package com.stockpulse.api.service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.stockpulse.api.dto.StockDataResponse;
import com.stockpulse.api.dto.StockSearchResult;
import com.stockpulse.api.entity.ApiKeyEntity;
import com.stockpulse.api.exception.ExternalServiceException;
import com.stockpulse.api.exception.InvalidIntervalException;
import com.stockpulse.api.exception.InvalidStockSymbolException;
import com.stockpulse.api.exception.RateLimitException;
import com.stockpulse.api.repository.ApiKeyRepository;
import com.stockpulse.api.util.StockCache;

@Service
public class StockService {

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;
    private final StockCache stockCache;
    private final ApiKeyRepository apiKeyRepository;
    private volatile String apiKey;

    private static final List<IntervalConfig> SUPPORTED_INTERVALS = List.of(
            new IntervalConfig("1min", "TIME_SERIES_INTRADAY", "Time Series (1min)", "1min"),
            new IntervalConfig("hourly", "TIME_SERIES_INTRADAY", "Time Series (60min)", "60min"),
            new IntervalConfig("daily", "TIME_SERIES_DAILY", "Time Series (Daily)", null),
            new IntervalConfig("weekly", "TIME_SERIES_WEEKLY", "Weekly Time Series", null),
            new IntervalConfig("monthly", "TIME_SERIES_MONTHLY", "Monthly Time Series", null));

    public StockService(RestTemplate restTemplate,
            ObjectMapper objectMapper,
            StockCache stockCache,
            ApiKeyRepository apiKeyRepository) {
        this.restTemplate = restTemplate;
        this.objectMapper = objectMapper;
        this.stockCache = stockCache;
        this.apiKeyRepository = apiKeyRepository;
        this.apiKey = null;
        loadApiKeyFromDatabase();
    }

    public String getApiKey() {
        return apiKey;
    }

    public void setApiKey(String apiKey) {
        this.apiKey = apiKey;
        apiKeyRepository.save(new ApiKeyEntity(1L, apiKey));
    }

    private void loadApiKeyFromDatabase() {
        apiKeyRepository.findById(1L).ifPresent(entity -> this.apiKey = entity.getApiKey());
    }

    public StockDataResponse getStockData(String symbol, String interval) {
        if (symbol == null || symbol.isBlank()) {
            throw new InvalidStockSymbolException("Symbol is required");
        }

        IntervalConfig config = SUPPORTED_INTERVALS.stream()
                .filter(i -> i.name.equalsIgnoreCase(interval))
                .findFirst()
                .orElseThrow(() -> new InvalidIntervalException(
                        "Interval must be one of: 1min, hourly, daily, weekly, monthly"));

        String normalizedSymbol = symbol.trim().toUpperCase();
        String cacheKey = normalizedSymbol + ":" + config.name;

        Optional<StockDataResponse> cached = stockCache.get(cacheKey);
        if (cached.isPresent()) {
            return cached.get();
        }

        String url = buildUrl(normalizedSymbol, config);
        String json = fetchJson(url);
        Map<String, Object> data = parseJson(json);
        checkForErrors(data);
        Map<String, Object> timeSeries = extractTimeSeries(data, config.seriesKey);

        if (timeSeries == null || timeSeries.isEmpty()) {
            throw new InvalidStockSymbolException("Invalid symbol or no data for: " + normalizedSymbol);
        }

        List<String> timestamps = new ArrayList<>(timeSeries.keySet());
        Collections.sort(timestamps);

        List<String> openValues = new ArrayList<>();
        List<String> closeValues = new ArrayList<>();

        for (String timestamp : timestamps) {
            Object entry = timeSeries.get(timestamp);
            if (!(entry instanceof Map)) {
                continue;
            }
            @SuppressWarnings("unchecked")
            Map<String, Object> point = (Map<String, Object>) entry;
            openValues.add(getValue(point, "1. open"));
            closeValues.add(getValue(point, "4. close"));
        }

        StockDataResponse response = new StockDataResponse(
                normalizedSymbol,
                config.name,
                timestamps,
                openValues,
                closeValues);

        stockCache.put(cacheKey, response);
        return response;
    }

    public List<StockSearchResult> searchSymbols(String keyword) {
        if (keyword == null || keyword.isBlank()) {
            return Collections.emptyList();
        }

        String url = String.format("https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords=%s&apikey=%s",
                keyword.trim(), apiKey);
        String json = fetchJson(url);
        Map<String, Object> data = parseJson(json);
        checkForErrors(data);

        Object matches = data.get("bestMatches");
        if (!(matches instanceof List)) {
            return Collections.emptyList();
        }

        @SuppressWarnings("unchecked")
        List<Map<String, Object>> list = (List<Map<String, Object>>) matches;
        return list.stream()
                .map(match -> new StockSearchResult(
                        getValue(match, "1. symbol"),
                        getValue(match, "2. name")))
                .collect(Collectors.toList());
    }

    private String buildUrl(String symbol, IntervalConfig config) {
        String base = String.format("https://www.alphavantage.co/query?function=%s&symbol=%s&apikey=%s",
                config.function, symbol, apiKey);
        if (config.intervalValue != null) {
            base += "&interval=" + config.intervalValue;
        }
        return base;
    }

    private String fetchJson(String url) {
        try {
            return restTemplate.getForObject(url, String.class);
        } catch (Exception ex) {
            throw new ExternalServiceException("Failed to fetch stock data", ex);
        }
    }

    private Map<String, Object> parseJson(String json) {
        try {
            return objectMapper.readValue(json, new TypeReference<Map<String, Object>>() {
            });
        } catch (Exception ex) {
            throw new ExternalServiceException("Could not parse response from Alpha Vantage", ex);
        }
    }

    private void checkForErrors(Map<String, Object> data) {
        if (data.containsKey("Error Message")) {
            throw new InvalidStockSymbolException("Invalid stock symbol or request parameters");
        }
        if (data.containsKey("Note")) {
            throw new RateLimitException(data.get("Note").toString());
        }
        if (data.containsKey("Information")) {
            throw new ExternalServiceException(data.get("Information").toString());
        }
    }

    private Map<String, Object> extractTimeSeries(Map<String, Object> data, String key) {
        Object timeSeries = data.get(key);
        if (timeSeries instanceof Map) {
            @SuppressWarnings("unchecked")
            Map<String, Object> series = (Map<String, Object>) timeSeries;
            return series;
        }
        return null;
    }

    private String getValue(Map<String, Object> point, String key) {
        Object value = point.get(key);
        if (value == null) {
            return "0";
        }
        if (value instanceof String) {
            return ((String) value).trim();
        }
        return new BigDecimal(value.toString()).toPlainString();
    }

    private static class IntervalConfig {
        private final String name;
        private final String function;
        private final String seriesKey;
        private final String intervalValue;

        private IntervalConfig(String name, String function, String seriesKey, String intervalValue) {
            this.name = name;
            this.function = function;
            this.seriesKey = seriesKey;
            this.intervalValue = intervalValue;
        }
    }
}
