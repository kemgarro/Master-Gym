"use client";

import { Download } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { apiDownload } from "@/lib/api";
import type { Medicion } from "../types";

interface MedicionDetailProps {
  medicion: Medicion;
  clienteNombre: string;
}

export function MedicionDetail({ medicion, clienteNombre }: MedicionDetailProps) {
  const calcularIMC = (peso: number, altura: number) => {
    const alturaMetros = altura / 100;
    return (peso / (alturaMetros * alturaMetros)).toFixed(1);
  };

  const getIMCCategoria = (imc: number) => {
    if (imc < 18.5) return { texto: "Bajo peso", color: "bg-blue-100 text-blue-900" };
    if (imc < 25) return { texto: "Normal", color: "bg-green-100 text-green-900" };
    if (imc < 30) return { texto: "Sobrepeso", color: "bg-yellow-100 text-yellow-900" };
    return { texto: "Obesidad", color: "bg-red-100 text-red-900" };
  };

  const imc = parseFloat(calcularIMC(medicion.peso, medicion.altura));
  const categoria = getIMCCategoria(imc);

  const handleDownloadPdf = async () => {
    try {
      const blob = await apiDownload(`/api/measurements/${Number(medicion.id)}/report/pdf`);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `medicion_${medicion.id}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert("No se pudo descargar el PDF.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button onClick={handleDownloadPdf} className="rounded-xl bg-gradient-to-r from-[#ff5e62] to-[#ff9966] text-white shadow-lg">
          <Download className="mr-2 h-4 w-4" />
          Descargar PDF
        </Button>
      </div>
      <div className="rounded-2xl bg-gradient-to-r from-[#ffe5e6] to-[#ffe5cc] p-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Cliente</p>
            <p className="text-lg font-bold text-gray-900">{clienteNombre}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Fecha</p>
            <p className="text-lg font-bold text-gray-900">{new Date(medicion.fecha).toLocaleDateString()}</p>
          </div>
        </div>
      </div>

      <div className="space-y-4 rounded-2xl bg-gray-50 p-6">
        <h3 className="font-semibold text-gray-900">Datos Básicos</h3>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <div className="rounded-xl bg-white p-4 text-center shadow-sm">
            <p className="mb-1 text-xs text-gray-600">Peso</p>
            <p className="text-2xl font-bold text-[#ff5e62]">{medicion.peso}</p>
            <p className="text-xs text-gray-500">kg</p>
          </div>
          <div className="rounded-xl bg-white p-4 text-center shadow-sm">
            <p className="mb-1 text-xs text-gray-600">Altura</p>
            <p className="text-2xl font-bold text-[#ff9966]">{medicion.altura}</p>
            <p className="text-xs text-gray-500">cm</p>
          </div>
          <div className="rounded-xl bg-white p-4 text-center shadow-sm">
            <p className="mb-1 text-xs text-gray-600">IMC</p>
            <p className="text-2xl font-bold text-gray-900">{imc}</p>
            <Badge className={`${categoria.color} mt-1 text-xs`}>{categoria.texto}</Badge>
          </div>
          {medicion.grasaCorporal != null && (
            <div className="rounded-xl bg-white p-4 text-center shadow-sm">
              <p className="mb-1 text-xs text-gray-600">Grasa</p>
              <p className="text-2xl font-bold text-purple-600">{medicion.grasaCorporal}</p>
              <p className="text-xs text-gray-500">%</p>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-4 rounded-2xl bg-gray-50 p-6">
        <h3 className="font-semibold text-gray-900">Circunferencias Torso</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="rounded-xl bg-white p-4 text-center shadow-sm">
            <p className="mb-2 text-xs text-gray-600">Pecho</p>
            <p className="text-xl font-bold text-gray-900">{medicion.pechoCm}</p>
            <p className="text-xs text-gray-500">cm</p>
          </div>
          <div className="rounded-xl bg-white p-4 text-center shadow-sm">
            <p className="mb-2 text-xs text-gray-600">Cintura</p>
            <p className="text-xl font-bold text-gray-900">{medicion.cinturaCm}</p>
            <p className="text-xs text-gray-500">cm</p>
          </div>
          <div className="rounded-xl bg-white p-4 text-center shadow-sm">
            <p className="mb-2 text-xs text-gray-600">Cadera</p>
            <p className="text-xl font-bold text-gray-900">{medicion.caderaCm}</p>
            <p className="text-xs text-gray-500">cm</p>
          </div>
        </div>
      </div>

      <div className="space-y-4 rounded-2xl bg-gray-50 p-6">
        <h3 className="font-semibold text-gray-900">Circunferencias Brazos</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-xl bg-white p-4 text-center shadow-sm">
            <p className="mb-2 text-xs text-gray-600">Brazo Izquierdo</p>
            <p className="text-xl font-bold text-gray-900">{medicion.brazoIzqCm}</p>
            <p className="text-xs text-gray-500">cm</p>
          </div>
          <div className="rounded-xl bg-white p-4 text-center shadow-sm">
            <p className="mb-2 text-xs text-gray-600">Brazo Derecho</p>
            <p className="text-xl font-bold text-gray-900">{medicion.brazoDerCm}</p>
            <p className="text-xs text-gray-500">cm</p>
          </div>
        </div>
      </div>

      <div className="space-y-4 rounded-2xl bg-gray-50 p-6">
        <h3 className="font-semibold text-gray-900">Circunferencias Piernas</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-xl bg-white p-4 text-center shadow-sm">
            <p className="mb-2 text-xs text-gray-600">Pierna Izquierda</p>
            <p className="text-xl font-bold text-gray-900">{medicion.piernaIzqCm}</p>
            <p className="text-xs text-gray-500">cm</p>
          </div>
          <div className="rounded-xl bg-white p-4 text-center shadow-sm">
            <p className="mb-2 text-xs text-gray-600">Pierna Derecha</p>
            <p className="text-xl font-bold text-gray-900">{medicion.piernaDerCm}</p>
            <p className="text-xs text-gray-500">cm</p>
          </div>
        </div>
      </div>
    </div>
  );
}
