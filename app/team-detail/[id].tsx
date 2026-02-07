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
  getTeamById,
  getTechniciansByTeam,
  getTeamStats,
  deleteTeam,
  roleLabels,
  type Team,
  type Technician,
  type TeamStats,
  type UserRole,
} from '@/lib/team-service';

const roleColors: Record<UserRole, string> = {
  admin: '#8B5CF6',
  manager: '#0EA5E9',
  technician: '#22C55E',
  viewer: '#64748B',
};

export default function TeamDetailScreen() {
  const colors = useColors();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [team, setTeam] = useState<Team | null>(null);
  const [members, setMembers] = useState<Technician[]>([]);
  const [stats, setStats] = useState<TeamStats | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    if (!id) return;
    try {
      const [teamData, membersData, statsData] = await Promise.all([
        getTeamById(id),
        getTechniciansByTeam(id),
        getTeamStats(id),
      ]);
      
      setTeam(teamData);
      setMembers(membersData);
      setStats(statsData);
    } catch (error) {
      console.error('Error loading team:', error);
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
      'Supprimer l\'équipe',
      `Êtes-vous sûr de vouloir supprimer l'équipe "${team?.name}" ? Les membres seront désassignés.`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            if (!id) return;
            try {
              await deleteTeam(id);
              if (Platform.OS !== 'web') {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              }
              router.back();
            } catch (error) {
              Alert.alert('Erreur', 'Impossible de supprimer l\'équipe');
            }
          },
        },
      ]
    );
  };

  if (!team) {
    return (
      <ScreenContainer edges={['top', 'left', 'right']}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: colors.muted }}>Chargement...</Text>
        </View>
      </ScreenContainer>
    );
  }

  const statItems: Array<{ label: string; value: string | number; icon: IconSymbolName; color: string }> = [
    { label: 'Membres', value: stats?.memberCount || 0, icon: 'person.fill', color: team.color },
    { label: 'Inspections', value: stats?.totalInspections || 0, icon: 'clipboard.fill', color: '#22C55E' },
    { label: 'Véhicules', value: stats?.vehiclesAssigned || 0, icon: 'car.fill', color: '#0EA5E9' },
    { label: 'Performance', value: `${stats?.averagePerformance || 0}%`, icon: 'chart.bar.fill', color: '#F59E0B' },
  ];

  return (
    <ScreenContainer edges={['top', 'left', 'right']}>
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
          <View
            style={{
              width: 72,
              height: 72,
              borderRadius: 20,
              backgroundColor: team.color + '20',
              alignItems: 'center',
              justifyContent: 'center',
              borderWidth: 3,
              borderColor: team.color,
              marginBottom: 12,
            }}
          >
            <IconSymbol name="person.3.fill" size={32} color={team.color} />
          </View>

          <Text style={{ fontSize: 22, fontWeight: 'bold', color: colors.foreground }}>
            {team.name}
          </Text>

          {team.description && (
            <Text style={{ fontSize: 14, color: colors.muted, marginTop: 8, textAlign: 'center' }}>
              {team.description}
            </Text>
          )}

          <View
            style={{
              backgroundColor: team.isActive ? colors.success + '20' : colors.muted + '20',
              paddingHorizontal: 14,
              paddingVertical: 6,
              borderRadius: 12,
              marginTop: 12,
            }}
          >
            <Text
              style={{
                fontSize: 13,
                fontWeight: '600',
                color: team.isActive ? colors.success : colors.muted,
              }}
            >
              {team.isActive ? 'Équipe active' : 'Équipe inactive'}
            </Text>
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

        {/* Members List */}
        <View style={{ paddingHorizontal: 16, marginBottom: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <Text style={{ fontSize: 16, fontWeight: '600', color: colors.foreground }}>
              Membres ({members.length})
            </Text>
            <Pressable
              onPress={() => router.push('/technician/add' as any)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: colors.primary + '20',
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 16,
              }}
            >
              <IconSymbol name="plus" size={14} color={colors.primary} />
              <Text style={{ fontSize: 13, color: colors.primary, marginLeft: 4, fontWeight: '500' }}>
                Ajouter
              </Text>
            </Pressable>
          </View>

          {members.length === 0 ? (
            <View
              style={{
                backgroundColor: colors.surface,
                padding: 24,
                borderRadius: 12,
                alignItems: 'center',
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              <IconSymbol name="person.fill" size={36} color={colors.muted} />
              <Text style={{ fontSize: 14, color: colors.muted, marginTop: 8 }}>
                Aucun membre dans cette équipe
              </Text>
            </View>
          ) : (
            <View style={{ gap: 8 }}>
              {members.map((member) => (
                <Pressable
                  key={member.id}
                  onPress={() => router.push(`/technician/${member.id}` as any)}
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
                      width: 44,
                      height: 44,
                      borderRadius: 22,
                      backgroundColor: roleColors[member.role] + '20',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: 12,
                      borderWidth: 2,
                      borderColor: roleColors[member.role],
                    }}
                  >
                    <Text style={{ fontSize: 14, fontWeight: 'bold', color: roleColors[member.role] }}>
                      {member.firstName[0]}{member.lastName[0]}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 15, fontWeight: '600', color: colors.foreground }}>
                      {member.firstName} {member.lastName}
                    </Text>
                    <Text style={{ fontSize: 12, color: colors.muted }}>
                      {roleLabels[member.role]}
                    </Text>
                  </View>
                  <View
                    style={{
                      backgroundColor: roleColors[member.role] + '20',
                      paddingHorizontal: 8,
                      paddingVertical: 4,
                      borderRadius: 8,
                      marginRight: 8,
                    }}
                  >
                    <Text style={{ fontSize: 10, color: roleColors[member.role], fontWeight: '600' }}>
                      {member.specialties.length} spéc.
                    </Text>
                  </View>
                  <IconSymbol name="chevron.right" size={18} color={colors.muted} />
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
