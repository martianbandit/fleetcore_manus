import { useEffect, useState, useCallback } from 'react';
import { ScrollView, Text, View, Pressable, RefreshControl, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

import { ScreenContainer } from '@/components/screen-container';
import { StatCard } from '@/components/ui/stat-card';
import { ActionCard } from '@/components/ui/action-card';
import { SectionHeader } from '@/components/ui/section-header';
import { ActivityTimeline, type ActivityItem } from '@/components/ui/activity-timeline';
import { ProgressRing } from '@/components/ui/progress-ring';
import { QuickStats } from '@/components/ui/quick-stats';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { SyncIndicator, useSyncStatus } from '@/components/ui/sync-indicator';
import {
  getDashboardStats,
  getInspections,
  getAlerts,
  getRecentActivity,
} from '@/lib/data-service';
import { getWorkOrderStats } from '@/lib/work-order-service';
import { getInventoryStats } from '@/lib/inventory-service';
import { getNotificationCounts } from '@/lib/business-notification-service';
import type { DashboardStats, Inspection, Alert, RecentActivity } from '@/lib/types';

export default function DashboardScreen() {
  const router = useRouter();
  const syncStatus = useSyncStatus();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentInspections, setRecentInspections] = useState<Inspection[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [activities, setActivities] = useState<RecentActivity[]>([]);
  const [workOrderStats, setWorkOrderStats] = useState<any>(null);
  const [inventoryStats, setInventoryStats] = useState<any>(null);
  const [notificationCounts, setNotificationCounts] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const [statsData, inspectionsData, alertsData, activityData, woStats, invStats, notifCounts] = await Promise.all([
        getDashboardStats(),
        getInspections(),
        getAlerts(),
        getRecentActivity(),
        getWorkOrderStats(),
        getInventoryStats(),
        getNotificationCounts(),
      ]);
      setStats(statsData);
      setRecentInspections(inspectionsData.slice(0, 5));
      setAlerts(alertsData.filter(a => a.severity === 'critical').slice(0, 3));
      setActivities(activityData.slice(0, 5));
      setWorkOrderStats(woStats);
      setInventoryStats(invStats);
      setNotificationCounts(notifCounts);
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

  const handleNavigation = (route: string) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.push(route as any);
  };

  // Transform activities for timeline
  const timelineItems: ActivityItem[] = activities.map(activity => ({
    id: activity.id,
    type: activity.type as any,
    title: activity.title,
    description: activity.description,
    timestamp: activity.timestamp,
    status: activity.type === 'defect_found' ? 'warning' : 'success',
    metadata: {
      vehiclePlate: (activity as any).vehiclePlate,
      userName: activity.userName,
    },
    onPress: activity.vehicleId ? () => handleNavigation(`/vehicle/${activity.vehicleId}`) : undefined,
  }));

  if (loading) {
    return (
      <ScreenContainer className="items-center justify-center">
        <View className="items-center">
          <View className="w-12 h-12 rounded-full bg-primary/20 items-center justify-center mb-3">
            <IconSymbol name="car.fill" size={24} color="#0891B2" />
          </View>
          <Text className="text-muted">Chargement...</Text>
        </View>
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
          <View className="flex-row justify-between items-start">
            <View className="flex-1">
              <Text className="text-3xl font-bold text-foreground">FleetCore</Text>
              <Text className="text-base text-muted mt-1">
                Tableau de bord de gestion de flotte
              </Text>
            </View>
            <View className="flex-row items-center">
              {/* Notifications Badge */}
              <Pressable
                onPress={() => handleNavigation('/notifications')}
                className="mr-3 relative"
                style={({ pressed }) => [pressed && { opacity: 0.7 }]}
              >
                <View className="w-10 h-10 rounded-full bg-surface border border-border items-center justify-center">
                  <IconSymbol name="bell.fill" size={20} color="#64748B" />
                </View>
                {notificationCounts?.unread > 0 && (
                  <View className="absolute -top-1 -right-1 bg-error rounded-full min-w-[18px] h-[18px] items-center justify-center px-1">
                    <Text className="text-[10px] font-bold text-white">
                      {notificationCounts.unread > 99 ? '99+' : notificationCounts.unread}
                    </Text>
                  </View>
                )}
              </Pressable>
              <SyncIndicator
                status={syncStatus.status}
                lastSyncTime={syncStatus.lastSyncTime}
                onPress={syncStatus.startSync}
                size="small"
              />
            </View>
          </View>
        </View>

        {/* Conformité globale avec Progress Ring */}
        <View className="px-4 mb-4">
          <View className="bg-surface rounded-2xl border border-border p-4">
            <View className="flex-row items-center">
              <ProgressRing
                progress={stats?.complianceScore || 0}
                size={80}
                color="auto"
                label="Conformité"
              />
              <View className="flex-1 ml-4">
                <Text className="text-lg font-bold text-foreground">
                  Score de conformité
                </Text>
                <Text className="text-sm text-muted mt-1">
                  {stats?.complianceScore || 0}% de votre flotte est conforme aux normes SAAQ
                </Text>
                <Pressable
                  onPress={() => handleNavigation('/reports')}
                  className="flex-row items-center mt-2"
                  style={({ pressed }) => [pressed && { opacity: 0.7 }]}
                >
                  <Text className="text-sm font-medium text-primary">Voir le rapport</Text>
                  <IconSymbol name="chevron.right" size={14} color="#0891B2" />
                </Pressable>
              </View>
            </View>
          </View>
        </View>

        {/* KPI Cards - Statistiques principales */}
        <View className="px-4 mb-4">
          <SectionHeader
            title="Vue d'ensemble"
            icon="chart.bar.fill"
            iconColor="#0891B2"
          />
          <View className="flex-row flex-wrap -mx-1.5">
            <View className="w-1/2 px-1.5 mb-3">
              <StatCard
                title="Véhicules"
                value={stats?.totalVehicles || 0}
                subtitle={`${stats?.activeVehicles || 0} actifs`}
                icon="car.fill"
                iconColor="#0891B2"
                onPress={() => handleNavigation('/(tabs)/vehicles')}
              />
            </View>
            <View className="w-1/2 px-1.5 mb-3">
              <StatCard
                title="Inspections"
                value={stats?.todayInspections || 0}
                subtitle="Aujourd'hui"
                icon="clipboard.fill"
                iconColor="#22C55E"
                onPress={() => handleNavigation('/(tabs)/inspections')}
              />
            </View>
            <View className="w-1/2 px-1.5 mb-3">
              <StatCard
                title="Défauts actifs"
                value={stats?.activeDefects || 0}
                subtitle={`${stats?.majorDefects || 0} majeurs`}
                icon="exclamationmark.triangle.fill"
                iconColor="#EF4444"
                badge={stats?.majorDefects && stats.majorDefects > 0 ? { text: 'Urgent', color: 'error' } : undefined}
              />
            </View>
            <View className="w-1/2 px-1.5 mb-3">
              <StatCard
                title="Bons de travail"
                value={workOrderStats?.inProgress || 0}
                subtitle={`${workOrderStats?.pending || 0} en attente`}
                icon="wrench.fill"
                iconColor="#F59E0B"
                onPress={() => handleNavigation('/work-orders')}
              />
            </View>
          </View>
        </View>

        {/* Actions rapides */}
        <View className="px-4 mb-4">
          <SectionHeader
            title="Actions rapides"
            icon="bolt.fill"
            iconColor="#F59E0B"
          />
          <View className="gap-2">
            <ActionCard
              title="Nouvelle inspection"
              description="Démarrer une inspection de véhicule"
              icon="plus.circle.fill"
              variant="primary"
              onPress={() => handleNavigation('/new-inspection')}
            />
            <ActionCard
              title="Signaler un défaut"
              description="Rapporter un problème sur un véhicule"
              icon="exclamationmark.triangle.fill"
              variant="warning"
              onPress={() => handleNavigation('/report-defect')}
            />
            <ActionCard
              title="Générer un rapport"
              description="Créer un rapport de conformité"
              icon="doc.text.fill"
              variant="default"
              onPress={() => handleNavigation('/reports')}
            />
          </View>
        </View>

        {/* Modules connexes - Quick Stats */}
        {(workOrderStats || inventoryStats) && (
          <View className="px-4 mb-4">
            <SectionHeader
              title="Modules"
              icon="square.grid.2x2.fill"
              iconColor="#8B5CF6"
              action={{
                label: 'Tout voir',
                onPress: () => handleNavigation('/modules'),
              }}
            />
            <QuickStats
              items={[
                {
                  label: 'Inventaire',
                  value: inventoryStats?.totalItems || 0,
                  icon: 'cube.box.fill',
                  color: '#8B5CF6',
                },
                {
                  label: 'Stock bas',
                  value: inventoryStats?.lowStockCount || 0,
                  icon: 'exclamationmark.circle.fill',
                  color: '#F59E0B',
                },
                {
                  label: 'Réparations',
                  value: `${(workOrderStats?.totalActualCost || 0).toLocaleString()} $`,
                  icon: 'dollarsign.circle.fill',
                  color: '#22C55E',
                },
                {
                  label: 'Complétés',
                  value: workOrderStats?.completed || 0,
                  icon: 'checkmark.circle.fill',
                  color: '#3B82F6',
                },
              ]}
              variant="card"
              columns={2}
            />
          </View>
        )}

        {/* Alertes critiques */}
        {alerts.length > 0 && (
          <View className="px-4 mb-4">
            <SectionHeader
              title="Alertes critiques"
              icon="exclamationmark.triangle.fill"
              iconColor="#EF4444"
              badge={alerts.length}
              action={{
                label: 'Tout voir',
                onPress: () => handleNavigation('/notifications'),
              }}
            />
            <View className="bg-error/10 rounded-2xl border border-error/20 p-4">
              {alerts.map((alert, index) => (
                <Pressable
                  key={alert.id}
                  onPress={() => alert.vehicleId && handleNavigation(`/vehicle/${alert.vehicleId}`)}
                  className={`flex-row items-center ${index < alerts.length - 1 ? 'pb-3 mb-3 border-b border-error/10' : ''}`}
                  style={({ pressed }) => [pressed && { opacity: 0.7 }]}
                >
                  <View className="w-8 h-8 rounded-full bg-error/20 items-center justify-center mr-3">
                    <IconSymbol name="exclamationmark.triangle.fill" size={16} color="#EF4444" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-sm font-semibold text-foreground" numberOfLines={1}>
                      {alert.title}
                    </Text>
                    <Text className="text-xs text-muted" numberOfLines={1}>
                      {alert.message}
                    </Text>
                  </View>
                  <IconSymbol name="chevron.right" size={14} color="#94A3B8" />
                </Pressable>
              ))}
            </View>
          </View>
        )}

        {/* Activité récente */}
        <View className="px-4 mb-4">
          <SectionHeader
            title="Activité récente"
            icon="clock.fill"
            iconColor="#64748B"
            action={{
              label: 'Historique',
              onPress: () => handleNavigation('/audit-log'),
            }}
          />
          <View className="bg-surface rounded-2xl border border-border p-4">
            <ActivityTimeline items={timelineItems} maxItems={5} />
          </View>
        </View>

        {/* Accès rapide aux rôles */}
        <View className="px-4 mb-4">
          <SectionHeader
            title="Espaces de travail"
            icon="person.2.fill"
            iconColor="#3B82F6"
          />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="-mx-4 px-4">
            <View className="flex-row gap-3">
              {[
                { id: 'driver', title: 'Chauffeur', icon: 'car.fill', color: '#0891B2', route: '/dashboard/driver' },
                { id: 'technician', title: 'Technicien', icon: 'wrench.fill', color: '#F59E0B', route: '/dashboard/technician' },
                { id: 'dispatcher', title: 'Dispatcher', icon: 'calendar', color: '#8B5CF6', route: '/dashboard/dispatcher' },
                { id: 'manager', title: 'Gestionnaire', icon: 'chart.bar.fill', color: '#22C55E', route: '/dashboard/manager' },
                { id: 'admin', title: 'Admin', icon: 'gear', color: '#64748B', route: '/dashboard/admin' },
              ].map((role) => (
                <Pressable
                  key={role.id}
                  onPress={() => handleNavigation(role.route)}
                  className="bg-surface rounded-xl border border-border p-4 items-center"
                  style={{ width: 100 }}
                >
                  <View
                    className="w-12 h-12 rounded-full items-center justify-center mb-2"
                    style={{ backgroundColor: `${role.color}15` }}
                  >
                    <IconSymbol name={role.icon as any} size={24} color={role.color} />
                  </View>
                  <Text className="text-sm font-medium text-foreground text-center">
                    {role.title}
                  </Text>
                </Pressable>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Footer spacing */}
        <View className="h-8" />
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 100,
  },
});
