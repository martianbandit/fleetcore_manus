import "@/global.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useMemo, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "react-native-reanimated";
import { Platform, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import "@/lib/_core/nativewind-pressable";
import { ThemeProvider } from "@/lib/theme-provider";
import { ThemeProvider as FleetCoreThemeProvider } from "@/lib/theme-context";
import {
  SafeAreaFrameContext,
  SafeAreaInsetsContext,
  SafeAreaProvider,
  initialWindowMetrics,
} from "react-native-safe-area-context";
import type { EdgeInsets, Metrics, Rect } from "react-native-safe-area-context";

import { trpc, createTRPCClient } from "@/lib/trpc";
import { initManusRuntime, subscribeSafeAreaInsets } from "@/lib/_core/manus-runtime";
import { requestNotificationPermissions } from "@/lib/notification-service";

const DEFAULT_WEB_INSETS: EdgeInsets = { top: 0, right: 0, bottom: 0, left: 0 };
const DEFAULT_WEB_FRAME: Rect = { x: 0, y: 0, width: 0, height: 0 };

export const unstable_settings = {
  anchor: "(tabs)",
};

export default function RootLayout() {
  const initialInsets = initialWindowMetrics?.insets ?? DEFAULT_WEB_INSETS;
  const initialFrame = initialWindowMetrics?.frame ?? DEFAULT_WEB_FRAME;

  const [insets, setInsets] = useState<EdgeInsets>(initialInsets);
  const [frame, setFrame] = useState<Rect>(initialFrame);

  // Initialize Manus runtime for cookie injection from parent container
  useEffect(() => {
    initManusRuntime();
  }, []);

  // Request notification permissions on app start
  useEffect(() => {
    const setupNotifications = async () => {
      try {
        await requestNotificationPermissions();
      } catch (error) {
        console.error('Failed to request notification permissions:', error);
      }
    };
    setupNotifications();
  }, []);

  const handleSafeAreaUpdate = useCallback((metrics: Metrics) => {
    setInsets(metrics.insets);
    setFrame(metrics.frame);
  }, []);

  useEffect(() => {
    if (Platform.OS !== "web") return;
    const unsubscribe = subscribeSafeAreaInsets(handleSafeAreaUpdate);
    return () => unsubscribe();
  }, [handleSafeAreaUpdate]);

  // Create clients once and reuse them
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Disable automatic refetching on window focus for mobile
            refetchOnWindowFocus: false,
            // Retry failed requests once
            retry: 1,
          },
        },
      }),
  );
  const [trpcClient] = useState(() => createTRPCClient());

  // Ensure minimum 8px padding for top and bottom on mobile
  const providerInitialMetrics = useMemo(() => {
    const metrics = initialWindowMetrics ?? { insets: initialInsets, frame: initialFrame };
    return {
      ...metrics,
      insets: {
        ...metrics.insets,
        top: Math.max(metrics.insets.top, 16),
        bottom: Math.max(metrics.insets.bottom, 12),
      },
    };
  }, [initialInsets, initialFrame]);

  const content = (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <trpc.Provider client={trpcClient} queryClient={queryClient}>
        <QueryClientProvider client={queryClient}>
          {/* Default to hiding native headers so raw route segments don't appear (e.g. "(tabs)", "products/[id]"). */}
          {/* If a screen needs the native header, explicitly enable it and set a human title via Stack.Screen options. */}
          <Stack 
              screenOptions={({ navigation }) => ({
                headerShown: true,
                headerStyle: {
                  backgroundColor: '#ffffff',
                },
                headerTintColor: '#0a7ea4',
                headerTitleStyle: {
                  fontWeight: '600',
                  fontSize: 17,
                },
                headerBackTitleVisible: false,
                headerLeft: ({ canGoBack }) => 
                  canGoBack ? (
                    <Pressable
                      onPress={() => navigation.goBack()}
                      style={({ pressed }) => ({
                        opacity: pressed ? 0.7 : 1,
                        paddingHorizontal: 8,
                        paddingVertical: 4,
                        flexDirection: 'row',
                        alignItems: 'center',
                      })}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                      <Ionicons name="chevron-back" size={28} color="#0a7ea4" />
                    </Pressable>
                  ) : null,
              })}
            >
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="onboarding" options={{ headerShown: false, gestureEnabled: false }} />
            <Stack.Screen name="oauth/callback" options={{ headerShown: false }} />
            
            {/* Écrans principaux */}
            <Stack.Screen name="analytics" options={{ title: 'Analytiques' }} />
            <Stack.Screen name="audit-log" options={{ title: 'Journal d\'audit' }} />
            <Stack.Screen name="new-inspection" options={{ title: 'Nouvelle inspection' }} />
            <Stack.Screen name="notifications" options={{ title: 'Notifications' }} />
            <Stack.Screen name="reports" options={{ title: 'Rapports' }} />
            <Stack.Screen name="role-select" options={{ title: 'Sélection du rôle' }} />
            
            {/* Véhicules */}
            <Stack.Screen name="vehicle/[id]" options={{ title: 'Détail véhicule' }} />
            
            {/* Inspections */}
            <Stack.Screen name="inspection/[id]" options={{ title: 'Détail inspection' }} />
            <Stack.Screen name="checklist/[id]" options={{ title: 'Checklist' }} />
            
            {/* Dashboards par rôle */}
            <Stack.Screen name="dashboard/admin" options={{ title: 'Administration' }} />
            <Stack.Screen name="dashboard/dispatcher" options={{ title: 'Dispatcher' }} />
            <Stack.Screen name="dashboard/driver" options={{ title: 'Chauffeur' }} />
            <Stack.Screen name="dashboard/manager" options={{ title: 'Gestionnaire' }} />
            <Stack.Screen name="dashboard/technician" options={{ title: 'Technicien' }} />
            
            {/* PEP */}
            <Stack.Screen name="pep/index" options={{ title: 'PEP' }} />
            <Stack.Screen name="pep/create" options={{ title: 'Créer PEP' }} />
            <Stack.Screen name="pep/select-vehicle" options={{ title: 'Sélectionner véhicule' }} />
            <Stack.Screen name="pep/sign" options={{ title: 'Signer PEP' }} />
            
            {/* Rappels */}
            <Stack.Screen name="reminders/index" options={{ title: 'Rappels' }} />
            <Stack.Screen name="reminders/create" options={{ title: 'Nouveau rappel' }} />
            <Stack.Screen name="reminder/[id]" options={{ title: 'Détail rappel' }} />
            
            {/* Inventaire */}
            <Stack.Screen name="inventory/index" options={{ title: 'Inventaire' }} />
            <Stack.Screen name="inventory/add" options={{ title: 'Ajouter pièce' }} />
            <Stack.Screen name="inventory/[id]" options={{ title: 'Détail pièce' }} />
            
            {/* Équipes */}
            <Stack.Screen name="teams/index" options={{ title: 'Équipes' }} />
            <Stack.Screen name="technician/[id]" options={{ title: 'Détail technicien' }} />
            <Stack.Screen name="technicians/index" options={{ title: 'Techniciens' }} />
            <Stack.Screen name="team-detail/[id]" options={{ title: 'Détail équipe' }} />
            
            {/* Bons de travail */}
            <Stack.Screen name="work-orders/index" options={{ title: 'Bons de travail' }} />
            <Stack.Screen name="work-orders/[id]" options={{ title: 'Détail bon' }} />
            <Stack.Screen name="work-orders/create" options={{ title: 'Nouveau bon' }} />
            
            {/* Paramètres */}
            <Stack.Screen name="settings/notifications" options={{ title: 'Notifications' }} />
            <Stack.Screen name="settings/language" options={{ title: 'Langue' }} />
            <Stack.Screen name="settings/resources" options={{ title: 'Ressources' }} />
            <Stack.Screen name="settings/calendar-sync" options={{ title: 'Synchronisation calendrier' }} />
            <Stack.Screen name="settings/permissions" options={{ title: 'Permissions' }} />
            
            {/* Autres */}
            <Stack.Screen name="documents/index" options={{ title: 'Documents' }} />
            <Stack.Screen name="help/index" options={{ title: 'Aide' }} />
            <Stack.Screen name="maintenance-costs/index" options={{ title: 'Coûts maintenance' }} />
            <Stack.Screen name="subscription/index" options={{ title: 'Abonnement' }} />
            <Stack.Screen name="auth/login" options={{ title: 'Connexion', headerShown: false }} />
            <Stack.Screen name="dev/theme-lab" options={{ title: 'Theme Lab' }} />
          </Stack>
          <StatusBar style="auto" />
        </QueryClientProvider>
      </trpc.Provider>
    </GestureHandlerRootView>
  );

  const shouldOverrideSafeArea = Platform.OS === "web";

  if (shouldOverrideSafeArea) {
    return (
      <ThemeProvider>
        <FleetCoreThemeProvider>
          <SafeAreaProvider initialMetrics={providerInitialMetrics}>
            <SafeAreaFrameContext.Provider value={frame}>
              <SafeAreaInsetsContext.Provider value={insets}>
                {content}
              </SafeAreaInsetsContext.Provider>
            </SafeAreaFrameContext.Provider>
          </SafeAreaProvider>
        </FleetCoreThemeProvider>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      <FleetCoreThemeProvider>
        <SafeAreaProvider initialMetrics={providerInitialMetrics}>{content}</SafeAreaProvider>
      </FleetCoreThemeProvider>
    </ThemeProvider>
  );
}
