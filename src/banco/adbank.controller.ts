import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AdbankService } from './adbank.service';
import {
  AdbankCreateDto,
  AdbankUpdateDto,
  AdbankDto,
} from './adbank.interface';

@ApiTags('Banco')
@Controller('banco')
export class AdbankController {
  constructor(private readonly service: AdbankService) {}

  @Get()
  @ApiOperation({ summary: 'Listar todas las cuentas bancarias' })
  @ApiResponse({
    status: 200,
    description: 'Lista de cuentas',
    type: [AdbankDto],
  })
  async findAll(): Promise<AdbankDto[]> {
    return this.service.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener cuenta bancaria por ID' })
  @ApiResponse({
    status: 200,
    description: 'Cuenta encontrada',
    type: AdbankDto,
  })
  async findOne(@Param('id') id: number): Promise<AdbankDto> {
    return this.service.findOne(id);
  }

  @Get('usuario/:adbankusrn')
  @ApiOperation({ summary: 'Obtener cuentas bancarias de un usuario' })
  @ApiResponse({
    status: 200,
    description: 'Cuentas del usuario',
    type: [AdbankDto],
  })
  async findByUser(
    @Param('adbankusrn') adbankusrn: string,
  ): Promise<AdbankDto[]> {
    return this.service.findByUser(adbankusrn);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear nueva cuenta bancaria' })
  @ApiResponse({
    status: 201,
    description: 'Cuenta creada',
    type: AdbankDto,
  })
  async create(@Body() dto: AdbankCreateDto): Promise<AdbankDto> {
    return this.service.create(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualizar cuenta bancaria' })
  @ApiResponse({
    status: 200,
    description: 'Cuenta actualizada',
    type: AdbankDto,
  })
  async update(
    @Param('id') id: number,
    @Body() dto: AdbankUpdateDto,
  ): Promise<AdbankDto> {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar cuenta bancaria' })
  @ApiResponse({
    status: 204,
    description: 'Cuenta eliminada',
  })
  async delete(@Param('id') id: number): Promise<void> {
    return this.service.delete(id);
  }
}
