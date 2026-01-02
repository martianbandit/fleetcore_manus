/**
 * Écran d'onboarding - Slides de bienvenue
 * Présente les fonctionnalités principales de FleetCore aux nouveaux utilisateurs
 */

import { useRef, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  Dimensions,
  FlatList,
  StyleSheet,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { WELCOME_SLIDES, completeWelcomeSlides } from '@/lib/onboarding-service';
import { useColors } from '@/hooks/use-colors';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Mapping des icônes
const ICON_MAP: Record<string, string> = {
  truck: 'truck.fill',
  car: 'car.fill',
  'clipboard-check': 'checkmark.circle.fill',
  tools: 'wrench.fill',
  bell: 'bell.fill',
};

export default function OnboardingScreen() {
  const router = useRouter();
  const colors = useColors();
  const flatListRef = useRef<FlatList>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useSharedValue(0);

  const handleNext = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    if (currentIndex < WELCOME_SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({
        index: currentIndex + 1,
        animated: true,
      });
      setCurrentIndex(currentIndex + 1);
    } else {
      handleComplete();
    }
  };

  const handleSkip = async () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    await completeWelcomeSlides();
    router.replace('/');
  };

  const handleComplete = async () => {
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    await completeWelcomeSlides();
    router.replace('/');
  };

  const renderSlide = ({ item, index }: { item: typeof WELCOME_SLIDES[0]; index: number }) => {
    return (
      <View style={[styles.slide, { width: SCREEN_WIDTH }]}>
        {/* Icône animée */}
        <View
          style={[
            styles.iconContainer,
            { backgroundColor: item.color + '20', borderColor: item.color + '40' },
          ]}
        >
          <IconSymbol
            name={ICON_MAP[item.icon] as any}
            size={80}
            color={item.color}
          />
        </View>

        {/* Titre */}
        <Text style={[styles.title, { color: colors.foreground }]}>
          {item.title}
        </Text>

        {/* Description */}
        <Text style={[styles.description, { color: colors.muted }]}>
          {item.description}
        </Text>

        {/* Features */}
        {item.features && (
          <View style={styles.featuresContainer}>
            {item.features.map((feature, idx) => (
              <View key={idx} style={styles.featureRow}>
                <View
                  style={[
                    styles.featureDot,
                    { backgroundColor: item.color },
                  ]}
                />
                <Text style={[styles.featureText, { color: colors.foreground }]}>
                  {feature}
                </Text>
              </View>
            ))}
          </View>
        )}
      </View>
    );
  };

  const renderDots = () => {
    return (
      <View style={styles.dotsContainer}>
        {WELCOME_SLIDES.map((_, index) => {
          const isActive = index === currentIndex;
          return (
            <Pressable
              key={index}
              onPress={() => {
                flatListRef.current?.scrollToIndex({ index, animated: true });
                setCurrentIndex(index);
              }}
            >
              <View
                style={[
                  styles.dot,
                  {
                    backgroundColor: isActive ? colors.primary : colors.border,
                    width: isActive ? 24 : 8,
                  },
                ]}
              />
            </Pressable>
          );
        })}
      </View>
    );
  };

  const isLastSlide = currentIndex === WELCOME_SLIDES.length - 1;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style="auto" />

      {/* Header avec bouton Passer */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Text style={[styles.logoText, { color: colors.primary }]}>FleetCore</Text>
        </View>
        {!isLastSlide && (
          <Pressable
            onPress={handleSkip}
            style={({ pressed }) => [
              styles.skipButton,
              pressed && { opacity: 0.7 },
            ]}
          >
            <Text style={[styles.skipText, { color: colors.muted }]}>Passer</Text>
          </Pressable>
        )}
      </View>

      {/* Slides */}
      <FlatList
        ref={flatListRef}
        data={WELCOME_SLIDES}
        renderItem={renderSlide}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => {
          const index = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
          setCurrentIndex(index);
        }}
        keyExtractor={(item) => item.id}
        getItemLayout={(_, index) => ({
          length: SCREEN_WIDTH,
          offset: SCREEN_WIDTH * index,
          index,
        })}
      />

      {/* Footer */}
      <View style={styles.footer}>
        {/* Dots */}
        {renderDots()}

        {/* Bouton principal */}
        <Pressable
          onPress={handleNext}
          style={({ pressed }) => [
            styles.nextButton,
            { backgroundColor: colors.primary },
            pressed && { transform: [{ scale: 0.97 }], opacity: 0.9 },
          ]}
        >
          <Text style={styles.nextButtonText}>
            {isLastSlide ? 'Commencer' : 'Suivant'}
          </Text>
          {!isLastSlide && (
            <IconSymbol name="chevron.right" size={20} color="#FFFFFF" />
          )}
        </Pressable>

        {/* Indicateur de progression */}
        <Text style={[styles.progressText, { color: colors.muted }]}>
          {currentIndex + 1} / {WELCOME_SLIDES.length}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 16,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 24,
    fontWeight: '700',
  },
  skipButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  skipText: {
    fontSize: 16,
    fontWeight: '500',
  },
  slide: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  iconContainer: {
    width: 160,
    height: 160,
    borderRadius: 80,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
    borderWidth: 3,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    fontSize: 17,
    textAlign: 'center',
    lineHeight: 26,
    marginBottom: 32,
  },
  featuresContainer: {
    alignSelf: 'stretch',
    paddingHorizontal: 16,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 12,
  },
  featureText: {
    fontSize: 16,
    fontWeight: '500',
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: Platform.OS === 'ios' ? 50 : 32,
    alignItems: 'center',
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    gap: 8,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
    width: '100%',
    maxWidth: 320,
    gap: 8,
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  progressText: {
    marginTop: 16,
    fontSize: 14,
  },
});
