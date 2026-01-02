/**
 * FleetCore Theme Configuration
 * 
 * Palette inspirée de l'icône FleetCore:
 * - Cyan néon (#00D4FF) comme couleur primaire
 * - Fond sombre profond pour le mode dark
 * - Style sobre, épuré et moderne
 */

/** @type {const} */
const themeColors = {
  // Couleur primaire - Cyan néon de l'icône
  primary: { light: '#0891B2', dark: '#00D4FF' },
  
  // Couleur secondaire - Cyan plus foncé
  secondary: { light: '#0E7490', dark: '#22D3EE' },
  
  // Accent - Cyan lumineux pour les highlights
  accent: { light: '#06B6D4', dark: '#67E8F9' },
  
  // Arrière-plans - Très sombre en dark, clair épuré en light
  background: { light: '#F8FAFC', dark: '#030712' },
  
  // Surfaces - Cartes et éléments surélevés
  surface: { light: '#FFFFFF', dark: '#0A1628' },
  
  // Surface secondaire - Pour les éléments imbriqués
  surfaceSecondary: { light: '#F1F5F9', dark: '#111827' },
  
  // Texte principal
  foreground: { light: '#0F172A', dark: '#F1F5F9' },
  
  // Texte secondaire/muted
  muted: { light: '#64748B', dark: '#94A3B8' },
  
  // Bordures
  border: { light: '#E2E8F0', dark: '#1E3A5F' },
  
  // États de succès - Vert cyan
  success: { light: '#059669', dark: '#34D399' },
  
  // États d'avertissement - Ambre
  warning: { light: '#D97706', dark: '#FBBF24' },
  
  // États d'erreur - Rouge corail
  error: { light: '#DC2626', dark: '#F87171' },
  
  // Info - Cyan clair
  info: { light: '#0284C7', dark: '#38BDF8' },
  
  // Glow effect - Pour les effets néon
  glow: { light: '#0891B220', dark: '#00D4FF30' },
};

module.exports = { themeColors };
