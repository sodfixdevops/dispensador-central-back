import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Dpsrl } from './dpsrl.entity';
import { DpsrlService } from './dpsrl.service';

@Module({
  imports: [TypeOrmModule.forFeature([Dpsrl])],
  providers: [DpsrlService],
  exports: [DpsrlService],
})
export class DpsrlModule {}
