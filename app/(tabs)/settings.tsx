import { View, Text, ScrollView, TouchableOpacity, Switch, Linking, Alert } from 'react-native';
import { router } from 'expo-router';
import { useState, useEffect } from 'react';
import { ScreenContainer } from '@/components/screen-container';
import { useTheme } from '@/lib/theme-context';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { AdBanner } from '@/components/ui/ad-banner';
import { useAuth } from '@/hooks/use-auth';
import { getSettings, saveSettings, type AppSettings } from '@/lib/data-service';
import { getSubscription, getUsageStats, PLAN_NAMES } from '@/lib/subscription-service';
import { getCompanyProfile } from '@/lib/company-service';
import { resetOnboarding } from '@/lib/onboarding-service';
import { getCurrentUserRole, ROLE_CONFIGS, type UserRole } from '@/lib/role-service';
import type { PlanType } from '@/lib/subscription-service';

export default function SettingsScreen() {
  const { colors, theme, setTheme } = useTheme();
  const { user, logout } = useAuth();
  const [settings, setSettingsState] = useState<AppSettings | null>(null);
  const [subscription, setSubscription] = useState<{ plan: PlanType } | null>(null);
  const [usage, setUsage] = useState<{ vehiclesCount: number; inspectionsThisMonth: number } | null>(null);
  const [company, setCompany] = useState<{ name: string } | null>(null);
  const [currentRole, setCurrentRole] = useState<UserRole>('driver');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [settingsData, subscriptionData, usageData, companyData, roleData] = await Promise.all([
      getSettings(),
      getSubscription(),
      getUsageStats(),
      getCompanyProfile(),
      getCurrentUserRole(),
    ]);
    setSettingsState(settingsData);
    setSubscription(subscriptionData);
    setUsage(usageData);
    setCompany(companyData);
    setCurrentRole(roleData);
  };

  const updateSetting = async (key: keyof AppSettings, value: any) => {
    await saveSettings({ [key]: value });
    setSettingsState({ ...settings!, [key]: value });
  };

  const handleLogout = () => {
    Alert.alert(
      'Déconnexion',
      'Êtes-vous sûr de vouloir vous déconnecter?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Déconnexion',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/auth/login' as any);
          },
        },
      ]
    );
  };

  if (!settings) {
    return (
      <ScreenContainer className="items-center justify-center">
        <Text style={{ color: colors.muted }}>Chargement...</Text>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <ScrollView className="flex-1">
        {/* Header */}
        <View className="px-4 py-6">
          <Text className="text-3xl font-bold" style={{ color: colors.foreground }}>
            Paramètres
          </Text>
        </View>

        {/* User Section */}
        {user && (
          <View className="px-4 mb-6">
            <View className="rounded-2xl p-4" style={{ backgroundColor: colors.surface }}>
              <View className="flex-row items-center mb-3">
                <View
                  className="w-16 h-16 rounded-full items-center justify-center mr-4"
                  style={{ backgroundColor: colors.primary }}
                >
                  <Text className="text-white text-2xl font-bold">
                    {user.name?.charAt(0).toUpperCase() || 'U'}
                  </Text>
                </View>
                <View className="flex-1">
                  <Text className="text-lg font-bold" style={{ color: colors.foreground }}>
                    {user.name || 'Utilisateur'}
                  </Text>
                  <Text className="text-sm" style={{ color: colors.muted }}>
                    {user.email || 'Aucun email'}
                  </Text>
                </View>
              </View>
              {company && (
                <Text className="text-sm mb-2" style={{ color: colors.muted }}>
                  {company.name}
                </Text>
              )}
            </View>
          </View>
        )}

        {/* Subscription Section */}
        {subscription && usage && (
          <View className="px-4 mb-6">
            <Text className="text-sm font-semibold mb-2" style={{ color: colors.muted }}>
              ABONNEMENT
            </Text>
            <TouchableOpacity
              onPress={() => router.push('/subscription/upgrade' as any)}
              className="rounded-2xl p-4"
              style={{ backgroundColor: colors.surface }}
            >
              <View className="flex-row items-center justify-between mb-3">
                <View>
                  <Text className="text-lg font-bold" style={{ color: colors.foreground }}>
                    Plan {PLAN_NAMES[subscription.plan]}
                  </Text>
                  <Text className="text-sm" style={{ color: colors.muted }}>
                    {usage.vehiclesCount} véhicules • {usage.inspectionsThisMonth} inspections ce mois
                  </Text>
                </View>
                <IconSymbol name="chevron.right" size={20} color={colors.muted} />
              </View>
              {subscription.plan === 'free' && (
                <View
                  className="px-3 py-2 rounded-lg"
                  style={{ backgroundColor: colors.primary + '15' }}
                >
                  <Text className="text-xs font-semibold" style={{ color: colors.primary }}>
                    Passez au plan Pro pour débloquer toutes les fonctionnalités
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* Appearance Section */}
        <View className="px-4 mb-6">
          <Text className="text-sm font-semibold mb-2" style={{ color: colors.muted }}>
            APPARENCE
          </Text>

          {/* Theme */}
          <View className="rounded-2xl overflow-hidden" style={{ backgroundColor: colors.surface }}>
            <View className="p-4 border-b" style={{ borderColor: colors.border }}>
              <Text className="text-base font-semibold mb-3" style={{ color: colors.foreground }}>
                Thème
              </Text>
              <View className="flex-row gap-2">
                {(['auto', 'light', 'dark'] as const).map((mode) => (
                  <TouchableOpacity
                    key={mode}
                    onPress={() => setTheme(mode)}
                    className="flex-1 py-3 rounded-xl items-center"
                    style={{
                      backgroundColor: theme === mode ? colors.primary : colors.background,
                      borderWidth: 1,
                      borderColor: theme === mode ? colors.primary : colors.border,
                    }}
                  >
                    <Text
                      className="font-semibold capitalize"
                      style={{
                        color: theme === mode ? '#FFF' : colors.foreground,
                      }}
                    >
                      {mode === 'auto' ? 'Auto' : mode === 'light' ? 'Clair' : 'Sombre'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        </View>

        {/* Preferences Section */}
        <View className="px-4 mb-6">
          <Text className="text-sm font-semibold mb-2" style={{ color: colors.muted }}>
            PRÉFÉRENCES
          </Text>

          <View className="rounded-2xl overflow-hidden" style={{ backgroundColor: colors.surface }}>
            {/* Notifications */}
            <TouchableOpacity
              className="p-4 flex-row items-center justify-between border-b"
              style={{ borderColor: colors.border }}
              onPress={() => router.push('/settings/notifications' as any)}
            >
              <View className="flex-row items-center flex-1">
                <IconSymbol name="bell.fill" size={20} color={colors.foreground} />
                <View className="ml-3 flex-1">
                  <Text className="text-base" style={{ color: colors.foreground }}>
                    Notifications
                  </Text>
                  <Text className="text-sm" style={{ color: colors.muted }}>
                    Gérer les alertes et rappels
                  </Text>
                </View>
              </View>
              <IconSymbol name="chevron.right" size={16} color={colors.muted} />
            </TouchableOpacity>

            {/* Google Calendar Sync */}
            <TouchableOpacity
              className="p-4 flex-row items-center justify-between border-b"
              style={{ borderColor: colors.border }}
              onPress={() => router.push('/settings/calendar-sync' as any)}
            >
              <View className="flex-row items-center flex-1">
                <IconSymbol name="calendar" size={20} color={colors.foreground} />
                <View className="ml-3 flex-1">
                  <Text className="text-base" style={{ color: colors.foreground }}>
                    Google Calendar
                  </Text>
                  <Text className="text-sm" style={{ color: colors.muted }}>
                    Synchroniser les rappels
                  </Text>
                </View>
              </View>
              <IconSymbol name="chevron.right" size={16} color={colors.muted} />
            </TouchableOpacity>

            {/* Auto Sync */}
            <View className="p-4 flex-row items-center justify-between">
              <View className="flex-row items-center flex-1">
                <IconSymbol name="arrow.triangle.2.circlepath" size={20} color={colors.foreground} />
                <Text className="text-base ml-3" style={{ color: colors.foreground }}>
                  Synchronisation automatique
                </Text>
              </View>
              <Switch
                value={settings.autoSync}
                onValueChange={(value) => updateSetting('autoSync', value)}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor="#FFF"
              />
            </View>
          </View>
        </View>

        {/* Regional Settings Section */}
        <View className="px-4 mb-6">
          <Text className="text-sm font-semibold mb-2" style={{ color: colors.muted }}>
            RÉGIONAL
          </Text>

          <View className="rounded-2xl overflow-hidden" style={{ backgroundColor: colors.surface }}>
            {/* Language */}
            <View className="p-4 border-b" style={{ borderColor: colors.border }}>
              <Text className="text-base font-semibold mb-3" style={{ color: colors.foreground }}>
                Langue
              </Text>
              <View className="flex-row gap-2">
                {(['fr', 'en'] as const).map((lang) => (
                  <TouchableOpacity
                    key={lang}
                    onPress={() => updateSetting('language', lang)}
                    className="flex-1 py-3 rounded-xl items-center"
                    style={{
                      backgroundColor: settings.language === lang ? colors.primary : colors.background,
                      borderWidth: 1,
                      borderColor: settings.language === lang ? colors.primary : colors.border,
                    }}
                  >
                    <Text
                      className="font-semibold"
                      style={{
                        color: settings.language === lang ? '#FFF' : colors.foreground,
                      }}
                    >
                      {lang === 'fr' ? 'Français' : 'English'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Date Format */}
            <View className="p-4 border-b" style={{ borderColor: colors.border }}>
              <Text className="text-base font-semibold mb-3" style={{ color: colors.foreground }}>
                Format de date
              </Text>
              <View className="flex-row gap-2">
                {(['YYYY-MM-DD', 'DD/MM/YYYY', 'MM/DD/YYYY'] as const).map((format) => (
                  <TouchableOpacity
                    key={format}
                    onPress={() => updateSetting('dateFormat', format)}
                    className="flex-1 py-3 rounded-xl items-center"
                    style={{
                      backgroundColor: settings.dateFormat === format ? colors.primary : colors.background,
                      borderWidth: 1,
                      borderColor: settings.dateFormat === format ? colors.primary : colors.border,
                    }}
                  >
                    <Text
                      className="font-semibold text-xs"
                      style={{
                        color: settings.dateFormat === format ? '#FFF' : colors.foreground,
                      }}
                    >
                      {format}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Distance Unit */}
            <View className="p-4">
              <Text className="text-base font-semibold mb-3" style={{ color: colors.foreground }}>
                Unité de distance
              </Text>
              <View className="flex-row gap-2">
                {(['km', 'mi'] as const).map((unit) => (
                  <TouchableOpacity
                    key={unit}
                    onPress={() => updateSetting('distanceUnit', unit)}
                    className="flex-1 py-3 rounded-xl items-center"
                    style={{
                      backgroundColor: settings.distanceUnit === unit ? colors.primary : colors.background,
                      borderWidth: 1,
                      borderColor: settings.distanceUnit === unit ? colors.primary : colors.border,
                    }}
                  >
                    <Text
                      className="font-semibold"
                      style={{
                        color: settings.distanceUnit === unit ? '#FFF' : colors.foreground,
                      }}
                    >
                      {unit === 'km' ? 'Kilomètres (km)' : 'Miles (mi)'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        </View>

        {/* Rôle et Dashboard Section */}
        <View className="px-4 mb-6">
          <Text className="text-sm font-semibold mb-2" style={{ color: colors.muted }}>
            RÔLE ET DASHBOARD
          </Text>

          <View className="rounded-2xl overflow-hidden" style={{ backgroundColor: colors.surface }}>
            <TouchableOpacity
              onPress={() => router.push('/role-select' as any)}
              className="p-4 flex-row items-center justify-between border-b"
              style={{ borderColor: colors.border }}
            >
              <View className="flex-row items-center flex-1">
                <View
                  className="w-10 h-10 rounded-full items-center justify-center mr-3"
                  style={{ backgroundColor: ROLE_CONFIGS[currentRole].color + '20' }}
                >
                  <IconSymbol name="person.fill" size={20} color={ROLE_CONFIGS[currentRole].color} />
                </View>
                <View className="flex-1">
                  <Text className="text-base font-medium" style={{ color: colors.foreground }}>
                    Changer de rôle
                  </Text>
                  <Text className="text-xs mt-0.5" style={{ color: colors.muted }}>
                    Actuellement: {ROLE_CONFIGS[currentRole].nameFr}
                  </Text>
                </View>
              </View>
              <IconSymbol name="chevron.right" size={16} color={colors.muted} />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push(ROLE_CONFIGS[currentRole].dashboardRoute as any)}
              className="p-4 flex-row items-center justify-between"
            >
              <View className="flex-row items-center flex-1">
                <View
                  className="w-10 h-10 rounded-full items-center justify-center mr-3"
                  style={{ backgroundColor: colors.primary + '20' }}
                >
                  <IconSymbol name="house.fill" size={20} color={colors.primary} />
                </View>
                <View className="flex-1">
                  <Text className="text-base font-medium" style={{ color: colors.foreground }}>
                    Accéder à mon dashboard
                  </Text>
                  <Text className="text-xs mt-0.5" style={{ color: colors.muted }}>
                    Dashboard {ROLE_CONFIGS[currentRole].nameFr}
                  </Text>
                </View>
              </View>
              <IconSymbol name="chevron.right" size={16} color={colors.muted} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Administration Section */}
        <View className="px-4 mb-6">
          <Text className="text-sm font-semibold mb-2" style={{ color: colors.muted }}>
            ADMINISTRATION
          </Text>

          <View className="rounded-2xl overflow-hidden" style={{ backgroundColor: colors.surface }}>
            <TouchableOpacity
              onPress={() => router.push('/technicians' as any)}
              className="p-4 flex-row items-center justify-between border-b"
              style={{ borderColor: colors.border }}
            >
              <View className="flex-row items-center flex-1">
                <IconSymbol name="person.fill" size={20} color={colors.primary} />
                <View className="ml-3 flex-1">
                  <Text className="text-base font-medium" style={{ color: colors.foreground }}>
                    Techniciens
                  </Text>
                  <Text className="text-xs mt-0.5" style={{ color: colors.muted }}>
                    Gérer les techniciens et leurs spécialités
                  </Text>
                </View>
              </View>
              <IconSymbol name="chevron.right" size={16} color={colors.muted} />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push('/teams' as any)}
              className="p-4 flex-row items-center justify-between border-b"
              style={{ borderColor: colors.border }}
            >
              <View className="flex-row items-center flex-1">
                <IconSymbol name="person.3.fill" size={20} color={colors.primary} />
                <View className="ml-3 flex-1">
                  <Text className="text-base font-medium" style={{ color: colors.foreground }}>
                    Équipes
                  </Text>
                  <Text className="text-xs mt-0.5" style={{ color: colors.muted }}>
                    Organiser les techniciens en équipes
                  </Text>
                </View>
              </View>
              <IconSymbol name="chevron.right" size={16} color={colors.muted} />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push('/settings/permissions' as any)}
              className="p-4 flex-row items-center justify-between"
            >
              <View className="flex-row items-center flex-1">
                <IconSymbol name="lock.fill" size={20} color={colors.primary} />
                <View className="ml-3 flex-1">
                  <Text className="text-base font-medium" style={{ color: colors.foreground }}>
                    Permissions
                  </Text>
                  <Text className="text-xs mt-0.5" style={{ color: colors.muted }}>
                    Configurer les droits d'accès par rôle
                  </Text>
                </View>
              </View>
              <IconSymbol name="chevron.right" size={16} color={colors.muted} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Help & Tutorial Section */}
        <View className="px-4 mb-6">
          <Text className="text-sm font-semibold mb-2" style={{ color: colors.muted }}>
            AIDE & TUTORIEL
          </Text>

          <View className="rounded-2xl overflow-hidden" style={{ backgroundColor: colors.surface }}>
            <TouchableOpacity
              onPress={async () => {
                await resetOnboarding();
                router.replace('/onboarding' as any);
              }}
              className="p-4 flex-row items-center justify-between border-b"
              style={{ borderColor: colors.border }}
            >
              <View className="flex-row items-center flex-1">
                <IconSymbol name="questionmark.circle.fill" size={20} color={colors.primary} />
                <View className="ml-3 flex-1">
                  <Text className="text-base font-medium" style={{ color: colors.foreground }}>
                    Revoir le tutoriel
                  </Text>
                  <Text className="text-xs mt-0.5" style={{ color: colors.muted }}>
                    Relancer le guide de démarrage
                  </Text>
                </View>
              </View>
              <IconSymbol name="chevron.right" size={16} color={colors.muted} />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push('/help' as any)}
              className="p-4 flex-row items-center justify-between border-b"
              style={{ borderColor: colors.border }}
            >
              <View className="flex-row items-center flex-1">
                <IconSymbol name="book.fill" size={20} color={colors.primary} />
                <View className="ml-3 flex-1">
                  <Text className="text-base font-medium" style={{ color: colors.foreground }}>
                    FAQ & Documentation
                  </Text>
                  <Text className="text-xs mt-0.5" style={{ color: colors.muted }}>
                    Questions fréquentes et guides
                  </Text>
                </View>
              </View>
              <IconSymbol name="chevron.right" size={16} color={colors.muted} />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push('/settings/resources' as any)}
              className="p-4 flex-row items-center justify-between"
            >
              <View className="flex-row items-center flex-1">
                <IconSymbol name="link" size={20} color={colors.primary} />
                <View className="ml-3 flex-1">
                  <Text className="text-base font-medium" style={{ color: colors.foreground }}>
                    Ressources utiles
                  </Text>
                  <Text className="text-xs mt-0.5" style={{ color: colors.muted }}>
                    Liens SAAQ, guides et support
                  </Text>
                </View>
              </View>
              <IconSymbol name="chevron.right" size={16} color={colors.muted} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Resources Section */}
        <View className="px-4 mb-8">
          <Text className="text-sm font-semibold mb-2" style={{ color: colors.muted }}>
            RESSOURCES UTILES
          </Text>

          <View className="rounded-2xl overflow-hidden" style={{ backgroundColor: colors.surface }}>
            <TouchableOpacity
              onPress={() => Linking.openURL('https://saaq.gouv.qc.ca')}
              className="p-4 flex-row items-center justify-between border-b"
              style={{ borderColor: colors.border }}
            >
              <View className="flex-row items-center flex-1">
                <IconSymbol name="link" size={20} color={colors.primary} />
                <View className="ml-3 flex-1">
                  <Text className="text-base font-medium" style={{ color: colors.foreground }}>
                    SAAQ - Sécurité routière
                  </Text>
                  <Text className="text-xs mt-0.5" style={{ color: colors.muted }}>
                    Réglementations et normes
                  </Text>
                </View>
              </View>
              <IconSymbol name="chevron.right" size={16} color={colors.muted} />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => Linking.openURL('https://www.vmrscode.com')}
              className="p-4 flex-row items-center justify-between border-b"
              style={{ borderColor: colors.border }}
            >
              <View className="flex-row items-center flex-1">
                <IconSymbol name="link" size={20} color={colors.primary} />
                <View className="ml-3 flex-1">
                  <Text className="text-base font-medium" style={{ color: colors.foreground }}>
                    Codes VMRS
                  </Text>
                  <Text className="text-xs mt-0.5" style={{ color: colors.muted }}>
                    Système de codification des composants
                  </Text>
                </View>
              </View>
              <IconSymbol name="chevron.right" size={16} color={colors.muted} />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => Linking.openURL('https://www.carfax.ca')}
              className="p-4 flex-row items-center justify-between border-b"
              style={{ borderColor: colors.border }}
            >
              <View className="flex-row items-center flex-1">
                <IconSymbol name="link" size={20} color={colors.primary} />
                <View className="ml-3 flex-1">
                  <Text className="text-base font-medium" style={{ color: colors.foreground }}>
                    CARFAX Canada
                  </Text>
                  <Text className="text-xs mt-0.5" style={{ color: colors.muted }}>
                    Historique des véhicules
                  </Text>
                </View>
              </View>
              <IconSymbol name="chevron.right" size={16} color={colors.muted} />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push('/team' as any)}
              className="p-4 flex-row items-center justify-between"
            >
              <View className="flex-row items-center flex-1">
                <IconSymbol name="person.2.fill" size={20} color={colors.primary} />
                <View className="ml-3 flex-1">
                  <Text className="text-base font-medium" style={{ color: colors.foreground }}>
                    Gestion de l'équipe
                  </Text>
                  <Text className="text-xs mt-0.5" style={{ color: colors.muted }}>
                    Ajouter et gérer les techniciens
                  </Text>
                </View>
              </View>
              <IconSymbol name="chevron.right" size={16} color={colors.muted} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Account Section */}
        <View className="px-4 mb-8">
          <Text className="text-sm font-semibold mb-2" style={{ color: colors.muted }}>
            COMPTE
          </Text>

          <View className="rounded-2xl overflow-hidden" style={{ backgroundColor: colors.surface }}>
            <TouchableOpacity
              onPress={handleLogout}
              className="p-4 flex-row items-center"
            >
              <IconSymbol name="arrow.right.square.fill" size={20} color={colors.error} />
              <Text className="text-base ml-3 font-semibold" style={{ color: colors.error }}>
                Déconnexion
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Ad Banner */}
        <View className="px-4 mb-6">
          <AdBanner
            variant="banner"
            rotationInterval={5000}
            showIndicators={true}
            compact={false}
          />
        </View>

        {/* Version */}
        <View className="px-4 pb-8 items-center">
          <Text className="text-xs" style={{ color: colors.muted }}>
            FleetCore v1.0.0
          </Text>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
