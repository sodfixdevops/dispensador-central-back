import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository, InjectDataSource } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { AdbankEntity } from './adbank.entity';
import {
  AdbankCreateDto,
  AdbankUpdateDto,
  AdbankDto,
} from './adbank.interface';
import { AduserEntity } from 'src/usuario/adusr.entity';

@Injectable()
export class AdbankService {
  constructor(
    @InjectRepository(AdbankEntity)
    private readonly repo: Repository<AdbankEntity>,
    @InjectDataSource() private readonly dataSource: DataSource,
  ) {}

  async findAll(): Promise<AdbankDto[]> {
    const data = await this.repo.find({
      where: { adbankmrcb: 0 },
      order: { adbankseri: 'DESC' },
    });
    return data.map((item) => this.toDto(item));
  }

  async findOne(id: number): Promise<AdbankDto> {
    const item = await this.repo.findOneBy({ adbankseri: id });
    if (!item) {
      throw new NotFoundException('Cuenta bancaria no encontrada');
    }
    return this.toDto(item);
  }

  async findByUser(adbankusrn: string): Promise<AdbankDto[]> {
    const data = await this.repo.find({
      where: { adbankusrn, adbankmrcb: 0 },
      order: { adbankseri: 'DESC' },
    });
    return data.map((item) => this.toDto(item));
  }

  async create(dto: AdbankCreateDto): Promise<AdbankDto> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const aduserRepo = queryRunner.manager.getRepository(AduserEntity);
      const adbankRepo = queryRunner.manager.getRepository(AdbankEntity);

      // Validar que el usuario existe SI viene adbankusrn
      if (dto.adbankusrn) {
        const usuario = await aduserRepo.findOneBy({
          adusrusrn: dto.adbankusrn,
        });
        if (!usuario) {
          throw new BadRequestException(
            'El usuario especificado no existe en el sistema',
          );
        }
      }

      // Crear cuenta bancaria dentro de la transacción
      const newItem = adbankRepo.create({
        adbankusrn: dto.adbankusrn,
        adbankncta: dto.adbankncta,
        adbanktipo: dto.adbanktipo,
        adbankmone: dto.adbankmone,
        adbankmrcb: dto.adbankmrcb ?? 0, // Por defecto 0 si no viene del front
        adbankfreg: new Date(),
      });

      const saved = await adbankRepo.save(newItem);
      await queryRunner.commitTransaction();
      return this.toDto(saved);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async update(id: number, dto: AdbankUpdateDto): Promise<AdbankDto> {
    const item = await this.repo.findOneBy({ adbankseri: id });
    if (!item) {
      throw new NotFoundException('Cuenta bancaria no encontrada');
    }

    if (dto.adbankusrn !== undefined) item.adbankusrn = dto.adbankusrn;
    if (dto.adbankncta !== undefined) item.adbankncta = dto.adbankncta;
    if (dto.adbanktipo !== undefined) item.adbanktipo = dto.adbanktipo;
    if (dto.adbankmone !== undefined) item.adbankmone = dto.adbankmone;
    if (dto.adbankmrcb !== undefined) item.adbankmrcb = dto.adbankmrcb;

    const saved = await this.repo.save(item);
    return this.toDto(saved);
  }

  async delete(id: number): Promise<void> {
    const item = await this.repo.findOneBy({ adbankseri: id });
    if (!item) {
      throw new NotFoundException('Cuenta bancaria no encontrada');
    }
    await this.repo.remove(item);
  }

  private toDto(entity: AdbankEntity): AdbankDto {
    return {
      adbankseri: entity.adbankseri,
      adbankusrn: entity.adbankusrn,
      adbankncta: entity.adbankncta,
      adbanktipo: entity.adbanktipo,
      adbankmone: entity.adbankmone,
      adbankfreg: entity.adbankfreg,
      adbankmrcb: entity.adbankmrcb,
    };
  }
}
