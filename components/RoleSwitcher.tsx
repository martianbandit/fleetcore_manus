/**
 * FleetCore - RoleSwitcher Component
 * 
 * Permet de basculer entre les différents dashboards selon le rôle
 * Affiche le rôle actuel et permet de changer de vue
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Pressable,
  Modal,
  StyleSheet,
  FlatList,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '@/hooks/use-colors';
import {
  getCurrentUser,
  setCurrentUser,
  getUsers,
  ROLE_CONFIGS,
  type User,
  type UserRole,
} from '@/lib/role-service';

interface RoleSwitcherProps {
  compact?: boolean;
}

export function RoleSwitcher({ compact = false }: RoleSwitcherProps) {
  const router = useRouter();
  const colors = useColors();
  const [currentUser, setCurrentUserState] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [user, allUsers] = await Promise.all([
      getCurrentUser(),
      getUsers(),
    ]);
    setCurrentUserState(user);
    setUsers(allUsers);
  };

  const handleSwitchUser = async (user: User) => {
    await setCurrentUser(user);
    setCurrentUserState(user);
    setModalVisible(false);
    
    // Naviguer vers le dashboard approprié
    const roleConfig = ROLE_CONFIGS[user.role];
    router.replace(roleConfig.dashboardRoute as any);
  };

  const getRoleIcon = (role: UserRole): string => {
    const icons: Record<UserRole, string> = {
      admin: 'shield',
      manager: 'briefcase',
      dispatcher: 'map',
      technician: 'construct',
      driver: 'car',
    };
    return icons[role] || 'person';
  };

  const currentRole = currentUser?.role || 'driver';
  const roleConfig = ROLE_CONFIGS[currentRole];

  const styles = StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    button: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: roleConfig.color + '20',
      paddingHorizontal: compact ? 10 : 14,
      paddingVertical: compact ? 6 : 10,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: roleConfig.color + '40',
    },
    buttonIcon: {
      marginRight: compact ? 6 : 8,
    },
    buttonText: {
      fontSize: compact ? 13 : 14,
      fontWeight: '600',
      color: roleConfig.color,
    },
    chevron: {
      marginLeft: compact ? 4 : 6,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContent: {
      backgroundColor: colors.background,
      borderRadius: 16,
      width: '85%',
      maxHeight: '70%',
      overflow: 'hidden',
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.foreground,
    },
    closeButton: {
      padding: 4,
    },
    userItem: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    userItemSelected: {
      backgroundColor: colors.primary + '10',
    },
    userAvatar: {
      width: 44,
      height: 44,
      borderRadius: 22,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },
    userInfo: {
      flex: 1,
    },
    userName: {
      fontSize: 15,
      fontWeight: '600',
      color: colors.foreground,
    },
    userRole: {
      fontSize: 13,
      color: colors.muted,
      marginTop: 2,
    },
    checkmark: {
      marginLeft: 8,
    },
    emptyText: {
      textAlign: 'center',
      color: colors.muted,
      padding: 20,
    },
    sectionHeader: {
      backgroundColor: colors.surface,
      paddingHorizontal: 16,
      paddingVertical: 8,
    },
    sectionTitle: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.muted,
      textTransform: 'uppercase',
    },
  });

  // Grouper les utilisateurs par rôle
  const groupedUsers = Object.entries(ROLE_CONFIGS).map(([role, config]) => ({
    role: role as UserRole,
    config,
    users: users.filter(u => u.role === role && u.isActive),
  })).filter(group => group.users.length > 0);

  return (
    <View style={styles.container}>
      <Pressable
        style={({ pressed }) => [
          styles.button,
          pressed && { opacity: 0.7 },
        ]}
        onPress={() => setModalVisible(true)}
      >
        <Ionicons
          name={getRoleIcon(currentRole) as any}
          size={compact ? 16 : 18}
          color={roleConfig.color}
          style={styles.buttonIcon}
        />
        <Text style={styles.buttonText}>
          {compact ? roleConfig.nameFr.slice(0, 3) : roleConfig.nameFr}
        </Text>
        <Ionicons
          name="chevron-down"
          size={compact ? 14 : 16}
          color={roleConfig.color}
          style={styles.chevron}
        />
      </Pressable>

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Changer d'utilisateur</Text>
              <Pressable
                style={styles.closeButton}
                onPress={() => setModalVisible(false)}
              >
                <Ionicons name="close" size={24} color={colors.muted} />
              </Pressable>
            </View>

            {groupedUsers.length === 0 ? (
              <Text style={styles.emptyText}>
                Aucun utilisateur configuré.{'\n'}
                Générez des utilisateurs de démonstration dans les paramètres.
              </Text>
            ) : (
              <FlatList
                data={groupedUsers}
                keyExtractor={(item) => item.role}
                renderItem={({ item: group }) => (
                  <View>
                    <View style={styles.sectionHeader}>
                      <Text style={styles.sectionTitle}>{group.config.nameFr}</Text>
                    </View>
                    {group.users.map((user) => {
                      const isSelected = currentUser?.id === user.id;
                      return (
                        <Pressable
                          key={user.id}
                          style={[
                            styles.userItem,
                            isSelected && styles.userItemSelected,
                          ]}
                          onPress={() => handleSwitchUser(user)}
                        >
                          <View
                            style={[
                              styles.userAvatar,
                              { backgroundColor: group.config.color + '20' },
                            ]}
                          >
                            <Ionicons
                              name={getRoleIcon(user.role) as any}
                              size={20}
                              color={group.config.color}
                            />
                          </View>
                          <View style={styles.userInfo}>
                            <Text style={styles.userName}>{user.name}</Text>
                            <Text style={styles.userRole}>{user.email}</Text>
                          </View>
                          {isSelected && (
                            <Ionicons
                              name="checkmark-circle"
                              size={24}
                              color={colors.primary}
                              style={styles.checkmark}
                            />
                          )}
                        </Pressable>
                      );
                    })}
                  </View>
                )}
              />
            )}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

export default RoleSwitcher;
