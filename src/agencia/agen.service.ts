import {
  Injectable,
  NotFoundException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThan, Not, Repository } from 'typeorm';
import { AgenEntity } from './agen.entity';
import {
  Agenciafiltro,
  AgenDto,
  CreateAgenDto,
  Sucursalfiltro,
  UpdateAgenDto,
} from './agen.interface';

@Injectable()
export class AgenService {
  constructor(
    @InjectRepository(AgenEntity)
    private readonly agenRepo: Repository<AgenEntity>,
  ) {}

  // Convertir Dto a Entidad
  private dtoToEntity(dto: Partial<AgenDto>): Partial<AgenEntity> {
    return {
      agencode: dto.idAgencia,
      agendesc: dto.descripcion,
      agensigl: dto.sigla,
      agenplza: dto.plaza,
      agenfreg: dto.fechaRegistro,
      agenmrcb: dto.marca,
    };
  }

  // Convertir Entidad a Dto
  private entityToDto(entity: AgenEntity): AgenDto {
    return {
      idAgencia: entity.agencode,
      descripcion: entity.agendesc,
      sigla: entity.agensigl,
      plaza: entity.agenplza,
      fechaRegistro: entity.agenfreg,
      marca: entity.agenmrcb,
    };
  }

  async create(createAgenDto: CreateAgenDto): Promise<AgenDto> {
    // Paso 1: Verificar si ya existe una agencia con el mismo idAgencia
    const existingAgen = await this.agenRepo.findOne({
      where: { agencode: createAgenDto.idAgencia },
    });

    // Si ya existe, lanzar una excepción de conflicto (409)
    if (existingAgen) {
      throw new HttpException(
        `Agencia con ID ${createAgenDto.idAgencia} ya existe.`,
        HttpStatus.CONFLICT,
      );
    }

    // Paso 2: Crear la nueva entidad
    const createAgen: CreateAgenDto = {
      ...createAgenDto,
      fechaRegistro: new Date(),
    };
    const entity = this.dtoToEntity(createAgen);

    const newAgen = this.agenRepo.create(entity);

    // Paso 3: Guardar la nueva agencia
    const saved = await this.agenRepo.save(newAgen);

    // Paso 4: Retornar la respuesta con la entidad guardada
    return this.entityToDto(saved);
  }

  async findAll(): Promise<AgenDto[]> {
    const entities = await this.agenRepo.find();
    return entities.map(this.entityToDto);
  }

  async findOne(idAgencia: number): Promise<AgenDto> {
    const entity = await this.agenRepo.findOne({
      where: { agencode: idAgencia },
    });
    if (!entity) {
      throw new NotFoundException('Agencia no encontrada');
    }
    return this.entityToDto(entity);
  }

  async findAllSucursales(): Promise<AgenDto[]> {
    const entities = await this.agenRepo.findBy({ agenplza: 0 });
    return entities.map(this.entityToDto);
  }

  async findAllAgencias(): Promise<AgenDto[]> {
    const entities = await this.agenRepo.findBy({ agenplza: MoreThan(0) });
    return entities.map(this.entityToDto);
  }

  async filtroSucursales(): Promise<Sucursalfiltro[]> {
    const entities = await this.agenRepo.findBy({ agenplza: 0 });
    const agencias = entities.map((agencia: AgenEntity) => {
      return {
        value: agencia.agencode,
        label: agencia.agendesc,
      };
    });
    return agencias;
  }

  async filtroAgencias(): Promise<Agenciafiltro[]> {
    const entities = await this.agenRepo.findBy({ agenplza: Not(0) });
    const agencias = entities.map((agencia: AgenEntity) => {
      return {
        value: agencia.agencode,
        label: agencia.agendesc,
        idSucursal: agencia.agenplza,
      };
    });
    return agencias;
  }

  async findAllAgenciasBySucursal(idAgencia: number): Promise<AgenDto[]> {
    const entities = await this.agenRepo.findBy({ agenplza: idAgencia });
    return entities.map(this.entityToDto);
  }

  async update(
    idAgencia: number,
    updateAgenDto: UpdateAgenDto,
  ): Promise<AgenDto> {
    const entity = await this.agenRepo.findOne({
      where: { agencode: idAgencia },
    });
    if (!entity) {
      throw new NotFoundException('Agencia no encontrada');
    }
    const updatedEntity = this.dtoToEntity(updateAgenDto);
    await this.agenRepo.update(idAgencia, updatedEntity);

    const updatedAgen = await this.agenRepo.findOneBy({
      agencode: idAgencia,
    });

    return this.entityToDto(updatedAgen);
  }

  async remove(idAgencia: number): Promise<void> {
    const entity = await this.agenRepo.findOne({
      where: { agencode: idAgencia },
    });
    if (!entity) {
      throw new NotFoundException('Agencia no encontrada');
    }
    await this.agenRepo.remove(entity);
  }
}
