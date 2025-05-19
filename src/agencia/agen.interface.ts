export interface CreateAgenDto {
  idAgencia: number;
  descripcion: string;
  sigla: string;
  plaza?: number;
  fechaRegistro?: Date;
  marca?: number;
}

export interface UpdateAgenDto {
  descripcion?: string;
  sigla?: string;
  plaza?: number;
  fechaRegistro?: Date;
  marca?: number;
}

export interface AgenDto {
  idAgencia?: number;
  descripcion?: string;
  sigla: string;
  plaza?: number;
  fechaRegistro?: Date;
  marca?: number;
}

export interface Sucursalfiltro {
  value: number;
  label: string;
}

export interface Agenciafiltro {
  value: number;
  label: string;
  idSucursal: number;
}
