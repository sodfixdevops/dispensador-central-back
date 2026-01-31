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
import { AdapiService } from './adapi.service';
import { AdapiCreateDto, AdapiUpdateDto, AdapiDto } from './adapi.interface';

@ApiTags('API')
@Controller('bankapi')
export class AdapiController {
  constructor(private readonly service: AdapiService) {}

  @Get()
  @ApiOperation({ summary: 'Listar todas las APIs' })
  @ApiResponse({
    status: 200,
    description: 'Lista de APIs',
    type: [AdapiDto],
  })
  async findAll(): Promise<AdapiDto[]> {
    console.log('Entro al controller');
    return this.service.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener API por ID' })
  @ApiResponse({
    status: 200,
    description: 'API encontrada',
    type: AdapiDto,
  })
  async findOne(@Param('id') id: number): Promise<AdapiDto> {
    return this.service.findOne(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear nueva API' })
  @ApiResponse({
    status: 201,
    description: 'API creada',
    type: AdapiDto,
  })
  async create(@Body() dto: AdapiCreateDto): Promise<AdapiDto> {
    return this.service.create(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualizar API' })
  @ApiResponse({
    status: 200,
    description: 'API actualizada',
    type: AdapiDto,
  })
  async update(
    @Param('id') id: number,
    @Body() dto: AdapiUpdateDto,
  ): Promise<AdapiDto> {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar API' })
  @ApiResponse({
    status: 204,
    description: 'API eliminada',
  })
  async delete(@Param('id') id: number): Promise<void> {
    return this.service.delete(id);
  }
}
