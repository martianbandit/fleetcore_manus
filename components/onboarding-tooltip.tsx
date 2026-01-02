/**
 * Composant OnboardingTooltip
 * Affiche des tooltips contextuels pour guider l'utilisateur dans l'interface
 */

import { useEffect, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Modal,
  Dimensions,
  Platform,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  FadeIn,
  FadeOut,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import { useColors } from '@/hooks/use-colors';
import { IconSymbol } from '@/components/ui/icon-symbol';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export type TooltipPosition = 'top' | 'bottom' | 'left' | 'right';

interface OnboardingTooltipProps {
  visible: boolean;
  title: string;
  description: string;
  position?: TooltipPosition;
  targetRect?: { x: number; y: number; width: number; height: number };
  currentStep: number;
  totalSteps: number;
  onNext: () => void;
  onSkip: () => void;
  onComplete?: () => void;
}

export function OnboardingTooltip({
  visible,
  title,
  description,
  position = 'bottom',
  targetRect,
  currentStep,
  totalSteps,
  onNext,
  onSkip,
  onComplete,
}: OnboardingTooltipProps) {
  const colors = useColors();
  const scale = useSharedValue(0.9);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      scale.value = withSpring(1, { damping: 15 });
      opacity.value = withTiming(1, { duration: 200 });
    } else {
      scale.value = withTiming(0.9, { duration: 150 });
      opacity.value = withTiming(0, { duration: 150 });
    }
  }, [visible]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const handleNext = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    if (currentStep === totalSteps) {
      onComplete?.();
    } else {
      onNext();
    }
  };

  const handleSkip = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onSkip();
  };

  if (!visible) return null;

  // Calcul de la position du tooltip
  const getTooltipPosition = () => {
    if (!targetRect) {
      return {
        top: SCREEN_HEIGHT / 2 - 100,
        left: 20,
        right: 20,
      };
    }

    const padding = 16;
    const tooltipHeight = 180;
    const arrowSize = 12;

    switch (position) {
      case 'top':
        return {
          bottom: SCREEN_HEIGHT - targetRect.y + arrowSize + padding,
          left: padding,
          right: padding,
        };
      case 'bottom':
        return {
          top: targetRect.y + targetRect.height + arrowSize + padding,
          left: padding,
          right: padding,
        };
      case 'left':
        return {
          top: targetRect.y,
          right: SCREEN_WIDTH - targetRect.x + arrowSize + padding,
        };
      case 'right':
        return {
          top: targetRect.y,
          left: targetRect.x + targetRect.width + arrowSize + padding,
        };
      default:
        return {
          top: SCREEN_HEIGHT / 2 - 100,
          left: padding,
          right: padding,
        };
    }
  };

  // Calcul de la position de la flèche
  const getArrowStyle = () => {
    if (!targetRect) return {};

    const arrowSize = 12;
    const centerX = targetRect.x + targetRect.width / 2;
    const centerY = targetRect.y + targetRect.height / 2;

    switch (position) {
      case 'top':
        return {
          position: 'absolute' as const,
          bottom: -arrowSize,
          left: Math.min(Math.max(centerX - arrowSize, 20), SCREEN_WIDTH - 40),
          width: 0,
          height: 0,
          borderLeftWidth: arrowSize,
          borderRightWidth: arrowSize,
          borderTopWidth: arrowSize,
          borderLeftColor: 'transparent',
          borderRightColor: 'transparent',
          borderTopColor: colors.surface,
        };
      case 'bottom':
        return {
          position: 'absolute' as const,
          top: -arrowSize,
          left: Math.min(Math.max(centerX - arrowSize, 20), SCREEN_WIDTH - 40),
          width: 0,
          height: 0,
          borderLeftWidth: arrowSize,
          borderRightWidth: arrowSize,
          borderBottomWidth: arrowSize,
          borderLeftColor: 'transparent',
          borderRightColor: 'transparent',
          borderBottomColor: colors.surface,
        };
      default:
        return {};
    }
  };

  const isLastStep = currentStep === totalSteps;

  return (
    <Modal transparent visible={visible} animationType="none">
      {/* Overlay sombre */}
      <Pressable style={styles.overlay} onPress={handleSkip}>
        {/* Zone de surbrillance (spotlight) */}
        {targetRect && (
          <View
            style={[
              styles.spotlight,
              {
                top: targetRect.y - 8,
                left: targetRect.x - 8,
                width: targetRect.width + 16,
                height: targetRect.height + 16,
                borderColor: colors.primary,
              },
            ]}
          />
        )}
      </Pressable>

      {/* Tooltip */}
      <Animated.View
        style={[
          styles.tooltip,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
            ...getTooltipPosition(),
          },
          animatedStyle,
        ]}
      >
        {/* Flèche */}
        <View style={getArrowStyle()} />

        {/* Contenu */}
        <View style={styles.content}>
          {/* Header avec numéro d'étape */}
          <View style={styles.header}>
            <View
              style={[
                styles.stepBadge,
                { backgroundColor: colors.primary + '20' },
              ]}
            >
              <Text style={[styles.stepText, { color: colors.primary }]}>
                Étape {currentStep}/{totalSteps}
              </Text>
            </View>
            <Pressable onPress={handleSkip} hitSlop={8}>
              <IconSymbol name="xmark" size={20} color={colors.muted} />
            </Pressable>
          </View>

          {/* Titre et description */}
          <Text style={[styles.title, { color: colors.foreground }]}>
            {title}
          </Text>
          <Text style={[styles.description, { color: colors.muted }]}>
            {description}
          </Text>

          {/* Actions */}
          <View style={styles.actions}>
            <Pressable
              onPress={handleSkip}
              style={({ pressed }) => [
                styles.skipButton,
                pressed && { opacity: 0.7 },
              ]}
            >
              <Text style={[styles.skipText, { color: colors.muted }]}>
                Passer le guide
              </Text>
            </Pressable>

            <Pressable
              onPress={handleNext}
              style={({ pressed }) => [
                styles.nextButton,
                { backgroundColor: colors.primary },
                pressed && { transform: [{ scale: 0.97 }], opacity: 0.9 },
              ]}
            >
              <Text style={styles.nextText}>
                {isLastStep ? 'Terminer' : 'Suivant'}
              </Text>
              {!isLastStep && (
                <IconSymbol name="chevron.right" size={16} color="#FFFFFF" />
              )}
            </Pressable>
          </View>

          {/* Indicateurs de progression */}
          <View style={styles.dots}>
            {Array.from({ length: totalSteps }).map((_, index) => (
              <View
                key={index}
                style={[
                  styles.dot,
                  {
                    backgroundColor:
                      index + 1 <= currentStep ? colors.primary : colors.border,
                    width: index + 1 === currentStep ? 16 : 6,
                  },
                ]}
              />
            ))}
          </View>
        </View>
      </Animated.View>
    </Modal>
  );
}

// Hook pour gérer le tour guidé
export function useDashboardTour() {
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [targetRects, setTargetRects] = useState<Record<string, any>>({});

  const startTour = () => {
    setIsActive(true);
    setCurrentStep(1);
  };

  const nextStep = () => {
    setCurrentStep((prev) => prev + 1);
  };

  const skipTour = () => {
    setIsActive(false);
    setCurrentStep(1);
  };

  const completeTour = () => {
    setIsActive(false);
    setCurrentStep(1);
  };

  const registerTarget = (id: string, rect: any) => {
    setTargetRects((prev) => ({ ...prev, [id]: rect }));
  };

  return {
    isActive,
    currentStep,
    targetRects,
    startTour,
    nextStep,
    skipTour,
    completeTour,
    registerTarget,
  };
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  spotlight: {
    position: 'absolute',
    borderRadius: 12,
    borderWidth: 3,
    backgroundColor: 'transparent',
  },
  tooltip: {
    position: 'absolute',
    borderRadius: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  content: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  stepBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  stepText: {
    fontSize: 12,
    fontWeight: '600',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 20,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  skipButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  skipText: {
    fontSize: 14,
    fontWeight: '500',
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    gap: 6,
  },
  nextText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  dot: {
    height: 6,
    borderRadius: 3,
  },
});
