import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('tr_pfage')
export class PfageEntity {
  @PrimaryGeneratedColumn({ name: 'pfagecode' })
  pfagecode: number;

  @Column({ name: 'pfageperf' })
  pfageperf: number;

  @Column({ name: 'pfageagen' })
  pfageagen: number;
  @Column({ name: 'pfagetipo' })
  pfagetipo: number;
}
