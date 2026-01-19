import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('tr_agen')
export class AgenEntity {
  @PrimaryColumn({ name: 'agencode', type: 'int' })
  agencode: number;

  @Column({ name: 'agendesc', type: 'varchar', length: 50 })
  agendesc: string;

  @Column({ name: 'agensigl', type: 'varchar', length: 15 })
  agensigl: string;

  @Column({ name: 'agenplza', type: 'int', nullable: true })
  agenplza: number;

  @Column({ name: 'agenfreg', type: 'datetime', nullable: true })
  agenfreg: Date;

  @Column({ name: 'agenmrcb', type: 'smallint', nullable: true })
  agenmrcb: number;
}
