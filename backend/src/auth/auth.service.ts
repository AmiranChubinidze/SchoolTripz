import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { User, UserDocument } from '../users/schemas/user.schema';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.userModel.findOne({ email: dto.email });
    if (existing) throw new ConflictException('Email already registered');

    const hashed = await bcrypt.hash(dto.password, 12);
    const user = await this.userModel.create({ ...dto, password: hashed });

    const token = this.signToken(user);
    return { token, user: this.sanitize(user) };
  }

  async login(dto: LoginDto) {
    const user = await this.userModel.findOne({ email: dto.email }).select('+password');
    if (!user || !user.isActive) throw new UnauthorizedException('Invalid credentials');

    const valid = await bcrypt.compare(dto.password, user.password);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    const token = this.signToken(user);
    return { token, user: this.sanitize(user) };
  }

  async me(userId: string) {
    return this.userModel.findById(userId).exec();
  }

  private signToken(user: UserDocument) {
    return this.jwtService.sign({ sub: user._id, email: user.email, role: user.role });
  }

  private sanitize(user: UserDocument) {
    const obj = user.toObject();
    delete obj.password;
    return obj;
  }
}
