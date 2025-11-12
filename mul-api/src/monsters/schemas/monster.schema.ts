import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ _id: false })
class ArmorClass {
  @Prop()
  type: string;

  @Prop()
  value: number;
}

@Schema({ _id: false })
class Speed {
  @Prop()
  walk?: string;

  @Prop()
  fly?: string;

  @Prop()
  swim?: string;
}

@Schema({ _id: false })
class Senses {
  @Prop()
  blindsight?: string;

  @Prop()
  darkvision?: string;

  @Prop()
  passive_perception: number;
}

@Schema()
export class Monster extends Document {
  @Prop({ required: true, unique: true })
  index: string;

  @Prop({ required: true, default: false })
  favorite: boolean;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  size: string;

  @Prop({ required: true })
  type: string;

  @Prop({ required: true })
  alignment: string;

  @Prop({ type: [ArmorClass] })
  armor_class: ArmorClass[];

  @Prop()
  hit_points: number;

  @Prop({ type: Speed, required: true })
  speed: Speed;

  @Prop({ required: true })
  strength: number;

  @Prop({ required: true })
  dexterity: number;

  @Prop({ required: true })
  constitution: number;

  @Prop({ required: true })
  intelligence: number;

  @Prop({ required: true })
  wisdom: number;

  @Prop({ required: true })
  charisma: number;

  @Prop({ type: Senses})
  senses: Senses;

  @Prop()
  challenge_rating: number;

  @Prop()
  image: string;

  @Prop({ required: true })
  url: string;
}

export const MonsterSchema = SchemaFactory.createForClass(Monster);
