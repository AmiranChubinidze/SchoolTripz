import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async findAll(query: any = {}) {
    const { page = 1, limit = 20, role, search } = query;
    const filter: any = {};
    if (role) filter.role = role;
    if (search) filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
    const [users, total] = await Promise.all([
      this.userModel.find(filter).skip((page - 1) * limit).limit(+limit).sort({ createdAt: -1 }),
      this.userModel.countDocuments(filter),
    ]);
    return { users, total, page: +page, limit: +limit };
  }

  async findById(id: string) {
    const user = await this.userModel.findById(id);
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async update(id: string, dto: any) {
    const user = await this.userModel.findByIdAndUpdate(id, dto, { new: true });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async deactivate(id: string) {
    return this.userModel.findByIdAndUpdate(id, { isActive: false }, { new: true });
  }
}
