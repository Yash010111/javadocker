package com.stockpulse.api.util;

import java.time.Instant;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.stereotype.Component;

import com.stockpulse.api.dto.StockDataResponse;

@Component
public class StockCache {

    private static final long EXPIRATION_MS = 10 * 60 * 1000L;

    private static class CacheEntry {
        private final StockDataResponse response;
        private final long createdAt;

        private CacheEntry(StockDataResponse response, long createdAt) {
            this.response = response;
            this.createdAt = createdAt;
        }

        private boolean isExpired() {
            return Instant.now().toEpochMilli() - createdAt >= EXPIRATION_MS;
        }
    }

    private final ConcurrentHashMap<String, CacheEntry> cache = new ConcurrentHashMap<>();

    public Optional<StockDataResponse> get(String key) {
        CacheEntry entry = cache.get(key);
        if (entry == null || entry.isExpired()) {
            cache.remove(key);
            return Optional.empty();
        }
        return Optional.of(entry.response);
    }

    public void put(String key, StockDataResponse response) {
        cache.put(key, new CacheEntry(response, Instant.now().toEpochMilli()));
    }
}
