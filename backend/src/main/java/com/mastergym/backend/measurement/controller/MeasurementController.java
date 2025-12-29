package com.mastergym.backend.measurement.controller;

import com.mastergym.backend.common.error.BadRequestException;
import com.mastergym.backend.measurement.dto.MeasurementRequest;
import com.mastergym.backend.measurement.dto.MeasurementResponse;
import com.mastergym.backend.measurement.service.MeasurementService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/measurements")
public class MeasurementController {

    private final MeasurementService measurementService;

    public MeasurementController(MeasurementService measurementService) {
        this.measurementService = measurementService;
    }

    @PostMapping
    public ResponseEntity<MeasurementResponse> create(@Valid @RequestBody MeasurementRequest request) {
        MeasurementResponse created = measurementService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping
    public Page<MeasurementResponse> list(
            @RequestParam(required = false) Long clientId,
            @PageableDefault(size = 100, sort = "fecha", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        if (pageable.getPageSize() > 500) {
            throw new BadRequestException("size maximo permitido: 500");
        }
        return measurementService.list(clientId, pageable);
    }

    @GetMapping("/{id}")
    public MeasurementResponse getById(@PathVariable Long id) {
        return measurementService.getById(id);
    }

    @GetMapping("/{id}/report/pdf")
    public ResponseEntity<byte[]> downloadDetailReport(@PathVariable Long id) {
        byte[] pdf = measurementService.buildDetailReportPdf(id);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"medicion_" + id + ".pdf\"")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdf);
    }

    @GetMapping("/report/pdf")
    public ResponseEntity<byte[]> downloadReport(@RequestParam Long clientId) {
        MeasurementService.ReportPdfPayload payload = measurementService.buildReportPdfPayload(clientId);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + payload.filename() + "\"")
                .contentType(MediaType.APPLICATION_PDF)
                .body(payload.pdf());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        measurementService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
