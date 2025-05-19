import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TicketEntity } from './ticket.entity';
import { TicketService } from './ticket.service';
import { TicketController } from './ticket.controller';

import { ServService } from 'src/servicios/serv.service';
import { ServEntity } from 'src/servicios/serv.entity';
import { DperfService } from 'src/detalleperfil/dperf.service';
import { DperfEntity } from 'src/detalleperfil/dperf.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TicketEntity, ServEntity, DperfEntity])],
  controllers: [TicketController],
  providers: [TicketService, ServService, DperfService],
})
export class TicketModule {}
