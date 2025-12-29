package com.mastergym.backend.measurement.report;

import com.mastergym.backend.client.model.ClientEntity;
import com.mastergym.backend.measurement.model.MeasurementEntity;

import java.text.DecimalFormat;
import java.time.format.DateTimeFormatter;

public final class MeasurementDetailReportHtmlBuilder {

    private static final DateTimeFormatter DATE_FORMAT = DateTimeFormatter.ofPattern("yyyy-MM-dd");
    private static final DecimalFormat NUMBER_FORMAT = new DecimalFormat("0.##");

    private MeasurementDetailReportHtmlBuilder() {
    }

    public static String build(ClientEntity client, MeasurementEntity measurement) {
        String nombre = escape(client.getNombre());
        String apellido = escape(client.getApellido());
        String clientName = apellido.isEmpty() ? nombre : (nombre + " " + apellido);
        String fecha = measurement.getFecha() == null ? "-" : DATE_FORMAT.format(measurement.getFecha());

        StringBuilder html = new StringBuilder(8000);
        html.append("<?xml version=\"1.0\" encoding=\"UTF-8\"?>");
        html.append("<html xmlns=\"http://www.w3.org/1999/xhtml\" lang=\"es\">");
        html.append("<head>");
        html.append("<meta charset=\"utf-8\"/>");
        html.append("<style>");
        html.append("body{font-family:'Segoe UI',Arial,Helvetica,sans-serif;margin:0;padding:32px;color:#111827;background:#f1f2f5;}");
        html.append(".container{max-width:900px;margin:0 auto;}");
        html.append(".header{background:#ffe5e6;border-radius:20px;padding:22px 24px;color:#111827;box-shadow:0 12px 26px rgba(0,0,0,0.08);}");
        html.append(".title{font-size:24px;font-weight:800;margin:0 0 4px 0;}");
        html.append(".subtitle{font-size:13px;color:#6b7280;margin:0;}");
        html.append(".card{background:#fff;border-radius:18px;padding:20px;box-shadow:0 10px 20px rgba(0,0,0,0.06);}");
        html.append(".card-soft{background:#ffe5d9;border-radius:18px;padding:18px;border:1px solid #ffe1d0;}");
        html.append(".section-title{font-size:16px;font-weight:800;margin:24px 0 12px 0;color:#111827;}");
        html.append(".grid-4{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;}");
        html.append(".grid-3{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;}");
        html.append(".grid-2{display:grid;grid-template-columns:repeat(2,1fr);gap:12px;}");
        html.append(".metric{background:#f9fafb;border:1px solid #eef0f4;border-radius:14px;padding:12px;text-align:center;}");
        html.append(".metric .label{font-size:11px;color:#6b7280;text-transform:uppercase;letter-spacing:.08em;}");
        html.append(".metric .value{font-size:18px;font-weight:800;color:#111827;}");
        html.append(".metric .unit{font-size:11px;color:#6b7280;}");
        html.append(".badge{display:inline-block;background:#ff5e62;color:#fff;border-radius:999px;padding:4px 10px;font-size:12px;font-weight:700;}");
        html.append(".muted{color:#6b7280;font-size:12px;}");
        html.append("</style>");
        html.append("</head>");
        html.append("<body>");
        html.append("<div class=\"container\">");
        html.append("<div class=\"header\">");
        html.append("<div class=\"title\">Detalle de Medicion</div>");
        html.append("<div class=\"subtitle\">Resumen completo de la medicion registrada</div>");
        html.append("</div>");

        html.append("<div style=\"height:16px;\"></div>");
        html.append("<div class=\"card\">");
        html.append("<div class=\"card-soft\">");
        html.append("<div style=\"display:flex;justify-content:space-between;align-items:center;gap:12px;\">");
        html.append("<div>");
        html.append("<div style=\"font-size:20px;font-weight:800;\">").append(clientName).append("</div>");
        html.append("<div class=\"muted\">Fecha: ").append(fecha).append("</div>");
        html.append("</div>");
        html.append("<div class=\"badge\">Medicion ID: ").append(measurement.getId()).append("</div>");
        html.append("</div>");
        html.append("</div>");
        html.append("</div>");

        html.append("<div class=\"section-title\">Datos Basicos</div>");
        html.append("<div class=\"card\">");
        html.append("<div class=\"grid-4\">");
        html.append(metric("Peso", formatNumber(measurement.getPeso()), "kg"));
        html.append(metric("Altura", formatNumber(measurement.getAltura()), "cm"));
        html.append(metric("IMC", formatImc(measurement.getPeso(), measurement.getAltura()), ""));
        html.append(metric("Grasa", formatNullable(measurement.getGrasaCorporal()), "%"));
        html.append("</div>");
        html.append("</div>");

        html.append("<div class=\"section-title\">Circunferencias Torso</div>");
        html.append("<div class=\"card\">");
        html.append("<div class=\"grid-3\">");
        html.append(metric("Pecho", formatNumber(measurement.getPechoCm()), "cm"));
        html.append(metric("Cintura", formatNumber(measurement.getCinturaCm()), "cm"));
        html.append(metric("Cadera", formatNumber(measurement.getCaderaCm()), "cm"));
        html.append("</div>");
        html.append("</div>");

        html.append("<div class=\"section-title\">Circunferencias Brazos</div>");
        html.append("<div class=\"card\">");
        html.append("<div class=\"grid-2\">");
        html.append(metric("Brazo Izquierdo", formatNumber(measurement.getBrazoIzqCm()), "cm"));
        html.append(metric("Brazo Derecho", formatNumber(measurement.getBrazoDerCm()), "cm"));
        html.append("</div>");
        html.append("</div>");

        html.append("<div class=\"section-title\">Circunferencias Piernas</div>");
        html.append("<div class=\"card\">");
        html.append("<div class=\"grid-2\">");
        html.append(metric("Pierna Izquierda", formatNumber(measurement.getPiernaIzqCm()), "cm"));
        html.append(metric("Pierna Derecha", formatNumber(measurement.getPiernaDerCm()), "cm"));
        html.append("</div>");
        html.append("</div>");

        if (measurement.getNotas() != null && !measurement.getNotas().isBlank()) {
            html.append("<div class=\"section-title\">Notas</div>");
            html.append("<div class=\"card\">");
            html.append("<div class=\"muted\">").append(escape(measurement.getNotas())).append("</div>");
            html.append("</div>");
        }

        html.append("</div>");
        html.append("</body>");
        html.append("</html>");
        return html.toString();
    }

    private static String metric(String label, String value, String unit) {
        StringBuilder html = new StringBuilder();
        html.append("<div class=\"metric\">");
        html.append("<div class=\"label\">").append(escape(label)).append("</div>");
        html.append("<div class=\"value\">").append(escape(value)).append("</div>");
        if (unit != null && !unit.isBlank()) {
            html.append("<div class=\"unit\">").append(escape(unit)).append("</div>");
        }
        html.append("</div>");
        return html.toString();
    }

    private static String formatNumber(Double value) {
        if (value == null) return "-";
        return NUMBER_FORMAT.format(value);
    }

    private static String formatNullable(Double value) {
        if (value == null) return "-";
        return NUMBER_FORMAT.format(value);
    }

    private static String formatImc(Double peso, Double alturaCm) {
        if (peso == null || alturaCm == null || alturaCm == 0) return "-";
        double alturaM = alturaCm / 100.0;
        double imc = peso / (alturaM * alturaM);
        return NUMBER_FORMAT.format(imc);
    }

    private static String escape(String value) {
        if (value == null) return "";
        return value
                .replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;");
    }
}
