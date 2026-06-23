import { getImageMeta } from '@/data/imageManifest';
import styles from './OptimizedImage.module.css';

type OptimizedImageProps = {
  src: string;
  alt: string;
  className?: string;
  /** Above-the-fold / LCP, disables lazy loading and sets fetchpriority high */
  priority?: boolean;
  sizes?: string;
  width?: number;
  height?: number;
};

function toWebpSrc(src: string): string {
  return src.replace(/\.png$/i, '.webp');
}

function getManifestEntry(src: string) {
  return getImageMeta(src);
}

export function OptimizedImage({
  src,
  alt,
  className = '',
  priority = false,
  sizes,
  width,
  height,
}: OptimizedImageProps) {
  const webpSrc = toWebpSrc(src);
  const entry = getManifestEntry(src);
  const resolvedWidth = width ?? entry?.width;
  const resolvedHeight = height ?? entry?.height;
  const resolvedSizes = sizes ?? entry?.sizes ?? '(max-width: 640px) 100vw, (max-width: 1200px) 100vw, 1400px';
  const srcSet = entry?.srcSet;
  const sharedProps = {
    alt,
    className: [styles.img, className].filter(Boolean).join(' '),
    loading: priority ? ('eager' as const) : ('lazy' as const),
    decoding: priority ? ('sync' as const) : ('async' as const),
    ...(priority ? { fetchPriority: 'high' as const } : {}),
    ...(alt === '' ? { 'aria-hidden': true as const } : {}),
    ...(resolvedWidth ? { width: resolvedWidth } : {}),
    ...(resolvedHeight ? { height: resolvedHeight } : {}),
  };

  if (srcSet && entry?.variants) {
    return (
      <picture>
        <source media="(max-width: 640px)" srcSet={entry.variants['640']} type="image/webp" />
        <source media="(max-width: 1024px)" srcSet={entry.variants['1024']} type="image/webp" />
        <img src={entry.variants['640'] ?? webpSrc} srcSet={srcSet} sizes={resolvedSizes} {...sharedProps} />
      </picture>
    );
  }

  return (
    <img
      src={webpSrc}
      {...(srcSet ? { srcSet, sizes: resolvedSizes } : {})}
      {...sharedProps}
    />
  );
}
