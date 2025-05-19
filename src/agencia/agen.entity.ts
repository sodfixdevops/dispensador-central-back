import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('tr_agen')
export class AgenEntity {
  @PrimaryColumn({ name: 'agencode' })
  agencode: number;

  @Column({ name: 'agendesc', type: 'char', length: 50 })
  agendesc: string;

  @Column({ name: 'agensigl', type: 'char', length: 15 })
  agensigl: string;

  @Column({ name: 'agenplza', type: 'integer', nullable: true })
  agenplza: number;

  @Column({ name: 'agenfreg', type: 'date', nullable: true })
  agenfreg: Date;

  @Column({ name: 'agenmrcb', type: 'smallint', nullable: true })
  agenmrcb: number;
}
