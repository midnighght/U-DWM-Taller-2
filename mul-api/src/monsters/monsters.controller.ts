import { Controller, Get, Post, Body, Patch, Param } from '@nestjs/common';
import { MonstersService } from './monsters.service';
import { CreateMonsterDto, UpdateMonsterDto } from './dto/monster.dto';

@Controller('monsters')
export class MonstersController {
  constructor(private monstersService: MonstersService) {}

  @Get()
  getAll() {
    return this.monstersService.getAll();
  }

  // 1. Full list
  @Get('full')
  listFull() {
    return this.monstersService.listFull();
  }

  // 2. Full data by index
  @Get(':index')
  getOne(@Param('index') index: string) {
    return this.monstersService.findOneFull(index);
  }

  // 3. Toggle favorite
  @Patch(':index/toggle-favorite')
  toggleFavorite(@Param('index') index: string) {
    return this.monstersService.toggleFavorite(index);
  }

  // 4. Create a new monster
  @Post()
  create(@Body() dto: CreateMonsterDto) {
    return this.monstersService.create(dto);
  }

}
