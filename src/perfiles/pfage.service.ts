import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, QueryRunner, In } from 'typeorm';
import { PfageEntity } from './pfage.entity';
import { CreatePfageDto, PfageDto, PfageMasivoDto } from './pfage.interface';

@Injectable()
export class PfageService {
  constructor(
    @InjectRepository(PfageEntity)
    private readonly pfageRepo: Repository<PfageEntity>,
    private readonly dataSource: DataSource,
  ) {}

  async create(createPfageDto: CreatePfageDto): Promise<PfageDto> {
    const entity = this.dtoToEntity(createPfageDto);
    const savedEntity = await this.pfageRepo.save(entity);
    return this.entityToDto(savedEntity);
  }

  async findAll(): Promise<PfageDto[]> {
    const entities = await this.pfageRepo.find();
    return entities.map(this.entityToDto);
  }

  async findOne(codigo: number): Promise<PfageDto> {
    const entity = await this.pfageRepo.findOneBy({ pfagecode: codigo });
    if (!entity) throw new Error('Registro no encontrado');
    return this.entityToDto(entity);
  }

  async update(
    codigo: number,
    updatePfageDto: CreatePfageDto,
  ): Promise<PfageDto> {
    const entity = await this.pfageRepo.findOneBy({ pfagecode: codigo });
    if (!entity) throw new Error('Registro no encontrado');
    const updatedEntity = this.dtoToEntity(updatePfageDto);
    updatedEntity.pfagecode = codigo;
    const savedEntity = await this.pfageRepo.save(updatedEntity);
    return this.entityToDto(savedEntity);
  }

  async remove(codigo: number): Promise<void> {
    const result = await this.pfageRepo.delete(codigo);
    if (result.affected === 0) throw new Error('Registro no encontrado');
  }

  async createMany(masivo: PfageMasivoDto): Promise<PfageDto[]> {
    const queryRunner: QueryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const createPfageDtos: CreatePfageDto[] = masivo.registros;
      const perfil = masivo.perfil;
      const tipo = masivo.tipo;
      if (createPfageDtos.length > 0) {
        // Eliminar todos los registros para el perfil recibido
        await queryRunner.manager.delete(PfageEntity, { pfageperf: perfil });

        // Eliminar registros basados en los códigos de agencia
        const agencias = createPfageDtos.map((dto) => dto.agencia);
        if (tipo == 1) {
          await queryRunner.manager.delete(PfageEntity, {
            pfageagen: In(agencias),
            pfagetipo: tipo,
          });
        }

        // Insertar los nuevos registros
        const entities = createPfageDtos.map(this.dtoToEntity);
        const savedEntities = await queryRunner.manager.save(
          PfageEntity,
          entities,
        );

        await queryRunner.commitTransaction();
        return savedEntities.map(this.entityToDto);
      }

      return [];
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findByPerfil(perfil: number): Promise<PfageDto[]> {
    const entities = await this.pfageRepo.findBy({ pfageperf: perfil });
    return entities.map(this.entityToDto);
  }

  async findPerfilesAgencia(
    agencia: number,
    tipo: number,
  ): Promise<PfageDto[]> {
    const entities = await this.pfageRepo.findBy({
      pfageagen: agencia,
      pfagetipo: tipo,
    });
    return entities.map(this.entityToDto);
  }

  private dtoToEntity(dto: CreatePfageDto): PfageEntity {
    const entity = new PfageEntity();
    entity.pfageperf = dto.perfil;
    entity.pfageagen = dto.agencia;
    entity.pfagetipo = dto.tipo;
    return entity;
  }

  private entityToDto(entity: PfageEntity): PfageDto {
    return {
      codigo: entity.pfagecode,
      perfil: entity.pfageperf,
      agencia: entity.pfageagen,
      tipo: entity.pfagetipo,
    };
  }
}
