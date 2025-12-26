"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertCircle, Database, DollarSign, Search, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { apiGet, apiSend } from "@/lib/api";
import type {
  ClientCreateRequest,
  ClientResponse,
  ClientStatus,
  ClientUpdateRequest,
  MeasurementCreateRequest,
  MeasurementResponse,
  Page,
  PaymentCreateRequest,
  PaymentMethod,
  PaymentType,
  PaymentResponse,
} from "@/lib/types";
import { ClientesTab } from "./components/ClientesTab";
import { MedicionesTab } from "./components/MedicionesTab";
import { PagosTab } from "./components/PagosTab";
import gymLogo from "../../../recursos/logo.jpg";
import type { Cliente, ClienteFormData, Medicion, Pago } from "./types";

type ClienteExtras = Pick<Cliente, "contactoEmergencia">;

const LS_CLIENT_EXTRAS = "mastergym-client-extras";
const colones = new Intl.NumberFormat("es-CR", { style: "currency", currency: "CRC", maximumFractionDigits: 0 });

const HEADER_IMAGE = gymLogo.src;

function safeReadJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  const raw = window.localStorage.getItem(key);
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function safeWriteJson(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

function ymd(date: Date) {
  return date.toISOString().split("T")[0];
}

function computeEstado(backendStatus: ClientStatus, fechaVencimiento?: string | null): Cliente["estado"] {
  if (backendStatus === "INACTIVO") return "inactivo";
  if (backendStatus === "MOROSO") return "vencido";
  if (!fechaVencimiento) return "inactivo";
  const vencimiento = new Date(fechaVencimiento);
  const hoy = new Date();
  const diasParaVencer = Math.ceil((vencimiento.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
  if (vencimiento < hoy) return "vencido";
  if (diasParaVencer <= 7) return "por-vencer";
  return "activo";
}

function paymentMethodFromUi(metodoPago: Pago["metodoPago"]): PaymentMethod {
  if (metodoPago === "efectivo") return "CASH";
  if (metodoPago === "tarjeta") return "CARD";
  return "SINPE";
}

function uiMetodoFromBackend(method?: PaymentMethod): Pago["metodoPago"] {
  switch (method) {
    case "CARD":
      return "tarjeta";
    case "SINPE":
      return "sinpe";
    default:
      return "efectivo";
  }
}

function paymentTypeFromUi(tipoPago: Pago["tipoPago"]): PaymentType {
  switch (tipoPago) {
    case "diario":
      return "DAILY_MEMBERSHIP";
    case "trimestral":
      return "QUARTERLY_MEMBERSHIP";
    case "semestral":
      return "SEMESTER_MEMBERSHIP";
    case "anual":
      return "ANNUAL_MEMBERSHIP";
    case "mensual":
    default:
      return "MONTHLY_MEMBERSHIP";
  }
}

function tipoPagoFromPayment(paymentType?: PaymentType, notes?: string | null): Pago["tipoPago"] {
  switch (paymentType) {
    case "DAILY_MEMBERSHIP":
      return "diario";
    case "QUARTERLY_MEMBERSHIP":
      return "trimestral";
    case "SEMESTER_MEMBERSHIP":
      return "semestral";
    case "ANNUAL_MEMBERSHIP":
      return "anual";
    case "MONTHLY_MEMBERSHIP":
    default:
      break;
  }

  const match = notes?.match(/tipoPago:\\s*(diario|mensual|trimestral|semestral|anual)/i);
  const fromNotes = match?.[1]?.toLowerCase();
  if (fromNotes === "diario" || fromNotes === "trimestral" || fromNotes === "semestral" || fromNotes === "anual" || fromNotes === "mensual") {
    return fromNotes as Pago["tipoPago"];
  }
  return "mensual";
}

export function FigmaApp({ defaultTab }: { defaultTab?: "clientes" | "pagos" | "mediciones" }) {
  const [backendClients, setBackendClients] = useState<ClientResponse[]>([]);
  const [backendPayments, setBackendPayments] = useState<PaymentResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uiError, setUiError] = useState<string | null>(null);
  const [backupNotice, setBackupNotice] = useState<{ title: string; message: string } | null>(null);
  const [lastBackupAt, setLastBackupAt] = useState<string | null>(null);
  const [backupLoading, setBackupLoading] = useState(false);

  const [clientExtras, setClientExtras] = useState<Record<string, ClienteExtras>>({});
  const [mediciones, setMediciones] = useState<Medicion[]>([]);

  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    setClientExtras(safeReadJson<Record<string, ClienteExtras>>(LS_CLIENT_EXTRAS, {}));
    setLastBackupAt(safeReadJson<string | null>("mastergym-last-backup", null));
  }, []);

  useEffect(() => {
    safeWriteJson(LS_CLIENT_EXTRAS, clientExtras);
  }, [clientExtras]);

  async function loadAll() {
    setLoading(true);
    setError(null);
    try {
      const [clientsPage, paymentsPage, measurementsPage] = await Promise.all([
        apiGet<Page<ClientResponse>>("/api/clients?page=0&size=200&sort=fechaRegistro,desc"),
        apiGet<Page<PaymentResponse>>("/api/payments?page=0&size=200&sort=paymentDate,desc"),
        apiGet<Page<MeasurementResponse>>("/api/measurements?page=0&size=500&sort=fecha,desc"),
      ]);
      setBackendClients(clientsPage.content);
      setBackendPayments(paymentsPage.content);
      setMediciones(
        measurementsPage.content.map((m) => ({
          id: String(m.id),
          clienteId: String(m.clientId),
          fecha: m.fecha,
          peso: m.peso,
          altura: m.altura,
          pechoCm: m.pechoCm,
          cinturaCm: m.cinturaCm,
          caderaCm: m.caderaCm,
          brazoIzqCm: m.brazoIzqCm,
          brazoDerCm: m.brazoDerCm,
          piernaIzqCm: m.piernaIzqCm,
          piernaDerCm: m.piernaDerCm,
          grasaCorporal: m.grasaCorporal ?? undefined,
          notas: m.notas ?? undefined,
        }))
      );
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error cargando datos";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
  }, []);

  const latestPaymentByClient = useMemo(() => {
    const map = new Map<string, PaymentResponse>();
    backendPayments.forEach((payment) => {
      const key = String(payment.clientId);
      const current = map.get(key);
      if (!current || new Date(payment.paymentDate) > new Date(current.paymentDate)) {
        map.set(key, payment);
      }
    });
    return map;
  }, [backendPayments]);

  const clientesAll: Cliente[] = useMemo(() => {
    return backendClients.map((c) => {
      const id = String(c.id);
      const extras = clientExtras[id];
      const fechaInicio = c.fechaInicioMembresia ?? c.fechaRegistro?.slice(0, 10) ?? ymd(new Date());
      const fechaVencimiento = c.fechaVencimiento ?? "";
      const lastPayment = latestPaymentByClient.get(id);
      const tipoMembresia = tipoPagoFromPayment(lastPayment?.paymentType, lastPayment?.notes);

      return {
        id,
        nombre: c.nombre,
        apellido: c.apellido ?? "",
        email: c.email ?? "",
        telefono: c.telefono ?? "",
        fechaInicio,
        fechaVencimiento,
        estado: computeEstado(c.estado, c.fechaVencimiento),
        tipoMembresia,
        contactoEmergencia: extras?.contactoEmergencia || undefined,
        observaciones: c.notas ?? undefined,
      };
    });
  }, [backendClients, clientExtras, latestPaymentByClient]);

  const pagosAll: Pago[] = useMemo(() => {
    return backendPayments.map((p) => {
      return {
        id: String(p.id),
        clienteId: String(p.clientId),
        monto: Number.parseFloat(p.amount),
        fecha: p.paymentDate,
        tipoPago: tipoPagoFromPayment(p.paymentType, p.notes),
        metodoPago: uiMetodoFromBackend(p.paymentMethod),
        referencia: p.reference ?? undefined,
      };
    });
  }, [backendPayments]);

  const clientesFiltrados = useMemo(() => {
    if (!searchQuery.trim()) return clientesAll;
    const query = searchQuery.toLowerCase();
    return clientesAll.filter(
      (cliente) =>
        cliente.nombre.toLowerCase().includes(query) ||
        cliente.apellido.toLowerCase().includes(query) ||
        cliente.email.toLowerCase().includes(query) ||
        cliente.telefono.includes(query) ||
        cliente.estado.toLowerCase().includes(query)
    );
  }, [clientesAll, searchQuery]);

  const clientesActivos = clientesAll.filter((c) => c.estado === "activo" || c.estado === "por-vencer").length;
  const clientesVencidos = clientesAll.filter((c) => c.estado === "vencido").length;
  const clientesPorVencer = clientesAll.filter((c) => c.estado === "por-vencer").length;
  const clientesInactivos = clientesAll.filter((c) => c.estado === "inactivo").length;

  const ingresosMes = pagosAll
    .filter((p) => {
      const pagoDate = new Date(p.fecha);
      const now = new Date();
      return pagoDate.getMonth() === now.getMonth() && pagoDate.getFullYear() === now.getFullYear();
    })
    .reduce((sum, p) => sum + p.monto, 0);

  async function handleCreateCliente(cliente: ClienteFormData) {
    setError(null);
    const request: ClientCreateRequest = {
      nombre: cliente.nombre,
      apellido: cliente.apellido,
      telefono: cliente.telefono,
      email: cliente.email,
      notas: cliente.observaciones,
    };

    const created = await apiSend<ClientResponse>("/api/clients", "POST", request);

    setClientExtras((prev) => ({
      ...prev,
      [String(created.id)]: {
        contactoEmergencia: cliente.contactoEmergencia,
      },
    }));

    await loadAll();
  }

  async function handleUpdateCliente(clienteId: string, cliente: ClienteFormData) {
    setError(null);
    const request: ClientUpdateRequest = {
      nombre: cliente.nombre,
      apellido: cliente.apellido,
      telefono: cliente.telefono,
      email: cliente.email,
      notas: cliente.observaciones,
    };

    await apiSend<ClientResponse>(`/api/clients/${Number(clienteId)}`, "PUT", request);

    setClientExtras((prev) => ({
      ...prev,
      [clienteId]: {
        contactoEmergencia: cliente.contactoEmergencia,
      },
    }));

    await loadAll();
  }

  async function handleDeleteCliente(clienteId: string) {
    setError(null);
    await apiSend<void>(`/api/clients/${Number(clienteId)}`, "DELETE");

    setClientExtras((prev) => {
      const next = { ...prev };
      delete next[clienteId];
      return next;
    });

    await loadAll();
  }

  async function handleSendReminder(clienteId: string) {
    setError(null);
    try {
      await apiSend<void>(`/api/clients/${Number(clienteId)}/reminder`, "POST");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error enviando recordatorio";
      setError(msg);
      throw err;
    }
  }

  async function handleCreatePago(pago: Omit<Pago, "id">) {
    setError(null);
    try {
      const request: PaymentCreateRequest = {
        clientId: Number(pago.clienteId),
        amount: pago.monto.toFixed(2),
        currency: "CRC",
        paymentMethod: paymentMethodFromUi(pago.metodoPago),
        paymentType: paymentTypeFromUi(pago.tipoPago),
        status: "PAID",
        reference: pago.referencia,
        notes: `tipoPago: ${pago.tipoPago}`,
        paymentDate: pago.fecha,
      };

      await apiSend<PaymentResponse>("/api/payments", "POST", request);
      await loadAll();
    } catch (err) {
      const fallback = "Error registrando pago";
      let msg = fallback;
      if (err instanceof Error) {
        const match = err.message.match(/\{.*\}$/);
        if (match) {
          try {
            const parsed = JSON.parse(match[0]) as {
              message?: string;
              details?: { fieldErrors?: Record<string, string> };
            };
            msg = parsed.details?.fieldErrors?.paymentDate ?? parsed.message ?? fallback;
          } catch {
            msg = err.message;
          }
        } else {
          msg = err.message;
        }
      }
      const friendly =
        msg.toLowerCase().includes("paymentdate") || msg.toLowerCase().includes("futura")
          ? "La fecha de pago no puede ser futura. Selecciona hoy o una fecha anterior."
          : msg;
      setUiError(friendly);
    }
  }

  async function handleDeletePago(pagoId: string) {
    setError(null);
    await apiSend<void>(`/api/payments/${Number(pagoId)}`, "DELETE");
    await loadAll();
  }

  async function handleCreateMedicion(medicion: Omit<Medicion, "id">) {
    setError(null);
    const request: MeasurementCreateRequest = {
      clientId: Number(medicion.clienteId),
      fecha: medicion.fecha,
      peso: Number(medicion.peso),
      altura: Number(medicion.altura),
      pechoCm: Number(medicion.pechoCm),
      cinturaCm: Number(medicion.cinturaCm),
      caderaCm: Number(medicion.caderaCm),
      brazoIzqCm: Number(medicion.brazoIzqCm),
      brazoDerCm: Number(medicion.brazoDerCm),
      piernaIzqCm: Number(medicion.piernaIzqCm),
      piernaDerCm: Number(medicion.piernaDerCm),
      grasaCorporal: medicion.grasaCorporal !== undefined ? Number(medicion.grasaCorporal) : undefined,
      notas: medicion.notas,
    };
    await apiSend<MeasurementResponse>("/api/measurements", "POST", request);
    await loadAll();
  }

  async function handleDeleteMedicion(id: string) {
    setError(null);
    await apiSend<void>(`/api/measurements/${Number(id)}`, "DELETE");
    await loadAll();
  }

  async function handleBackup() {
    if (backupLoading) return;
    const ok = confirm("Deseas iniciar el respaldo en la nube ahora?");
    if (!ok) return;
    setBackupLoading(true);
    try {
      const token = process.env.NEXT_PUBLIC_BACKUP_TOKEN?.trim();
      const response = await apiSend<{ success: boolean; exitCode: number; output?: string }>(
        "/api/backup",
        "POST",
        undefined,
        token ? { headers: { "X-BACKUP-TOKEN": token } } : undefined
      );
      if (!response.success) {
        setBackupNotice({
          title: "Error de respaldo",
          message: response.output?.trim() || "No se pudo ejecutar el respaldo.",
        });
      } else {
        const now = new Date().toISOString();
        safeWriteJson("mastergym-last-backup", now);
        setLastBackupAt(now);
        setBackupNotice({ title: "Respaldo completado", message: "La copia en la nube se actualizo correctamente." });
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error al ejecutar el respaldo";
      setBackupNotice({ title: "Error de respaldo", message: msg });
    } finally {
      setBackupLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Dialog open={uiError !== null} onOpenChange={(open) => (!open ? setUiError(null) : null)}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle>Error</DialogTitle>
            <DialogDescription>{uiError}</DialogDescription>
          </DialogHeader>
          <div className="flex justify-end">
            <Button onClick={() => setUiError(null)} className="rounded-xl bg-gradient-to-r from-[#ff5e62] to-[#ff9966] text-white">
              Entendido
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      <Dialog open={backupNotice !== null} onOpenChange={(open) => (!open ? setBackupNotice(null) : null)}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle>{backupNotice?.title}</DialogTitle>
            <DialogDescription>{backupNotice?.message}</DialogDescription>
          </DialogHeader>
          <div className="flex justify-end">
            <Button onClick={() => setBackupNotice(null)} className="rounded-xl bg-gradient-to-r from-[#ff5e62] to-[#ff9966] text-white">
              Entendido
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      <div className="bg-gradient-to-r from-[#ff5e62] to-[#ff9966] shadow-xl">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="rounded-2xl bg-white p-3 shadow-lg">
                <img src={HEADER_IMAGE} alt="MasterGym Logo" className="h-12 w-12 rounded-xl object-cover" />
              </div>
              <div>
                <h1 className="font-black tracking-tight text-white" style={{ fontSize: "2rem" }}>
                  MasterGym
                </h1>
                <p className="text-white/90">Poder y Pasión</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {clientesPorVencer > 0 && (
                <Badge variant="secondary" className="flex items-center gap-2 bg-yellow-500 px-4 py-2 text-white hover:bg-yellow-600">
                  <AlertCircle className="h-4 w-4" />
                  {clientesPorVencer} por vencer
                </Badge>
              )}
              {clientesVencidos > 0 && (
                <Badge variant="destructive" className="flex items-center gap-2 bg-white px-4 py-2 text-[#ff5e62] hover:bg-white/90">
                  <AlertCircle className="h-4 w-4" />
                  {clientesVencidos} vencida{clientesVencidos !== 1 ? "s" : ""}
                </Badge>
              )}
              <Button
                onClick={handleBackup}
                disabled={backupLoading}
                className="rounded-xl bg-white px-4 py-2 text-[#ff5e62] shadow-md transition hover:bg-white/90 disabled:opacity-70"
              >
                <Database className="mr-2 h-4 w-4" />
                {backupLoading ? "Respaldando..." : "Respaldar"}
              </Button>
              {lastBackupAt && (
                <span className="text-sm text-white/90">
                  Ultimo respaldo: {new Date(lastBackupAt).toLocaleString("es-CR")}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-7xl p-6">
        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
            <p className="font-semibold">Error</p>
            <p className="mt-1">{error}</p>
          </div>
        )}

        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              placeholder="Buscar clientes por nombre, teléfono, correo o estado..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-14 rounded-2xl border-none bg-white pl-12 text-lg shadow-lg"
            />
          </div>
          {searchQuery && (
            <p className="ml-1 mt-2 text-sm text-gray-600">
              {clientesFiltrados.length} cliente{clientesFiltrados.length !== 1 ? "s" : ""} encontrado{clientesFiltrados.length !== 1 ? "s" : ""}
            </p>
          )}
        </div>

        <div className="mb-6 grid gap-4 md:grid-cols-3">
          <Card className="border-none bg-gradient-to-br from-white to-gray-50 shadow-lg transition-all duration-300 hover:shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm text-gray-600">Clientes Activos</CardTitle>
              <div className="rounded-xl bg-gradient-to-br from-[#ff5e62] to-[#ff9966] p-2">
                <Users className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="font-black text-gray-900" style={{ fontSize: "2rem" }}>
                {clientesActivos}
              </div>
              <p className="mt-2 text-sm text-gray-600">Activos + por vencer</p>
            </CardContent>
          </Card>

          <Card className="border-none bg-gradient-to-br from-white to-gray-50 shadow-lg transition-all duration-300 hover:shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm text-gray-600">Ingresos del Mes</CardTitle>
              <div className="rounded-xl bg-gradient-to-br from-[#ff9966] to-[#ff5e62] p-2">
                <DollarSign className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="font-black text-gray-900" style={{ fontSize: "2rem" }}>
                {colones.format(ingresosMes)}
              </div>
              <p className="mt-2 text-sm text-gray-600">Pagos registrados</p>
            </CardContent>
          </Card>

          <Card className="border-none bg-gradient-to-br from-white to-gray-50 shadow-lg transition-all duration-300 hover:shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm text-gray-600">Clientes Inactivos</CardTitle>
              <div className="rounded-xl bg-gradient-to-br from-[#ff9966] to-[#ff5e62] p-2">
                <AlertCircle className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="font-black text-gray-900" style={{ fontSize: "2rem" }}>
                {clientesInactivos}
              </div>
              <p className="mt-2 text-sm text-gray-600">Sin membresia activa</p>
            </CardContent>
          </Card>

                  </div>

        <Tabs defaultValue={defaultTab ?? "clientes"} className="space-y-6">
          <TabsList className="h-auto overflow-visible rounded-2xl border-none bg-white p-1.5 shadow-md">
            <TabsTrigger
              value="clientes"
              className="group relative rounded-xl px-6 py-3 transition-all data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#ff5e62] data-[state=active]:to-[#ff9966] data-[state=active]:text-white data-[state=active]:shadow-lg"
            >
              Clientes
              <span className="pointer-events-none absolute left-1/2 top-full z-20 mt-2 w-max -translate-x-1/2 rounded-xl bg-gradient-to-r from-[#ff5e62] to-[#ff9966] px-3 py-2 text-xs font-semibold text-white shadow-lg opacity-0 transition-all duration-200 group-hover:opacity-100 group-hover:translate-y-1">
                Gestiona perfiles, estado y contacto de clientes.
              </span>
            </TabsTrigger>
            <TabsTrigger
              value="pagos"
              className="group relative rounded-xl px-6 py-3 transition-all data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#ff5e62] data-[state=active]:to-[#ff9966] data-[state=active]:text-white data-[state=active]:shadow-lg"
            >
              Pagos
              <span className="pointer-events-none absolute left-1/2 top-full z-20 mt-2 w-max -translate-x-1/2 rounded-xl bg-gradient-to-r from-[#ff5e62] to-[#ff9966] px-3 py-2 text-xs font-semibold text-white shadow-lg opacity-0 transition-all duration-200 group-hover:opacity-100 group-hover:translate-y-1">
                Registra pagos y revisa el historial de transacciones.
              </span>
            </TabsTrigger>
            <TabsTrigger
              value="mediciones"
              className="group relative rounded-xl px-6 py-3 transition-all data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#ff5e62] data-[state=active]:to-[#ff9966] data-[state=active]:text-white data-[state=active]:shadow-lg"
            >
              Mediciones
              <span className="pointer-events-none absolute left-1/2 top-full z-20 mt-2 w-max -translate-x-1/2 rounded-xl bg-gradient-to-r from-[#ff5e62] to-[#ff9966] px-3 py-2 text-xs font-semibold text-white shadow-lg opacity-0 transition-all duration-200 group-hover:opacity-100 group-hover:translate-y-1">
                Guarda y consulta mediciones fisicas de los clientes.
              </span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="clientes">
            <ClientesTab
              clientes={clientesFiltrados}
              allClientes={clientesAll}
              pagos={pagosAll}
              mediciones={mediciones}
              onCreateCliente={handleCreateCliente}
              onUpdateCliente={handleUpdateCliente}
              onDeleteCliente={handleDeleteCliente}
              onSendReminder={handleSendReminder}
              onRefresh={loadAll}
            />
          </TabsContent>
          <TabsContent value="pagos">
            <PagosTab
              pagos={pagosAll}
              onCreatePago={handleCreatePago}
              onDeletePago={handleDeletePago}
              clientes={clientesAll}
            />
          </TabsContent>
          <TabsContent value="mediciones">
            <MedicionesTab
              mediciones={mediciones}
              clientes={clientesAll}
              onCreateMedicion={handleCreateMedicion}
              onDeleteMedicion={handleDeleteMedicion}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
