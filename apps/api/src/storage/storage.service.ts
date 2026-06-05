import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Minio from 'minio';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class StorageService implements OnModuleInit {
  private readonly logger = new Logger(StorageService.name);
  private client: Minio.Client;
  private readonly bucketDesigns = 'fap-designs';
  private readonly bucketPortfolios = 'fap-portfolios';

  constructor(private config: ConfigService) {}

  async onModuleInit() {
    this.client = new Minio.Client({
      endPoint: this.config.get('MINIO_ENDPOINT', 'localhost'),
      port: parseInt(this.config.get('MINIO_PORT', '9000')),
      useSSL: false,
      accessKey: this.config.get('MINIO_ACCESS_KEY', 'fap_minio_user'),
      secretKey: this.config.get('MINIO_SECRET_KEY', 'fap_minio_password'),
    });

    await this.ensureBuckets();
  }

  // Créer les buckets s'ils n'existent pas
  private async ensureBuckets() {
    for (const bucket of [this.bucketDesigns, this.bucketPortfolios]) {
      try {
        const exists = await this.client.bucketExists(bucket);
        if (!exists) {
          await this.client.makeBucket(bucket, 'us-east-1');
          // Rendre le bucket public en lecture
          const policy = {
            Version: '2012-10-17',
            Statement: [{
              Effect: 'Allow',
              Principal: { AWS: ['*'] },
              Action: ['s3:GetObject'],
              Resource: [`arn:aws:s3:::${bucket}/*`],
            }],
          };
          await this.client.setBucketPolicy(bucket, JSON.stringify(policy));
          this.logger.log(`Bucket cree : ${bucket}`);
        }
      } catch (err) {
        this.logger.warn(`Erreur bucket ${bucket}: ${err.message}`);
      }
    }
    this.logger.log('Storage MinIO initialise');
  }

  // Uploader une image depuis base64 ou buffer
  async uploadImage(
    base64OrBuffer: string | Buffer,
    folder: 'designs' | 'portfolios' = 'designs',
    filename?: string,
  ): Promise<string> {
    const bucket = folder === 'designs' ? this.bucketDesigns : this.bucketPortfolios;
    const name = filename || `${uuidv4()}.jpg`;
    const objectName = `${folder}/${name}`;

    let buffer: Buffer;

    if (typeof base64OrBuffer === 'string') {
      // Supprimer le préfixe data:image/...;base64,
      const base64Data = base64OrBuffer.replace(/^data:image\/\w+;base64,/, '');
      buffer = Buffer.from(base64Data, 'base64');
    } else {
      buffer = base64OrBuffer;
    }

    await this.client.putObject(
      bucket,
      objectName,
      buffer,
      buffer.length,
      { 'Content-Type': 'image/jpeg' },
    );

    // Retourner l'URL publique
    const endpoint = this.config.get('MINIO_ENDPOINT', 'localhost');
    const port = this.config.get('MINIO_PORT', '9000');
    return `http://${endpoint}:${port}/${bucket}/${objectName}`;
  }

  // Uploader depuis une URL (télécharger puis uploader)
  async uploadFromUrl(url: string, folder: 'designs' | 'portfolios' = 'designs'): Promise<string> {
    try {
      const response = await fetch(url);
      if (!response.ok) return url; // Retourner l'URL originale si échec
      const buffer = Buffer.from(await response.arrayBuffer());
      return this.uploadImage(buffer, folder);
    } catch {
      return url; // Retourner l'URL originale si échec
    }
  }

  // Supprimer une image
  async deleteImage(url: string): Promise<void> {
    try {
      const urlObj = new URL(url);
      const parts = urlObj.pathname.split('/').filter(Boolean);
      const bucket = parts[0];
      const objectName = parts.slice(1).join('/');
      await this.client.removeObject(bucket, objectName);
    } catch (err) {
      this.logger.warn(`Erreur suppression image: ${err.message}`);
    }
  }

  // Générer une URL signée (accès temporaire)
  async getSignedUrl(url: string, expirySeconds = 3600): Promise<string> {
    try {
      const urlObj = new URL(url);
      const parts = urlObj.pathname.split('/').filter(Boolean);
      const bucket = parts[0];
      const objectName = parts.slice(1).join('/');
      return await this.client.presignedGetObject(bucket, objectName, expirySeconds);
    } catch {
      return url;
    }
  }
}