package com.mastergym.backend.measurement.repository;

import com.mastergym.backend.measurement.model.MeasurementEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.Optional;

public interface MeasurementRepository extends JpaRepository<MeasurementEntity, Long>, JpaSpecificationExecutor<MeasurementEntity> {
    Optional<MeasurementEntity> findByIdAndGymId(Long id, Long gymId);
}
