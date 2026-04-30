import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';

@Injectable()
export class CloudinaryService {
  private readonly logger = new Logger(CloudinaryService.name);

  constructor() {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }

  // ─── Upload Prescription Image (encrypted, private folder) ──────────────────
  async uploadPrescription(
    file: Express.Multer.File,
    userId: string,
  ): Promise<{ secure_url: string; public_id: string }> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: `vaidyamarg/prescriptions/${userId}`,
          resource_type: 'auto',
          type: 'authenticated', // private — requires signed URL to view
          transformation: [
            { quality: 'auto:good' },
            { fetch_format: 'auto' },
          ],
          tags: ['prescription', `user_${userId}`],
          context: {
            uploaded_by: userId,
            uploaded_at: new Date().toISOString(),
            app: 'vaidyamarg',
          },
        },
        (error, result) => {
          if (error) {
            this.logger.error(`Cloudinary upload failed: ${error.message}`);
            reject(new InternalServerErrorException('File upload failed'));
          } else {
            resolve({
              secure_url: result.secure_url,
              public_id: result.public_id,
            });
          }
        },
      );

      // Convert buffer to stream and pipe to Cloudinary
      const readableStream = new Readable();
      readableStream.push(file.buffer);
      readableStream.push(null);
      readableStream.pipe(uploadStream);
    });
  }

  // ─── Delete Prescription Image ───────────────────────────────────────────────
  async deletePrescription(publicId: string): Promise<void> {
    try {
      await cloudinary.uploader.destroy(publicId, { type: 'authenticated' });
      this.logger.log(`Deleted prescription image: ${publicId}`);
    } catch (error) {
      this.logger.error(`Failed to delete image ${publicId}: ${error.message}`);
    }
  }

  // ─── Generate Signed URL (temporary access for pharmacist) ──────────────────
  generateSignedUrl(publicId: string, expiresInSeconds = 3600): string {
    return cloudinary.url(publicId, {
      type: 'authenticated',
      secure: true,
      sign_url: true,
      expires_at: Math.floor(Date.now() / 1000) + expiresInSeconds,
    });
  }
}
