package com.stockpulse.api.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.stockpulse.api.entity.HoldingEntity;
import com.stockpulse.api.entity.UserEntity;

@Repository
public interface HoldingRepository extends JpaRepository<HoldingEntity, Long> {
    Optional<HoldingEntity> findByUserAndSymbol(UserEntity user, String symbol);

    List<HoldingEntity> findAllByUser(UserEntity user);
}
