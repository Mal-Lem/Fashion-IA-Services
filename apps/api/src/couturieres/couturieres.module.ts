import { Module } from '@nestjs/common';
import { CouturieresController } from './couturieres.controller';
import { CouturieresService } from './couturieres.service';

@Module({
  controllers: [CouturieresController],
  providers: [CouturieresService],
  exports: [CouturieresService],
})
export class CouturieresModule {}