import { Controller, Get, Post, Body, Patch, Param } from '@nestjs/common';
import { SpellsService } from './spells.service';
import { CreateSpellDto, UpdateSpellDto } from './dto/spell.dto';

@Controller('spells')
export class SpellsController {
  constructor(private spellsService: SpellsService) {}

  @Get()
  getAll() {
    return this.spellsService.getAll();
  }

  @Post()
  create(@Body() createSpellDto: CreateSpellDto) {
    return this.spellsService.create(createSpellDto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSpellDto: UpdateSpellDto) {
    return this.spellsService.update(id, updateSpellDto);
  }

  @Patch(':id/favorite')
  toggleFavorite(@Param('id') id: string) {
    return this.spellsService.toggleFavorite(id);
  }
}
