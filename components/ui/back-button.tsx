import { Pressable, Text, View, Platform } from "react-native";
import { useRouter, usePathname } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useColors } from "@/hooks/use-colors";
import * as Haptics from "expo-haptics";

interface BackButtonProps {
  /** Titre optionnel à afficher à côté de la flèche */
  title?: string;
  /** Callback personnalisé au lieu de router.back() */
  onPress?: () => void;
  /** Couleur de la flèche (par défaut: primary) */
  color?: string;
  /** Taille de l'icône (par défaut: 24) */
  size?: number;
  /** Afficher le texte "Retour" */
  showLabel?: boolean;
}

/**
 * Composant BackButton réutilisable pour la navigation
 * Affiche une flèche de retour avec feedback haptique
 */
export function BackButton({
  title,
  onPress,
  color,
  size = 24,
  showLabel = false,
}: BackButtonProps) {
  const router = useRouter();
  const pathname = usePathname();
  const colors = useColors();
  
  // Ne pas afficher sur les pages principales (tabs)
  const isMainTab = pathname === "/" || pathname === "/vehicles" || pathname === "/inspections" || pathname === "/settings";
  
  if (isMainTab) {
    return null;
  }

  const handlePress = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    if (onPress) {
      onPress();
    } else {
      router.back();
    }
  };

  const buttonColor = color || colors.primary;

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [
        {
          flexDirection: "row",
          alignItems: "center",
          paddingVertical: 8,
          paddingHorizontal: 4,
          opacity: pressed ? 0.7 : 1,
        },
      ]}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
    >
      <Ionicons name="chevron-back" size={size} color={buttonColor} />
      {(showLabel || title) && (
        <Text
          style={{
            color: buttonColor,
            fontSize: 17,
            marginLeft: 2,
          }}
        >
          {title || "Retour"}
        </Text>
      )}
    </Pressable>
  );
}

/**
 * Composant Header avec bouton retour intégré
 * À utiliser en haut des écrans pour une navigation cohérente
 */
interface ScreenHeaderProps {
  /** Titre de l'écran */
  title: string;
  /** Sous-titre optionnel */
  subtitle?: string;
  /** Callback personnalisé pour le retour */
  onBack?: () => void;
  /** Éléments à droite du header */
  rightElement?: React.ReactNode;
  /** Masquer le bouton retour */
  hideBack?: boolean;
}

export function ScreenHeader({
  title,
  subtitle,
  onBack,
  rightElement,
  hideBack = false,
}: ScreenHeaderProps) {
  const colors = useColors();
  const pathname = usePathname();
  
  // Ne pas afficher le bouton retour sur les pages principales
  const isMainTab = pathname === "/" || pathname === "/vehicles" || pathname === "/inspections" || pathname === "/settings";
  const showBackButton = !hideBack && !isMainTab;

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: colors.background,
        borderBottomWidth: 0.5,
        borderBottomColor: colors.border,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
        {showBackButton && (
          <BackButton onPress={onBack} />
        )}
        <View style={{ marginLeft: showBackButton ? 8 : 0, flex: 1 }}>
          <Text
            style={{
              fontSize: 20,
              fontWeight: "700",
              color: colors.foreground,
            }}
            numberOfLines={1}
          >
            {title}
          </Text>
          {subtitle && (
            <Text
              style={{
                fontSize: 14,
                color: colors.muted,
                marginTop: 2,
              }}
              numberOfLines={1}
            >
              {subtitle}
            </Text>
          )}
        </View>
      </View>
      {rightElement && (
        <View style={{ marginLeft: 12 }}>
          {rightElement}
        </View>
      )}
    </View>
  );
}

export default BackButton;
