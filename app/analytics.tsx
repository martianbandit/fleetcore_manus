import { useState, useEffect, useCallback } from 'react';
import { ScrollView, Text, View, Pressable, RefreshControl, Dimensions } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

import { ScreenContainer } from '@/components/screen-container';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors } from '@/hooks/use-colors';
import {
  getFleetMetrics,
  exportMetricsCSV,
  getTechnicianMetrics,
  type FleetMetrics,
  type TechnicianMetrics,
} from '@/lib/metrics-service';
import { getWorkOrderStats } from '@/lib/work-order-service';
import { getInventoryStats } from '@/lib/inventory-service';
import { getTechnicians } from '@/lib/data-service';

const screenWidth = Dimensions.get('window').width;

// Simple bar chart component
function BarChart({ 
  data, 
  maxValue, 
  barColor, 
  labelColor 
}: { 
  data: { label: string; value: number }[];
  maxValue: number;
  barColor: string;
  labelColor: string;
}) {
  const colors = useColors();
  
  return (
    <View className="gap-2">
      {data.map((item, index) => (
        <View key={index} className="flex-row items-center gap-2">
          <Text className="w-16 text-xs" style={{ color: labelColor }} numberOfLines={1}>
            {item.label}
          </Text>
          <View className="flex-1 h-6 rounded-full overflow-hidden" style={{ backgroundColor: colors.border }}>
            <View 
              className="h-full rounded-full"
              style={{ 
                width: `${maxValue > 0 ? (item.value / maxValue) * 100 : 0}%`,
                backgroundColor: barColor,
                minWidth: item.value > 0 ? 20 : 0,
              }}
            />
          </View>
          <Text className="w-8 text-xs font-semibold text-right" style={{ color: colors.foreground }}>
            {item.value}
          </Text>
        </View>
      ))}
    </View>
  );
}

// KPI Card component
function KPICard({ 
  title, 
  value, 
  subtitle, 
  icon, 
  iconColor,
  trend,
}: { 
  title: string;
  value: string | number;
  subtitle?: string;
  icon: string;
  iconColor: string;
  trend?: { value: number; isPositive: boolean };
}) {
  const colors = useColors();
  
  return (
    <View 
      className="flex-1 min-w-[45%] rounded-xl p-4 border"
      style={{ backgroundColor: colors.surface, borderColor: colors.border }}
    >
      <View className="flex-row items-center justify-between mb-2">
        <IconSymbol name={icon as any} size={24} color={iconColor} />
        {trend && (
          <View className="flex-row items-center">
            <IconSymbol 
              name={trend.isPositive ? "arrow.up" : "arrow.down"} 
              size={12} 
              color={trend.isPositive ? colors.success : colors.error} 
            />
            <Text 
              className="text-xs ml-1"
              style={{ color: trend.isPositive ? colors.success : colors.error }}
            >
              {Math.abs(trend.value)}%
            </Text>
          </View>
        )}
      </View>
      <Text className="text-2xl font-bold" style={{ color: colors.foreground }}>
        {value}
      </Text>
      <Text className="text-sm" style={{ color: colors.muted }}>{title}</Text>
      {subtitle && (
        <Text className="text-xs mt-1" style={{ color: colors.muted }}>{subtitle}</Text>
      )}
    </View>
  );
}

// Section header component
function SectionHeader({ title, onPress }: { title: string; onPress?: () => void }) {
  const colors = useColors();
  
  return (
    <View className="flex-row items-center justify-between mb-3">
      <Text className="text-lg font-bold" style={{ color: colors.foreground }}>
        {title}
      </Text>
      {onPress && (
        <Pressable onPress={onPress}>
          <Text className="text-sm" style={{ color: colors.primary }}>Voir tout</Text>
        </Pressable>
      )}
    </View>
  );
}

export default function AnalyticsScreen() {
  const colors = useColors();
  const router = useRouter();
  const [metrics, setMetrics] = useState<FleetMetrics | null>(null);
  const [workOrderStats, setWorkOrderStats] = useState<any>(null);
  const [inventoryStats, setInventoryStats] = useState<any>(null);
  const [technicianStats, setTechnicianStats] = useState<TechnicianMetrics[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'fleet' | 'fleetcommand' | 'fleetcrew'>('fleet');

  const loadData = useCallback(async () => {
    try {
      const [metricsData, woStats, invStats, technicians] = await Promise.all([
        getFleetMetrics(),
        getWorkOrderStats(),
        getInventoryStats(),
        getTechnicians(),
      ]);
      
      setMetrics(metricsData);
      setWorkOrderStats(woStats);
      setInventoryStats(invStats);
      
      // Load technician metrics
      const techMetrics = await Promise.all(
        technicians.map(t => getTechnicianMetrics(t.id))
      );
      setTechnicianStats(techMetrics);
    } catch (error) {
      console.error('Error loading analytics:', error);
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

  const handleExportCSV = async () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    try {
      const csv = await exportMetricsCSV();
      alert('Métriques exportées avec succès!\n\nLes données ont été préparées pour l\'export.');
    } catch (error) {
      console.error('Error exporting CSV:', error);
      alert('Erreur lors de l\'export CSV');
    }
  };

  if (loading || !metrics) {
    return (
      <ScreenContainer className="items-center justify-center">
        <Text style={{ color: colors.muted }}>Chargement des métriques...</Text>
      </ScreenContainer>
    );
  }

  // Prepare chart data
  const inspectionChartData = metrics.inspectionsByMonth.slice(-6).map(m => ({
    label: m.month.split(' ')[0],
    value: m.count,
  }));
  const maxInspections = Math.max(...inspectionChartData.map(d => d.value), 1);

  const defectChartData = metrics.mostCommonDefects.slice(0, 5).map(d => ({
    label: d.component.substring(0, 10),
    value: d.count,
  }));
  const maxDefects = Math.max(...defectChartData.map(d => d.value), 1);

  return (
    <ScreenContainer>
      <ScrollView 
        className="flex-1" 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View className="px-4 py-4">
          <Text className="text-3xl font-bold" style={{ color: colors.foreground }}>
            Analytics
          </Text>
          <Text className="text-base mt-1" style={{ color: colors.muted }}>
            Métriques et statistiques de la flotte
          </Text>
        </View>

        {/* Tab Selector */}
        <View className="px-4 mb-4">
          <View 
            className="flex-row rounded-xl p-1"
            style={{ backgroundColor: colors.surface }}
          >
            {[
              { id: 'fleet', label: 'Flotte' },
              { id: 'fleetcommand', label: 'FleetCommand' },
              { id: 'fleetcrew', label: 'FleetCrew' },
            ].map((tab) => (
              <Pressable
                key={tab.id}
                onPress={() => {
                  if (Platform.OS !== 'web') {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }
                  setActiveTab(tab.id as any);
                }}
                className="flex-1 py-2 px-3 rounded-lg"
                style={[
                  activeTab === tab.id && { backgroundColor: colors.primary },
                ]}
              >
                <Text 
                  className="text-center text-sm font-medium"
                  style={{ color: activeTab === tab.id ? '#FFFFFF' : colors.muted }}
                >
                  {tab.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Fleet Tab */}
        {activeTab === 'fleet' && (
          <>
            {/* Fleet Overview KPIs */}
            <View className="px-4 mb-6">
              <SectionHeader title="Vue d'ensemble" />
              <View className="flex-row flex-wrap gap-3">
                <KPICard
                  title="Véhicules"
                  value={metrics.totalVehicles}
                  subtitle={`${metrics.activeVehicles} actifs`}
                  icon="car.fill"
                  iconColor={colors.primary}
                />
                <KPICard
                  title="Inspections"
                  value={metrics.totalInspections}
                  subtitle="Total effectuées"
                  icon="clipboard.fill"
                  iconColor={colors.success}
                />
                <KPICard
                  title="Défauts"
                  value={metrics.totalDefects}
                  subtitle="Détectés au total"
                  icon="exclamationmark.triangle.fill"
                  iconColor={colors.warning}
                />
                <KPICard
                  title="Conformité"
                  value={`${metrics.complianceRate.toFixed(0)}%`}
                  subtitle="Score global"
                  icon="checkmark.circle.fill"
                  iconColor={colors.success}
                />
              </View>
            </View>

            {/* Inspections Chart */}
            <View className="px-4 mb-6">
              <SectionHeader title="Inspections par mois" />
              <View 
                className="rounded-xl p-4 border"
                style={{ backgroundColor: colors.surface, borderColor: colors.border }}
              >
                {inspectionChartData.length > 0 && inspectionChartData.some(d => d.value > 0) ? (
                  <BarChart 
                    data={inspectionChartData}
                    maxValue={maxInspections}
                    barColor={colors.primary}
                    labelColor={colors.muted}
                  />
                ) : (
                  <Text className="text-center py-4" style={{ color: colors.muted }}>
                    Aucune inspection enregistrée
                  </Text>
                )}
              </View>
            </View>

            {/* Defects Chart */}
            <View className="px-4 mb-6">
              <SectionHeader title="Défauts les plus fréquents" />
              <View 
                className="rounded-xl p-4 border"
                style={{ backgroundColor: colors.surface, borderColor: colors.border }}
              >
                {defectChartData.length > 0 ? (
                  <BarChart 
                    data={defectChartData}
                    maxValue={maxDefects}
                    barColor={colors.warning}
                    labelColor={colors.muted}
                  />
                ) : (
                  <Text className="text-center py-4" style={{ color: colors.muted }}>
                    Aucun défaut enregistré
                  </Text>
                )}
              </View>
            </View>

            {/* Technician Stats */}
            <View className="px-4 mb-6">
              <SectionHeader 
                title="Performance techniciens" 
                onPress={() => router.push('/teams' as any)}
              />
              <View 
                className="rounded-xl p-4 border"
                style={{ backgroundColor: colors.surface, borderColor: colors.border }}
              >
                {technicianStats.length > 0 ? (
                  technicianStats.slice(0, 3).map((tech, index) => (
                    <View
                      key={tech.technicianId}
                      className="py-3"
                      style={{ 
                        borderBottomWidth: index < Math.min(technicianStats.length, 3) - 1 ? 1 : 0, 
                        borderColor: colors.border 
                      }}
                    >
                      <View className="flex-row items-center justify-between mb-2">
                        <Text className="font-semibold" style={{ color: colors.foreground }}>
                          {tech.technicianName}
                        </Text>
                        <View 
                          className="px-2 py-0.5 rounded-full"
                          style={{ backgroundColor: `${colors.success}20` }}
                        >
                          <Text className="text-xs font-medium" style={{ color: colors.success }}>
                            {tech.completedInspections}/{tech.totalInspections} complétées
                          </Text>
                        </View>
                      </View>
                      <View className="flex-row gap-4">
                        <View className="flex-1">
                          <Text className="text-xs" style={{ color: colors.muted }}>Temps moyen</Text>
                          <Text className="font-semibold" style={{ color: colors.foreground }}>
                            {tech.averageInspectionTime} min
                          </Text>
                        </View>
                        <View className="flex-1">
                          <Text className="text-xs" style={{ color: colors.muted }}>Défauts trouvés</Text>
                          <Text className="font-semibold" style={{ color: colors.foreground }}>
                            {tech.defectsFound}
                          </Text>
                        </View>
                        <View className="flex-1">
                          <Text className="text-xs" style={{ color: colors.muted }}>Véhicules</Text>
                          <Text className="font-semibold" style={{ color: colors.foreground }}>
                            {tech.vehiclesInspected}
                          </Text>
                        </View>
                      </View>
                    </View>
                  ))
                ) : (
                  <Text className="text-center py-4" style={{ color: colors.muted }}>
                    Aucun technicien enregistré
                  </Text>
                )}
              </View>
            </View>
          </>
        )}

        {/* FleetCommand Tab */}
        {activeTab === 'fleetcommand' && workOrderStats && (
          <>
            {/* Work Order KPIs */}
            <View className="px-4 mb-6">
              <SectionHeader title="Bons de travail" />
              <View className="flex-row flex-wrap gap-3">
                <KPICard
                  title="Total"
                  value={workOrderStats.total}
                  subtitle="Bons créés"
                  icon="doc.text.fill"
                  iconColor={colors.primary}
                />
                <KPICard
                  title="En attente"
                  value={workOrderStats.pending}
                  subtitle="À traiter"
                  icon="clock.fill"
                  iconColor={colors.warning}
                />
                <KPICard
                  title="En cours"
                  value={workOrderStats.inProgress}
                  subtitle="Actuellement"
                  icon="wrench.fill"
                  iconColor={colors.primary}
                />
                <KPICard
                  title="Complétés"
                  value={workOrderStats.completed}
                  subtitle="Terminés"
                  icon="checkmark.circle.fill"
                  iconColor={colors.success}
                />
              </View>
            </View>

            {/* Cost Analysis */}
            <View className="px-4 mb-6">
              <SectionHeader title="Analyse des coûts" />
              <View 
                className="rounded-xl p-4 border"
                style={{ backgroundColor: colors.surface, borderColor: colors.border }}
              >
                <View className="flex-row items-center justify-between py-3 border-b" style={{ borderColor: colors.border }}>
                  <Text style={{ color: colors.muted }}>Coût estimé total</Text>
                  <Text className="font-bold text-lg" style={{ color: colors.foreground }}>
                    {workOrderStats.totalEstimatedCost.toLocaleString()} $
                  </Text>
                </View>
                <View className="flex-row items-center justify-between py-3 border-b" style={{ borderColor: colors.border }}>
                  <Text style={{ color: colors.muted }}>Coût réel total</Text>
                  <Text className="font-bold text-lg" style={{ color: colors.success }}>
                    {workOrderStats.totalActualCost.toLocaleString()} $
                  </Text>
                </View>
                <View className="flex-row items-center justify-between py-3">
                  <Text style={{ color: colors.muted }}>Temps moyen de complétion</Text>
                  <Text className="font-bold text-lg" style={{ color: colors.primary }}>
                    {workOrderStats.averageCompletionTime} min
                  </Text>
                </View>
              </View>
            </View>

            {/* Work Order Status Distribution */}
            <View className="px-4 mb-6">
              <SectionHeader title="Distribution des statuts" />
              <View 
                className="rounded-xl p-4 border"
                style={{ backgroundColor: colors.surface, borderColor: colors.border }}
              >
                <BarChart 
                  data={[
                    { label: 'En attente', value: workOrderStats.pending },
                    { label: 'En cours', value: workOrderStats.inProgress },
                    { label: 'Complétés', value: workOrderStats.completed },
                    { label: 'Annulés', value: workOrderStats.cancelled },
                  ]}
                  maxValue={Math.max(workOrderStats.pending, workOrderStats.inProgress, workOrderStats.completed, workOrderStats.cancelled, 1)}
                  barColor="#F59E0B"
                  labelColor={colors.muted}
                />
              </View>
            </View>

            {/* Quick Actions */}
            <View className="px-4 mb-6">
              <Pressable
                onPress={() => router.push('/work-orders' as any)}
                style={({ pressed }) => [
                  {
                    backgroundColor: '#F59E0B',
                    padding: 16,
                    borderRadius: 12,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                  },
                  pressed && { opacity: 0.8 },
                ]}
              >
                <IconSymbol name="wrench.fill" size={20} color="#FFFFFF" />
                <Text className="text-base font-semibold" style={{ color: '#FFFFFF' }}>
                  Voir tous les bons de travail
                </Text>
              </Pressable>
            </View>
          </>
        )}

        {/* FleetCrew Tab */}
        {activeTab === 'fleetcrew' && inventoryStats && (
          <>
            {/* Inventory KPIs */}
            <View className="px-4 mb-6">
              <SectionHeader title="Inventaire" />
              <View className="flex-row flex-wrap gap-3">
                <KPICard
                  title="Articles"
                  value={inventoryStats.totalItems}
                  subtitle="En stock"
                  icon="cube.box.fill"
                  iconColor="#8B5CF6"
                />
                <KPICard
                  title="Valeur totale"
                  value={`${inventoryStats.totalValue.toLocaleString()} $`}
                  subtitle="Inventaire"
                  icon="dollarsign.circle.fill"
                  iconColor={colors.success}
                />
                <KPICard
                  title="Stock bas"
                  value={inventoryStats.lowStockCount}
                  subtitle="À commander"
                  icon="exclamationmark.triangle.fill"
                  iconColor={colors.warning}
                />
                <KPICard
                  title="Rupture"
                  value={inventoryStats.outOfStockCount}
                  subtitle="Urgent"
                  icon="xmark.circle.fill"
                  iconColor={colors.error}
                />
              </View>
            </View>

            {/* Category Distribution */}
            <View className="px-4 mb-6">
              <SectionHeader title="Répartition par catégorie" />
              <View 
                className="rounded-xl p-4 border"
                style={{ backgroundColor: colors.surface, borderColor: colors.border }}
              >
                {inventoryStats.byCategory && Object.keys(inventoryStats.byCategory).length > 0 ? (
                  <BarChart 
                    data={Object.entries(inventoryStats.byCategory).map(([cat, count]) => ({
                      label: cat.substring(0, 10),
                      value: count as number,
                    }))}
                    maxValue={Math.max(...Object.values(inventoryStats.byCategory as Record<string, number>), 1)}
                    barColor="#8B5CF6"
                    labelColor={colors.muted}
                  />
                ) : (
                  <Text className="text-center py-4" style={{ color: colors.muted }}>
                    Aucun article en inventaire
                  </Text>
                )}
              </View>
            </View>

            {/* Inventory Value Summary */}
            <View className="px-4 mb-6">
              <SectionHeader title="Résumé financier" />
              <View 
                className="rounded-xl p-4 border"
                style={{ backgroundColor: colors.surface, borderColor: colors.border }}
              >
                <View className="flex-row items-center justify-between py-3 border-b" style={{ borderColor: colors.border }}>
                  <Text style={{ color: colors.muted }}>Valeur totale du stock</Text>
                  <Text className="font-bold text-lg" style={{ color: colors.foreground }}>
                    {inventoryStats.totalValue.toLocaleString()} $
                  </Text>
                </View>
                <View className="flex-row items-center justify-between py-3 border-b" style={{ borderColor: colors.border }}>
                  <Text style={{ color: colors.muted }}>Articles à commander</Text>
                  <Text className="font-bold text-lg" style={{ color: colors.warning }}>
                    {inventoryStats.lowStockCount}
                  </Text>
                </View>
                <View className="flex-row items-center justify-between py-3">
                  <Text style={{ color: colors.muted }}>Articles en rupture</Text>
                  <Text className="font-bold text-lg" style={{ color: colors.error }}>
                    {inventoryStats.outOfStockCount}
                  </Text>
                </View>
              </View>
            </View>

            {/* Quick Actions */}
            <View className="px-4 mb-6">
              <Pressable
                onPress={() => router.push('/inventory' as any)}
                style={({ pressed }) => [
                  {
                    backgroundColor: '#8B5CF6',
                    padding: 16,
                    borderRadius: 12,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                  },
                  pressed && { opacity: 0.8 },
                ]}
              >
                <IconSymbol name="cube.box.fill" size={20} color="#FFFFFF" />
                <Text className="text-base font-semibold" style={{ color: '#FFFFFF' }}>
                  Gérer l'inventaire
                </Text>
              </Pressable>
            </View>
          </>
        )}

        {/* Export Button */}
        <View className="px-4 pb-8">
          <Pressable
            onPress={handleExportCSV}
            style={({ pressed }) => [
              {
                backgroundColor: colors.surface,
                borderWidth: 1,
                borderColor: colors.border,
                padding: 16,
                borderRadius: 12,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
              },
              pressed && { opacity: 0.8 },
            ]}
          >
            <IconSymbol name="arrow.down.doc.fill" size={20} color={colors.primary} />
            <Text className="text-base font-semibold" style={{ color: colors.primary }}>
              Exporter les métriques en CSV
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
