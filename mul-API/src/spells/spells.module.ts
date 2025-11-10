import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SpellsService } from './spells.service';
import { SpellsController } from './spells.controller';
import { Spell, SpellSchema } from './schemas/spell.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: Spell.name, schema: SpellSchema }])],
  controllers: [SpellsController],
  providers: [SpellsService],
})
export class SpellsModule {}
