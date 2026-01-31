import { ApiProperty } from '@nestjs/swagger';

export class AdbankCreateDto {
  @ApiProperty({ required: false })
  adbankusrn?: string;

  @ApiProperty({ required: false })
  adbankncta?: string;

  @ApiProperty({ required: false })
  adbanktipo?: string;

  @ApiProperty({ required: false })
  adbankmone?: string;

  @ApiProperty({ required: false, default: 0 })
  adbankmrcb?: number;
}

export class AdbankUpdateDto {
  @ApiProperty({ required: false })
  adbankusrn?: string;

  @ApiProperty({ required: false })
  adbankncta?: string;

  @ApiProperty({ required: false })
  adbanktipo?: string;

  @ApiProperty({ required: false })
  adbankmone?: string;

  @ApiProperty({ required: false })
  adbankmrcb?: number;
}

export class AdbankDto {
  @ApiProperty()
  adbankseri: number;

  @ApiProperty({ required: false })
  adbankusrn?: string;

  @ApiProperty({ required: false })
  adbankncta?: string;

  @ApiProperty({ required: false })
  adbanktipo?: string;

  @ApiProperty({ required: false })
  adbankmone?: string;

  @ApiProperty()
  adbankfreg: Date;

  @ApiProperty()
  adbankmrcb: number;
}
