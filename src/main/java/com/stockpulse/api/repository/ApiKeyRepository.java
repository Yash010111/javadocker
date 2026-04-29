package com.stockpulse.api.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.stockpulse.api.entity.ApiKeyEntity;

@Repository
public interface ApiKeyRepository extends JpaRepository<ApiKeyEntity, Long> {
}
