import { useEffect, useState, useCallback } from 'react';
import { ScrollView, Text, View, Pressable, RefreshControl, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

import { ScreenContainer } from '@/components/screen-container';
import { KPICard } from '@/components/ui/kpi-card';
import { InspectionCard } from '@/components/ui/inspection-card';
import { AlertCard } from '@/components/ui/alert-card';
import { AdBanner } from '@/components/ui/ad-banner';
import { IconSymbol } from '@/components/ui/icon-symbol';
import {
  getDashboardStats,
  getInspections,
  getAlerts,
} from '@/lib/data-service';
import { getWorkOrderStats } from '@/lib/work-order-service';
import { getInventoryStats } from '@/lib/inventory-service';
import type { DashboardStats, Inspection, Alert } from '@/lib/types';

export default function DashboardScreen() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentInspections, setRecentInspections] = useState<Inspection[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [workOrderStats, setWorkOrderStats] = useState<any>(null);
  const [inventoryStats, setInventoryStats] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const [statsData, inspectionsData, alertsData, woStats, invStats] = await Promise.all([
        getDashboardStats(),
        getInspections(),
        getAlerts(),
        getWorkOrderStats(),
        getInventoryStats(),
      ]);
      setStats(statsData);
      setRecentInspections(inspectionsData.slice(0, 5));
      setAlerts(alertsData.filter(a => a.severity === 'critical').slice(0, 3));
      setWorkOrderStats(woStats);
      setInventoryStats(invStats);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  const handleQuickAction = (action: string) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    switch (action) {
      case 'new-inspection':
        router.push('/new-inspection' as any);
        break;
      case 'vehicles':
        router.push('/(tabs)/vehicles' as any);
        break;
      case 'inspections':
        router.push('/(tabs)/inspections' as any);
        break;
    }
  };

  if (loading) {
    return (
      <ScreenContainer className="items-center justify-center">
        <Text className="text-muted">Chargement...</Text>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="px-4 pt-2 pb-4">
          <Text className="text-3xl font-bold text-foreground">FleetCore</Text>
          <Text className="text-base text-muted mt-1">
            Tableau de bord de gestion de flotte
          </Text>
        </View>

        {/* KPI Cards */}
        <View className="px-4">
          <View className="flex-row flex-wrap -mx-1.5">
            <View className="w-1/2 px-1.5 mb-3">
              <KPICard
                title="Véhicules"
                value={stats?.totalVehicles || 0}
                subtitle={`${stats?.activeVehicles || 0} actifs`}
                icon="car.fill"
                iconColor="#0066CC"
              />
            </View>
            <View className="w-1/2 px-1.5 mb-3">
              <KPICard
                title="Inspections"
                value={stats?.todayInspections || 0}
                subtitle="Aujourd'hui"
                icon="clipboard.fill"
                iconColor="#22C55E"
              />
            </View>
            <View className="w-1/2 px-1.5 mb-3">
              <KPICard
                title="Défauts actifs"
                value={stats?.activeDefects || 0}
                subtitle={`${stats?.majorDefects || 0} majeurs`}
                icon="exclamationmark.triangle.fill"
                iconColor="#EF4444"
              />
            </View>
            <View className="w-1/2 px-1.5 mb-3">
              <KPICard
                title="Conformité"
                value={`${stats?.complianceScore || 0}%`}
                subtitle="Score global"
                icon="checkmark.circle.fill"
                iconColor="#22C55E"
              />
            </View>
          </View>
        </View>

        {/* FleetCommand & FleetCrew KPIs */}
        {(workOrderStats || inventoryStats) && (
          <View className="px-4 mt-4">
            <Text className="text-lg font-bold text-foreground mb-3">Modules connexes</Text>
            <View className="flex-row flex-wrap -mx-1.5">
              {workOrderStats && (
                <>
                  <View className="w-1/2 px-1.5 mb-3">
                    <Pressable
                      onPress={() => router.push('/work-orders' as any)}
                      style={({ pressed }) => [pressed && { opacity: 0.8 }]}
                    >
                      <KPICard
                        title="Bons de travail"
                        value={workOrderStats.inProgress || 0}
                        subtitle={`${workOrderStats.pending || 0} en attente`}
                        icon="wrench.fill"
                        iconColor="#F59E0B"
                      />
                    </Pressable>
                  </View>
                  <View className="w-1/2 px-1.5 mb-3">
                    <Pressable
                      onPress={() => router.push('/analytics' as any)}
                      style={({ pressed }) => [pressed && { opacity: 0.8 }]}
                    >
                      <KPICard
                        title="Coûts réparations"
                        value={`${(workOrderStats.totalActualCost || 0).toLocaleString()} $`}
                        subtitle="Total complété"
                        icon="dollarsign.circle.fill"
                        iconColor="#22C55E"
                      />
                    </Pressable>
                  </View>
                </>
              )}
              {inventoryStats && (
                <>
                  <View className="w-1/2 px-1.5 mb-3">
                    <Pressable
                      onPress={() => router.push('/inventory' as any)}
                      style={({ pressed }) => [pressed && { opacity: 0.8 }]}
                    >
                      <KPICard
                        title="Inventaire"
                        value={inventoryStats.totalItems || 0}
                        subtitle={`${inventoryStats.lowStockCount || 0} stock bas`}
                        icon="cube.box.fill"
                        iconColor="#8B5CF6"
                      />
                    </Pressable>
                  </View>
                  <View className="w-1/2 px-1.5 mb-3">
                    <Pressable
                      onPress={() => router.push('/inventory' as any)}
                      style={({ pressed }) => [pressed && { opacity: 0.8 }]}
                    >
                      <KPICard
                        title="Valeur stock"
                        value={`${(inventoryStats.totalValue || 0).toLocaleString()} $`}
                        subtitle={`${inventoryStats.outOfStockCount || 0} rupture`}
                        icon="chart.bar.fill"
                        iconColor="#3B82F6"
                      />
                    </Pressable>
                  </View>
                </>
              )}
            </View>
          </View>
        )}

        {/* Quick Actions */}
        <View className="px-4 mt-2">
          <Text className="text-lg font-bold text-foreground mb-3">Actions rapides</Text>
          <View className="flex-row justify-between">
            <Pressable
              onPress={() => handleQuickAction('new-inspection')}
              style={({ pressed }) => [
                styles.quickAction,
                pressed && styles.quickActionPressed,
              ]}
            >
              <View className="bg-primary w-12 h-12 rounded-xl items-center justify-center mb-2">
                <IconSymbol name="plus.circle.fill" size={24} color="#FFFFFF" />
              </View>
              <Text className="text-xs text-foreground font-medium text-center">
                Nouvelle{'\n'}inspection
              </Text>
            </Pressable>

            <Pressable
              onPress={() => handleQuickAction('vehicles')}
              style={({ pressed }) => [
                styles.quickAction,
                pressed && styles.quickActionPressed,
              ]}
            >
              <View className="bg-surface border border-border w-12 h-12 rounded-xl items-center justify-center mb-2">
                <IconSymbol name="car.fill" size={24} color="#0066CC" />
              </View>
              <Text className="text-xs text-foreground font-medium text-center">
                Voir{'\n'}véhicules
              </Text>
            </Pressable>

            <Pressable
              onPress={() => router.push('/work-orders' as any)}
              style={({ pressed }) => [
                styles.quickAction,
                pressed && styles.quickActionPressed,
              ]}
            >
              <View className="bg-surface border border-border w-12 h-12 rounded-xl items-center justify-center mb-2">
                <IconSymbol name="wrench.fill" size={24} color="#F59E0B" />
              </View>
              <Text className="text-xs text-foreground font-medium text-center">
                Fleet{'\n'}Command
              </Text>
            </Pressable>

            <Pressable
              onPress={() => router.push('/inventory' as any)}
              style={({ pressed }) => [
                styles.quickAction,
                pressed && styles.quickActionPressed,
              ]}
            >
              <View className="bg-surface border border-border w-12 h-12 rounded-xl items-center justify-center mb-2">
                <IconSymbol name="cube.box.fill" size={24} color="#8B5CF6" />
              </View>
              <Text className="text-xs text-foreground font-medium text-center">
                Fleet{'\n'}Crew
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Secondary Actions */}
        <View className="px-4 mt-4">
          <View className="flex-row justify-between">
            <Pressable
              onPress={() => handleQuickAction('inspections')}
              style={({ pressed }) => [
                styles.quickAction,
                pressed && styles.quickActionPressed,
              ]}
            >
              <View className="bg-surface border border-border w-12 h-12 rounded-xl items-center justify-center mb-2">
                <IconSymbol name="clipboard.fill" size={24} color="#0066CC" />
              </View>
              <Text className="text-xs text-foreground font-medium text-center">
                Voir{'\n'}inspections
              </Text>
            </Pressable>

            <Pressable
              onPress={() => router.push('/analytics' as any)}
              style={({ pressed }) => [
                styles.quickAction,
                pressed && styles.quickActionPressed,
              ]}
            >
              <View className="bg-surface border border-border w-12 h-12 rounded-xl items-center justify-center mb-2">
                <IconSymbol name="chart.bar.fill" size={24} color="#0066CC" />
              </View>
              <Text className="text-xs text-foreground font-medium text-center">
                Voir{'\n'}rapports
              </Text>
            </Pressable>

            <Pressable
              onPress={() => router.push('/team' as any)}
              style={({ pressed }) => [
                styles.quickAction,
                pressed && styles.quickActionPressed,
              ]}
            >
              <View className="bg-surface border border-border w-12 h-12 rounded-xl items-center justify-center mb-2">
                <IconSymbol name="person.2.fill" size={24} color="#0066CC" />
              </View>
              <Text className="text-xs text-foreground font-medium text-center">
                Gérer{'\n'}équipe
              </Text>
            </Pressable>

            <Pressable
              onPress={() => router.push('/(tabs)/settings' as any)}
              style={({ pressed }) => [
                styles.quickAction,
                pressed && styles.quickActionPressed,
              ]}
            >
              <View className="bg-surface border border-border w-12 h-12 rounded-xl items-center justify-center mb-2">
                <IconSymbol name="gearshape.fill" size={24} color="#64748B" />
              </View>
              <Text className="text-xs text-foreground font-medium text-center">
                Paramètres
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Alerts */}
        {alerts.length > 0 && (
          <View className="px-4 mt-6">
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-lg font-bold text-foreground">Alertes critiques</Text>
              <View className="bg-error/15 px-2 py-0.5 rounded-full">
                <Text className="text-xs font-semibold text-error">{alerts.length}</Text>
              </View>
            </View>
            {alerts.map((alert) => (
              <AlertCard
                key={alert.id}
                alert={alert}
                onPress={() => {
                  if (alert.inspectionId) {
                    router.push(`/inspection/${alert.inspectionId}` as any);
                  } else if (alert.vehicleId) {
                    router.push(`/vehicle/${alert.vehicleId}` as any);
                  }
                }}
              />
            ))}
          </View>
        )}

        {/* Ad Banner */}
        <View className="px-4 mt-6">
          <AdBanner
            variant="banner"
            ad={{
              id: 'ad_1',
              type: 'banner',
              title: 'Pièces de camions lourds',
              description: 'Livraison rapide partout au Québec',
              imageUrl: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=400',
              ctaText: 'Voir le catalogue',
              targetUrl: 'https://example.com/pieces',
              sponsor: 'Pièces Pro',
              isLocal: true,
            }}
          />
        </View>

        {/* Recent Inspections */}
        <View className="px-4 mt-6">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-lg font-bold text-foreground">Inspections récentes</Text>
            <Pressable
              onPress={() => router.push('/(tabs)/inspections' as any)}
              style={({ pressed }) => [pressed && { opacity: 0.6 }]}
            >
              <Text className="text-sm text-primary font-medium">Voir tout</Text>
            </Pressable>
          </View>
          {recentInspections.length > 0 ? (
            recentInspections.map((inspection) => (
              <InspectionCard
                key={inspection.id}
                inspection={inspection}
                compact
                onPress={() => router.push(`/inspection/${inspection.id}` as any)}
              />
            ))
          ) : (
            <View className="bg-surface rounded-xl p-6 border border-border items-center">
              <IconSymbol name="clipboard.fill" size={32} color="#64748B" />
              <Text className="text-muted mt-2">Aucune inspection récente</Text>
            </View>
          )}
        </View>

        {/* Bottom spacing for tab bar */}
        <View className="h-24" />
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
  },
  quickAction: {
    alignItems: 'center',
    width: 80,
  },
  quickActionPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.95 }],
  },
});
