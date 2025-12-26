package com.mastergym.backend.measurement.model;

import com.mastergym.backend.client.model.ClientEntity;
import jakarta.persistence.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(
        name = "measurements",
        indexes = {
                @Index(name = "idx_measurements_gym_id", columnList = "gym_id"),
                @Index(name = "idx_measurements_client_id", columnList = "client_id"),
                @Index(name = "idx_measurements_fecha", columnList = "fecha")
        }
)
public class MeasurementEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "gym_id", nullable = false)
    private Long gymId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "client_id", nullable = false)
    private ClientEntity client;

    @Column(nullable = false)
    private LocalDate fecha;

    @Column(nullable = false)
    private Double peso;

    @Column(nullable = false)
    private Double altura;

    @Column(name = "pecho_cm", nullable = false)
    private Double pechoCm;

    @Column(name = "cintura_cm", nullable = false)
    private Double cinturaCm;

    @Column(name = "cadera_cm", nullable = false)
    private Double caderaCm;

    @Column(name = "brazo_izq_cm", nullable = false)
    private Double brazoIzqCm;

    @Column(name = "brazo_der_cm", nullable = false)
    private Double brazoDerCm;

    @Column(name = "pierna_izq_cm", nullable = false)
    private Double piernaIzqCm;

    @Column(name = "pierna_der_cm", nullable = false)
    private Double piernaDerCm;

    @Column(name = "grasa_corporal")
    private Double grasaCorporal;

    @Column(columnDefinition = "text")
    private String notas;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    public MeasurementEntity() {}

    public MeasurementEntity(
            Long gymId,
            ClientEntity client,
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
            String notas
    ) {
        this.gymId = gymId;
        this.client = client;
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
    }

    @PrePersist
    void prePersist() {
        LocalDateTime now = LocalDateTime.now();
        this.createdAt = now;
        this.updatedAt = now;
    }

    @PreUpdate
    void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public Long getGymId() {
        return gymId;
    }

    public void setGymId(Long gymId) {
        this.gymId = gymId;
    }

    public ClientEntity getClient() {
        return client;
    }

    public void setClient(ClientEntity client) {
        this.client = client;
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

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}
