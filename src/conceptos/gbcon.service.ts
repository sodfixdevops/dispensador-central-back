import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Not, QueryRunner, Repository } from 'typeorm';
import { GbconEntity } from './gbcon.entity';
import { GbconDataDto, GbconDto } from './gbcon.interface';
import { ApiResponse } from 'src/utiles';

@Injectable()
export class GbconService {
  constructor(
    @InjectRepository(GbconEntity)
    private readonly gbconRepo: Repository<GbconEntity>,
    private readonly dataSource: DataSource,
  ) {}

  async create(gbconDataDto: GbconDataDto): Promise<GbconDto> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const entity = this.dtoToEntity(gbconDataDto);
      const saved = await queryRunner.manager.save(GbconEntity, entity);
      await queryRunner.commitTransaction();

      return this.entityToDto(saved);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new Error(`No se pudo guardar Gbcon: ${error.message}`);
    } finally {
      await queryRunner.release();
    }
  }

  async update(
    pref: number,
    corr: number,
    gbconDataDto: GbconDataDto,
  ): Promise<GbconDto> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Buscar la entidad existente
      const entity = await queryRunner.manager.findOne(GbconEntity, {
        where: { gbconpref: pref, gbconcorr: corr },
      });
      if (!entity) {
        throw new Error(`Gbcon con id ${pref} no encontrado`);
      }

      // Actualizar los campos de la entidad con los datos del DTO
      const updatedFields = this.dtoToEntity(gbconDataDto);
      Object.assign(entity, updatedFields);
      // Guardar la entidad actualizada
      const saved = await queryRunner.manager.save(GbconEntity, entity);

      await queryRunner.commitTransaction();

      return this.entityToDto(saved);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new Error(`No se pudo actualizar Gbcon: ${error.message}`);
    } finally {
      await queryRunner.release();
    }
  }

  async getAll(): Promise<GbconDataDto[]> {
    const entities = await this.gbconRepo.find();
    return entities.map(this.entityToDto);
  }

  async getDetallePrefijo(prefijo: number): Promise<GbconDataDto[]> {
    const entities = await this.gbconRepo.find({
      where: {
        gbconpref: prefijo,
        gbconcorr: Not(0),
      },
      order: {
        gbconcorr: 'ASC',
      },
    });
    return entities.map(this.entityToDto);
  }

  async getPrefijos(): Promise<GbconDataDto[]> {
    const entities = await this.gbconRepo.find({
      where: {
        gbconcorr: 0,
      },
      order: {
        gbconpref: 'ASC',
        gbconcorr: 'ASC',
      },
    });
    return entities.map(this.entityToDto);
  }

  async getUnique(pref: number, corr: number): Promise<GbconDataDto[]> {
    const entities = await this.gbconRepo.find({
      where: {
        gbconpref: pref,
        gbconcorr: corr,
      },
    });
    return entities.map(this.entityToDto);
  }

  // Convertir Dto a Entidad
  private dtoToEntity(dto: Partial<GbconDto>): Partial<GbconEntity> {
    return {
      gbconpref: dto.prefijo,
      gbconcorr: dto.correlativo,
      gbcondesc: dto.descripcion,
      gbconabre: dto.abreviacion,
      gbconmrcb: dto.marca,
    };
  }

  // Convertir Entidad a Dto
  private entityToDto(entity: GbconEntity): GbconDto {
    return {
      prefijo: entity.gbconpref,
      correlativo: entity.gbconcorr,
      descripcion: entity.gbcondesc,
      abreviacion: entity.gbconabre,
      marca: entity.gbconmrcb,
    };
  }
}
