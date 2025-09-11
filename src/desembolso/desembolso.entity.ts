import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('dpdes')
export class Dpdes {
  @PrimaryColumn({ name: 'dpdesndes', type: 'int' })
  dpdesndes: number;

  @Column({ name: 'dpdesfsol', type: 'date' })
  dpdesfsol: Date;

  @Column({ name: 'dpdesstat', type: 'smallint' })
  dpdesstat: number;

  @Column({ name: 'dpdesimpt', type: 'decimal', precision: 14, scale: 2 })
  dpdesimpt: number;

  @Column({ name: 'dpdesusrs', type: 'char', length: 36 })
  dpdesusrs: string;

  @Column({ name: 'dpdesdisp', type: 'int' })
  dpdesdisp: number;

  @Column({ name: 'dpdesmrcb', type: 'smallint' })
  dpdesmrcb: number;
}
