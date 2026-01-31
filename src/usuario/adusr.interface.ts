import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AduserCreateDto {
  @ApiProperty({ required: false })
  adusrusrn?: string;

  @ApiProperty({ required: false })
  adusrnick?: string;

  @ApiProperty({ required: false })
  adusrclav?: string;

  @ApiProperty({ required: false })
  adusrtipo?: number;

  @ApiProperty({ required: false })
  adusrfreg?: Date;

  @ApiProperty({ required: false })
  adusrfupt?: Date;

  @ApiProperty({ required: false })
  adusrusra?: string;

  @ApiProperty({ required: false })
  adusrusru?: string;

  @ApiProperty({ required: false })
  adusrmrcb?: number;

  @ApiProperty({ required: false })
  adusrstat?: number;
}

export interface AduserDto {
  adusrusrn: string;
  adusrnick: string;
  adusrtipo: number;
  adusrfreg: Date;
  adusrusra: string;
  adusrstat: number;
  adusrmrcb: number;

  addispcode?: number;
}

export class AduserCrudDto {
  @ApiProperty({ example: 'uuid-v4' })
  adusrusrn: string;

  @ApiProperty({ example: 'admin' })
  adusrnick: string;

  @ApiProperty()
  adusrclav: string;

  @ApiProperty({ example: 1 })
  adusrtipo: number;

  @ApiProperty()
  adusrfreg: Date;

  @ApiPropertyOptional()
  adusrfupt?: Date;

  @ApiProperty({ example: 'system' })
  adusrusra: string;

  @ApiPropertyOptional()
  adusrusru?: string;

  @ApiProperty({ example: 1 })
  adusrstat: number;

  @ApiProperty({ example: 0 })
  adusrmrcb: number;

  @ApiPropertyOptional({ example: 3 })
  addispcode?: number;
}

export class LoginUserDto {
  @ApiProperty()
  username: string;

  @ApiProperty()
  password: string;
}

export class LoginUserResponseDTO {
  id?: string;
  status: number;
  username?: string;
  tipo?: number;
  token?: string;
  message?: string;
  dispositivo?: {
    codigo: number;
    descripcion: string;
    api_url: string;
  } | null;
}
