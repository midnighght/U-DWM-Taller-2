import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Spell } from './schemas/spell.schema';
import { CreateSpellDto, UpdateSpellDto } from './dto/spell.dto';

@Injectable()
export class SpellsService {
  constructor(@InjectModel(Spell.name) private spellModel: Model<Spell>) {}

  getAll() {
    return this.spellModel.find();
  }

  create(data) {
    return new this.spellModel(data).save();
  }

  async update(id: string, updateSpellDto: UpdateSpellDto): Promise<Spell> {
    const updatedSpell = await this.spellModel
      .findByIdAndUpdate(id, updateSpellDto, { new: true })
      .exec();

    if (!updatedSpell) {
      throw new NotFoundException(`Spell with id "${id}" not found`);
    }

    return updatedSpell;
  }

  async toggleFavorite(id: string) {
    const spell = await this.spellModel.findById(id);
    if (!spell) return null;
    spell.favorite = !spell.favorite;
    return spell.save();
  }
}
