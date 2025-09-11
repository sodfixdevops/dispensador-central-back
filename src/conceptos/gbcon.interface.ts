import { ApiProperty } from '@nestjs/swagger';

export class GbconDataDto {
  @ApiProperty({ required: false })
  prefijo?: number;

  @ApiProperty({ required: false })
  correlativo?: number;

  @ApiProperty({ required: false })
  descripcion?: string;

  @ApiProperty({ required: false })
  abreviacion?: string;

  @ApiProperty({ required: false })
  marca?: number;
}

export interface GbconDto {
  prefijo: number;
  correlativo: number;
  descripcion: string;
  abreviacion: string;
  marca: number;
}
