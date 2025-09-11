import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('dpsrl')
export class Dpsrl {
  @PrimaryGeneratedColumn({ name: 'dpsrlcode', type: 'int' })
  dpsrlCode: number;

  @Column({ name: 'dpsrltbla', type: 'char', length: 20 })
  dpsrlTbla: string;

  @Column({ name: 'dpsrlseri', type: 'int', nullable: true })
  dpsrlSeri: number;
}
