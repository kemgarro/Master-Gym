package com.mastergym.backend.measurement.report;

import com.openhtmltopdf.pdfboxout.PdfRendererBuilder;

import java.io.ByteArrayOutputStream;

public final class MeasurementReportPdfRenderer {

    private MeasurementReportPdfRenderer() {
    }

    public static byte[] render(String html) {
        try (ByteArrayOutputStream output = new ByteArrayOutputStream()) {
            PdfRendererBuilder builder = new PdfRendererBuilder();
            builder.withHtmlContent(html, null);
            builder.toStream(output);
            builder.useFastMode();
            builder.run();
            return output.toByteArray();
        } catch (Exception ex) {
            throw new IllegalStateException("No se pudo generar el PDF de mediciones", ex);
        }
    }
}
