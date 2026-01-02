import { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, Pressable, RefreshControl } from 'react-native';
import { router, Stack } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

import { ScreenContainer } from '@/components/screen-container';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { SearchBar } from '@/components/ui/search-bar';
import { AdBanner } from '@/components/ui/ad-banner';
import { useColors } from '@/hooks/use-colors';
import {
  getTechnicians,
  getTeams,
  generateDemoTeamData,
  specialtyLabels,
  roleLabels,
  type Technician,
  type Team,
  type UserRole,
} from '@/lib/team-service';

const roleColors: Record<UserRole, string> = {
  admin: '#8B5CF6',
  manager: '#0EA5E9',
  technician: '#22C55E',
  viewer: '#64748B',
};

export default function TechniciansScreen() {
  const colors = useColors();
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole | 'all'>('all');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      await generateDemoTeamData();
      const [techData, teamData] = await Promise.all([
        getTechnicians(),
        getTeams(),
      ]);
      setTechnicians(techData);
      setTeams(teamData);
    } catch (error) {
      console.error('Error loading technicians:', error);
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

  const filteredTechnicians = technicians.filter((tech) => {
    const matchesSearch =
      searchQuery === '' ||
      `${tech.firstName} ${tech.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tech.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = selectedRole === 'all' || tech.role === selectedRole;
    return matchesSearch && matchesRole && tech.isActive;
  });

  const getTeamName = (teamId?: string) => {
    if (!teamId) return 'Non assigné';
    const team = teams.find(t => t.id === teamId);
    return team?.name || 'Inconnu';
  };

  const getTeamColor = (teamId?: string) => {
    if (!teamId) return colors.muted;
    const team = teams.find(t => t.id === teamId);
    return team?.color || colors.muted;
  };

  const handleTechnicianPress = (technicianId: string) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.push(`/technician/${technicianId}` as any);
  };

  const roles: Array<{ key: UserRole | 'all'; label: string; color: string }> = [
    { key: 'all', label: 'Tous', color: colors.primary },
    { key: 'admin', label: 'Admin', color: roleColors.admin },
    { key: 'manager', label: 'Manager', color: roleColors.manager },
    { key: 'technician', label: 'Technicien', color: roleColors.technician },
    { key: 'viewer', label: 'Observateur', color: roleColors.viewer },
  ];

  return (
    <ScreenContainer edges={['top', 'left', 'right']}>
      <Stack.Screen
        options={{
          title: 'Techniciens',
          headerBackTitle: 'Retour',
        }}
      />

      {/* Stats Header */}
      <View
        style={{
          flexDirection: 'row',
          paddingHorizontal: 16,
          paddingVertical: 12,
          gap: 12,
        }}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: colors.surface,
            borderRadius: 12,
            padding: 12,
            alignItems: 'center',
            borderWidth: 1,
            borderColor: colors.border,
          }}
        >
          <Text style={{ fontSize: 20, fontWeight: 'bold', color: colors.primary }}>
            {technicians.filter(t => t.isActive).length}
          </Text>
          <Text style={{ fontSize: 11, color: colors.muted }}>Actifs</Text>
        </View>
        <View
          style={{
            flex: 1,
            backgroundColor: colors.surface,
            borderRadius: 12,
            padding: 12,
            alignItems: 'center',
            borderWidth: 1,
            borderColor: colors.border,
          }}
        >
          <Text style={{ fontSize: 20, fontWeight: 'bold', color: roleColors.manager }}>
            {technicians.filter(t => t.role === 'manager').length}
          </Text>
          <Text style={{ fontSize: 11, color: colors.muted }}>Managers</Text>
        </View>
        <View
          style={{
            flex: 1,
            backgroundColor: colors.surface,
            borderRadius: 12,
            padding: 12,
            alignItems: 'center',
            borderWidth: 1,
            borderColor: colors.border,
          }}
        >
          <Text style={{ fontSize: 20, fontWeight: 'bold', color: colors.foreground }}>
            {teams.length}
          </Text>
          <Text style={{ fontSize: 11, color: colors.muted }}>Équipes</Text>
        </View>
      </View>

      {/* Search */}
      <View style={{ paddingHorizontal: 16, paddingBottom: 8 }}>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Rechercher un technicien..."
        />
      </View>

      {/* Role Filter */}
      <FlatList
        horizontal
        data={roles}
        keyExtractor={(item) => item.key}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 12 }}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => setSelectedRole(item.key)}
            style={({ pressed }) => [
              {
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 20,
                marginRight: 8,
                backgroundColor: selectedRole === item.key ? item.color : colors.surface,
                borderWidth: 1,
                borderColor: selectedRole === item.key ? item.color : colors.border,
                opacity: pressed ? 0.8 : 1,
              },
            ]}
          >
            <Text
              style={{
                fontSize: 13,
                fontWeight: '500',
                color: selectedRole === item.key ? '#FFF' : colors.foreground,
              }}
            >
              {item.label}
            </Text>
          </Pressable>
        )}
      />

      {/* Technicians List */}
      <FlatList
        data={filteredTechnicians}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={{ paddingBottom: 100 }}
        ListEmptyComponent={
          <View style={{ alignItems: 'center', paddingVertical: 48 }}>
            <IconSymbol name="person.fill" size={48} color={colors.muted} />
            <Text style={{ fontSize: 16, color: colors.muted, marginTop: 12 }}>
              Aucun technicien trouvé
            </Text>
            <Text style={{ fontSize: 14, color: colors.muted, marginTop: 4 }}>
              Appuyez sur + pour ajouter un technicien
            </Text>
          </View>
        }
        ListFooterComponent={
          filteredTechnicians.length > 0 ? (
            <View style={{ paddingHorizontal: 16, paddingTop: 8 }}>
              <AdBanner variant="banner" rotationInterval={5000} />
            </View>
          ) : null
        }
        renderItem={({ item }) => (
          <Pressable
            onPress={() => handleTechnicianPress(item.id)}
            style={({ pressed }) => [
              {
                backgroundColor: colors.surface,
                borderRadius: 16,
                padding: 16,
                marginHorizontal: 16,
                marginBottom: 12,
                borderWidth: 1,
                borderColor: colors.border,
                opacity: pressed ? 0.8 : 1,
              },
            ]}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              {/* Avatar */}
              <View
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 26,
                  backgroundColor: roleColors[item.role] + '20',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 12,
                  borderWidth: 2,
                  borderColor: roleColors[item.role],
                }}
              >
                <Text style={{ fontSize: 18, fontWeight: 'bold', color: roleColors[item.role] }}>
                  {item.firstName[0]}{item.lastName[0]}
                </Text>
              </View>

              {/* Info */}
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={{ fontSize: 16, fontWeight: '600', color: colors.foreground }}>
                    {item.firstName} {item.lastName}
                  </Text>
                  <View
                    style={{
                      backgroundColor: roleColors[item.role] + '20',
                      paddingHorizontal: 8,
                      paddingVertical: 2,
                      borderRadius: 10,
                      marginLeft: 8,
                    }}
                  >
                    <Text style={{ fontSize: 10, fontWeight: '600', color: roleColors[item.role] }}>
                      {roleLabels[item.role]}
                    </Text>
                  </View>
                </View>
                <Text style={{ fontSize: 13, color: colors.muted, marginTop: 2 }}>
                  {item.email}
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                  <View
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: getTeamColor(item.teamId),
                      marginRight: 6,
                    }}
                  />
                  <Text style={{ fontSize: 12, color: colors.muted }}>
                    {getTeamName(item.teamId)}
                  </Text>
                </View>
              </View>

              {/* Arrow */}
              <IconSymbol name="chevron.right" size={20} color={colors.muted} />
            </View>

            {/* Specialties */}
            {item.specialties.length > 0 && (
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 12, gap: 6 }}>
                {item.specialties.slice(0, 4).map((specialty) => (
                  <View
                    key={specialty}
                    style={{
                      backgroundColor: colors.background,
                      paddingHorizontal: 10,
                      paddingVertical: 4,
                      borderRadius: 12,
                      borderWidth: 1,
                      borderColor: colors.border,
                    }}
                  >
                    <Text style={{ fontSize: 11, color: colors.muted }}>
                      {specialtyLabels[specialty]}
                    </Text>
                  </View>
                ))}
                {item.specialties.length > 4 && (
                  <View
                    style={{
                      backgroundColor: colors.primary + '20',
                      paddingHorizontal: 10,
                      paddingVertical: 4,
                      borderRadius: 12,
                    }}
                  >
                    <Text style={{ fontSize: 11, color: colors.primary }}>
                      +{item.specialties.length - 4}
                    </Text>
                  </View>
                )}
              </View>
            )}
          </Pressable>
        )}
      />

      {/* Add Button */}
      <Pressable
        onPress={() => router.push('/technician/add' as any)}
        style={({ pressed }) => [
          {
            position: 'absolute',
            bottom: 24,
            right: 24,
            width: 56,
            height: 56,
            borderRadius: 28,
            backgroundColor: colors.primary,
            alignItems: 'center',
            justifyContent: 'center',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 8,
            transform: [{ scale: pressed ? 0.95 : 1 }],
          },
        ]}
      >
        <IconSymbol name="plus" size={28} color="#FFF" />
      </Pressable>
    </ScreenContainer>
  );
}
