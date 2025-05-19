import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('tr_dperf')
export class DperfEntity {
  @PrimaryGeneratedColumn({ name: 'dperfcode' })
  dperfcode: number;

  @Column({ name: 'dperfperf' })
  dperfperf: number;

  @Column({ name: 'dperfserv' })
  dperfserv: number;

  @Column({ name: 'dperfsbsv' })
  dperfsbsv: number;

  @Column({ name: 'dperftipo' })
  dperftipo: number;
}
