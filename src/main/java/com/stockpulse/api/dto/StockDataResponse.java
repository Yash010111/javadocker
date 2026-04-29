package com.stockpulse.api.dto;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class StockDataResponse {
    private String symbol;
    private String interval;
    private List<String> timestamps;
    private List<String> open;
    private List<String> close;
}
