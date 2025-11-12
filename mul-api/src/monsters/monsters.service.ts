/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Monster } from './schemas/monster.schema';
import { CreateMonsterDto, UpdateMonsterDto } from './dto/monster.dto';

@Injectable()
export class MonstersService {
  constructor(@InjectModel(Monster.name) private monsterModel: Model<Monster>) {}

  /**
   * Return all monsters (full documents) – existing behavior
   */
  /**
   * Base GET: minimal list (index, name, url)
   */
  async getAll(): Promise<Array<{ index: string; name: string; url: string }>> {
    const docs = await this.monsterModel
      .find({}, 'index name url -_id')
      .lean()
      .exec();
    return (docs as any[]).map(d => ({ index: d.index, name: d.name, url: d.url }));
  }

  /**
   * Full list of monsters (all fields)
   */
  async listFull(): Promise<Monster[]> {
    return this.monsterModel.find().exec();
  }

  /**
   * 2. Full monster by index (id)
   */
  async findOneFull(index: string): Promise<Monster> {
    const monster = await this.monsterModel.findOne({ index }).exec();
    if (!monster) throw new NotFoundException(`Monster '${index}' not found`);
    return monster;
  }

  /**
   * 3. Toggle favorite flag, return new state
   */
  async toggleFavorite(index: string): Promise<{ index: string; favorite: boolean }> {
    const monster = await this.monsterModel.findOne({ index }).exec();
    if (!monster) throw new NotFoundException(`Monster '${index}' not found`);
    monster.favorite = !monster.favorite;
    await monster.save();
    return { index: monster.index, favorite: monster.favorite };
  }

  /**
   * 4. Create a new monster
   */
  async create(createDto: CreateMonsterDto): Promise<Monster> {
    const created = new this.monsterModel(createDto);
    return await created.save();
  }
}
