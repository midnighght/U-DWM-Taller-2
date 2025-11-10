import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Spell extends Document {
  @Prop({ required: true })
  name: string;

  @Prop()
  description: string;

  @Prop()
  level: number;

  @Prop({ default: false })
  favorite: boolean;
}

export const SpellSchema = SchemaFactory.createForClass(Spell);
