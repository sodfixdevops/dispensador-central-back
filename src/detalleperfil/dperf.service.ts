import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, QueryRunner } from 'typeorm';
import { DperfEntity } from './dperf.entity';
import { CreateDperfDto, DperfDto, dperfMasivoDto } from './dperf.interface';

@Injectable()
export class DperfService {
  constructor(
    @InjectRepository(DperfEntity)
    private readonly dperfRepo: Repository<DperfEntity>,
    private readonly dataSource: DataSource,
  ) {}

  async create(createDperfDto: CreateDperfDto): Promise<DperfDto> {
    const entity = this.dtoToEntity(createDperfDto);
    const savedEntity = await this.dperfRepo.save(entity);
    return this.entityToDto(savedEntity);
  }

  async findAll(): Promise<DperfDto[]> {
    const entities = await this.dperfRepo.find();
    return entities.map(this.entityToDto);
  }

  async findOne(codigo: number): Promise<DperfDto> {
    const entity = await this.dperfRepo.findOneBy({ dperfcode: codigo });
    if (!entity) throw new Error('Registro no encontrado');
    return this.entityToDto(entity);
  }

  async findByPerfil(perfil: number): Promise<DperfDto[]> {
    const entities = await this.dperfRepo.find({
      where: { dperfperf: perfil },
      order: { dperfserv: 'ASC', dperfsbsv: 'ASC' },
    });
    return entities.map(this.entityToDto);
  }

  //retorna los subservicios marcados del servicio y el perfil
  async findByPerfilServicio(
    perfil: number,
    servicio: number,
    tipo: number,
  ): Promise<DperfDto[]> {
    const entities = await this.dperfRepo.findBy({
      dperfperf: perfil,
      dperfserv: servicio,
      dperftipo: tipo,
    });
    return entities.map(this.entityToDto);
  }

  async update(
    codigo: number,
    updateDperfDto: CreateDperfDto,
  ): Promise<DperfDto> {
    const entity = await this.dperfRepo.findOneBy({ dperfcode: codigo });
    if (!entity) throw new Error('Registro no encontrado');
    const updatedEntity = this.dtoToEntity(updateDperfDto);
    updatedEntity.dperfcode = codigo;
    const savedEntity = await this.dperfRepo.save(updatedEntity);
    return this.entityToDto(savedEntity);
  }

  async remove(codigo: number): Promise<void> {
    const result = await this.dperfRepo.delete(codigo);
    if (result.affected === 0) throw new Error('Registro no encontrado');
  }

  async createMany(masivos: dperfMasivoDto): Promise<DperfDto[]> {
    const queryRunner: QueryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const createDperfDtos = masivos.registros;
      // Eliminar los registros existentes con pfageperf = perfil
      await queryRunner.manager.delete(DperfEntity, {
        dperfperf: masivos.perfil,
        dperfserv: masivos.servicio,
        dperftipo: masivos.tipo,
      });
      const entities = createDperfDtos.map(this.dtoToEntity);
      const savedEntities = await queryRunner.manager.save(
        DperfEntity,
        entities,
      );

      await queryRunner.commitTransaction();
      return savedEntities.map(this.entityToDto);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  private dtoToEntity(dto: CreateDperfDto): DperfEntity {
    const entity = new DperfEntity();
    entity.dperfperf = dto.perfil;
    entity.dperfserv = dto.servicio;
    entity.dperfsbsv = dto.subserv;
    entity.dperftipo = dto.tipo;
    return entity;
  }

  private dtoToEntityMasivo(dto: CreateDperfDto): DperfEntity {
    const entity = new DperfEntity();
    entity.dperfperf = dto.perfil;
    entity.dperfserv = dto.servicio;
    entity.dperfsbsv = dto.subserv;
    return entity;
  }

  private entityToDto(entity: DperfEntity): DperfDto {
    return {
      codigo: entity.dperfcode,
      perfil: entity.dperfperf,
      servicio: entity.dperfserv,
      subserv: entity.dperfsbsv,
      tipo: entity.dperftipo,
    };
  }
}
