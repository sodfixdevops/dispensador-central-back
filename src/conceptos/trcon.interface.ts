export interface CreateTrconDto {
  prefijo: number;
  correlativo: number;
  descripcion: string;
  abreviacion: string;
  marca: number;
}

export interface UpdateTrconDto {
  descripcion?: string;
  abreviacion?: string;
  marca?: number;
}

export interface TrconDto {
  prefijo?: number;
  correlativo?: number;
  descripcion?: string;
  abreviacion?: string;
  marca?: number;
}

export interface TrconMasivoDto {
  registros?: CreateTrconDto[];
  prefijo?: number;
}
