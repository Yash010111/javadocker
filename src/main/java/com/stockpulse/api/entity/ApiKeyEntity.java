package com.stockpulse.api.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "api_config")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ApiKeyEntity {

    @Id
    private Long id;

    @Column(name = "api_key")
    private String apiKey;
}
