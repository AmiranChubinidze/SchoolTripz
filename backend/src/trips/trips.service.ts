import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Trip, TripDocument } from './schemas/trip.schema';
import { CreateTripDto } from './dto/create-trip.dto';
import { SettingsService } from '../settings/settings.service';

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/[\s_]+/g, '-').replace(/^-+|-+$/g, '');
}

@Injectable()
export class TripsService {
  constructor(
    @InjectModel(Trip.name) private tripModel: Model<TripDocument>,
    private settingsService: SettingsService,
  ) {}

  async create(dto: CreateTripDto) {
    const slug = slugify(dto.title) + '-' + Date.now();
    try {
      return await this.tripModel.create({ ...dto, slug });
    } catch (err) {
      if (err.code === 11000) throw new ConflictException('Trip with this title already exists');
      if (err.name === 'ValidationError') throw new BadRequestException(err.message);
      throw err;
    }
  }

  async findAll(query: any = {}, adminView = false) {
    const { page = 1, limit = 12, destination, category, tags, search, featured } = query;

    let showAll = adminView;
    if (!adminView) {
      const showInactive = await this.settingsService.get('showInactiveTrips');
      showAll = showInactive === true;
    }

    const filter: any = showAll ? {} : { isActive: true };

    if (destination) filter.destination = { $regex: destination, $options: 'i' };
    if (category) filter.category = category;
    if (tags) filter.tags = { $in: Array.isArray(tags) ? tags : [tags] };
    if (featured === 'true') filter.isFeatured = true;
    if (search) filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { destination: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ];

    const [trips, total] = await Promise.all([
      this.tripModel.find(filter)
        .select(adminView ? '' : '-priceConfig')
        .skip((page - 1) * limit)
        .limit(+limit)
        .sort({ isFeatured: -1, createdAt: -1 }),
      this.tripModel.countDocuments(filter),
    ]);

    return { trips, total, page: +page, limit: +limit, pages: Math.ceil(total / +limit) };
  }

  async findBySlug(slug: string, withPricing = false) {
    const select = withPricing ? '' : '-priceConfig';
    const trip = await this.tripModel.findOne({ slug, isActive: true }).select(select);
    if (!trip) throw new NotFoundException('Trip not found');
    return trip;
  }

  async findById(id: string) {
    const trip = await this.tripModel.findById(id);
    if (!trip) throw new NotFoundException('Trip not found');
    return trip;
  }

  async update(id: string, dto: Partial<CreateTripDto>) {
    const trip = await this.tripModel.findByIdAndUpdate(id, dto, { new: true });
    if (!trip) throw new NotFoundException('Trip not found');
    return trip;
  }

  async remove(id: string) {
    const trip = await this.tripModel.findByIdAndUpdate(id, { isActive: false }, { new: true });
    if (!trip) throw new NotFoundException('Trip not found');
    return { message: 'Trip deactivated' };
  }

  async getCategories() {
    return this.tripModel.distinct('category', { isActive: true });
  }

  async getTags() {
    return this.tripModel.distinct('tags', { isActive: true });
  }
}
