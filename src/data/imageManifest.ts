import manifest from './imageManifest.json';

export type ImageManifestEntry = {
  width: number;
  height: number;
  sizes?: string;
  srcSet?: string;
  variants?: Record<string, string>;
};

type ImageManifest = {
  generatedAt: string;
  images: Record<string, ImageManifestEntry>;
};

const data = manifest as ImageManifest;

export function getImageMeta(src: string): ImageManifestEntry | undefined {
  const webp = src.replace(/\.png$/i, '.webp');
  return data.images[webp];
}
