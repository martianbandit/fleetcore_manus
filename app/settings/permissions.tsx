import { useState, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, Switch, Alert } from 'react-native';
import { Stack } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

import { ScreenContainer } from '@/components/screen-container';
import { IconSymbol, type IconSymbolName } from '@/components/ui/icon-symbol';
import { AdBanner } from '@/components/ui/ad-banner';
import { useColors } from '@/hooks/use-colors';
import {
  getRolePermissions,
  updateRolePermissions,
  roleLabels,
  type RolePermission,
  type UserRole,
} from '@/lib/team-service';

const roleColors: Record<UserRole, string> = {
  admin: '#8B5CF6',
  manager: '#0EA5E9',
  technician: '#22C55E',
  viewer: '#64748B',
};

const resourceLabels: Record<keyof RolePermission['permissions'], { label: string; icon: IconSymbolName }> = {
  vehicles: { label: 'Véhicules', icon: 'car.fill' },
  inspections: { label: 'Inspections', icon: 'clipboard.fill' },
  workOrders: { label: 'Bons de travail', icon: 'wrench.fill' },
  inventory: { label: 'Inventaire', icon: 'shippingbox.fill' },
  technicians: { label: 'Techniciens', icon: 'person.fill' },
  teams: { label: 'Équipes', icon: 'person.3.fill' },
  reports: { label: 'Rapports', icon: 'chart.bar.fill' },
  settings: { label: 'Paramètres', icon: 'gear' },
};

const actionLabels: Record<'create' | 'read' | 'update' | 'delete', string> = {
  create: 'Créer',
  read: 'Voir',
  update: 'Modifier',
  delete: 'Supprimer',
};

export default function PermissionsScreen() {
  const colors = useColors();
  const [permissions, setPermissions] = useState<RolePermission[]>([]);
  const [selectedRole, setSelectedRole] = useState<UserRole>('technician');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadPermissions();
  }, []);

  const loadPermissions = async () => {
    try {
      const data = await getRolePermissions();
      setPermissions(data);
    } catch (error) {
      console.error('Error loading permissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCurrentPermissions = () => {
    return permissions.find(p => p.role === selectedRole)?.permissions;
  };

  const handleTogglePermission = async (
    resource: keyof RolePermission['permissions'],
    action: 'create' | 'read' | 'update' | 'delete'
  ) => {
    if (selectedRole === 'admin') {
      Alert.alert('Info', 'Les permissions administrateur ne peuvent pas être modifiées');
      return;
    }

    const currentPerms = getCurrentPermissions();
    if (!currentPerms) return;

    const newValue = !currentPerms[resource][action];

    // Update local state
    const updatedPermissions = permissions.map(p => {
      if (p.role === selectedRole) {
        return {
          ...p,
          permissions: {
            ...p.permissions,
            [resource]: {
              ...p.permissions[resource],
              [action]: newValue,
            },
          },
        };
      }
      return p;
    });

    setPermissions(updatedPermissions);

    // Save to storage
    try {
      const updatedPerms = updatedPermissions.find(p => p.role === selectedRole)?.permissions;
      if (updatedPerms) {
        await updateRolePermissions(selectedRole, updatedPerms);
        if (Platform.OS !== 'web') {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
      }
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de sauvegarder les permissions');
    }
  };

  const handleToggleAll = async (resource: keyof RolePermission['permissions'], enable: boolean) => {
    if (selectedRole === 'admin') {
      Alert.alert('Info', 'Les permissions administrateur ne peuvent pas être modifiées');
      return;
    }

    const updatedPermissions = permissions.map(p => {
      if (p.role === selectedRole) {
        return {
          ...p,
          permissions: {
            ...p.permissions,
            [resource]: {
              create: enable,
              read: enable,
              update: enable,
              delete: enable,
            },
          },
        };
      }
      return p;
    });

    setPermissions(updatedPermissions);

    try {
      const updatedPerms = updatedPermissions.find(p => p.role === selectedRole)?.permissions;
      if (updatedPerms) {
        await updateRolePermissions(selectedRole, updatedPerms);
        if (Platform.OS !== 'web') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
      }
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de sauvegarder les permissions');
    }
  };

  const currentPerms = getCurrentPermissions();
  const roles: UserRole[] = ['admin', 'manager', 'technician', 'viewer'];

  return (
    <ScreenContainer edges={['top', 'left', 'right']}>

      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Role Selector */}
        <View style={{ padding: 16 }}>
          <Text style={{ fontSize: 14, color: colors.muted, marginBottom: 8 }}>
            Sélectionnez un rôle pour modifier ses permissions
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {roles.map((role) => (
              <Pressable
                key={role}
                onPress={() => setSelectedRole(role)}
                style={{
                  paddingHorizontal: 16,
                  paddingVertical: 10,
                  borderRadius: 20,
                  backgroundColor: selectedRole === role ? roleColors[role] : colors.surface,
                  borderWidth: 1,
                  borderColor: selectedRole === role ? roleColors[role] : colors.border,
                }}
              >
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: '500',
                    color: selectedRole === role ? '#FFF' : colors.foreground,
                  }}
                >
                  {roleLabels[role]}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Info Banner */}
        {selectedRole === 'admin' && (
          <View
            style={{
              backgroundColor: roleColors.admin + '20',
              marginHorizontal: 16,
              padding: 12,
              borderRadius: 12,
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: 16,
            }}
          >
            <IconSymbol name="lock.fill" size={20} color={roleColors.admin} />
            <Text style={{ fontSize: 13, color: roleColors.admin, marginLeft: 10, flex: 1 }}>
              Les administrateurs ont toutes les permissions et ne peuvent pas être modifiés.
            </Text>
          </View>
        )}

        {/* Permissions Grid */}
        {currentPerms && (
          <View style={{ paddingHorizontal: 16 }}>
            {(Object.keys(resourceLabels) as Array<keyof RolePermission['permissions']>).map((resource) => {
              const resourceInfo = resourceLabels[resource];
              const perms = currentPerms[resource];
              const allEnabled = perms.create && perms.read && perms.update && perms.delete;

              return (
                <View
                  key={resource}
                  style={{
                    backgroundColor: colors.surface,
                    borderRadius: 16,
                    padding: 16,
                    marginBottom: 12,
                    borderWidth: 1,
                    borderColor: colors.border,
                  }}
                >
                  {/* Resource Header */}
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
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
                      <IconSymbol name={resourceInfo.icon} size={20} color={colors.primary} />
                    </View>
                    <Text style={{ fontSize: 16, fontWeight: '600', color: colors.foreground, flex: 1 }}>
                      {resourceInfo.label}
                    </Text>
                    {selectedRole !== 'admin' && (
                      <Pressable
                        onPress={() => handleToggleAll(resource, !allEnabled)}
                        style={{
                          backgroundColor: allEnabled ? colors.success + '20' : colors.muted + '20',
                          paddingHorizontal: 10,
                          paddingVertical: 4,
                          borderRadius: 8,
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 11,
                            fontWeight: '600',
                            color: allEnabled ? colors.success : colors.muted,
                          }}
                        >
                          {allEnabled ? 'Tout actif' : 'Activer tout'}
                        </Text>
                      </Pressable>
                    )}
                  </View>

                  {/* Permission Toggles */}
                  <View style={{ gap: 8 }}>
                    {(['create', 'read', 'update', 'delete'] as const).map((action) => (
                      <View
                        key={action}
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          backgroundColor: colors.background,
                          padding: 12,
                          borderRadius: 10,
                        }}
                      >
                        <Text style={{ fontSize: 14, color: colors.foreground }}>
                          {actionLabels[action]}
                        </Text>
                        <Switch
                          value={perms[action]}
                          onValueChange={() => handleTogglePermission(resource, action)}
                          disabled={selectedRole === 'admin'}
                          trackColor={{ false: colors.border, true: colors.primary + '60' }}
                          thumbColor={perms[action] ? colors.primary : colors.muted}
                        />
                      </View>
                    ))}
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* Ad Banner */}
        <View style={{ paddingHorizontal: 16, paddingTop: 8 }}>
          <AdBanner variant="banner" rotationInterval={5000} />
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
