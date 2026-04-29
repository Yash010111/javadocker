package com.stockpulse.api.exception;

public class InvalidStockSymbolException extends RuntimeException {
    public InvalidStockSymbolException(String message) {
        super(message);
    }
}
