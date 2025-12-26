package com.mastergym.backend.measurement.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class MeasurementResponse {

    private Long id;
    private Long gymId;
    private Long clientId;
    private LocalDate fecha;
    private Double peso;
    private Double altura;
    private Double pechoCm;
    private Double cinturaCm;
    private Double caderaCm;
    private Double brazoIzqCm;
    private Double brazoDerCm;
    private Double piernaIzqCm;
    private Double piernaDerCm;
    private Double grasaCorporal;
    private String notas;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public MeasurementResponse() {}

    public MeasurementResponse(
            Long id,
            Long gymId,
            Long clientId,
            LocalDate fecha,
            Double peso,
            Double altura,
            Double pechoCm,
            Double cinturaCm,
            Double caderaCm,
            Double brazoIzqCm,
            Double brazoDerCm,
            Double piernaIzqCm,
            Double piernaDerCm,
            Double grasaCorporal,
            String notas,
            LocalDateTime createdAt,
            LocalDateTime updatedAt
    ) {
        this.id = id;
        this.gymId = gymId;
        this.clientId = clientId;
        this.fecha = fecha;
        this.peso = peso;
        this.altura = altura;
        this.pechoCm = pechoCm;
        this.cinturaCm = cinturaCm;
        this.caderaCm = caderaCm;
        this.brazoIzqCm = brazoIzqCm;
        this.brazoDerCm = brazoDerCm;
        this.piernaIzqCm = piernaIzqCm;
        this.piernaDerCm = piernaDerCm;
        this.grasaCorporal = grasaCorporal;
        this.notas = notas;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public Long getId() {
        return id;
    }

    public Long getGymId() {
        return gymId;
    }

    public Long getClientId() {
        return clientId;
    }

    public LocalDate getFecha() {
        return fecha;
    }

    public Double getPeso() {
        return peso;
    }

    public Double getAltura() {
        return altura;
    }

    public Double getPechoCm() {
        return pechoCm;
    }

    public Double getCinturaCm() {
        return cinturaCm;
    }

    public Double getCaderaCm() {
        return caderaCm;
    }

    public Double getBrazoIzqCm() {
        return brazoIzqCm;
    }

    public Double getBrazoDerCm() {
        return brazoDerCm;
    }

    public Double getPiernaIzqCm() {
        return piernaIzqCm;
    }

    public Double getPiernaDerCm() {
        return piernaDerCm;
    }

    public Double getGrasaCorporal() {
        return grasaCorporal;
    }

    public String getNotas() {
        return notas;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}
