import { useState, useEffect } from 'react';
import { View, Text, Pressable, Modal, FlatList, Alert } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { SearchBar } from '@/components/ui/search-bar';
import { useColors } from '@/hooks/use-colors';
import {
  getTechnicians,
  getTeams,
  getActiveAssignmentsByVehicle,
  assignVehicle,
  endAssignment,
  assignTeamToVehicle,
  roleLabels,
  type Technician,
  type Team,
  type VehicleAssignment,
  type UserRole,
} from '@/lib/team-service';

interface VehicleAssignmentManagerProps {
  vehicleId: string;
  vehiclePlate: string;
  onAssignmentChange?: () => void;
}

const roleColors: Record<UserRole, string> = {
  admin: '#8B5CF6',
  manager: '#0EA5E9',
  technician: '#22C55E',
  viewer: '#64748B',
};

export function VehicleAssignmentManager({
  vehicleId,
  vehiclePlate,
  onAssignmentChange,
}: VehicleAssignmentManagerProps) {
  const colors = useColors();
  const [assignments, setAssignments] = useState<VehicleAssignment[]>([]);
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState<'technicians' | 'teams'>('technicians');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [vehicleId]);

  const loadData = async () => {
    try {
      const [assignmentsData, techniciansData, teamsData] = await Promise.all([
        getActiveAssignmentsByVehicle(vehicleId),
        getTechnicians(),
        getTeams(),
      ]);
      setAssignments(assignmentsData);
      setTechnicians(techniciansData.filter(t => t.isActive));
      setTeams(teamsData.filter(t => t.isActive));
    } catch (error) {
      console.error('Error loading assignments:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTechnicianById = (id: string) => technicians.find(t => t.id === id);

  const isAssigned = (technicianId: string) =>
    assignments.some(a => a.technicianId === technicianId);

  const handleAssignTechnician = async (technicianId: string) => {
    if (isAssigned(technicianId)) {
      Alert.alert('Info', 'Ce technicien est déjà assigné à ce véhicule');
      return;
    }

    try {
      await assignVehicle({
        vehicleId,
        technicianId,
        startDate: new Date().toISOString(),
        isPrimary: assignments.length === 0,
      });

      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }

      await loadData();
      onAssignmentChange?.();
    } catch (error) {
      Alert.alert('Erreur', 'Impossible d\'assigner le technicien');
    }
  };

  const handleAssignTeam = async (teamId: string) => {
    try {
      await assignTeamToVehicle(vehicleId, teamId);

      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }

      await loadData();
      onAssignmentChange?.();
      setModalVisible(false);
    } catch (error) {
      Alert.alert('Erreur', 'Impossible d\'assigner l\'équipe');
    }
  };

  const handleEndAssignment = async (assignmentId: string) => {
    Alert.alert(
      'Retirer l\'assignation',
      'Voulez-vous retirer ce technicien de ce véhicule ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Retirer',
          style: 'destructive',
          onPress: async () => {
            try {
              await endAssignment(assignmentId);
              if (Platform.OS !== 'web') {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              }
              await loadData();
              onAssignmentChange?.();
            } catch (error) {
              Alert.alert('Erreur', 'Impossible de retirer l\'assignation');
            }
          },
        },
      ]
    );
  };

  const filteredTechnicians = technicians.filter(
    t =>
      !isAssigned(t.id) &&
      (searchQuery === '' ||
        `${t.firstName} ${t.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredTeams = teams.filter(
    t =>
      searchQuery === '' ||
      t.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View>
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <Text style={{ fontSize: 16, fontWeight: '600', color: colors.foreground }}>
          Techniciens assignés ({assignments.length})
        </Text>
        <Pressable
          onPress={() => setModalVisible(true)}
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
            Assigner
          </Text>
        </Pressable>
      </View>

      {/* Current Assignments */}
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
          <IconSymbol name="person.fill" size={32} color={colors.muted} />
          <Text style={{ fontSize: 14, color: colors.muted, marginTop: 8 }}>
            Aucun technicien assigné
          </Text>
          <Text style={{ fontSize: 12, color: colors.muted, marginTop: 4 }}>
            Appuyez sur "Assigner" pour ajouter un technicien
          </Text>
        </View>
      ) : (
        <View style={{ gap: 8 }}>
          {assignments.map((assignment) => {
            const technician = getTechnicianById(assignment.technicianId);
            if (!technician) return null;

            return (
              <View
                key={assignment.id}
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
                <View
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: roleColors[technician.role] + '20',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: 12,
                    borderWidth: 2,
                    borderColor: roleColors[technician.role],
                  }}
                >
                  <Text style={{ fontSize: 12, fontWeight: 'bold', color: roleColors[technician.role] }}>
                    {technician.firstName[0]}{technician.lastName[0]}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: colors.foreground }}>
                    {technician.firstName} {technician.lastName}
                  </Text>
                  <Text style={{ fontSize: 11, color: colors.muted }}>
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
                      marginRight: 8,
                    }}
                  >
                    <Text style={{ fontSize: 10, color: colors.success, fontWeight: '600' }}>
                      Principal
                    </Text>
                  </View>
                )}
                <Pressable
                  onPress={() => handleEndAssignment(assignment.id)}
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 16,
                    backgroundColor: colors.error + '20',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <IconSymbol name="xmark" size={14} color={colors.error} />
                </Pressable>
              </View>
            );
          })}
        </View>
      )}

      {/* Assignment Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={{ flex: 1, backgroundColor: colors.background }}>
          {/* Modal Header */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: 16,
              borderBottomWidth: 1,
              borderBottomColor: colors.border,
            }}
          >
            <Text style={{ fontSize: 18, fontWeight: '600', color: colors.foreground }}>
              Assigner à {vehiclePlate}
            </Text>
            <Pressable onPress={() => setModalVisible(false)}>
              <IconSymbol name="xmark.circle.fill" size={28} color={colors.muted} />
            </Pressable>
          </View>

          {/* Tabs */}
          <View style={{ flexDirection: 'row', padding: 16, gap: 8 }}>
            <Pressable
              onPress={() => setSelectedTab('technicians')}
              style={{
                flex: 1,
                paddingVertical: 10,
                borderRadius: 12,
                backgroundColor: selectedTab === 'technicians' ? colors.primary : colors.surface,
                alignItems: 'center',
              }}
            >
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: '500',
                  color: selectedTab === 'technicians' ? '#FFF' : colors.foreground,
                }}
              >
                Techniciens
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setSelectedTab('teams')}
              style={{
                flex: 1,
                paddingVertical: 10,
                borderRadius: 12,
                backgroundColor: selectedTab === 'teams' ? colors.primary : colors.surface,
                alignItems: 'center',
              }}
            >
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: '500',
                  color: selectedTab === 'teams' ? '#FFF' : colors.foreground,
                }}
              >
                Équipes
              </Text>
            </Pressable>
          </View>

          {/* Search */}
          <View style={{ paddingHorizontal: 16, paddingBottom: 12 }}>
            <SearchBar
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder={selectedTab === 'technicians' ? 'Rechercher un technicien...' : 'Rechercher une équipe...'}
            />
          </View>

          {/* List */}
          {selectedTab === 'technicians' ? (
            <FlatList
              data={filteredTechnicians}
              keyExtractor={(item) => item.id}
              contentContainerStyle={{ padding: 16, paddingTop: 0 }}
              ListEmptyComponent={
                <View style={{ alignItems: 'center', paddingVertical: 32 }}>
                  <Text style={{ color: colors.muted }}>Aucun technicien disponible</Text>
                </View>
              }
              renderItem={({ item }) => (
                <Pressable
                  onPress={() => handleAssignTechnician(item.id)}
                  style={({ pressed }) => [
                    {
                      flexDirection: 'row',
                      alignItems: 'center',
                      backgroundColor: colors.surface,
                      padding: 12,
                      borderRadius: 12,
                      marginBottom: 8,
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
                      backgroundColor: roleColors[item.role] + '20',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: 12,
                      borderWidth: 2,
                      borderColor: roleColors[item.role],
                    }}
                  >
                    <Text style={{ fontSize: 14, fontWeight: 'bold', color: roleColors[item.role] }}>
                      {item.firstName[0]}{item.lastName[0]}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 15, fontWeight: '600', color: colors.foreground }}>
                      {item.firstName} {item.lastName}
                    </Text>
                    <Text style={{ fontSize: 12, color: colors.muted }}>
                      {roleLabels[item.role]} • {item.specialties.length} spécialités
                    </Text>
                  </View>
                  <IconSymbol name="plus.circle.fill" size={24} color={colors.primary} />
                </Pressable>
              )}
            />
          ) : (
            <FlatList
              data={filteredTeams}
              keyExtractor={(item) => item.id}
              contentContainerStyle={{ padding: 16, paddingTop: 0 }}
              ListEmptyComponent={
                <View style={{ alignItems: 'center', paddingVertical: 32 }}>
                  <Text style={{ color: colors.muted }}>Aucune équipe disponible</Text>
                </View>
              }
              renderItem={({ item }) => (
                <Pressable
                  onPress={() => handleAssignTeam(item.id)}
                  style={({ pressed }) => [
                    {
                      flexDirection: 'row',
                      alignItems: 'center',
                      backgroundColor: colors.surface,
                      padding: 12,
                      borderRadius: 12,
                      marginBottom: 8,
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
                      borderRadius: 12,
                      backgroundColor: item.color + '20',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: 12,
                      borderWidth: 2,
                      borderColor: item.color,
                    }}
                  >
                    <IconSymbol name="person.3.fill" size={20} color={item.color} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 15, fontWeight: '600', color: colors.foreground }}>
                      {item.name}
                    </Text>
                    {item.description && (
                      <Text style={{ fontSize: 12, color: colors.muted }} numberOfLines={1}>
                        {item.description}
                      </Text>
                    )}
                  </View>
                  <IconSymbol name="plus.circle.fill" size={24} color={colors.primary} />
                </Pressable>
              )}
            />
          )}
        </View>
      </Modal>
    </View>
  );
}
