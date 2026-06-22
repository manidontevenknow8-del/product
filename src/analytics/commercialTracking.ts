import { trackConversion } from './metaPixel';

type CommercialConversionPlacement =
  | 'hero_start_free'
  | 'hero_view_pricing'
  | 'cta_create_account'
  | 'widget_travel_calculator'
  | 'widget_document_scanner';

export function trackCommercialLead(
  placement: CommercialConversionPlacement,
  pagePath: string,
): void {
  trackConversion('Lead', {
    content_category: 'commercial',
    content_name: placement,
    page_path: pagePath,
  });
}

export function trackCommercialInitiateCheckout(
  placement: CommercialConversionPlacement,
  pagePath: string,
): void {
  trackConversion('InitiateCheckout', {
    content_category: 'commercial',
    content_name: placement,
    page_path: pagePath,
  });
}
