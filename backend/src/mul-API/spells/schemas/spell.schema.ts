import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Spell extends Document {
  // Unique identifier (like "acid-arrow")
  @Prop({ required: true, unique: true })
  index: string;

  // Display name
  @Prop({ required: true })
  name: string;

  // Description text — stored as an array of paragraphs
  @Prop({ type: [String], default: [] })
  desc: string[];

  // Text describing how the spell behaves at higher levels
  @Prop({ type: [String], default: [] })
  higher_level: string[];

  // Range in feet or meters
  @Prop()
  range: string;

  // Components: e.g. ["V", "S", "M"]
  @Prop({ type: [String], default: [] })
  components: string[];

  // Material requirements (optional)
  @Prop()
  material?: string;

  // Boolean flags
  @Prop({ default: false })
  ritual: boolean;

  @Prop()
  duration: string;

  @Prop({ default: false })
  concentration: boolean;

  // Casting time string
  @Prop()
  casting_time: string;

  // Level number (0 = cantrip)
  @Prop({ required: true })
  level: number;

  // Classes that can cast this spell
  @Prop({ type: [String], default: [] })
  classes: string[];

  // (Optional) user who created/customized the spell
  @Prop({ type: String, ref: 'User' })
  createdBy?: string;

  // (Optional) mark as favorite
  @Prop({ default: false })
  favorite: boolean;
}

export const SpellSchema = SchemaFactory.createForClass(Spell);
