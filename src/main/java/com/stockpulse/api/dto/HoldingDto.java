package com.stockpulse.api.dto;

import java.math.BigDecimal;

public class HoldingDto {

    private String symbol;
    private BigDecimal quantity;
    private BigDecimal averagePrice;

    public HoldingDto() {
    }

    public HoldingDto(String symbol, BigDecimal quantity, BigDecimal averagePrice) {
        this.symbol = symbol;
        this.quantity = quantity;
        this.averagePrice = averagePrice;
    }

    public String getSymbol() {
        return symbol;
    }

    public void setSymbol(String symbol) {
        this.symbol = symbol;
    }

    public BigDecimal getQuantity() {
        return quantity;
    }

    public void setQuantity(BigDecimal quantity) {
        this.quantity = quantity;
    }

    public BigDecimal getAveragePrice() {
        return averagePrice;
    }

    public void setAveragePrice(BigDecimal averagePrice) {
        this.averagePrice = averagePrice;
    }
}
