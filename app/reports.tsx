import { useEffect, useState, useCallback } from 'react';
import { ScrollView, Text, View, Pressable, RefreshControl, StyleSheet, Share, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';

import { ScreenContainer } from '@/components/screen-container';
import { SectionHeader } from '@/components/ui/section-header';
import { StatCard } from '@/components/ui/stat-card';
import { ProgressRing, ProgressRingGroup } from '@/components/ui/progress-ring';
import { QuickStats } from '@/components/ui/quick-stats';
import { IconSymbol } from '@/components/ui/icon-symbol';
import {
  generateComplianceReport,
  calculateFleetMetrics,
  exportReportToCSV,
} from '@/lib/reports-service';
import { getDashboardStats } from '@/lib/data-service';
import { getVehicles } from '@/lib/data-service';

type ReportType = 'compliance' | 'costs' | 'history';
type TimePeriod = '30d' | '90d' | '6m' | '12m';

export default function ReportsScreen() {
  const router = useRouter();
  const [activeReport, setActiveReport] = useState<ReportType>('compliance');
  const [period, setPeriod] = useState<TimePeriod>('30d');
  const [complianceData, setComplianceData] = useState<any>(null);
  const [costData, setCostData] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  const getPeriodDays = (p: TimePeriod) => {
    switch (p) {
      case '30d': return 30;
      case '90d': return 90;
      case '6m': return 180;
      case '12m': return 365;
    }
  };

  const loadData = useCallback(async () => {
    try {
      const periodDays = getPeriodDays(period);
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - periodDays);
      
      const [statsData, vehiclesData, compliance, costs] = await Promise.all([
        getDashboardStats(),
        getVehicles(),
        generateComplianceReport('fleet', startDate.toISOString(), endDate.toISOString()),
        calculateFleetMetrics(period),
      ]);
      setStats(statsData);
      setVehicles(vehiclesData);
      setComplianceData(compliance);
      setCostData(costs);
    } catch (error) {
      console.error('Error loading reports:', error);
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  const handleExport = async (format: 'csv' | 'pdf') => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    setExporting(true);
    
    try {
      let data: any;
      let filename: string;
      
      if (activeReport === 'compliance') {
        data = complianceData;
        filename = `rapport-conformite-${period}`;
      } else if (activeReport === 'costs') {
        data = costData;
        filename = `rapport-couts-${period}`;
      } else {
        data = { vehicles };
        filename = `historique-vehicules`;
      }
      
      if (format === 'csv') {
        const csv = exportReportToCSV(data);
        // In a real app, this would save or share the file
        if (Platform.OS !== 'web') {
          await Share.share({
            message: csv,
            title: `${filename}.csv`,
          });
        }
      }
    } catch (error) {
      console.error('Export error:', error);
    } finally {
      setExporting(false);
    }
  };

  const reportTabs = [
    { key: 'compliance' as ReportType, label: 'Conformité', icon: 'checkmark.shield.fill' },
    { key: 'costs' as ReportType, label: 'Coûts', icon: 'dollarsign.circle.fill' },
    { key: 'history' as ReportType, label: 'Historique', icon: 'clock.fill' },
  ];

  const periodOptions = [
    { key: '30d' as TimePeriod, label: '30 jours' },
    { key: '90d' as TimePeriod, label: '90 jours' },
    { key: '6m' as TimePeriod, label: '6 mois' },
    { key: '12m' as TimePeriod, label: '12 mois' },
  ];

  if (loading) {
    return (
      <ScreenContainer className="items-center justify-center">
        <Text className="text-muted">Chargement des rapports...</Text>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      {/* Header */}
      <View className="px-4 pt-2 pb-4 flex-row items-center">
        <Pressable
          onPress={() => router.back()}
          className="mr-3"
          style={({ pressed }) => [pressed && { opacity: 0.7 }]}
        >
          <IconSymbol name="chevron.left" size={24} color="#64748B" />
        </Pressable>
        <View className="flex-1">
          <Text className="text-2xl font-bold text-foreground">Rapports</Text>
          <Text className="text-sm text-muted">Analyses et métriques de votre flotte</Text>
        </View>
        <Pressable
          onPress={() => handleExport('csv')}
          disabled={exporting}
          className="px-3 py-2 bg-primary/10 rounded-lg flex-row items-center"
          style={({ pressed }) => [pressed && { opacity: 0.7 }]}
        >
          <IconSymbol name="square.and.arrow.up" size={16} color="#0891B2" />
          <Text className="text-sm font-medium text-primary ml-1">
            {exporting ? 'Export...' : 'Exporter'}
          </Text>
        </Pressable>
      </View>

      {/* Report Type Tabs */}
      <View className="px-4 mb-4">
        <View className="flex-row bg-surface rounded-xl border border-border p-1">
          {reportTabs.map((tab) => (
            <Pressable
              key={tab.key}
              onPress={() => setActiveReport(tab.key)}
              className={`flex-1 flex-row items-center justify-center py-2.5 rounded-lg ${
                activeReport === tab.key ? 'bg-primary' : ''
              }`}
              style={({ pressed }) => [pressed && { opacity: 0.7 }]}
            >
              <IconSymbol
                name={tab.icon as any}
                size={16}
                color={activeReport === tab.key ? '#FFFFFF' : '#64748B'}
              />
              <Text
                className={`text-sm font-medium ml-1.5 ${
                  activeReport === tab.key ? 'text-white' : 'text-muted'
                }`}
              >
                {tab.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* Period Selector */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="px-4 mb-4"
        contentContainerStyle={{ gap: 8 }}
      >
        {periodOptions.map((opt) => (
          <Pressable
            key={opt.key}
            onPress={() => setPeriod(opt.key)}
            className={`px-4 py-2 rounded-full ${
              period === opt.key
                ? 'bg-primary'
                : 'bg-surface border border-border'
            }`}
            style={({ pressed }) => [pressed && { opacity: 0.7 }]}
          >
            <Text
              className={`text-sm font-medium ${
                period === opt.key ? 'text-white' : 'text-foreground'
              }`}
            >
              {opt.label}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Compliance Report */}
        {activeReport === 'compliance' && complianceData && (
          <>
            {/* Main Compliance Score */}
            <View className="px-4 mb-4">
              <View className="bg-surface rounded-2xl border border-border p-6">
                <View className="flex-row items-center">
                  <ProgressRing
                    progress={complianceData.overallComplianceRate || 0}
                    size={100}
                    color="auto"
                  />
                  <View className="flex-1 ml-6">
                    <Text className="text-2xl font-bold text-foreground">
                      {complianceData.overallComplianceRate?.toFixed(1)}%
                    </Text>
                    <Text className="text-base text-muted">Taux de conformité global</Text>
                    <View className="flex-row items-center mt-2">
                      <View
                        className="w-2 h-2 rounded-full mr-2"
                        style={{
                          backgroundColor:
                            complianceData.overallComplianceRate >= 80
                              ? '#22C55E'
                              : complianceData.overallComplianceRate >= 50
                              ? '#F59E0B'
                              : '#EF4444',
                        }}
                      />
                      <Text className="text-sm text-muted">
                        {complianceData.overallComplianceRate >= 80
                          ? 'Excellent'
                          : complianceData.overallComplianceRate >= 50
                          ? 'À améliorer'
                          : 'Critique'}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            </View>

            {/* Compliance Breakdown */}
            <View className="px-4 mb-4">
              <SectionHeader title="Détails de conformité" icon="list.bullet" iconColor="#0891B2" />
              <QuickStats
                items={[
                  {
                    label: 'Véhicules conformes',
                    value: complianceData.compliantVehicles || 0,
                    icon: 'checkmark.circle.fill',
                    color: '#22C55E',
                  },
                  {
                    label: 'Non conformes',
                    value: complianceData.nonCompliantVehicles || 0,
                    icon: 'xmark.circle.fill',
                    color: '#EF4444',
                  },
                  {
                    label: 'Inspections',
                    value: complianceData.totalInspections || 0,
                    icon: 'clipboard.fill',
                    color: '#0891B2',
                  },
                  {
                    label: 'En retard',
                    value: complianceData.overdueInspections || 0,
                    icon: 'clock.fill',
                    color: '#F59E0B',
                  },
                ]}
                variant="card"
                columns={2}
              />
            </View>

            {/* Defects Summary */}
            <View className="px-4 mb-4">
              <SectionHeader title="Résumé des défauts" icon="exclamationmark.triangle.fill" iconColor="#F59E0B" />
              <View className="bg-surface rounded-2xl border border-border p-4">
                <View className="flex-row justify-between mb-4">
                  <View className="items-center flex-1">
                    <Text className="text-3xl font-bold text-foreground">
                      {complianceData.totalDefects || 0}
                    </Text>
                    <Text className="text-sm text-muted">Total défauts</Text>
                  </View>
                  <View className="w-px bg-border" />
                  <View className="items-center flex-1">
                    <Text className="text-3xl font-bold text-error">
                      {complianceData.majorDefects || 0}
                    </Text>
                    <Text className="text-sm text-muted">Majeurs</Text>
                  </View>
                  <View className="w-px bg-border" />
                  <View className="items-center flex-1">
                    <Text className="text-3xl font-bold text-warning">
                      {complianceData.minorDefects || 0}
                    </Text>
                    <Text className="text-sm text-muted">Mineurs</Text>
                  </View>
                </View>
                <View className="h-2 bg-border rounded-full overflow-hidden flex-row">
                  <View
                    className="h-full bg-error"
                    style={{
                      width: `${
                        ((complianceData.majorDefects || 0) /
                          Math.max(complianceData.totalDefects || 1, 1)) *
                        100
                      }%`,
                    }}
                  />
                  <View
                    className="h-full bg-warning"
                    style={{
                      width: `${
                        ((complianceData.minorDefects || 0) /
                          Math.max(complianceData.totalDefects || 1, 1)) *
                        100
                      }%`,
                    }}
                  />
                </View>
              </View>
            </View>
          </>
        )}

        {/* Costs Report */}
        {activeReport === 'costs' && costData && (
          <>
            {/* Total Costs */}
            <View className="px-4 mb-4">
              <View className="bg-surface rounded-2xl border border-border p-6">
                <Text className="text-sm text-muted mb-1">Coûts totaux de maintenance</Text>
                <Text className="text-3xl font-bold text-foreground">
                  {(costData.totalCost || 0).toLocaleString()} $
                </Text>
                <View className="flex-row items-center mt-2">
                  <IconSymbol name="calendar" size={14} color="#64748B" />
                  <Text className="text-sm text-muted ml-1">
                    Période: {periodOptions.find((p) => p.key === period)?.label}
                  </Text>
                </View>
              </View>
            </View>

            {/* Cost Breakdown */}
            <View className="px-4 mb-4">
              <SectionHeader title="Répartition des coûts" icon="chart.pie.fill" iconColor="#8B5CF6" />
              <QuickStats
                items={[
                  {
                    label: 'Pièces',
                    value: `${(costData.partsCost || 0).toLocaleString()} $`,
                    icon: 'cube.box.fill',
                    color: '#8B5CF6',
                  },
                  {
                    label: 'Main d\'œuvre',
                    value: `${(costData.laborCost || 0).toLocaleString()} $`,
                    icon: 'person.fill',
                    color: '#3B82F6',
                  },
                  {
                    label: 'Moyenne/véhicule',
                    value: `${(costData.averageCostPerVehicle || 0).toLocaleString()} $`,
                    icon: 'car.fill',
                    color: '#0891B2',
                  },
                  {
                    label: 'Bons complétés',
                    value: costData.completedWorkOrders || 0,
                    icon: 'checkmark.circle.fill',
                    color: '#22C55E',
                  },
                ]}
                variant="card"
                columns={2}
              />
            </View>

            {/* Top Costly Vehicles */}
            {costData.vehicleCosts && costData.vehicleCosts.length > 0 && (
              <View className="px-4 mb-4">
                <SectionHeader
                  title="Véhicules les plus coûteux"
                  icon="arrow.up.circle.fill"
                  iconColor="#EF4444"
                />
                <View className="bg-surface rounded-2xl border border-border overflow-hidden">
                  {costData.vehicleCosts.slice(0, 5).map((vehicle: any, index: number) => (
                    <Pressable
                      key={vehicle.vehicleId}
                      onPress={() => router.push(`/vehicle/${vehicle.vehicleId}` as any)}
                      className={`flex-row items-center p-4 ${
                        index < Math.min(costData.vehicleCosts.length, 5) - 1
                          ? 'border-b border-border'
                          : ''
                      }`}
                      style={({ pressed }) => [pressed && { opacity: 0.7 }]}
                    >
                      <View className="w-8 h-8 rounded-full bg-error/10 items-center justify-center mr-3">
                        <Text className="text-sm font-bold text-error">{index + 1}</Text>
                      </View>
                      <View className="flex-1">
                        <Text className="text-sm font-semibold text-foreground">
                          {vehicle.plate || 'Véhicule'}
                        </Text>
                        <Text className="text-xs text-muted">
                          {vehicle.workOrderCount || 0} bons de travail
                        </Text>
                      </View>
                      <Text className="text-base font-bold text-foreground">
                        {(vehicle.totalCost || 0).toLocaleString()} $
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            )}
          </>
        )}

        {/* History Report */}
        {activeReport === 'history' && (
          <>
            <View className="px-4 mb-4">
              <SectionHeader
                title="Historique des véhicules"
                icon="clock.arrow.circlepath"
                iconColor="#64748B"
              />
              <View className="bg-surface rounded-2xl border border-border overflow-hidden">
                {vehicles.slice(0, 10).map((vehicle, index) => (
                  <Pressable
                    key={vehicle.id}
                    onPress={() => router.push(`/vehicle/${vehicle.id}` as any)}
                    className={`flex-row items-center p-4 ${
                      index < Math.min(vehicles.length, 10) - 1 ? 'border-b border-border' : ''
                    }`}
                    style={({ pressed }) => [pressed && { opacity: 0.7 }]}
                  >
                    <View
                      className="w-10 h-10 rounded-full items-center justify-center mr-3"
                      style={{
                        backgroundColor:
                          vehicle.status === 'active'
                            ? '#22C55E15'
                            : vehicle.status === 'maintenance'
                            ? '#F59E0B15'
                            : '#64748B15',
                      }}
                    >
                      <IconSymbol
                        name="car.fill"
                        size={20}
                        color={
                          vehicle.status === 'active'
                            ? '#22C55E'
                            : vehicle.status === 'maintenance'
                            ? '#F59E0B'
                            : '#64748B'
                        }
                      />
                    </View>
                    <View className="flex-1">
                      <Text className="text-sm font-semibold text-foreground">
                        {vehicle.plate}
                      </Text>
                      <Text className="text-xs text-muted">
                        {vehicle.make} {vehicle.model} • {vehicle.year}
                      </Text>
                    </View>
                    <View className="items-end">
                      <Text className="text-xs text-muted">
                        {vehicle.mileage?.toLocaleString() || 0} km
                      </Text>
                      <View
                        className="px-2 py-0.5 rounded-full mt-1"
                        style={{
                          backgroundColor:
                            vehicle.status === 'active'
                              ? '#DCFCE7'
                              : vehicle.status === 'maintenance'
                              ? '#FEF3C7'
                              : '#F3F4F6',
                        }}
                      >
                        <Text
                          className="text-xs font-medium"
                          style={{
                            color:
                              vehicle.status === 'active'
                                ? '#166534'
                                : vehicle.status === 'maintenance'
                                ? '#92400E'
                                : '#6B7280',
                          }}
                        >
                          {vehicle.status === 'active'
                            ? 'Actif'
                            : vehicle.status === 'maintenance'
                            ? 'Maintenance'
                            : 'Inactif'}
                        </Text>
                      </View>
                    </View>
                  </Pressable>
                ))}
              </View>
            </View>

            {vehicles.length > 10 && (
              <View className="px-4 mb-4">
                <Pressable
                  onPress={() => router.push('/(tabs)/vehicles' as any)}
                  className="bg-surface rounded-xl border border-border p-4 flex-row items-center justify-center"
                  style={({ pressed }) => [pressed && { opacity: 0.7 }]}
                >
                  <Text className="text-sm font-medium text-primary">
                    Voir tous les véhicules ({vehicles.length})
                  </Text>
                  <IconSymbol name="chevron.right" size={14} color="#0891B2" />
                </Pressable>
              </View>
            )}
          </>
        )}

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
