import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PfageService } from './pfage.service';
import { PfageController } from './pfage.controller';
import { PfageEntity } from './pfage.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PfageEntity])],
  controllers: [PfageController],
  providers: [PfageService],
  exports: [PfageService],
})
export class PfageModule {}
