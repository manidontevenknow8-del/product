import type { ReactNode } from 'react';
import { EmptyStateIllustration, type EmptyStateVariant } from './EmptyStateIllustration';
import illustrationStyles from './EmptyStateIllustration.module.css';
import frameStyles from './EmptyStateFrame.module.css';

export function EmptyStateFrame({
  variant,
  title,
  description,
  hint,
  action,
  compact = false,
  image,
  imageAlt = '',
}: {
  variant: EmptyStateVariant;
  title: string;
  description?: string;
  hint?: string;
  action?: ReactNode;
  compact?: boolean;
  image?: string;
  imageAlt?: string;
}) {
  return (
    <div
      className={`${frameStyles.frame} ${image ? frameStyles.frameWithImage : illustrationStyles[variant]} ${compact ? frameStyles.compact : ''}`}
    >
      {image ? (
        <div className={frameStyles.imageWrap}>
          <img src={image} alt={imageAlt} className={frameStyles.image} />
        </div>
      ) : (
        <EmptyStateIllustration variant={variant} compact={compact} />
      )}
      <h2 className={frameStyles.title}>{title}</h2>
      {description && <p className={frameStyles.description}>{description}</p>}
      {hint && <span className={frameStyles.hint}>{hint}</span>}
      {action && <div className={frameStyles.action}>{action}</div>}
    </div>
  );
}
