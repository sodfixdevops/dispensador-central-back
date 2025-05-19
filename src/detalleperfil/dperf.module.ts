import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DperfService } from './dperf.service';
import { DperfController } from './dperf.controller';
import { DperfEntity } from './dperf.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DperfEntity])],
  providers: [DperfService],
  controllers: [DperfController],
})
export class DperfModule {}
