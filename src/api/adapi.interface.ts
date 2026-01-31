import { ApiProperty } from '@nestjs/swagger';

export class AdapiCreateDto {
  @ApiProperty()
  adapicurl: string;

  @ApiProperty({ required: false })
  adapiresp?: string;

  @ApiProperty({ required: false })
  adapiobse?: string;

  @ApiProperty()
  adapistat: number;
}

export class AdapiUpdateDto {
  @ApiProperty({ required: false })
  adapicurl?: string;

  @ApiProperty({ required: false })
  adapiresp?: string;

  @ApiProperty({ required: false })
  adapiobse?: string;

  @ApiProperty({ required: false })
  adapistat?: number;
}

export class AdapiDto {
  @ApiProperty()
  adapiseri: number;

  @ApiProperty()
  adapicurl: string;

  @ApiProperty({ required: false })
  adapiresp?: string;

  @ApiProperty()
  adapifreg: Date;

  @ApiProperty()
  adapifupt: Date;

  @ApiProperty({ required: false })
  adapiobse?: string;

  @ApiProperty()
  adapistat: number;
}
