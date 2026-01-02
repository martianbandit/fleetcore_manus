import { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';
import { useTheme } from '@/lib/theme-context';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { getTechnicianMetrics, type TechnicianMetrics } from '@/lib/metrics-service';
import { getInspections } from '@/lib/data-service';
import type { Inspection } from '@/lib/types';

interface Technician {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  certifications: string[];
  photo?: string;
}

export default function TechnicianDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useTheme();
  const [technician, setTechnician] = useState<Technician | null>(null);
  const [metrics, setMetrics] = useState<TechnicianMetrics | null>(null);
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      // Load technician data (mock for now)
      const mockTechnician: Technician = {
        id: id || '1',
        name: 'Jean Tremblay',
        email: 'jean.tremblay@fleetcore.ca',
        phone: '514-555-1234',
        role: 'Technicien senior',
        certifications: ['SAAQ Classe 1', 'Freins pneumatiques', 'Inspection PEP'],
      };
      setTechnician(mockTechnician);

      // Load metrics
      const metricsData = await getTechnicianMetrics(id || '1');
      setMetrics(metricsData);

      // Load inspections by this technician
      const allInspections = await getInspections();
      const techInspections = allInspections.filter(i => i.technicianId === id);
      setInspections(techInspections);
    } catch (error) {
      console.error('Error loading technician data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}min` : `${mins}min`;
  };

  const formatDate = (date: Date | string): string => {
    return new Date(date).toLocaleDateString('fr-CA', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  if (loading || !technician) {
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
        <View className="flex-row items-center px-4 py-4">
          <TouchableOpacity onPress={() => router.back()} className="mr-4">
            <IconSymbol name="chevron.left" size={24} color={colors.foreground} />
          </TouchableOpacity>
          <Text className="text-2xl font-bold flex-1" style={{ color: colors.foreground }}>
            Profil technicien
          </Text>
        </View>

        {/* Profile Card */}
        <View className="px-4 mb-6">
          <View className="rounded-2xl p-6" style={{ backgroundColor: colors.surface }}>
            <View className="flex-row items-center mb-4">
              <View
                className="w-20 h-20 rounded-full items-center justify-center mr-4"
                style={{ backgroundColor: colors.primary }}
              >
                <Text className="text-white text-3xl font-bold">
                  {technician.name.charAt(0).toUpperCase()}
                </Text>
              </View>
              <View className="flex-1">
                <Text className="text-xl font-bold" style={{ color: colors.foreground }}>
                  {technician.name}
                </Text>
                <Text className="text-base" style={{ color: colors.muted }}>
                  {technician.role}
                </Text>
              </View>
            </View>

            {/* Contact Info */}
            <View className="border-t pt-4" style={{ borderColor: colors.border }}>
              <View className="flex-row items-center mb-2">
                <IconSymbol name="paperplane.fill" size={16} color={colors.muted} />
                <Text className="ml-2" style={{ color: colors.foreground }}>
                  {technician.email}
                </Text>
              </View>
              <View className="flex-row items-center">
                <IconSymbol name="phone.fill" size={16} color={colors.muted} />
                <Text className="ml-2" style={{ color: colors.foreground }}>
                  {technician.phone}
                </Text>
              </View>
            </View>

            {/* Certifications */}
            <View className="border-t pt-4 mt-4" style={{ borderColor: colors.border }}>
              <Text className="text-sm font-semibold mb-2" style={{ color: colors.muted }}>
                CERTIFICATIONS
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {technician.certifications.map((cert, index) => (
                  <View
                    key={index}
                    className="px-3 py-1 rounded-full"
                    style={{ backgroundColor: colors.primary + '20' }}
                  >
                    <Text className="text-sm" style={{ color: colors.primary }}>
                      {cert}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        </View>

        {/* Statistics */}
        <View className="px-4 mb-6">
          <Text className="text-sm font-semibold mb-3" style={{ color: colors.muted }}>
            STATISTIQUES
          </Text>

          <View className="flex-row gap-3 mb-3">
            <View className="flex-1 rounded-xl p-4" style={{ backgroundColor: colors.surface }}>
              <Text className="text-2xl font-bold" style={{ color: colors.primary }}>
                {metrics?.totalInspections || 0}
              </Text>
              <Text className="text-sm" style={{ color: colors.muted }}>
                Inspections totales
              </Text>
            </View>
            <View className="flex-1 rounded-xl p-4" style={{ backgroundColor: colors.surface }}>
              <Text className="text-2xl font-bold" style={{ color: colors.success }}>
                {metrics?.completedInspections || 0}
              </Text>
              <Text className="text-sm" style={{ color: colors.muted }}>
                Complétées
              </Text>
            </View>
          </View>

          <View className="flex-row gap-3 mb-3">
            <View className="flex-1 rounded-xl p-4" style={{ backgroundColor: colors.surface }}>
              <Text className="text-2xl font-bold" style={{ color: colors.foreground }}>
                {formatDuration(metrics?.averageInspectionTime || 0)}
              </Text>
              <Text className="text-sm" style={{ color: colors.muted }}>
                Temps moyen
              </Text>
            </View>
            <View className="flex-1 rounded-xl p-4" style={{ backgroundColor: colors.surface }}>
              <Text className="text-2xl font-bold" style={{ color: colors.warning }}>
                {metrics?.defectsFound || 0}
              </Text>
              <Text className="text-sm" style={{ color: colors.muted }}>
                Défauts détectés
              </Text>
            </View>
          </View>

          <View className="flex-row gap-3">
            <View className="flex-1 rounded-xl p-4" style={{ backgroundColor: colors.surface }}>
              <Text className="text-2xl font-bold" style={{ color: colors.error }}>
                {Math.round((metrics?.defectsFound || 0) * 0.3)}
              </Text>
              <Text className="text-sm" style={{ color: colors.muted }}>
                Défauts majeurs
              </Text>
            </View>
            <View className="flex-1 rounded-xl p-4" style={{ backgroundColor: colors.surface }}>
              <Text className="text-2xl font-bold" style={{ color: colors.foreground }}>
                {formatDuration(metrics?.totalWorkTime || 0)}
              </Text>
              <Text className="text-sm" style={{ color: colors.muted }}>
                Temps total
              </Text>
            </View>
          </View>
        </View>

        {/* Recent Inspections */}
        <View className="px-4 mb-6">
          <Text className="text-sm font-semibold mb-3" style={{ color: colors.muted }}>
            INSPECTIONS RÉCENTES
          </Text>

          {inspections.length === 0 ? (
            <View className="rounded-xl p-6 items-center" style={{ backgroundColor: colors.surface }}>
              <IconSymbol name="doc.text" size={40} color={colors.muted} />
              <Text className="mt-2 text-center" style={{ color: colors.muted }}>
                Aucune inspection effectuée
              </Text>
            </View>
          ) : (
            inspections.slice(0, 5).map((inspection) => (
              <TouchableOpacity
                key={inspection.id}
                className="rounded-xl p-4 mb-2"
                style={{ backgroundColor: colors.surface }}
                onPress={() => router.push(`/inspection/${inspection.id}` as any)}
              >
                <View className="flex-row items-center justify-between">
                  <View className="flex-1">
                    <Text className="font-semibold" style={{ color: colors.foreground }}>
                      {inspection.vehicleId}
                    </Text>
                    <Text className="text-sm" style={{ color: colors.muted }}>
                      {formatDate(inspection.createdAt)}
                    </Text>
                  </View>
                  <View
                    className="px-3 py-1 rounded-full"
                    style={{
                      backgroundColor:
                        inspection.status === 'COMPLETED'
                          ? colors.success + '20'
                          : inspection.status === 'BLOCKED'
                          ? colors.error + '20'
                          : colors.warning + '20',
                    }}
                  >
                    <Text
                      className="text-sm"
                      style={{
                        color:
                          inspection.status === 'COMPLETED'
                            ? colors.success
                            : inspection.status === 'BLOCKED'
                            ? colors.error
                            : colors.warning,
                      }}
                    >
                      {inspection.status === 'COMPLETED'
                        ? 'Complétée'
                        : inspection.status === 'BLOCKED'
                        ? 'Bloquée'
                        : 'En cours'}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>

        {/* Performance Chart Placeholder */}
        <View className="px-4 mb-8">
          <Text className="text-sm font-semibold mb-3" style={{ color: colors.muted }}>
            PERFORMANCE
          </Text>
          <View
            className="rounded-xl p-6 items-center justify-center"
            style={{ backgroundColor: colors.surface, height: 200 }}
          >
            <IconSymbol name="chart.bar.fill" size={48} color={colors.muted} />
            <Text className="mt-2 text-center" style={{ color: colors.muted }}>
              Graphique de performance
            </Text>
            <Text className="text-sm text-center" style={{ color: colors.muted }}>
              (Disponible dans la version Pro)
            </Text>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
