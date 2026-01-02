/**
 * FleetCore - Écran de sélection de rôle
 * 
 * Permet à l'utilisateur de choisir son rôle et d'accéder
 * au dashboard correspondant
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer } from '@/components/screen-container';
import { useColors } from '@/hooks/use-colors';
import {
  ROLE_CONFIGS,
  setCurrentUserRole,
  getCurrentUserRole,
  type UserRole,
} from '@/lib/role-service';

const ROLE_ICONS: Record<UserRole, string> = {
  admin: 'shield-checkmark',
  manager: 'briefcase',
  dispatcher: 'calendar',
  technician: 'construct',
  driver: 'car',
};

export default function RoleSelectScreen() {
  const router = useRouter();
  const colors = useColors();
  const [currentRole, setCurrentRole] = useState<UserRole>('driver');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCurrentRole();
  }, []);

  const loadCurrentRole = async () => {
    try {
      const role = await getCurrentUserRole();
      setCurrentRole(role);
    } catch (error) {
      console.error('Error loading current role:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectRole = async (role: UserRole) => {
    await setCurrentUserRole(role);
    setCurrentRole(role);
    
    // Naviguer vers le dashboard approprié
    const config = ROLE_CONFIGS[role];
    router.replace(config.dashboardRoute as any);
  };

  const roles = Object.entries(ROLE_CONFIGS).map(([key, config]) => ({
    ...config,
    roleKey: key as UserRole,
    icon: ROLE_ICONS[key as UserRole],
  }));

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 20,
    },
    header: {
      alignItems: 'center',
      marginTop: 40,
      marginBottom: 40,
    },
    logo: {
      width: 80,
      height: 80,
      borderRadius: 20,
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 20,
    },
    title: {
      fontSize: 28,
      fontWeight: '700',
      color: colors.foreground,
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 16,
      color: colors.muted,
      textAlign: 'center',
    },
    rolesContainer: {
      gap: 12,
    },
    roleCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 20,
      borderWidth: 2,
      borderColor: colors.border,
    },
    roleCardSelected: {
      borderColor: colors.primary,
      backgroundColor: colors.primary + '10',
    },
    roleIcon: {
      width: 56,
      height: 56,
      borderRadius: 28,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 16,
    },
    roleInfo: {
      flex: 1,
    },
    roleName: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.foreground,
      marginBottom: 4,
    },
    roleDescription: {
      fontSize: 13,
      color: colors.muted,
      lineHeight: 18,
    },
    checkIcon: {
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    footer: {
      marginTop: 30,
      alignItems: 'center',
    },
    footerText: {
      fontSize: 13,
      color: colors.muted,
      textAlign: 'center',
    },
    currentBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.success + '20',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 20,
      marginTop: 20,
    },
    currentBadgeText: {
      fontSize: 13,
      color: colors.success,
      fontWeight: '500',
      marginLeft: 6,
    },
  });

  if (loading) {
    return (
      <ScreenContainer>
        <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
          <Text style={{ color: colors.muted }}>Chargement...</Text>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logo}>
            <Ionicons name="car-sport" size={40} color="#FFFFFF" />
          </View>
          <Text style={styles.title}>FleetCore</Text>
          <Text style={styles.subtitle}>
            Sélectionnez votre rôle pour accéder{'\n'}à votre tableau de bord
          </Text>
        </View>

        {/* Liste des rôles */}
        <View style={styles.rolesContainer}>
          {roles.map((role) => {
            const isSelected = currentRole === role.roleKey;
            
            return (
              <Pressable
                key={role.roleKey}
                style={({ pressed }) => [
                  styles.roleCard,
                  isSelected && styles.roleCardSelected,
                  pressed && { opacity: 0.8 },
                ]}
                onPress={() => handleSelectRole(role.roleKey)}
              >
                <View style={[styles.roleIcon, { backgroundColor: role.color + '20' }]}>
                  <Ionicons name={role.icon as any} size={28} color={role.color} />
                </View>
                <View style={styles.roleInfo}>
                  <Text style={styles.roleName}>{role.nameFr}</Text>
                  <Text style={styles.roleDescription}>{role.description}</Text>
                </View>
                {isSelected && (
                  <View style={styles.checkIcon}>
                    <Ionicons name="checkmark" size={18} color="#FFFFFF" />
                  </View>
                )}
              </Pressable>
            );
          })}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Vous pouvez changer de rôle à tout moment{'\n'}depuis les paramètres
          </Text>
          
          <View style={styles.currentBadge}>
            <Ionicons name="person" size={16} color={colors.success} />
            <Text style={styles.currentBadgeText}>
              Rôle actuel: {ROLE_CONFIGS[currentRole].nameFr}
            </Text>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </ScreenContainer>
  );
}
