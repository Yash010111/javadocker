package com.stockpulse.api.controller;

import java.util.List;

import jakarta.validation.Valid;

import org.springframework.security.core.Authentication;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.stockpulse.api.dto.HoldingDto;
import com.stockpulse.api.dto.TradeRequest;
import com.stockpulse.api.service.PortfolioService;

@RestController
@RequestMapping("/api/portfolio")
@Validated
public class PortfolioController {

    private final PortfolioService portfolioService;

    public PortfolioController(PortfolioService portfolioService) {
        this.portfolioService = portfolioService;
    }

    @GetMapping
    public List<HoldingDto> getPortfolio(Authentication authentication) {
        return portfolioService.getHoldings(authentication.getName());
    }

    @PostMapping("/buy")
    public HoldingDto buy(@Valid @RequestBody TradeRequest request, Authentication authentication) {
        return portfolioService.buyStock(authentication.getName(), request.getSymbol(), request.getQuantity(),
                request.getPrice());
    }

    @PostMapping("/sell")
    public HoldingDto sell(@Valid @RequestBody TradeRequest request, Authentication authentication) {
        return portfolioService.sellStock(authentication.getName(), request.getSymbol(), request.getQuantity(),
                request.getPrice());
    }
}
