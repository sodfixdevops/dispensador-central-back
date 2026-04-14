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
  private static readonly URL_MAX_LENGTH = 100;
  private static readonly RESP_MAX_LENGTH = 10;
  private static readonly OBSE_MAX_LENGTH = 500;

  constructor(
    @InjectRepository(AdapiEntity)
    private readonly repo: Repository<AdapiEntity>,
  ) {}

  private sanitizeRequiredText(value: unknown, maxLength: number): string {
    const text = String(value ?? '').trim();
    return text.slice(0, maxLength);
  }

  private sanitizeOptionalText(
    value: unknown,
    maxLength: number,
  ): string | null {
    if (value === undefined || value === null) {
      return null;
    }
    const text = String(value).trim().slice(0, maxLength);
    return text.length > 0 ? text : null;
  }

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
    const sanitizedPayload = {
      adapicurl: this.sanitizeRequiredText(
        dto.adapicurl,
        AdapiService.URL_MAX_LENGTH,
      ),
      adapiresp: this.sanitizeOptionalText(
        dto.adapiresp,
        AdapiService.RESP_MAX_LENGTH,
      ),
      adapiobse: this.sanitizeOptionalText(
        dto.adapiobse,
        AdapiService.OBSE_MAX_LENGTH,
      ),
      adapistat: 1,
      adapifreg: now,
      adapifupt: now,
    };

    console.log('[ADAPI][CREATE][RAW_DTO]', JSON.stringify(dto));
    console.log('[ADAPI][CREATE][SANITIZED]', JSON.stringify(sanitizedPayload));

    const newItem = this.repo.create(sanitizedPayload);

    const saved = await this.repo.save(newItem);
    return this.toDto(saved);
  }

  async update(id: number, dto: AdapiUpdateDto): Promise<AdapiDto> {
    const item = await this.repo.findOneBy({ adapiseri: id });
    if (!item) {
      throw new NotFoundException('API no encontrada');
    }

    if (dto.adapicurl !== undefined) {
      item.adapicurl = this.sanitizeRequiredText(
        dto.adapicurl,
        AdapiService.URL_MAX_LENGTH,
      );
    }
    if (dto.adapiresp !== undefined) {
      item.adapiresp = this.sanitizeOptionalText(
        dto.adapiresp,
        AdapiService.RESP_MAX_LENGTH,
      );
    }
    if (dto.adapiobse !== undefined) {
      item.adapiobse = this.sanitizeOptionalText(
        dto.adapiobse,
        AdapiService.OBSE_MAX_LENGTH,
      );
    }
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
