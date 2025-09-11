import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Dpsrl } from './dpsrl.entity';
import { DpsrlInterface } from './dpsrl.interface';

@Injectable()
export class DpsrlService {
  constructor(
    @InjectRepository(Dpsrl)
    private readonly dpsrlRepository: Repository<Dpsrl>,
  ) {}

  async findAll(): Promise<Dpsrl[]> {
    return this.dpsrlRepository.find();
  }

  async findByTableName(tableName: string): Promise<Dpsrl | null> {
    return this.dpsrlRepository.findOne({
      where: { dpsrlTbla: tableName },
    });
  }

  async create(data: DpsrlInterface): Promise<Dpsrl> {
    const newRecord = this.dpsrlRepository.create(data);
    return this.dpsrlRepository.save(newRecord);
  }

  async updateSerial(id: number, newSerial: number): Promise<void> {
    await this.dpsrlRepository.update(id, { dpsrlSeri: newSerial });
  }

  async incrementSerial(tableName: string): Promise<Dpsrl> {
    let record = await this.findByTableName(tableName);

    if (record) {
      record.dpsrlSeri += 1;
    } else {
      record = this.dpsrlRepository.create({
        dpsrlTbla: tableName,
        dpsrlSeri: 1,
      });
    }

    return this.dpsrlRepository.save(record);
  }
}
