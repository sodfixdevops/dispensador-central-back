import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('addisp')
export class DispositivoEntity {
  @PrimaryGeneratedColumn({ name: 'addispcode', type: 'int' })
  addispcode: number;

  @Column({ name: 'addispnomb', type: 'varchar', length: 70 })
  addispnomb: string;

  @Column({ name: 'addispusrn', type: 'varchar', length: 36 })
  addispusrn: string;

  @Column({ name: 'addipsapis', type: 'varchar', length: 70 })
  addipsapis: string;

  @Column({ name: 'addispsrl1', type: 'varchar', length: 70 })
  addispsrl1: string;

  @Column({ name: 'addispsrl2', type: 'varchar', length: 70 })
  addispsrl2: string;

  @Column({ name: 'addispmrcb', type: 'smallint' })
  addispmrcb: number;

  @Column({ name: 'addispstat', type: 'smallint' })
  addispstat: number;

  @Column({ name: 'addispfreg', type: 'datetime' })
  addispfreg: Date;

  @Column({ name: 'addispfupt', type: 'datetime', nullable: true })
  addispfupt?: Date;

  @Column({ name: 'addispusra', type: 'varchar', length: 36, nullable: true })
  addispusra?: string;

  @Column({ name: 'addispusru', type: 'varchar', length: 36, nullable: true })
  addispusru?: string;
}
