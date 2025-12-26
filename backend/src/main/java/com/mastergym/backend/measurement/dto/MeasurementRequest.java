package com.mastergym.backend.measurement.dto;

import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public class MeasurementRequest {

    @NotNull
    private Long clientId;

    @NotNull
    private LocalDate fecha;

    @NotNull
    private Double peso;

    @NotNull
    private Double altura;

    @NotNull
    private Double pechoCm;

    @NotNull
    private Double cinturaCm;

    @NotNull
    private Double caderaCm;

    @NotNull
    private Double brazoIzqCm;

    @NotNull
    private Double brazoDerCm;

    @NotNull
    private Double piernaIzqCm;

    @NotNull
    private Double piernaDerCm;

    private Double grasaCorporal;

    private String notas;

    public MeasurementRequest() {}

    public Long getClientId() {
        return clientId;
    }

    public void setClientId(Long clientId) {
        this.clientId = clientId;
    }

    public LocalDate getFecha() {
        return fecha;
    }

    public void setFecha(LocalDate fecha) {
        this.fecha = fecha;
    }

    public Double getPeso() {
        return peso;
    }

    public void setPeso(Double peso) {
        this.peso = peso;
    }

    public Double getAltura() {
        return altura;
    }

    public void setAltura(Double altura) {
        this.altura = altura;
    }

    public Double getPechoCm() {
        return pechoCm;
    }

    public void setPechoCm(Double pechoCm) {
        this.pechoCm = pechoCm;
    }

    public Double getCinturaCm() {
        return cinturaCm;
    }

    public void setCinturaCm(Double cinturaCm) {
        this.cinturaCm = cinturaCm;
    }

    public Double getCaderaCm() {
        return caderaCm;
    }

    public void setCaderaCm(Double caderaCm) {
        this.caderaCm = caderaCm;
    }

    public Double getBrazoIzqCm() {
        return brazoIzqCm;
    }

    public void setBrazoIzqCm(Double brazoIzqCm) {
        this.brazoIzqCm = brazoIzqCm;
    }

    public Double getBrazoDerCm() {
        return brazoDerCm;
    }

    public void setBrazoDerCm(Double brazoDerCm) {
        this.brazoDerCm = brazoDerCm;
    }

    public Double getPiernaIzqCm() {
        return piernaIzqCm;
    }

    public void setPiernaIzqCm(Double piernaIzqCm) {
        this.piernaIzqCm = piernaIzqCm;
    }

    public Double getPiernaDerCm() {
        return piernaDerCm;
    }

    public void setPiernaDerCm(Double piernaDerCm) {
        this.piernaDerCm = piernaDerCm;
    }

    public Double getGrasaCorporal() {
        return grasaCorporal;
    }

    public void setGrasaCorporal(Double grasaCorporal) {
        this.grasaCorporal = grasaCorporal;
    }

    public String getNotas() {
        return notas;
    }

    public void setNotas(String notas) {
        this.notas = notas;
    }
}
