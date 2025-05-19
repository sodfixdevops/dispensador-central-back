export interface ServDto {
  idServicio: number;
  descripcion?: string;
  sigla?: string;
  prioridad?: number;
  posicion?: number;
  servicio?: number;
  tipo?: number;
}

export interface ServicioFiltro {
  value: number;
  label: string;
}

export interface SubservicioFiltro {
  value: number;
  label: string;
  idServicio: number;
}
