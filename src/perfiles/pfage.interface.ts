export interface CreatePfageDto {
  perfil: number;
  agencia: number;
  tipo: number;
}

export interface PfageDto {
  codigo: number;
  perfil: number;
  agencia: number;
  tipo: number;
}

export interface PfageMasivoDto {
  registros?: PfageDto[];
  perfil?: number;
  tipo?: number;
}
