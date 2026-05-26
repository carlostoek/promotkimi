import sharp from 'sharp';
import path from 'path';
import fs from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';

const UPLOAD_DIR = process.env.UPLOAD_DIR || './uploads';
const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE || '10485760'); // 10MB

const ALLOWED_MIMETYPES = ['image/jpeg', 'image/png', 'image/webp'];
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'];

export interface ProcessedImage {
  originalUrl: string;
  thumbnailUrl: string;
  filename: string;
}

export function validateImage(file: Express.Multer.File): { valid: boolean; error?: string } {
  // Validar mimetype
  if (!ALLOWED_MIMETYPES.includes(file.mimetype)) {
    return {
      valid: false,
      error: `Tipo de archivo no permitido. Permitidos: ${ALLOWED_MIMETYPES.join(', ')}`
    };
  }

  // Validar extensión
  const ext = path.extname(file.originalname).toLowerCase();
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    return {
      valid: false,
      error: `Extensión no permitida. Permitidas: ${ALLOWED_EXTENSIONS.join(', ')}`
    };
  }

  // Validar tamaño
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `Archivo demasiado grande. Máximo: ${MAX_FILE_SIZE / 1024 / 1024}MB`
    };
  }

  return { valid: true };
}

export async function processImage(file: Express.Multer.File): Promise<ProcessedImage> {
  const validation = validateImage(file);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  // Generar nombre único
  const timestamp = Date.now();
  const uuid = uuidv4().split('-')[0];
  const filename = `${uuid}-${timestamp}`;

  // Asegurar que el directorio existe
  const uploadPath = path.resolve(UPLOAD_DIR);
  await fs.mkdir(uploadPath, { recursive: true });

  const originalPath = path.join(uploadPath, `${filename}.webp`);
  const thumbnailPath = path.join(uploadPath, `${filename}-thumb.webp`);

  // Procesar imagen original (optimizada)
  await sharp(file.buffer)
    .resize(1200, 1200, {
      fit: 'inside',
      withoutEnlargement: true
    })
    .webp({ quality: 85 })
    .toFile(originalPath);

  // Generar miniatura
  await sharp(file.buffer)
    .resize(300, 300, {
      fit: 'cover',
      position: 'center'
    })
    .webp({ quality: 80 })
    .toFile(thumbnailPath);

  return {
    originalUrl: `/uploads/${filename}.webp`,
    thumbnailUrl: `/uploads/${filename}-thumb.webp`,
    filename
  };
}

export async function deleteImage(imageUrl: string): Promise<void> {
  if (!imageUrl) return;

  try {
    const filename = path.basename(imageUrl);
    const uploadPath = path.resolve(UPLOAD_DIR);
    
    // Eliminar imagen original
    const originalPath = path.join(uploadPath, filename);
    await fs.unlink(originalPath).catch(() => {});

    // Eliminar miniatura (reemplazar .webp con -thumb.webp)
    const thumbFilename = filename.replace('.webp', '-thumb.webp');
    const thumbnailPath = path.join(uploadPath, thumbFilename);
    await fs.unlink(thumbnailPath).catch(() => {});
  } catch (error) {
    console.error('Error eliminando imagen:', error);
  }
}

export async function deleteImages(imageUrl: string | null, thumbnailUrl: string | null): Promise<void> {
  if (imageUrl) await deleteImage(imageUrl);
  if (thumbnailUrl) await deleteImage(thumbnailUrl);
}
