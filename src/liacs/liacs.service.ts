import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Liacs } from './liacs.entity';
import { LiacsInterface, LiacsCreateDto } from './liacs.interface';

@Injectable()
export class LiacsService {
  constructor(
    @InjectRepository(Liacs)
    private readonly liacsRepository: Repository<Liacs>,
  ) {}

  async findOne(id: number): Promise<Liacs | null> {
    return this.liacsRepository.findOne({ where: { liacsSeri: id } });
  }

  async create(data: LiacsCreateDto): Promise<Liacs> {
    const now = new Date();
    const rec: LiacsInterface = {
      liacsUsrn: data.liacsUsrn,
      liacsDisp: data.liacsDisp,
      liacsMrcb: 1,
      liacsFreg: now,
      liacsUact: now,
    };

    const entity = new Liacs();
    entity.liacsUsrn = rec.liacsUsrn as string;
    entity.liacsDisp = rec.liacsDisp as number;
    entity.liacsNrip = (rec as any).liacsNrip as string;
    entity.liacsMrcb = rec.liacsMrcb as number;
    entity.liacsFreg = rec.liacsFreg as Date;
    entity.liacsUact = rec.liacsUact as Date;

    return this.liacsRepository.save(entity);
  }

  async updateActivity(id: number): Promise<void> {
    await this.liacsRepository.update(id, { liacsUact: new Date() } as any);
  }

  async delete(id: number): Promise<void> {
    await this.liacsRepository.delete(id);
  }
}
