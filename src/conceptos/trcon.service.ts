import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Not, QueryRunner, Repository } from 'typeorm';
import { TrconEntity } from './trcon.entity';
import {
  CreateTrconDto,
  TrconDto,
  TrconMasivoDto,
  UpdateTrconDto,
} from './trcon.interface';

@Injectable()
export class TrconService {
  constructor(
    @InjectRepository(TrconEntity)
    private readonly trconRepo: Repository<TrconEntity>,
    private readonly dataSource: DataSource,
  ) {}

  // Convertir Dto a Entidad
  private dtoToEntity(dto: Partial<TrconDto>): Partial<TrconEntity> {
    return {
      trconpref: dto.prefijo,
      trconcorr: dto.correlativo,
      trcondesc: dto.descripcion,
      trconabre: dto.abreviacion,
      trconmrcb: dto.marca,
    };
  }

  // Convertir Entidad a Dto
  private entityToDto(entity: TrconEntity): CreateTrconDto {
    return {
      prefijo: entity.trconpref,
      correlativo: entity.trconcorr,
      descripcion: entity.trcondesc,
      abreviacion: entity.trconabre,
      marca: entity.trconmrcb,
    };
  }

  async create(createTrconDto: CreateTrconDto): Promise<CreateTrconDto> {
    const entity = this.dtoToEntity(createTrconDto);
    const newTrcon = this.trconRepo.create(entity);
    const saved = await this.trconRepo.save(newTrcon);
    return this.entityToDto(saved);
  }

  async createMany(masivo: TrconMasivoDto): Promise<CreateTrconDto[]> {
    const queryRunner: QueryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const createTrconDtos = masivo.registros;
      if (createTrconDtos.length > 0) {
        // Eliminar todos los registros para el perfil recibido
        await queryRunner.manager.delete(TrconEntity, {
          trconpref: masivo.prefijo,
          trconcorr: Not(0),
        });

        // Insertar los nuevos registros
        const entities = createTrconDtos.map(this.dtoToEntity);
        const savedEntities = await queryRunner.manager.save(
          TrconEntity,
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

  async findAll(): Promise<CreateTrconDto[]> {
    const entities = await this.trconRepo.find();
    return entities.map(this.entityToDto);
  }

  async findOne(prefijo: number, correlativo: number): Promise<CreateTrconDto> {
    const entity = await this.trconRepo.findOne({
      where: { trconpref: prefijo, trconcorr: correlativo },
    });
    if (!entity) {
      throw new NotFoundException('Registro no encontrado');
    }
    return this.entityToDto(entity);
  }

  async findConceptosByPrefijo(prefijo: number) {
    const entities = await this.trconRepo.find({
      where: {
        trconpref: prefijo,
        trconcorr: Not(0),
      },
      order: {
        trconpref: 'ASC',
      },
    });
    return entities.map(this.entityToDto);
  }

  async findConceptosCabecera() {
    const entities = await this.trconRepo.findBy({
      trconcorr: 0,
    });
    return entities.map(this.entityToDto);
  }

  async findConceptosByPerfiles() {
    const entities = await this.trconRepo.findBy({
      trconpref: In([1, 4]),
      trconcorr: Not(0),
    });
    return entities.map(this.entityToDto);
  }

  async update(
    prefijo: number,
    correlativo: number,
    updateTrconDto: UpdateTrconDto,
  ): Promise<CreateTrconDto> {
    const entity = await this.trconRepo.findOne({
      where: { trconpref: prefijo, trconcorr: correlativo },
    });
    if (!entity) {
      throw new NotFoundException('Registro no encontrado');
    }

    const updatedEntity = this.dtoToEntity(updateTrconDto);
    Object.assign(entity, updatedEntity);

    const saved = await this.trconRepo.save(entity);
    return this.entityToDto(saved);
  }

  async remove(prefijo: number, correlativo: number): Promise<void> {
    const entity = await this.trconRepo.findOne({
      where: { trconpref: prefijo, trconcorr: correlativo },
    });
    if (!entity) {
      throw new NotFoundException('Registro no encontrado');
    }
    await this.trconRepo.remove(entity);
  }
}
