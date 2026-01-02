/**
 * Composant TutorialOverlay
 * Affiche les tooltips et guides du tutoriel interactif
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  Modal,
  Dimensions,
  StyleSheet,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
  FadeIn,
  FadeOut,
} from 'react-native-reanimated';
import { useColors } from '@/hooks/use-colors';
import type { TutorialStep } from '@/lib/tutorial-service';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface TutorialOverlayProps {
  step: TutorialStep | null;
  currentStepIndex: number;
  totalSteps: number;
  onNext: () => void;
  onPrevious: () => void;
  onSkip: () => void;
  onComplete: () => void;
}

export function TutorialOverlay({
  step,
  currentStepIndex,
  totalSteps,
  onNext,
  onPrevious,
  onSkip,
  onComplete,
}: TutorialOverlayProps) {
  const colors = useColors();
  const [visible, setVisible] = useState(false);
  
  // Animation pour le pulse
  const pulseScale = useSharedValue(1);
  
  useEffect(() => {
    if (step) {
      setVisible(true);
      pulseScale.value = withRepeat(
        withSequence(
          withTiming(1.1, { duration: 800 }),
          withTiming(1, { duration: 800 })
        ),
        -1,
        true
      );
    } else {
      setVisible(false);
    }
  }, [step]);
  
  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));
  
  if (!step || !visible) {
    return null;
  }
  
  const isLastStep = currentStepIndex === totalSteps - 1;
  const isFirstStep = currentStepIndex === 0;
  
  // Position du tooltip basée sur step.position
  const getTooltipPosition = () => {
    switch (step.position) {
      case 'top':
        return { top: 100 };
      case 'bottom':
        return { bottom: 150 };
      case 'center':
      default:
        return { top: SCREEN_HEIGHT / 2 - 100 };
    }
  };
  
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        {/* Tooltip */}
        <Animated.View
          entering={FadeIn.duration(300)}
          exiting={FadeOut.duration(200)}
          style={[
            styles.tooltipContainer,
            getTooltipPosition(),
            { backgroundColor: colors.surface },
          ]}
        >
          {/* Indicateur de progression */}
          <View style={styles.progressContainer}>
            {Array.from({ length: totalSteps }).map((_, index) => (
              <View
                key={index}
                style={[
                  styles.progressDot,
                  {
                    backgroundColor: index <= currentStepIndex 
                      ? colors.primary 
                      : colors.border,
                  },
                ]}
              />
            ))}
          </View>
          
          {/* Contenu */}
          <Text style={[styles.title, { color: colors.foreground }]}>
            {step.title}
          </Text>
          <Text style={[styles.description, { color: colors.muted }]}>
            {step.description}
          </Text>
          
          {/* Action suggérée */}
          {step.actionLabel && (
            <Animated.View style={[styles.actionHint, pulseStyle]}>
              <View style={[styles.actionBadge, { backgroundColor: colors.primary + '20' }]}>
                <Text style={[styles.actionText, { color: colors.primary }]}>
                  👆 {step.actionLabel}
                </Text>
              </View>
            </Animated.View>
          )}
          
          {/* Boutons de navigation */}
          <View style={styles.buttonContainer}>
            {/* Bouton Ignorer */}
            <Pressable
              onPress={onSkip}
              style={[styles.skipButton]}
            >
              <Text style={[styles.skipText, { color: colors.muted }]}>
                Ignorer
              </Text>
            </Pressable>
            
            <View style={styles.navButtons}>
              {/* Bouton Précédent */}
              {!isFirstStep && (
                <Pressable
                  onPress={onPrevious}
                  style={[styles.navButton, { borderColor: colors.border }]}
                >
                  <Text style={[styles.navButtonText, { color: colors.foreground }]}>
                    ← Précédent
                  </Text>
                </Pressable>
              )}
              
              {/* Bouton Suivant / Terminer */}
              <Pressable
                onPress={isLastStep ? onComplete : onNext}
                style={[styles.primaryButton, { backgroundColor: colors.primary }]}
              >
                <Text style={styles.primaryButtonText}>
                  {isLastStep ? 'Terminer ✓' : 'Suivant →'}
                </Text>
              </Pressable>
            </View>
          </View>
          
          {/* Compteur */}
          <Text style={[styles.counter, { color: colors.muted }]}>
            {currentStepIndex + 1} / {totalSteps}
          </Text>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tooltipContainer: {
    position: 'absolute',
    left: 20,
    right: 20,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    marginBottom: 16,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 16,
  },
  actionHint: {
    alignItems: 'center',
    marginBottom: 16,
  },
  actionBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  skipButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  skipText: {
    fontSize: 14,
  },
  navButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  navButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
  },
  navButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  primaryButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  primaryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  counter: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 12,
  },
});
