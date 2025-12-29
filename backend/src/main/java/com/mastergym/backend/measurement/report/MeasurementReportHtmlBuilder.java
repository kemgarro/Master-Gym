package com.mastergym.backend.measurement.report;

import com.mastergym.backend.client.model.ClientEntity;
import com.mastergym.backend.measurement.model.MeasurementEntity;

import java.text.DecimalFormat;
import java.text.DecimalFormatSymbols;
import java.util.Locale;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;

public final class MeasurementReportHtmlBuilder {

    private static final DateTimeFormatter DATE_FORMAT = DateTimeFormatter.ofPattern("yyyy-MM-dd");
    private static final DecimalFormat NUMBER_FORMAT = new DecimalFormat("0.##");
    private static final DecimalFormat SVG_NUMBER_FORMAT = new DecimalFormat("0.##", DecimalFormatSymbols.getInstance(Locale.US));

    private MeasurementReportHtmlBuilder() {
    }

    public static String build(ClientEntity client, List<MeasurementEntity> measurements) {
        MeasurementEntity latest = measurements.isEmpty() ? null : measurements.get(0);
        String nombre = escape(client.getNombre());
        String apellido = escape(client.getApellido());
        String clientName = apellido.isEmpty() ? nombre : (nombre + " " + apellido);
        String lastDate = latest == null ? "-" : DATE_FORMAT.format(latest.getFecha());

        StringBuilder html = new StringBuilder(8000);
        html.append("<?xml version=\"1.0\" encoding=\"UTF-8\"?>");
        html.append("<html xmlns=\"http://www.w3.org/1999/xhtml\" lang=\"es\">");
        html.append("<head>");
        html.append("<meta charset=\"utf-8\"/>");
        html.append("<style>");
        html.append("@page{size:A4;margin:16mm;}");
        html.append("body{font-family:'Segoe UI',Arial,Helvetica,sans-serif;margin:0;padding:18px;color:#111827;background:#f1f2f5;font-size:12px;}");
        html.append(".container{max-width:820px;margin:0 auto;}");
        html.append(".header{background:#ffe5e6;border-radius:14px;padding:14px 16px;color:#111827;box-shadow:0 8px 16px rgba(0,0,0,0.08);}");
        html.append(".title{font-size:18px;font-weight:800;margin:0 0 4px 0;}");
        html.append(".subtitle{font-size:11px;color:#6b7280;margin:0;}");
        html.append(".card{background:#fff;border-radius:12px;padding:12px;box-shadow:0 8px 16px rgba(0,0,0,0.06);}");
        html.append(".card-soft{background:#ffe5d9;border-radius:12px;padding:12px;border:1px solid #ffe1d0;}");
        html.append(".row{display:flex;gap:16px;flex-wrap:wrap;}");
        html.append(".col{flex:1;min-width:240px;}");
        html.append(".label{font-size:10px;color:#6b7280;text-transform:uppercase;letter-spacing:.08em;}");
        html.append(".value{font-size:14px;font-weight:700;color:#111827;}");
        html.append(".badge{display:inline-block;background:#ff5e62;color:#fff;border-radius:999px;padding:4px 10px;font-size:12px;font-weight:700;}");
        html.append(".pill{display:inline-block;background:#fff;color:#111827;border-radius:999px;padding:4px 10px;font-size:11px;font-weight:700;border:1px solid #ffe1d0;}");
        html.append(".summary{display:flex;gap:12px;flex-wrap:wrap;margin-top:12px;}");
        html.append(".summary-card{flex:1;min-width:130px;background:#fff7f2;border-radius:10px;padding:8px 10px;border:1px solid #ffe6da;}");
        html.append(".summary-card .value{font-size:14px;}");
        html.append(".table{width:100%;border-collapse:separate;border-spacing:0 4px;margin-top:10px;font-size:11px;}");
        html.append(".table th{font-size:11px;color:#6b7280;text-align:left;padding:6px 8px;}");
        html.append(".table tr{background:#f9fafb;}");
        html.append(".table td{padding:6px 8px;font-size:11px;border-top:1px solid #f3f4f6;border-bottom:1px solid #f3f4f6;}");
        html.append(".table tr td:first-child{border-left:1px solid #f3f4f6;border-top-left-radius:10px;border-bottom-left-radius:10px;}");
        html.append(".table tr td:last-child{border-right:1px solid #f3f4f6;border-top-right-radius:10px;border-bottom-right-radius:10px;}");
        html.append(".muted{color:#6b7280;font-size:11px;}");
        html.append(".section-title{font-size:13px;font-weight:800;margin:14px 0 8px 0;color:#111827;}");
        html.append("</style>");
        html.append("</head>");
        html.append("<body>");
        html.append("<div class=\"container\">");
        html.append("<div class=\"header\">");
        html.append("<div class=\"title\">Reporte de Mediciones</div>");
        html.append("<div class=\"subtitle\">Resumen de mediciones del cliente</div>");
        html.append("</div>");

        html.append("<div style=\"height:16px;\"></div>");
        html.append("<div class=\"card\">");
        html.append("<div class=\"card-soft\">");
        html.append("<div style=\"display:flex;justify-content:space-between;align-items:center;gap:12px;\">");
        html.append("<div>");
        html.append("<div style=\"font-size:20px;font-weight:800;\">").append(clientName).append("</div>");
        html.append("<div class=\"muted\">Cliente ID: ").append(client.getId()).append("</div>");
        html.append("</div>");
        html.append("<div class=\"badge\">").append(measurements.size()).append(" mediciones</div>");
        html.append("</div>");
        html.append("<div class=\"muted\" style=\"margin-top:8px;\">Ultima medicion: ").append(lastDate).append("</div>");
        if (latest != null) {
            html.append("<div class=\"summary\">");
            html.append("<div class=\"summary-card\"><div class=\"label\">Peso</div><div class=\"value\">")
                    .append(formatNumber(latest.getPeso())).append(" kg</div></div>");
            html.append("<div class=\"summary-card\"><div class=\"label\">Altura</div><div class=\"value\">")
                    .append(formatNumber(latest.getAltura())).append(" cm</div></div>");
            html.append("<div class=\"summary-card\"><div class=\"label\">IMC</div><div class=\"value\">")
                    .append(formatImc(latest.getPeso(), latest.getAltura())).append("</div></div>");
            html.append("<div class=\"summary-card\"><div class=\"label\">Grasa</div><div class=\"value\">")
                    .append(formatNullable(latest.getGrasaCorporal())).append(" %</div></div>");
            html.append("</div>");
        }
        html.append("</div>");
        html.append("</div>");

        html.append("<div class=\"section-title\">Historial de Mediciones</div>");
        html.append("<div class=\"card\">");
        if (measurements.isEmpty()) {
            html.append("<div class=\"muted\">No hay mediciones registradas.</div>");
        } else {
            html.append("<table class=\"table\">");
            html.append("<thead><tr>");
            html.append("<th>Fecha</th>");
            html.append("<th>Peso (kg)</th>");
            html.append("<th>Altura (cm)</th>");
            html.append("<th>IMC</th>");
            html.append("<th>Cintura (cm)</th>");
            html.append("<th>Cadera (cm)</th>");
            html.append("<th>Grasa (%)</th>");
            html.append("</tr></thead>");
            html.append("<tbody>");
            for (MeasurementEntity m : measurements) {
                html.append("<tr>");
                html.append("<td>").append(formatDate(m.getFecha())).append("</td>");
                html.append("<td>").append(formatNumber(m.getPeso())).append("</td>");
                html.append("<td>").append(formatNumber(m.getAltura())).append("</td>");
                html.append("<td>").append(formatImc(m.getPeso(), m.getAltura())).append("</td>");
                html.append("<td>").append(formatNumber(m.getCinturaCm())).append("</td>");
                html.append("<td>").append(formatNumber(m.getCaderaCm())).append("</td>");
                html.append("<td>").append(formatNullable(m.getGrasaCorporal())).append("</td>");
                html.append("</tr>");
                if (m.getNotas() != null && !m.getNotas().isBlank()) {
                    html.append("<tr>");
                    html.append("<td colspan=\"7\" class=\"muted\">Notas: ").append(escape(m.getNotas())).append("</td>");
                    html.append("</tr>");
                }
            }
            html.append("</tbody></table>");
        }
        html.append("</div>");

        html.append("<div class=\"muted\" style=\"margin-top:16px;\">Generado: ").append(formatDate(LocalDate.now())).append("</div>");
        html.append("</div>");
        html.append("</body>");
        html.append("</html>");
        return html.toString();
    }

    private static String formatDate(LocalDate date) {
        if (date == null) return "-";
        return DATE_FORMAT.format(date);
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
