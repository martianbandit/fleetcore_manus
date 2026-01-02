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
  getTeams,
  getTechniciansByTeam,
  getTeamStats,
  generateDemoTeamData,
  type Team,
  type Technician,
  type TeamStats,
} from '@/lib/team-service';

interface TeamWithDetails extends Team {
  members: Technician[];
  stats: TeamStats;
}

export default function TeamsScreen() {
  const colors = useColors();
  const [teams, setTeams] = useState<TeamWithDetails[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      await generateDemoTeamData();
      const teamsData = await getTeams();
      
      const teamsWithDetails: TeamWithDetails[] = await Promise.all(
        teamsData.map(async (team) => {
          const [members, stats] = await Promise.all([
            getTechniciansByTeam(team.id),
            getTeamStats(team.id),
          ]);
          return { ...team, members, stats };
        })
      );
      
      setTeams(teamsWithDetails);
    } catch (error) {
      console.error('Error loading teams:', error);
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

  const filteredTeams = teams.filter((team) =>
    searchQuery === '' ||
    team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    team.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalMembers = teams.reduce((sum, team) => sum + team.members.length, 0);

  const handleTeamPress = (teamId: string) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.push(`/team/${teamId}` as any);
  };

  return (
    <ScreenContainer edges={['top', 'left', 'right']}>
      <Stack.Screen
        options={{
          title: 'Équipes',
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
            {teams.length}
          </Text>
          <Text style={{ fontSize: 11, color: colors.muted }}>Équipes</Text>
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
          <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#22C55E' }}>
            {totalMembers}
          </Text>
          <Text style={{ fontSize: 11, color: colors.muted }}>Membres</Text>
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
            {teams.filter(t => t.isActive).length}
          </Text>
          <Text style={{ fontSize: 11, color: colors.muted }}>Actives</Text>
        </View>
      </View>

      {/* Search */}
      <View style={{ paddingHorizontal: 16, paddingBottom: 12 }}>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Rechercher une équipe..."
        />
      </View>

      {/* Teams List */}
      <FlatList
        data={filteredTeams}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={{ paddingBottom: 100 }}
        ListEmptyComponent={
          <View style={{ alignItems: 'center', paddingVertical: 48 }}>
            <IconSymbol name="person.3.fill" size={48} color={colors.muted} />
            <Text style={{ fontSize: 16, color: colors.muted, marginTop: 12 }}>
              Aucune équipe trouvée
            </Text>
            <Text style={{ fontSize: 14, color: colors.muted, marginTop: 4 }}>
              Appuyez sur + pour créer une équipe
            </Text>
          </View>
        }
        ListFooterComponent={
          filteredTeams.length > 0 ? (
            <View style={{ paddingHorizontal: 16, paddingTop: 8 }}>
              <AdBanner variant="banner" rotationInterval={5000} />
            </View>
          ) : null
        }
        renderItem={({ item }) => (
          <Pressable
            onPress={() => handleTeamPress(item.id)}
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
            {/* Header */}
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
              <View
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 12,
                  backgroundColor: item.color + '20',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 12,
                  borderWidth: 2,
                  borderColor: item.color,
                }}
              >
                <IconSymbol name="person.3.fill" size={22} color={item.color} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 17, fontWeight: '600', color: colors.foreground }}>
                  {item.name}
                </Text>
                {item.description && (
                  <Text style={{ fontSize: 13, color: colors.muted, marginTop: 2 }} numberOfLines={1}>
                    {item.description}
                  </Text>
                )}
              </View>
              <View
                style={{
                  backgroundColor: item.isActive ? colors.success + '20' : colors.muted + '20',
                  paddingHorizontal: 10,
                  paddingVertical: 4,
                  borderRadius: 10,
                }}
              >
                <Text
                  style={{
                    fontSize: 11,
                    fontWeight: '600',
                    color: item.isActive ? colors.success : colors.muted,
                  }}
                >
                  {item.isActive ? 'Active' : 'Inactive'}
                </Text>
              </View>
            </View>

            {/* Members Preview */}
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
              <View style={{ flexDirection: 'row', marginRight: 8 }}>
                {item.members.slice(0, 4).map((member, index) => (
                  <View
                    key={member.id}
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 16,
                      backgroundColor: item.color + '30',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginLeft: index > 0 ? -10 : 0,
                      borderWidth: 2,
                      borderColor: colors.surface,
                    }}
                  >
                    <Text style={{ fontSize: 11, fontWeight: '600', color: item.color }}>
                      {member.firstName[0]}{member.lastName[0]}
                    </Text>
                  </View>
                ))}
                {item.members.length > 4 && (
                  <View
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 16,
                      backgroundColor: colors.muted + '30',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginLeft: -10,
                      borderWidth: 2,
                      borderColor: colors.surface,
                    }}
                  >
                    <Text style={{ fontSize: 10, fontWeight: '600', color: colors.muted }}>
                      +{item.members.length - 4}
                    </Text>
                  </View>
                )}
              </View>
              <Text style={{ fontSize: 13, color: colors.muted }}>
                {item.members.length} membre{item.members.length > 1 ? 's' : ''}
              </Text>
            </View>

            {/* Stats */}
            <View
              style={{
                flexDirection: 'row',
                backgroundColor: colors.background,
                borderRadius: 12,
                padding: 12,
                gap: 16,
              }}
            >
              <View style={{ flex: 1, alignItems: 'center' }}>
                <Text style={{ fontSize: 16, fontWeight: 'bold', color: colors.foreground }}>
                  {item.stats.totalInspections}
                </Text>
                <Text style={{ fontSize: 10, color: colors.muted }}>Inspections</Text>
              </View>
              <View style={{ width: 1, backgroundColor: colors.border }} />
              <View style={{ flex: 1, alignItems: 'center' }}>
                <Text style={{ fontSize: 16, fontWeight: 'bold', color: colors.foreground }}>
                  {item.stats.vehiclesAssigned}
                </Text>
                <Text style={{ fontSize: 10, color: colors.muted }}>Véhicules</Text>
              </View>
              <View style={{ width: 1, backgroundColor: colors.border }} />
              <View style={{ flex: 1, alignItems: 'center' }}>
                <Text style={{ fontSize: 16, fontWeight: 'bold', color: colors.success }}>
                  {item.stats.averagePerformance}%
                </Text>
                <Text style={{ fontSize: 10, color: colors.muted }}>Performance</Text>
              </View>
            </View>
          </Pressable>
        )}
      />

      {/* Add Button */}
      <Pressable
        onPress={() => router.push('/team/add' as any)}
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
