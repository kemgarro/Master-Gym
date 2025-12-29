"use client";

import { Activity, Calendar, CreditCard, Download, Mail } from "lucide-react";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { apiDownload } from "@/lib/api";
import type { Cliente, Medicion, Pago } from "../types";

interface ClienteReporteDialogProps {
  cliente: Cliente;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pagos: Pago[];
  mediciones: Medicion[];
}

const colones = new Intl.NumberFormat("es-CR", { style: "currency", currency: "CRC", maximumFractionDigits: 0 });

export function ClienteReporteDialog({ cliente, open, onOpenChange, pagos, mediciones }: ClienteReporteDialogProps) {
  const getEstadoBadge = (estado: Cliente["estado"]) => {
    switch (estado) {
      case "activo":
        return <Badge className="bg-green-500 text-white">Activo</Badge>;
      case "por-vencer":
        return <Badge className="bg-yellow-500 text-white">Por vencer</Badge>;
      case "vencido":
        return <Badge className="bg-red-500 text-white">Vencido</Badge>;
      default:
        return <Badge variant="secondary">{estado}</Badge>;
    }
  };

  const dataPeso = mediciones
    .slice()
    .sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime())
    .map((m) => ({
      fecha: new Date(m.fecha).toLocaleDateString("es-CR", { day: "2-digit", month: "short" }),
      peso: m.peso,
    }));

  const totalPagado = pagos.reduce((sum, p) => sum + p.monto, 0);
  const ultimoPago = pagos.length > 0 ? pagos.slice().sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())[0] : null;

  const handleExportarReporte = async () => {
    try {
      const rawName = `${cliente.nombre} ${cliente.apellido}`.trim();
      const safeName = rawName
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^A-Za-z0-9]+/g, "_")
        .replace(/^_+|_+$/g, "") || "cliente";
      const blob = await apiDownload(`/api/measurements/report/pdf?clientId=${Number(cliente.id)}`);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `mediciones_${safeName}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert("No se pudo descargar el PDF.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto rounded-3xl">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="font-black" style={{ fontSize: "1.5rem" }}>
                Reporte Individual
              </DialogTitle>
              <DialogDescription>Resumen completo de actividad del cliente</DialogDescription>
            </div>
            <Button
              onClick={handleExportarReporte}
              className="rounded-xl bg-gradient-to-r from-[#ff5e62] to-[#ff9966] text-white shadow-lg"
            >
              <Download className="mr-2 h-4 w-4" />
              Descargar PDF
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          <div className="rounded-2xl bg-gradient-to-r from-[#ffe5e6] to-[#ffe5cc] p-6">
            <div className="flex-1">
              <h3 className="text-2xl font-black text-gray-900">
                {cliente.nombre} {cliente.apellido}
              </h3>
              <div className="mt-2 flex items-center gap-2">
                {getEstadoBadge(cliente.estado)}
                <Badge variant="secondary" className="bg-white/60 text-gray-900">
                  {cliente.tipoMembresia}
                </Badge>
              </div>
              {ultimoPago && <p className="mt-2 text-sm text-gray-700">Último pago: {new Date(ultimoPago.fecha).toLocaleDateString("es-CR")}</p>}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card className="border-none shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-[#ff5e62]" />
                  Contacto
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <p className="text-xs text-gray-600">Correo</p>
                  <p className="font-semibold text-gray-900">{cliente.email}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Teléfono</p>
                  <p className="font-semibold text-gray-900">{cliente.telefono}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-[#ff5e62]" />
                  Membresía
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <p className="text-xs text-gray-600">Inicio</p>
                  <p className="font-semibold text-gray-900">
                    {new Date(cliente.fechaInicio).toLocaleDateString("es-CR", { day: "2-digit", month: "long", year: "numeric" })}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Vencimiento</p>
                  <p className="font-semibold text-gray-900">
                    {cliente.fechaVencimiento
                      ? new Date(cliente.fechaVencimiento).toLocaleDateString("es-CR", { day: "2-digit", month: "long", year: "numeric" })
                      : "Sin membresia"}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="border-none shadow-md">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-[#ff5e62]" />
                  Historial de Pagos
                </CardTitle>
                <Badge className="bg-gradient-to-r from-[#ff5e62] to-[#ff9966] text-white">
                  {pagos.length} pago{pagos.length !== 1 ? "s" : ""}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {pagos.length === 0 ? (
                <p className="py-4 text-center text-gray-500">No hay pagos registrados</p>
              ) : (
                <div className="space-y-3">
                  <div className="rounded-xl bg-gradient-to-r from-[#ffe5e6] to-[#ffe5cc] p-4">
                    <p className="text-sm text-gray-600">Total pagado</p>
                    <p className="font-black text-gray-900" style={{ fontSize: "1.5rem" }}>
                      {colones.format(totalPagado)}
                    </p>
                  </div>
                  <div className="max-h-48 space-y-2 overflow-y-auto">
                    {pagos
                      .slice()
                      .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
                      .map((pago) => (
                        <div key={pago.id} className="flex items-center justify-between rounded-xl bg-gray-50 p-3">
                          <div>
                            <p className="font-semibold text-gray-900">{colones.format(pago.monto)}</p>
                            <p className="text-xs text-gray-600">
                              {new Date(pago.fecha).toLocaleDateString("es-CR")} • {pago.metodoPago} • {pago.tipoPago}
                            </p>
                          </div>
                          {pago.referencia && (
                            <Badge variant="outline" className="text-xs">
                              Ref: {pago.referencia}
                            </Badge>
                          )}
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-none shadow-md">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-[#ff5e62]" />
                  Evolución de Peso
                </CardTitle>
                <Badge className="bg-gradient-to-r from-[#ff5e62] to-[#ff9966] text-white">
                  {mediciones.length} medición{mediciones.length !== 1 ? "es" : ""}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {dataPeso.length === 0 ? (
                <p className="py-4 text-center text-gray-500">No hay mediciones registradas</p>
              ) : (
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={dataPeso}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="fecha" tick={{ fontSize: 12 }} stroke="#9ca3af" />
                    <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" />
                    <Tooltip
                      contentStyle={{ background: "white", border: "none", borderRadius: "12px", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
                    />
                    <Line type="monotone" dataKey="peso" stroke="#ff5e62" strokeWidth={3} dot={{ fill: "#ff5e62", r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
