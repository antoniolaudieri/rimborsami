import { useEffect, useRef } from "react";

type AdFormat = 'banner' | 'rectangle' | 'leaderboard' | 'mobile-banner' | 'in-article';

interface AdUnitProps {
  format: AdFormat;
  className?: string;
  slot?: string; // Ad network slot ID
}

// Ad dimensions by format
const AD_DIMENSIONS: Record<AdFormat, { width: number; height: number }> = {
  'banner': { width: 468, height: 60 },
  'rectangle': { width: 300, height: 250 },
  'leaderboard': { width: 728, height: 90 },
  'mobile-banner': { width: 320, height: 50 },
  'in-article': { width: 300, height: 250 },
};

export function AdUnit({ format, className = '', slot }: AdUnitProps) {
  const adRef = useRef<HTMLDivElement>(null);
  const dimensions = AD_DIMENSIONS[format];

  useEffect(() => {
    // Placeholder for ad network initialization
    // In production, replace with actual ad network code (The Moneytizer, etc.)
    
    // Example The Moneytizer integration:
    // if (window.tmzntr) {
    //   window.tmzntr.cmd.push(() => {
    //     window.tmzntr.display(slot);
    //   });
    // }
    
    console.log(`[AdUnit] ${format} ad placeholder rendered`);
  }, [format, slot]);

  // Don't show ads in development for cleaner testing
  if (import.meta.env.DEV) {
    return (
      <div 
        className={`bg-muted/30 border border-dashed border-muted-foreground/20 rounded-lg flex items-center justify-center text-muted-foreground/50 text-xs ${className}`}
        style={{ 
          width: '100%', 
          maxWidth: dimensions.width, 
          height: dimensions.height 
        }}
      >
        <span>Ad: {format} ({dimensions.width}x{dimensions.height})</span>
      </div>
    );
  }

  return (
    <div 
      ref={adRef}
      className={`ad-unit ad-${format} ${className}`}
      data-ad-slot={slot}
      data-ad-format={format}
      style={{ 
        width: '100%', 
        maxWidth: dimensions.width,
        minHeight: dimensions.height,
      }}
    >
      {/* Ad content will be inserted by the ad network script */}
    </div>
  );
}

// Sticky footer ad for mobile
export function StickyFooterAd() {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-sm border-t border-border p-2 md:hidden">
      <div className="max-w-[320px] mx-auto">
        <AdUnit format="mobile-banner" />
      </div>
    </div>
  );
}

// In-article ad wrapper with proper spacing
export function InArticleAd({ className = '' }: { className?: string }) {
  return (
    <div className={`my-8 flex justify-center ${className}`}>
      <AdUnit format="in-article" />
    </div>
  );
}

// Sidebar ad for desktop
export function SidebarAd({ className = '' }: { className?: string }) {
  return (
    <div className={`hidden lg:block ${className}`}>
      <div className="sticky top-24">
        <p className="text-[10px] text-muted-foreground/50 mb-1">Pubblicità</p>
        <AdUnit format="rectangle" />
      </div>
    </div>
  );
}
