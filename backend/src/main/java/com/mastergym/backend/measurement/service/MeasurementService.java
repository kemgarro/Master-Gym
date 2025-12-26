package com.mastergym.backend.measurement.service;

import com.mastergym.backend.client.model.ClientEntity;
import com.mastergym.backend.client.repository.ClientRepository;
import com.mastergym.backend.common.error.BadRequestException;
import com.mastergym.backend.common.error.NotFoundException;
import com.mastergym.backend.common.gym.GymContext;
import com.mastergym.backend.measurement.dto.MeasurementRequest;
import com.mastergym.backend.measurement.dto.MeasurementResponse;
import com.mastergym.backend.measurement.model.MeasurementEntity;
import com.mastergym.backend.measurement.repository.MeasurementRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.util.ArrayList;

@Service
public class MeasurementService {

    private final MeasurementRepository measurementRepository;
    private final ClientRepository clientRepository;

    public MeasurementService(MeasurementRepository measurementRepository, ClientRepository clientRepository) {
        this.measurementRepository = measurementRepository;
        this.clientRepository = clientRepository;
    }

    public MeasurementResponse create(MeasurementRequest request) {
        Long gymId = GymContext.requireGymId();
        ClientEntity client = clientRepository.findByIdAndGymId(request.getClientId(), gymId)
                .orElseThrow(() -> new BadRequestException("clientId invalido (no pertenece al gym)"));

        MeasurementEntity entity = new MeasurementEntity(
                gymId,
                client,
                request.getFecha(),
                request.getPeso(),
                request.getAltura(),
                request.getPechoCm(),
                request.getCinturaCm(),
                request.getCaderaCm(),
                request.getBrazoIzqCm(),
                request.getBrazoDerCm(),
                request.getPiernaIzqCm(),
                request.getPiernaDerCm(),
                request.getGrasaCorporal(),
                blankToNull(request.getNotas())
        );

        MeasurementEntity saved = measurementRepository.save(entity);
        return toResponse(saved);
    }

    public Page<MeasurementResponse> list(Long clientId, Pageable pageable) {
        Long gymId = GymContext.requireGymId();
        Specification<MeasurementEntity> spec = specFor(gymId, clientId);
        return measurementRepository.findAll(spec, pageable).map(this::toResponse);
    }

    public MeasurementResponse getById(Long id) {
        Long gymId = GymContext.requireGymId();
        MeasurementEntity entity = measurementRepository.findByIdAndGymId(id, gymId)
                .orElseThrow(() -> new NotFoundException("Medicion no encontrada"));
        return toResponse(entity);
    }

    public void delete(Long id) {
        Long gymId = GymContext.requireGymId();
        MeasurementEntity entity = measurementRepository.findByIdAndGymId(id, gymId)
                .orElseThrow(() -> new NotFoundException("Medicion no encontrada"));
        measurementRepository.delete(entity);
    }

    private MeasurementResponse toResponse(MeasurementEntity e) {
        return new MeasurementResponse(
                e.getId(),
                e.getGymId(),
                e.getClient().getId(),
                e.getFecha(),
                e.getPeso(),
                e.getAltura(),
                e.getPechoCm(),
                e.getCinturaCm(),
                e.getCaderaCm(),
                e.getBrazoIzqCm(),
                e.getBrazoDerCm(),
                e.getPiernaIzqCm(),
                e.getPiernaDerCm(),
                e.getGrasaCorporal(),
                e.getNotas(),
                e.getCreatedAt(),
                e.getUpdatedAt()
        );
    }

    private static Specification<MeasurementEntity> specFor(Long gymId, Long clientId) {
        return (root, query, cb) -> {
            var predicates = new ArrayList<jakarta.persistence.criteria.Predicate>();
            predicates.add(cb.equal(root.get("gymId"), gymId));

            if (clientId != null) {
                predicates.add(cb.equal(root.get("client").get("id"), clientId));
            }

            return cb.and(predicates.toArray(jakarta.persistence.criteria.Predicate[]::new));
        };
    }

    private static String blankToNull(String value) {
        if (value == null) return null;
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
