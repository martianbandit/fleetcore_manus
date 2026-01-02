import { useState, useEffect } from 'react';
import { ScrollView, Text, View, Pressable, StyleSheet } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors } from '@/hooks/use-colors';
import {
  getFleetMetrics,
  exportMetricsCSV,
  type FleetMetrics,
  type TechnicianMetrics,
  type MaintenanceCost,
} from '@/lib/metrics-service';

type InspectionTimeData = { month: string; count: number; avgTime: number };
type MaintenanceCostData = { vehiclePlate: string; vehicleMake: string; vehicleModel: string; totalCost: number };
type DefectFrequencyData = { defectType: string; severity: 'major' | 'minor'; count: number; percentage: number };
type TechnicianStat = TechnicianMetrics & { avgTime: number };

export default function AnalyticsScreen() {
  const colors = useColors();
  const router = useRouter();
  const [metrics, setMetrics] = useState<FleetMetrics | null>(null);
  const [inspectionTimes, setInspectionTimes] = useState<InspectionTimeData[]>([]);
  const [costs, setCosts] = useState<MaintenanceCostData[]>([]);
  const [defects, setDefects] = useState<DefectFrequencyData[]>([]);
  const [technicians, setTechnicians] = useState<TechnicianMetrics[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const metricsData = await getFleetMetrics();
      setMetrics(metricsData);
      
      // Transform metrics data for display
      setInspectionTimes(metricsData.inspectionsByMonth.map(m => ({
        month: m.month,
        count: m.count,
        avgTime: 45 // Mock average time
      })));
      
      setCosts(metricsData.costByVehicle.map(c => ({
        vehiclePlate: c.plate,
        vehicleMake: '',
        vehicleModel: '',
        totalCost: c.cost
      })));
      
      setDefects(metricsData.mostCommonDefects.map((d, i) => ({
        defectType: d.component,
        severity: i % 2 === 0 ? 'major' : 'minor',
        count: d.count,
        percentage: (d.count / metricsData.totalDefects) * 100
      })));
      
      setTechnicians([]);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = async () => {
    try {
      const csvPath = await exportMetricsCSV();
      alert(`Métriques exportées: ${csvPath}`);
    } catch (error) {
      console.error('Error exporting CSV:', error);
      alert('Erreur lors de l\'export CSV');
    }
  };

  if (loading || !metrics) {
    return (
      <ScreenContainer className="items-center justify-center">
        <Stack.Screen options={{ title: 'Analytics' }} />
        <Text style={{ color: colors.muted }}>Chargement...</Text>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <Stack.Screen
        options={{
          title: 'Analytics',
          headerBackTitle: 'Retour',
        }}
      />
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="px-4 py-6">
          <Text className="text-3xl font-bold" style={{ color: colors.foreground }}>
            Analytics
          </Text>
          <Text className="text-base mt-1" style={{ color: colors.muted }}>
            Métriques et statistiques de la flotte
          </Text>
        </View>

        {/* Fleet Overview */}
        <View className="px-4 mb-4">
          <Text className="text-lg font-bold mb-3" style={{ color: colors.foreground }}>
            Vue d'ensemble
          </Text>
          <View className="flex-row flex-wrap gap-3">
            <View className="flex-1 min-w-[45%] rounded-xl p-4" style={{ backgroundColor: colors.surface }}>
              <IconSymbol name="car.fill" size={24} color={colors.primary} />
              <Text className="text-2xl font-bold mt-2" style={{ color: colors.foreground }}>
                {metrics.totalVehicles}
              </Text>
              <Text className="text-sm" style={{ color: colors.muted }}>Véhicules</Text>
            </View>
            <View className="flex-1 min-w-[45%] rounded-xl p-4" style={{ backgroundColor: colors.surface }}>
              <IconSymbol name="clipboard.fill" size={24} color={colors.success} />
              <Text className="text-2xl font-bold mt-2" style={{ color: colors.foreground }}>
                {metrics.totalInspections}
              </Text>
              <Text className="text-sm" style={{ color: colors.muted }}>Inspections</Text>
            </View>
            <View className="flex-1 min-w-[45%] rounded-xl p-4" style={{ backgroundColor: colors.surface }}>
              <IconSymbol name="exclamationmark.triangle.fill" size={24} color={colors.warning} />
              <Text className="text-2xl font-bold mt-2" style={{ color: colors.foreground }}>
                {metrics.totalDefects}
              </Text>
              <Text className="text-sm" style={{ color: colors.muted }}>Défauts</Text>
            </View>
            <View className="flex-1 min-w-[45%] rounded-xl p-4" style={{ backgroundColor: colors.surface }}>
              <IconSymbol name="checkmark.circle.fill" size={24} color={colors.success} />
              <Text className="text-2xl font-bold mt-2" style={{ color: colors.foreground }}>
                {metrics.complianceRate.toFixed(1)}%
              </Text>
              <Text className="text-sm" style={{ color: colors.muted }}>Conformité</Text>
            </View>
          </View>
        </View>

        {/* Inspection Times */}
        <View className="px-4 mb-4">
          <Text className="text-lg font-bold mb-3" style={{ color: colors.foreground }}>
            Temps d'inspection (derniers mois)
          </Text>
          <View className="rounded-xl p-4" style={{ backgroundColor: colors.surface }}>
            {inspectionTimes.length > 0 ? (
              inspectionTimes.map((item, index) => (
                <View
                  key={index}
                  className="flex-row items-center justify-between py-3"
                  style={{ borderBottomWidth: index < inspectionTimes.length - 1 ? 1 : 0, borderColor: colors.border }}
                >
                  <Text style={{ color: colors.foreground }}>{item.month}</Text>
                  <View className="flex-row items-center gap-4">
                    <Text style={{ color: colors.muted }}>{item.count} inspections</Text>
                    <Text className="font-semibold" style={{ color: colors.primary }}>
                      {item.avgTime.toFixed(0)} min
                    </Text>
                  </View>
                </View>
              ))
            ) : (
              <Text style={{ color: colors.muted }}>Aucune donnée disponible</Text>
            )}
          </View>
        </View>

        {/* Maintenance Costs */}
        <View className="px-4 mb-4">
          <Text className="text-lg font-bold mb-3" style={{ color: colors.foreground }}>
            Coûts de maintenance par véhicule
          </Text>
          <View className="rounded-xl p-4" style={{ backgroundColor: colors.surface }}>
            {costs.length > 0 ? (
              costs.slice(0, 5).map((item, index) => (
                <View
                  key={index}
                  className="flex-row items-center justify-between py-3"
                  style={{ borderBottomWidth: index < Math.min(costs.length, 5) - 1 ? 1 : 0, borderColor: colors.border }}
                >
                  <View className="flex-1">
                    <Text className="font-semibold" style={{ color: colors.foreground }}>
                      {item.vehiclePlate}
                    </Text>
                    <Text className="text-sm" style={{ color: colors.muted }}>
                      {item.vehicleMake} {item.vehicleModel}
                    </Text>
                  </View>
                  <Text className="font-bold" style={{ color: colors.primary }}>
                    {item.totalCost.toFixed(0)} $
                  </Text>
                </View>
              ))
            ) : (
              <Text style={{ color: colors.muted }}>Aucune donnée disponible</Text>
            )}
          </View>
        </View>

        {/* Defect Frequency */}
        <View className="px-4 mb-4">
          <Text className="text-lg font-bold mb-3" style={{ color: colors.foreground }}>
            Défauts les plus fréquents
          </Text>
          <View className="rounded-xl p-4" style={{ backgroundColor: colors.surface }}>
            {defects.length > 0 ? (
              defects.slice(0, 5).map((item, index) => (
                <View
                  key={index}
                  className="flex-row items-center justify-between py-3"
                  style={{ borderBottomWidth: index < Math.min(defects.length, 5) - 1 ? 1 : 0, borderColor: colors.border }}
                >
                  <View className="flex-1">
                    <Text className="font-semibold" style={{ color: colors.foreground }}>
                      {item.defectType}
                    </Text>
                    <Text className="text-sm" style={{ color: colors.muted }}>
                      {item.severity === 'major' ? 'Majeur' : 'Mineur'}
                    </Text>
                  </View>
                  <View className="items-end">
                    <Text className="font-bold" style={{ color: colors.primary }}>
                      {item.count}
                    </Text>
                    <Text className="text-sm" style={{ color: colors.muted }}>
                      {item.percentage.toFixed(1)}%
                    </Text>
                  </View>
                </View>
              ))
            ) : (
              <Text style={{ color: colors.muted }}>Aucune donnée disponible</Text>
            )}
          </View>
        </View>

        {/* Technician Stats */}
        <View className="px-4 mb-4">
          <Text className="text-lg font-bold mb-3" style={{ color: colors.foreground }}>
            Statistiques par technicien
          </Text>
          <View className="rounded-xl p-4" style={{ backgroundColor: colors.surface }}>
            {technicians.length > 0 ? (
              technicians.map((item, index) => (
                <View
                  key={index}
                  className="py-3"
                  style={{ borderBottomWidth: index < technicians.length - 1 ? 1 : 0, borderColor: colors.border }}
                >
                  <Text className="font-semibold mb-2" style={{ color: colors.foreground }}>
                    {item.technicianName}
                  </Text>
                  <View className="flex-row flex-wrap gap-4">
                    <View>
                      <Text className="text-sm" style={{ color: colors.muted }}>Inspections</Text>
                      <Text className="font-semibold" style={{ color: colors.foreground }}>
                        {item.totalInspections}
                      </Text>
                    </View>
                    <View>
                      <Text className="text-sm" style={{ color: colors.muted }}>Temps moyen</Text>
                      <Text className="font-semibold" style={{ color: colors.foreground }}>
                        {item.averageInspectionTime.toFixed(0)} min
                      </Text>
                    </View>
                    <View>
                      <Text className="text-sm" style={{ color: colors.muted }}>Défauts trouvés</Text>
                      <Text className="font-semibold" style={{ color: colors.foreground }}>
                        {item.defectsFound}
                      </Text>
                    </View>
                  </View>
                </View>
              ))
            ) : (
              <Text style={{ color: colors.muted }}>Aucune donnée disponible</Text>
            )}
          </View>
        </View>

        {/* Export Button */}
        <View className="px-4 pb-8">
          <Pressable
            onPress={handleExportCSV}
            style={({ pressed }) => [
              {
                backgroundColor: colors.primary,
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
            <IconSymbol name="arrow.down.doc.fill" size={20} color="#FFFFFF" />
            <Text className="text-base font-semibold" style={{ color: '#FFFFFF' }}>
              Exporter en CSV
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
