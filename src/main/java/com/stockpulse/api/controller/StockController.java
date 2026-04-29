package com.stockpulse.api.controller;

import java.util.List;

import jakarta.validation.constraints.NotBlank;

import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.stockpulse.api.dto.StockDataResponse;
import com.stockpulse.api.dto.StockSearchResult;
import com.stockpulse.api.service.StockService;

@RestController
@RequestMapping("/api")
@Validated
public class StockController {

    private final StockService stockService;

    public StockController(StockService stockService) {
        this.stockService = stockService;
    }

    @GetMapping("/stocks")
    public StockDataResponse getStockData(
            @RequestParam @NotBlank(message = "Symbol is required") String symbol,
            @RequestParam @NotBlank(message = "Interval is required") String interval) {
        return stockService.getStockData(symbol, interval);
    }

    @GetMapping("/stocks/search")
    public List<StockSearchResult> searchStocks(
            @RequestParam @NotBlank(message = "Keyword is required") String keyword) {
        return stockService.searchSymbols(keyword);
    }
}
