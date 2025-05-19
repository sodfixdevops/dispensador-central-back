import { ServController } from './serv.controller';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServEntity } from './serv.entity';
import { ServService } from './serv.service';

@Module({
  imports: [TypeOrmModule.forFeature([ServEntity])],
  providers: [ServService],
  controllers: [ServController, ServController],
  exports: [ServService],
})
export class ServModule {}
