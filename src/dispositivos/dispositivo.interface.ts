// dispositivos.interface.ts
import { ApiProperty } from '@nestjs/swagger';

export class DispositivoCreateDto {
  @ApiProperty({ required: false })
  addispcode?: number;

  @ApiProperty({ required: false })
  addispnomb?: string;

  @ApiProperty({ required: false })
  addispusrn?: string;

  @ApiProperty({ required: false })
  addipsapis?: string;

  @ApiProperty({ required: false })
  addispsrl1?: string;

  @ApiProperty({ required: false })
  addispsrl2?: string;

  @ApiProperty({ required: false })
  addispmrcb?: number;

  @ApiProperty({ required: false })
  addispstat?: number;

  @ApiProperty({ required: false })
  addispfreg?: Date;

  @ApiProperty({ required: false })
  addispfupt?: Date;

  @ApiProperty({ required: false })
  addispusra?: string;

  @ApiProperty({ required: false })
  addispusru?: string;
}

export interface DispositivoDto {
  addispcode: number;
  addispnomb: string;
  addispusrn?: string;
  addipsapis: string;
  addispsrl1?: string;
  addispsrl2?: string;
  addispmrcb: number;
  addispstat: number;
  addispfreg: Date;
  addispfupt?: Date;
  addispusra?: string;
  addispusru?: string;

  nomUsuario: string;
}
