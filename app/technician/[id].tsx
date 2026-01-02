import { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, Pressable, Alert, RefreshControl } from 'react-native';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

import { ScreenContainer } from '@/components/screen-container';
import { IconSymbol, type IconSymbolName } from '@/components/ui/icon-symbol';
import { AdBanner } from '@/components/ui/ad-banner';
import { useColors } from '@/hooks/use-colors';
import {
  getTechnicianById,
  getTechnicianStats,
  getTeamById,
  getAssignmentsByTechnician,
  deleteTechnician,
  specialtyLabels,
  roleLabels,
  type Technician,
  type Team,
  type TechnicianStats,
  type VehicleAssignment,
  type UserRole,
} from '@/lib/team-service';
import { getVehicles } from '@/lib/data-service';
import type { Vehicle } from '@/lib/types';

const roleColors: Record<UserRole, string> = {
  admin: '#8B5CF6',
  manager: '#0EA5E9',
  technician: '#22C55E',
  viewer: '#64748B',
};

export default function TechnicianDetailScreen() {
  const colors = useColors();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [technician, setTechnician] = useState<Technician | null>(null);
  const [team, setTeam] = useState<Team | null>(null);
  const [stats, setStats] = useState<TechnicianStats | null>(null);
  const [assignments, setAssignments] = useState<VehicleAssignment[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    if (!id) return;
    try {
      const [techData, statsData, assignmentsData, vehiclesData] = await Promise.all([
        getTechnicianById(id),
        getTechnicianStats(id),
        getAssignmentsByTechnician(id),
        getVehicles(),
      ]);
      
      setTechnician(techData);
      setStats(statsData);
      setAssignments(assignmentsData.filter(a => !a.endDate));
      setVehicles(vehiclesData);
      
      if (techData?.teamId) {
        const teamData = await getTeamById(techData.teamId);
        setTeam(teamData);
      }
    } catch (error) {
      console.error('Error loading technician:', error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  const handleDelete = () => {
    Alert.alert(
      'Supprimer le technicien',
      `Êtes-vous sûr de vouloir supprimer ${technician?.firstName} ${technician?.lastName} ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            if (!id) return;
            try {
              await deleteTechnician(id);
              if (Platform.OS !== 'web') {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              }
              router.back();
            } catch (error) {
              Alert.alert('Erreur', 'Impossible de supprimer le technicien');
            }
          },
        },
      ]
    );
  };

  const getVehiclePlate = (vehicleId: string) => {
    const vehicle = vehicles.find(v => v.id === vehicleId);
    return vehicle?.plate || 'Inconnu';
  };

  if (!technician) {
    return (
      <ScreenContainer edges={['top', 'left', 'right']}>
        <Stack.Screen options={{ title: 'Chargement...' }} />
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: colors.muted }}>Chargement...</Text>
        </View>
      </ScreenContainer>
    );
  }

  const statItems: Array<{ label: string; value: string | number; icon: IconSymbolName; color: string }> = [
    { label: 'Inspections', value: stats?.totalInspections || 0, icon: 'clipboard.fill', color: '#22C55E' },
    { label: 'Défauts trouvés', value: stats?.defectsFound || 0, icon: 'exclamationmark.triangle.fill', color: '#EF4444' },
    { label: 'Véhicules', value: stats?.vehiclesAssigned || 0, icon: 'car.fill', color: '#0EA5E9' },
    { label: 'Heures travail', value: `${stats?.totalWorkHours || 0}h`, icon: 'clock.fill', color: '#F59E0B' },
  ];

  return (
    <ScreenContainer edges={['top', 'left', 'right']}>
      <Stack.Screen
        options={{
          title: `${technician.firstName} ${technician.lastName}`,
          headerBackTitle: 'Retour',
          headerRight: () => (
            <View style={{ flexDirection: 'row', gap: 16 }}>
              <Pressable onPress={() => router.push(`/technician/add?id=${id}` as any)}>
                <IconSymbol name="pencil" size={22} color={colors.primary} />
              </Pressable>
              <Pressable onPress={handleDelete}>
                <IconSymbol name="trash.fill" size={22} color={colors.error} />
              </Pressable>
            </View>
          ),
        }}
      />

      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Header Card */}
        <View
          style={{
            backgroundColor: colors.surface,
            margin: 16,
            borderRadius: 20,
            padding: 20,
            borderWidth: 1,
            borderColor: colors.border,
            alignItems: 'center',
          }}
        >
          {/* Avatar */}
          <View
            style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              backgroundColor: roleColors[technician.role] + '20',
              alignItems: 'center',
              justifyContent: 'center',
              borderWidth: 3,
              borderColor: roleColors[technician.role],
              marginBottom: 12,
            }}
          >
            <Text style={{ fontSize: 28, fontWeight: 'bold', color: roleColors[technician.role] }}>
              {technician.firstName[0]}{technician.lastName[0]}
            </Text>
          </View>

          <Text style={{ fontSize: 22, fontWeight: 'bold', color: colors.foreground }}>
            {technician.firstName} {technician.lastName}
          </Text>

          <View
            style={{
              backgroundColor: roleColors[technician.role] + '20',
              paddingHorizontal: 12,
              paddingVertical: 4,
              borderRadius: 12,
              marginTop: 8,
            }}
          >
            <Text style={{ fontSize: 13, fontWeight: '600', color: roleColors[technician.role] }}>
              {roleLabels[technician.role]}
            </Text>
          </View>

          {team && (
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 12 }}>
              <View
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: 5,
                  backgroundColor: team.color,
                  marginRight: 8,
                }}
              />
              <Text style={{ fontSize: 14, color: colors.muted }}>{team.name}</Text>
            </View>
          )}
        </View>

        {/* Contact Info */}
        <View
          style={{
            backgroundColor: colors.surface,
            marginHorizontal: 16,
            borderRadius: 16,
            padding: 16,
            borderWidth: 1,
            borderColor: colors.border,
            marginBottom: 16,
          }}
        >
          <Text style={{ fontSize: 16, fontWeight: '600', color: colors.foreground, marginBottom: 12 }}>
            Contact
          </Text>
          <View style={{ gap: 12 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <IconSymbol name="envelope.fill" size={18} color={colors.primary} />
              <Text style={{ fontSize: 14, color: colors.foreground, marginLeft: 12 }}>
                {technician.email}
              </Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <IconSymbol name="phone.fill" size={18} color={colors.primary} />
              <Text style={{ fontSize: 14, color: colors.foreground, marginLeft: 12 }}>
                {technician.phone}
              </Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <IconSymbol name="calendar" size={18} color={colors.primary} />
              <Text style={{ fontSize: 14, color: colors.foreground, marginLeft: 12 }}>
                Embauché le {new Date(technician.hireDate).toLocaleDateString('fr-CA')}
              </Text>
            </View>
          </View>
        </View>

        {/* Stats Grid */}
        <View style={{ paddingHorizontal: 16, marginBottom: 16 }}>
          <Text style={{ fontSize: 16, fontWeight: '600', color: colors.foreground, marginBottom: 12 }}>
            Statistiques
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
            {statItems.map((stat, index) => (
              <View
                key={index}
                style={{
                  width: '47%',
                  backgroundColor: colors.surface,
                  borderRadius: 12,
                  padding: 16,
                  borderWidth: 1,
                  borderColor: colors.border,
                }}
              >
                <View
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    backgroundColor: stat.color + '20',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 8,
                  }}
                >
                  <IconSymbol name={stat.icon} size={18} color={stat.color} />
                </View>
                <Text style={{ fontSize: 20, fontWeight: 'bold', color: colors.foreground }}>
                  {stat.value}
                </Text>
                <Text style={{ fontSize: 12, color: colors.muted }}>{stat.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Specialties */}
        {technician.specialties.length > 0 && (
          <View style={{ paddingHorizontal: 16, marginBottom: 16 }}>
            <Text style={{ fontSize: 16, fontWeight: '600', color: colors.foreground, marginBottom: 12 }}>
              Spécialités
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {technician.specialties.map((specialty) => (
                <View
                  key={specialty}
                  style={{
                    backgroundColor: colors.primary + '20',
                    paddingHorizontal: 14,
                    paddingVertical: 8,
                    borderRadius: 16,
                    borderWidth: 1,
                    borderColor: colors.primary + '40',
                  }}
                >
                  <Text style={{ fontSize: 13, color: colors.primary, fontWeight: '500' }}>
                    {specialtyLabels[specialty]}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Certifications */}
        {technician.certifications.length > 0 && (
          <View style={{ paddingHorizontal: 16, marginBottom: 16 }}>
            <Text style={{ fontSize: 16, fontWeight: '600', color: colors.foreground, marginBottom: 12 }}>
              Certifications
            </Text>
            <View style={{ gap: 8 }}>
              {technician.certifications.map((cert, index) => (
                <View
                  key={index}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: colors.surface,
                    padding: 12,
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: colors.border,
                  }}
                >
                  <IconSymbol name="checkmark.seal.fill" size={20} color={colors.success} />
                  <Text style={{ fontSize: 14, color: colors.foreground, marginLeft: 10 }}>
                    {cert}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Assigned Vehicles */}
        <View style={{ paddingHorizontal: 16, marginBottom: 16 }}>
          <Text style={{ fontSize: 16, fontWeight: '600', color: colors.foreground, marginBottom: 12 }}>
            Véhicules assignés ({assignments.length})
          </Text>
          {assignments.length === 0 ? (
            <View
              style={{
                backgroundColor: colors.surface,
                padding: 20,
                borderRadius: 12,
                alignItems: 'center',
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              <IconSymbol name="car.fill" size={32} color={colors.muted} />
              <Text style={{ fontSize: 14, color: colors.muted, marginTop: 8 }}>
                Aucun véhicule assigné
              </Text>
            </View>
          ) : (
            <View style={{ gap: 8 }}>
              {assignments.map((assignment) => (
                <Pressable
                  key={assignment.id}
                  onPress={() => router.push(`/vehicle/${assignment.vehicleId}` as any)}
                  style={({ pressed }) => [
                    {
                      flexDirection: 'row',
                      alignItems: 'center',
                      backgroundColor: colors.surface,
                      padding: 12,
                      borderRadius: 12,
                      borderWidth: 1,
                      borderColor: colors.border,
                      opacity: pressed ? 0.8 : 1,
                    },
                  ]}
                >
                  <View
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 10,
                      backgroundColor: colors.primary + '20',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: 12,
                    }}
                  >
                    <IconSymbol name="car.fill" size={20} color={colors.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 15, fontWeight: '600', color: colors.foreground }}>
                      {getVehiclePlate(assignment.vehicleId)}
                    </Text>
                    <Text style={{ fontSize: 12, color: colors.muted }}>
                      Depuis le {new Date(assignment.startDate).toLocaleDateString('fr-CA')}
                    </Text>
                  </View>
                  {assignment.isPrimary && (
                    <View
                      style={{
                        backgroundColor: colors.success + '20',
                        paddingHorizontal: 8,
                        paddingVertical: 4,
                        borderRadius: 8,
                      }}
                    >
                      <Text style={{ fontSize: 10, color: colors.success, fontWeight: '600' }}>
                        Principal
                      </Text>
                    </View>
                  )}
                  <IconSymbol name="chevron.right" size={18} color={colors.muted} style={{ marginLeft: 8 }} />
                </Pressable>
              ))}
            </View>
          )}
        </View>

        {/* Ad Banner */}
        <View style={{ paddingHorizontal: 16 }}>
          <AdBanner variant="banner" rotationInterval={5000} />
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
