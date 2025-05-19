import { UsrInfoEntity } from './usrinfo.entity';

export interface UsrInfoDto {
  codigoUsuario: string;
  nombre: string;
  nroCaja: number;
  perfil: number;
}

export interface UsrInfoResponseDto {
  codigo?: number;
  message: string;
}

export function mapToUsrInfoEntity(dto: UsrInfoDto): Partial<UsrInfoEntity> {
  return {
    usrinfousrn: dto.codigoUsuario,
    usrinfonomb: dto.nombre,
    usrinfoncja: dto.nroCaja,
    usrinfoperf: dto.perfil,
  };
}

export function mapToUsrInfoDto(entity: UsrInfoEntity): UsrInfoDto {
  return {
    codigoUsuario: entity.usrinfousrn,
    nombre: entity.usrinfonomb,
    nroCaja: entity.usrinfoncja,
    perfil: entity.usrinfoperf,
  };
}
