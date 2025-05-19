import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('tr_trcon')
export class TrconEntity {
  @PrimaryColumn({ name: 'trconpref', type: 'smallint' })
  trconpref: number;

  @PrimaryColumn({ name: 'trconcorr', type: 'integer' })
  trconcorr: number;

  @Column({ name: 'trcondesc', type: 'char', length: 200 })
  trcondesc: string;

  @Column({ name: 'trconabre', type: 'char', length: 20 })
  trconabre: string;

  @Column({ name: 'trconmrcb', type: 'smallint' })
  trconmrcb: number;
}
