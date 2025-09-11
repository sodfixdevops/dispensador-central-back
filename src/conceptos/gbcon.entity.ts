import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('gbcon')
export class GbconEntity {
  @PrimaryGeneratedColumn()
  gbcongnid: number;

  @Column({ type: 'smallint' })
  gbconpref: number;

  @Column({ type: 'int' })
  gbconcorr: number;

  @Column({ type: 'char', length: 200 })
  gbcondesc: string;

  @Column({ type: 'char', length: 20 })
  gbconabre: string;

  @Column({ type: 'smallint' })
  gbconmrcb: number;
}
