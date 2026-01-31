import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AdapiEntity } from './adapi.entity';
import { AdapiCreateDto, AdapiUpdateDto, AdapiDto } from './adapi.interface';

@Injectable()
export class AdapiService {
  constructor(
    @InjectRepository(AdapiEntity)
    private readonly repo: Repository<AdapiEntity>,
  ) {}

  async findAll(): Promise<AdapiDto[]> {
    console.log('Esttoy aca');
    const data = await this.repo.find({
      order: { adapiseri: 'DESC' },
    });
    return data.map((item) => this.toDto(item));
  }

  async findOne(id: number): Promise<AdapiDto> {
    const item = await this.repo.findOneBy({ adapiseri: id });
    if (!item) {
      throw new NotFoundException('API no encontrada');
    }
    return this.toDto(item);
  }

  async create(dto: AdapiCreateDto): Promise<AdapiDto> {
    const now = new Date();
    const newItem = this.repo.create({
      adapicurl: dto.adapicurl,
      adapiresp: dto.adapiresp,
      adapiobse: dto.adapiobse,
      adapistat: 1,
      adapifreg: now,
      adapifupt: now,
    });

    const saved = await this.repo.save(newItem);
    return this.toDto(saved);
  }

  async update(id: number, dto: AdapiUpdateDto): Promise<AdapiDto> {
    const item = await this.repo.findOneBy({ adapiseri: id });
    if (!item) {
      throw new NotFoundException('API no encontrada');
    }

    if (dto.adapicurl !== undefined) item.adapicurl = dto.adapicurl;
    if (dto.adapiresp !== undefined) item.adapiresp = dto.adapiresp;
    if (dto.adapiobse !== undefined) item.adapiobse = dto.adapiobse;
    if (dto.adapistat !== undefined) item.adapistat = dto.adapistat;
    item.adapifupt = new Date();

    const saved = await this.repo.save(item);
    return this.toDto(saved);
  }

  async delete(id: number): Promise<void> {
    const item = await this.repo.findOneBy({ adapiseri: id });
    if (!item) {
      throw new NotFoundException('API no encontrada');
    }
    await this.repo.remove(item);
  }

  private toDto(entity: AdapiEntity): AdapiDto {
    return {
      adapiseri: entity.adapiseri,
      adapicurl: entity.adapicurl,
      adapiresp: entity.adapiresp,
      adapifreg: entity.adapifreg,
      adapifupt: entity.adapifupt,
      adapiobse: entity.adapiobse,
      adapistat: entity.adapistat,
    };
  }
}
