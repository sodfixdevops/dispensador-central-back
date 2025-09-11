export class RegistrarTransaccionDto {
  usuario: string; // UUID del usuario que realiza la transacción
  moneda: number;
  detalle: {
    gbcucyvlor: number; // valor del billete
    gbcucycant: number; // cantidad de billetes
  }[];
}

export interface Dptrn {
  dptrnntra: number;
  dptrnndes: number;
  dptrncmon: number;
  dptrnftra: string; // o Date si mantienes tipo Date en frontend
  dptrnimpo: number;
  dptrnmrcb: number;
  dptrnstat: number;
  dptrnfreg: string; // o Date
  dptrnusrn: string;
}

export interface FiltroTransaccion {
  fechaInicio: Date;
  fechaFinal: Date;
  estado: number;
}
