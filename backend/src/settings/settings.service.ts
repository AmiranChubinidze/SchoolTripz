import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Settings, SettingsDocument } from './settings.schema';

const DEFAULTS: Record<string, any> = {
  showInactiveTrips: false,
};

@Injectable()
export class SettingsService implements OnModuleInit {
  constructor(
    @InjectModel(Settings.name) private settingsModel: Model<SettingsDocument>,
  ) {}

  async onModuleInit() {
    for (const [key, value] of Object.entries(DEFAULTS)) {
      const existing = await this.settingsModel.findOne({ key });
      if (!existing) {
        await this.settingsModel.create({ key, value });
      }
    }
  }

  async get(key: string): Promise<any> {
    const setting = await this.settingsModel.findOne({ key });
    return setting?.value ?? DEFAULTS[key];
  }

  async getAll(): Promise<Record<string, any>> {
    const settings = await this.settingsModel.find();
    const result: Record<string, any> = { ...DEFAULTS };
    for (const s of settings) {
      result[s.key] = s.value;
    }
    return result;
  }

  async set(key: string, value: any): Promise<void> {
    await this.settingsModel.findOneAndUpdate(
      { key },
      { value },
      { upsert: true, new: true },
    );
  }
}
