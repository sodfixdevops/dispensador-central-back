import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, IsNull, Not, Repository } from 'typeorm';
import { ServEntity } from './serv.entity';
import { ServDto, ServicioFiltro } from './serv.interface';

@Injectable()
export class ServService {
  constructor(
    @InjectRepository(ServEntity)
    private readonly servRepository: Repository<ServEntity>,
  ) {}

  async findAll(): Promise<ServDto[]> {
    const servEntities = await this.servRepository.find({
      where: [
        {
          servidsr: IsNull(),
        },
        {
          servidsr: 0,
        },
      ],
    });
    return servEntities.map((entity) => this.toDto(entity));
  }

  async findOne(idServicio: number): Promise<ServDto> {
    const entity = await this.servRepository.findOne({
      where: { servcode: idServicio },
    });
    return this.toDto(entity);
  }

  async ListaSubservicios(idServicio: number): Promise<ServDto[]> {
    const entity = await this.servRepository.findBy({
      servidsr: idServicio,
    });
    return entity.map((entity) => this.toDto(entity));
  }

  async listaSubserviciosAccion(): Promise<ServDto[]> {
    const servEntities = await this.servRepository.find({
      where: [
        {
          servtipo: Not(1),
        },
      ],
    });
    return servEntities.map((entity) => this.toDto(entity));
  }

  async filtroServicios(): Promise<ServicioFiltro[]> {
    const servEntities = await this.servRepository.find({
      where: [
        {
          servidsr: IsNull(),
        },
        {
          servidsr: 0,
        },
      ],
    });
    const servicios = servEntities.map((servicio: ServEntity) => {
      return {
        value: servicio.servcode,
        label: servicio.servdesc,
      };
    });
    return servicios;
  }

  async filtroSubservicio(): Promise<ServicioFiltro[]> {
    const servEntities = await this.servRepository.find({
      where: [
        {
          servidsr: Not(0),
        },
      ],
    });
    const servicios = servEntities.map((servicio: ServEntity) => {
      return {
        value: servicio.servcode,
        label: servicio.servdesc,
        idServicio: servicio.servidsr,
      };
    });
    return servicios;
  }

  /**
   * Obtener servicios por lista de codigos
   */
  async findServiciosByCodes(codigos: string) {
    const serviciosArray = JSON.parse(codigos);
    const result = await this.servRepository.find({
      where: {
        servcode: In(serviciosArray), // Esto aplica el filtro `IN` a la columna `servcode`
      },
      order: {
        servcode: 'ASC', // Esto aplica el `ORDER BY` a la columna `servcode`
      },
    });

    return result.map(this.toDto);
  }

  async create(servDto: ServDto): Promise<ServDto> {
    const newServ = this.servRepository.create(this.toEntity(servDto));
    const savedEntity = await this.servRepository.save(newServ);

    return this.toDto(savedEntity);
  }

  async update(idServicio: number, servDto: ServDto): Promise<ServDto> {
    const entity = await this.servRepository.findOne({
      where: { servcode: idServicio },
    });
    if (entity) {
      const updated = this.servRepository.merge(entity, this.toEntity(servDto));
      const result = await this.servRepository.save(updated);
      return this.toDto(result);
    }
    return null;
  }

  async delete(idServicio: number): Promise<void> {
    await this.servRepository.delete({ servcode: idServicio });
  }

  // Métodos de conversión
  private toDto(entity: ServEntity): ServDto {
    return {
      idServicio: entity.servcode,
      descripcion: entity.servdesc,
      sigla: entity.servsigl,
      prioridad: entity.servprio,
      posicion: entity.servposi,
      servicio: entity.servidsr,
      tipo: entity.servtipo,
    };
  }

  private toEntity(dto: ServDto): ServEntity {
    return {
      servcode: dto.idServicio,
      servdesc: dto.descripcion,
      servsigl: dto.sigla,
      servprio: dto.prioridad,
      servposi: dto.posicion,
      servidsr: dto.servicio,
      servtipo: dto.tipo,
    };
  }
}
