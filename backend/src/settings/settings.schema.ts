import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SettingsDocument = Settings & Document;

@Schema({ collection: 'settings' })
export class Settings {
  @Prop({ required: true, unique: true })
  key: string;

  @Prop({ type: Object })
  value: any;
}

export const SettingsSchema = SchemaFactory.createForClass(Settings);
