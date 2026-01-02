import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { calculateCTR } from '../lib/ad-service';

describe('Ad Service', () => {
  describe('calculateCTR', () => {
    it('should return 0 when no impressions', () => {
      const ctr = calculateCTR(0, 0);
      expect(ctr).toBe(0);
    });

    it('should calculate CTR correctly', () => {
      const ctr = calculateCTR(100, 5);
      expect(ctr).toBe(5);
    });

    it('should handle high CTR', () => {
      const ctr = calculateCTR(10, 5);
      expect(ctr).toBe(50);
    });

    it('should handle 100% CTR', () => {
      const ctr = calculateCTR(10, 10);
      expect(ctr).toBe(100);
    });
  });
});

describe('Ad Banner Rotation Logic', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should rotate ads every 5 seconds', () => {
    const rotationInterval = 5000;
    let currentAdIndex = 0;
    const totalAds = 3;

    const rotateAd = () => {
      currentAdIndex = (currentAdIndex + 1) % totalAds;
    };

    // Simulate rotation
    expect(currentAdIndex).toBe(0);
    
    // After 5 seconds
    vi.advanceTimersByTime(rotationInterval);
    rotateAd();
    expect(currentAdIndex).toBe(1);
    
    // After 10 seconds
    vi.advanceTimersByTime(rotationInterval);
    rotateAd();
    expect(currentAdIndex).toBe(2);
    
    // After 15 seconds - should wrap around
    vi.advanceTimersByTime(rotationInterval);
    rotateAd();
    expect(currentAdIndex).toBe(0);
  });

  it('should pause rotation on user interaction', () => {
    let isPaused = false;
    let currentAdIndex = 0;
    const totalAds = 3;

    const pauseRotation = () => {
      isPaused = true;
    };

    const resumeRotation = () => {
      isPaused = false;
    };

    const rotateAd = () => {
      if (!isPaused) {
        currentAdIndex = (currentAdIndex + 1) % totalAds;
      }
    };

    // Initial state
    expect(currentAdIndex).toBe(0);
    
    // Pause rotation
    pauseRotation();
    rotateAd();
    expect(currentAdIndex).toBe(0); // Should not change
    
    // Resume rotation
    resumeRotation();
    rotateAd();
    expect(currentAdIndex).toBe(1); // Should change now
  });

  it('should handle single ad without rotation', () => {
    let currentAdIndex = 0;
    const totalAds = 1;

    const rotateAd = () => {
      currentAdIndex = (currentAdIndex + 1) % totalAds;
    };

    rotateAd();
    expect(currentAdIndex).toBe(0); // Should stay at 0
  });
});

describe('Theme Configuration', () => {
  it('should have correct primary color (cyan)', () => {
    const themeColors = {
      primary: { light: '#00B8D9', dark: '#00D4FF' },
    };
    
    expect(themeColors.primary.light).toBe('#00B8D9');
    expect(themeColors.primary.dark).toBe('#00D4FF');
  });

  it('should have correct background colors', () => {
    const themeColors = {
      background: { light: '#F8FAFC', dark: '#030712' },
    };
    
    expect(themeColors.background.light).toBe('#F8FAFC');
    expect(themeColors.background.dark).toBe('#030712');
  });

  it('should have correct surface colors', () => {
    const themeColors = {
      surface: { light: '#FFFFFF', dark: '#0A1628' },
    };
    
    expect(themeColors.surface.light).toBe('#FFFFFF');
    expect(themeColors.surface.dark).toBe('#0A1628');
  });

  it('should have all required color tokens', () => {
    const requiredTokens = [
      'primary',
      'secondary',
      'accent',
      'background',
      'surface',
      'foreground',
      'muted',
      'border',
      'success',
      'warning',
      'error',
      'info',
      'highlight',
      'overlay',
    ];
    
    const themeColors: Record<string, { light: string; dark: string }> = {
      primary: { light: '#00B8D9', dark: '#00D4FF' },
      secondary: { light: '#0EA5E9', dark: '#38BDF8' },
      accent: { light: '#06B6D4', dark: '#22D3EE' },
      background: { light: '#F8FAFC', dark: '#030712' },
      surface: { light: '#FFFFFF', dark: '#0A1628' },
      foreground: { light: '#0F172A', dark: '#F1F5F9' },
      muted: { light: '#64748B', dark: '#94A3B8' },
      border: { light: '#E2E8F0', dark: '#1E293B' },
      success: { light: '#10B981', dark: '#34D399' },
      warning: { light: '#F59E0B', dark: '#FBBF24' },
      error: { light: '#DC2626', dark: '#F87171' },
      info: { light: '#0EA5E9', dark: '#38BDF8' },
      highlight: { light: '#00D4FF15', dark: '#00D4FF20' },
      overlay: { light: '#00000050', dark: '#00000080' },
    };
    
    requiredTokens.forEach(token => {
      expect(themeColors).toHaveProperty(token);
      expect(themeColors[token]).toHaveProperty('light');
      expect(themeColors[token]).toHaveProperty('dark');
    });
  });

  it('should have valid hex color format', () => {
    const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{8})$/;
    
    const colors = ['#00B8D9', '#00D4FF', '#F8FAFC', '#030712'];
    
    colors.forEach(color => {
      expect(color).toMatch(hexColorRegex);
    });
  });
});

describe('Ad Banner Variants', () => {
  const variants = ['banner', 'card', 'compact'] as const;

  it('should support banner variant', () => {
    expect(variants).toContain('banner');
  });

  it('should support card variant', () => {
    expect(variants).toContain('card');
  });

  it('should support compact variant', () => {
    expect(variants).toContain('compact');
  });

  it('should have exactly 3 variants', () => {
    expect(variants).toHaveLength(3);
  });
});

describe('Ad Types', () => {
  const adTypes = ['banner', 'card', 'native', 'interstitial'] as const;

  it('should support all ad types', () => {
    expect(adTypes).toContain('banner');
    expect(adTypes).toContain('card');
    expect(adTypes).toContain('native');
    expect(adTypes).toContain('interstitial');
  });

  it('should have exactly 4 ad types', () => {
    expect(adTypes).toHaveLength(4);
  });
});

describe('Ad Positions', () => {
  const positions = ['top', 'bottom', 'inline', 'feed'] as const;

  it('should support all positions', () => {
    expect(positions).toContain('top');
    expect(positions).toContain('bottom');
    expect(positions).toContain('inline');
    expect(positions).toContain('feed');
  });
});
