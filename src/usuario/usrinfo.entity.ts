import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('tr_usrinfo')
export class UsrInfoEntity {
  @PrimaryColumn({ name: 'usrinfousrn', type: 'char', length: 36 })
  usrinfousrn: string;

  @Column({ name: 'usrinfonomb', type: 'char', length: 100 })
  usrinfonomb: string;

  @Column({ name: 'usrinfoncja', type: 'integer', default: 0 })
  usrinfoncja: number;
  @Column({ name: 'usrinfoperf', type: 'integer', default: 0 })
  usrinfoperf: number;
}
