import { Controller, Get, Post, Body, Param, Patch } from '@nestjs/common';
import { SpellsService } from './spells.service';

@Controller('spells')
export class SpellsController {
  constructor(private readonly spellsService: SpellsService) {}

  @Get()
  getAll() {
    return this.spellsService.getAll();
  }

  @Post()
  create(@Body() data) {
    return this.spellsService.create(data);
  }

  @Patch(':id/favorite')
  toggleFavorite(@Param('id') id: string) {
    return this.spellsService.toggleFavorite(id);
  }
}
