package com.stockpulse.api.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.stockpulse.api.dto.HoldingDto;
import com.stockpulse.api.entity.HoldingEntity;
import com.stockpulse.api.entity.UserEntity;
import com.stockpulse.api.repository.HoldingRepository;

@Service
public class PortfolioService {

    private final HoldingRepository holdingRepository;
    private final UserService userService;

    public PortfolioService(HoldingRepository holdingRepository, UserService userService) {
        this.holdingRepository = holdingRepository;
        this.userService = userService;
    }

    @Transactional(readOnly = true)
    public List<HoldingDto> getHoldings(String username) {
        UserEntity user = userService.getByUsername(username);
        return holdingRepository.findAllByUser(user).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public HoldingDto buyStock(String username, String symbol, BigDecimal quantity, BigDecimal price) {
        UserEntity user = userService.getByUsername(username);
        String normalizedSymbol = normalizeSymbol(symbol);

        HoldingEntity holding = holdingRepository.findByUserAndSymbol(user, normalizedSymbol)
                .orElseGet(() -> new HoldingEntity(null, user, normalizedSymbol, BigDecimal.ZERO, BigDecimal.ZERO));

        BigDecimal existingQuantity = holding.getQuantity() == null ? BigDecimal.ZERO : holding.getQuantity();
        BigDecimal existingValue = holding.getAveragePrice() == null ? BigDecimal.ZERO
                : holding.getAveragePrice().multiply(existingQuantity);
        BigDecimal purchasedValue = price.multiply(quantity);
        BigDecimal newQuantity = existingQuantity.add(quantity);
        BigDecimal newAverage = BigDecimal.ZERO;
        if (newQuantity.compareTo(BigDecimal.ZERO) > 0) {
            newAverage = existingValue.add(purchasedValue).divide(newQuantity, 6, RoundingMode.HALF_UP);
        }

        holding.setQuantity(newQuantity);
        holding.setAveragePrice(newAverage);
        return toDto(holdingRepository.save(holding));
    }

    @Transactional
    public HoldingDto sellStock(String username, String symbol, BigDecimal quantity, BigDecimal price) {
        UserEntity user = userService.getByUsername(username);
        String normalizedSymbol = normalizeSymbol(symbol);

        HoldingEntity holding = holdingRepository.findByUserAndSymbol(user, normalizedSymbol)
                .orElseThrow(() -> new IllegalArgumentException("No holdings found for " + normalizedSymbol));

        if (quantity.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Sell quantity must be greater than zero");
        }

        if (holding.getQuantity().compareTo(quantity) < 0) {
            throw new IllegalArgumentException("Insufficient quantity to sell");
        }

        BigDecimal remaining = holding.getQuantity().subtract(quantity);
        if (remaining.compareTo(BigDecimal.ZERO) <= 0) {
            holdingRepository.delete(holding);
            return new HoldingDto(symbol, BigDecimal.ZERO, holding.getAveragePrice());
        }

        holding.setQuantity(remaining);
        holdingRepository.save(holding);
        return toDto(holding);
    }

    private HoldingDto toDto(HoldingEntity holding) {
        return new HoldingDto(holding.getSymbol(), holding.getQuantity(), holding.getAveragePrice());
    }

    private String normalizeSymbol(String symbol) {
        return symbol == null ? null : symbol.trim().toUpperCase();
    }
}
