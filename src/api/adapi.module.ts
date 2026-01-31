import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdapiEntity } from './adapi.entity';
import { AdapiService } from './adapi.service';
import { AdapiController } from './adapi.controller';

@Module({
  imports: [TypeOrmModule.forFeature([AdapiEntity])],
  controllers: [AdapiController],
  providers: [AdapiService],
  exports: [AdapiService],
})
export class AdapiModule {}
