import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('adusrd')
export class AdusrdEntity {
  @PrimaryGeneratedColumn({ name: 'adusrdseri', type: 'int' })
  adusrdseri: number;

  @Column({ name: 'adusrdusrn', type: 'varchar', length: 36 })
  adusrdusrn: string;

  @Column({ name: 'adusrddisp', type: 'int' })
  adusrddisp: number;

  @Column({ name: 'adusrdmrcb', type: 'smallint' })
  adusrdmrcb: number;
}
