// Affiliate Analytics Tracking
// Tracks clicks, conversions, and revenue from affiliate partnerships

export type AffiliatePartner = 
  | 'heymondo' 
  | 'segugio' 
  | 'sostariffe' 
  | 'moneytizer';

export interface AffiliateClick {
  partner: AffiliatePartner;
  source: 'article' | 'opportunity' | 'sidebar' | 'footer';
  articleSlug?: string;
  opportunityId?: string;
  category?: string;
  timestamp: Date;
}

// Track affiliate link clicks
export function trackAffiliateClick(click: AffiliateClick): void {
  try {
    // Store in localStorage for session tracking
    const clicks = JSON.parse(localStorage.getItem('affiliate_clicks') || '[]');
    clicks.push({
      ...click,
      timestamp: click.timestamp.toISOString(),
    });
    localStorage.setItem('affiliate_clicks', JSON.stringify(clicks.slice(-100))); // Keep last 100

    // Log for analytics
    console.log('[Affiliate]', click.partner, 'click from', click.source);

    // If Google Analytics is available, send event
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'affiliate_click', {
        event_category: 'affiliate',
        event_label: click.partner,
        affiliate_partner: click.partner,
        affiliate_source: click.source,
        article_slug: click.articleSlug,
        opportunity_id: click.opportunityId,
        category: click.category,
      });
    }
  } catch (e) {
    console.error('Failed to track affiliate click:', e);
  }
}

// Get affiliate stats for debugging
export function getAffiliateStats(): Record<AffiliatePartner, number> {
  try {
    const clicks = JSON.parse(localStorage.getItem('affiliate_clicks') || '[]');
    const stats: Record<string, number> = {
      heymondo: 0,
      segugio: 0,
      sostariffe: 0,
      moneytizer: 0,
    };
    
    clicks.forEach((click: AffiliateClick) => {
      if (stats[click.partner] !== undefined) {
        stats[click.partner]++;
      }
    });
    
    return stats as Record<AffiliatePartner, number>;
  } catch {
    return { heymondo: 0, segugio: 0, sostariffe: 0, moneytizer: 0 };
  }
}

// Affiliate partner links (placeholder - replace with actual affiliate URLs)
export const AFFILIATE_LINKS = {
  heymondo: {
    base: 'https://www.heymondo.com/?aff=rimborsami', // Replace with actual affiliate link
    utm: '&utm_source=rimborsami&utm_medium=affiliate&utm_campaign=travel_insurance',
  },
  segugio: {
    base: 'https://www.segugio.it/?partner=rimborsami', // Replace with actual affiliate link
    utm: '&utm_source=rimborsami&utm_medium=affiliate&utm_campaign=utility_compare',
  },
  sostariffe: {
    base: 'https://www.sostariffe.it/?ref=rimborsami', // Replace with actual affiliate link
    utm: '&utm_source=rimborsami&utm_medium=affiliate&utm_campaign=tariff_compare',
  },
} as const;

export function getAffiliateUrl(
  partner: keyof typeof AFFILIATE_LINKS,
  category?: string
): string {
  const config = AFFILIATE_LINKS[partner];
  return `${config.base}${config.utm}${category ? `&category=${category}` : ''}`;
}
