import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Liacs } from './liacs.entity';
import { LiacsService } from './liacs.service';
import { LiacsController } from './liacs.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Liacs])],
  controllers: [LiacsController],
  providers: [LiacsService],
  exports: [LiacsService],
})
export class LiacsModule {}
