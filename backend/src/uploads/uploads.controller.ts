import {
  Controller,
  Post,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../users/schemas/user.schema';

@Controller('uploads')
export class UploadsController {
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      fileFilter: (_req, file, cb) => {
        if (/\.(jpg|jpeg|png|gif|webp)$/i.test(file.originalname)) {
          cb(null, true);
        } else {
          cb(new BadRequestException('Only image files are allowed'), false);
        }
      },
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('No file uploaded');

    // If Cloudinary is configured, upload there; otherwise fall back to local
    if (process.env.CLOUDINARY_CLOUD_NAME) {
      cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
      });

      try {
        const result = await new Promise<{ secure_url: string }>((resolve, reject) => {
          cloudinary.uploader.upload_stream(
            { folder: 'schooltripz', resource_type: 'image' },
            (error, result) => {
              if (error) reject(error);
              else resolve(result as { secure_url: string });
            },
          ).end(file.buffer);
        });
        return { url: result.secure_url };
      } catch {
        throw new InternalServerErrorException('Image upload failed');
      }
    }

    // Local fallback (development only)
    const { join } = await import('path');
    const { existsSync, mkdirSync, writeFileSync } = await import('fs');
    const { extname } = await import('path');
    const uploadsDir = join(process.cwd(), 'uploads');
    if (!existsSync(uploadsDir)) mkdirSync(uploadsDir, { recursive: true });
    const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}${extname(file.originalname).toLowerCase()}`;
    writeFileSync(join(uploadsDir, filename), file.buffer);
    const baseUrl = process.env.PUBLIC_URL || 'http://localhost:3001';
    return { url: `${baseUrl}/uploads/${filename}` };
  }
}
