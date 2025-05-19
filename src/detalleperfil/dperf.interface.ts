export interface CreateDperfDto {
  perfil: number;
  servicio: number;
  subserv: number;
  tipo: number;
}

export interface DperfDto {
  codigo: number;
  perfil: number;
  servicio: number;
  subserv: number;
  tipo: number;
}

export interface dperfMasivoDto {
  registros?: CreateDperfDto[];
  perfil?: number;
  servicio?: number;
  tipo?: number;
}
