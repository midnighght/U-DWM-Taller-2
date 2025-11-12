/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MonstersService } from './monsters.service';
import { MonstersController } from './monsters.controller';
import { Monster, MonsterSchema } from './schemas/monster.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: Monster.name, schema: MonsterSchema }])],
  controllers: [MonstersController],
  providers: [MonstersService],
})
export class MonstersModule {}
