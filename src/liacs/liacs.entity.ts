import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('liacs')
export class Liacs {
  @PrimaryGeneratedColumn({ name: 'liacsseri', type: 'int' })
  liacsSeri: number;

  @Column({ name: 'liacsusrn', type: 'varchar', length: 36 })
  liacsUsrn: string;

  @Column({ name: 'liacsdisp', type: 'int' })
  liacsDisp: number;

  @Column({ name: 'liacsnrip', type: 'varchar', length: 20 })
  liacsNrip: string;

  @Column({ name: 'liacsmrcb', type: 'smallint' })
  liacsMrcb: number;

  @Column({ name: 'liacsfreg', type: 'datetime' })
  liacsFreg: Date;

  @Column({ name: 'liacsfult', type: 'datetime', nullable: true })
  liacsFult: Date | null;

  @Column({ name: 'liacsuact', type: 'datetime', nullable: true })
  liacsUact: Date | null;
}
