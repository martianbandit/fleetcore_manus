/**
 * FleetCore - Dashboard Administrateur
 * 
 * Vue d'ensemble complète de l'organisation avec:
 * - Statistiques globales
 * - Gestion des utilisateurs
 * - Configuration système
 * - Audit des activités
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  RefreshControl,
  FlatList,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer } from '@/components/screen-container';
import { useColors } from '@/hooks/use-colors';
import {
  getUsers,
  getRoleStats,
  getActivityLogs,
  ROLE_CONFIGS,
  type User,
  type RoleStats,
  type ActivityLog,
  type UserRole,
} from '@/lib/role-service';
import { getVehicles } from '@/lib/data-service';
import { getInspections } from '@/lib/data-service';
import { getWorkOrders, getWorkOrderStats } from '@/lib/work-order-service';
import { getSubscription, getUsageStats, PLAN_NAMES, PLAN_PRICES, PLAN_LIMITS, PLAN_DESCRIPTIONS, PLAN_FEATURES, type Subscription, type PlanType, type UsageStats } from '@/lib/subscription-service';
import { type WorkOrder } from '@/lib/work-order-service';

export default function AdminDashboard() {
  const router = useRouter();
  const colors = useColors();
  const [refreshing, setRefreshing] = useState(false);
  const [roleStats, setRoleStats] = useState<RoleStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [usage, setUsage] = useState<UsageStats | null>(null);
  const [fleetStats, setFleetStats] = useState({
    vehicles: 0,
    inspections: 0,
    workOrders: 0,
    pendingWorkOrders: 0,
  });
  const [subscription, setSubscription] = useState<Subscription | null>(null);

  const loadData = useCallback(async () => {
    try {
      const [stats, userList, logs, vehicles, inspections, workOrders, plan, usageData] = await Promise.all([
        getRoleStats(),
        getUsers(),
        getActivityLogs(20),
        getVehicles(),
        getInspections(),
        getWorkOrders(),
        getSubscription(),
        getUsageStats(),
      ]);
      
      setRoleStats(stats);
      setUsers(userList);
      setActivityLogs(logs);
      setFleetStats({
        vehicles: vehicles.length,
        inspections: inspections.length,
        workOrders: workOrders.length,
        pendingWorkOrders: workOrders.filter((wo: WorkOrder) => wo.status === 'PENDING').length,
      });
      setSubscription(plan);
      setUsage(usageData);
    } catch (error) {
      console.error('Error loading admin data:', error);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('fr-CA', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
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

  const styles = StyleSheet.create({
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 12,
    },
    title: {
      fontSize: 28,
      fontWeight: '700',
      color: colors.foreground,
    },
    subtitle: {
      fontSize: 14,
      color: colors.muted,
      marginTop: 2,
    },
    planBadge: {
      backgroundColor: colors.primary,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
    },
    planText: {
      color: '#FFFFFF',
      fontSize: 12,
      fontWeight: '600',
      textTransform: 'uppercase',
    },
    section: {
      marginTop: 24,
      paddingHorizontal: 16,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.foreground,
      marginBottom: 12,
    },
    statsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 12,
    },
    statCard: {
      flex: 1,
      minWidth: '45%',
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 16,
      borderWidth: 1,
      borderColor: colors.border,
    },
    statIcon: {
      width: 40,
      height: 40,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 12,
    },
    statValue: {
      fontSize: 28,
      fontWeight: '700',
      color: colors.foreground,
    },
    statLabel: {
      fontSize: 13,
      color: colors.muted,
      marginTop: 4,
    },
    roleCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 12,
      marginBottom: 8,
      borderWidth: 1,
      borderColor: colors.border,
    },
    roleIcon: {
      width: 36,
      height: 36,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },
    roleInfo: {
      flex: 1,
    },
    roleName: {
      fontSize: 15,
      fontWeight: '600',
      color: colors.foreground,
    },
    roleCount: {
      fontSize: 13,
      color: colors.muted,
    },
    activityItem: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    activityDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      marginTop: 6,
      marginRight: 12,
    },
    activityContent: {
      flex: 1,
    },
    activityAction: {
      fontSize: 14,
      color: colors.foreground,
    },
    activityDetails: {
      fontSize: 13,
      color: colors.muted,
      marginTop: 2,
    },
    activityTime: {
      fontSize: 12,
      color: colors.muted,
    },
    quickAction: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 16,
      marginBottom: 8,
      borderWidth: 1,
      borderColor: colors.border,
    },
    quickActionIcon: {
      width: 44,
      height: 44,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },
    quickActionText: {
      flex: 1,
    },
    quickActionTitle: {
      fontSize: 15,
      fontWeight: '600',
      color: colors.foreground,
    },
    quickActionSubtitle: {
      fontSize: 13,
      color: colors.muted,
    },
  });

  return (
    <ScreenContainer>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Administration</Text>
            <Text style={styles.subtitle}>Vue d'ensemble du système</Text>
          </View>
          <View style={styles.planBadge}>
            <Text style={styles.planText}>{subscription?.plan || 'free'}</Text>
          </View>
        </View>

        {/* Tarification FleetCore */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tarification FleetCore</Text>
          <View style={{
            backgroundColor: colors.surface,
            borderRadius: 16,
            padding: 16,
            borderWidth: 1,
            borderColor: colors.border,
          }}>
            {/* Plan actuel */}
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 16,
              paddingBottom: 16,
              borderBottomWidth: 1,
              borderBottomColor: colors.border,
            }}>
              <View>
                <Text style={{ fontSize: 12, color: colors.muted, marginBottom: 4 }}>PLAN ACTUEL</Text>
                <Text style={{ fontSize: 22, fontWeight: '800', color: colors.primary }}>
                  {PLAN_NAMES[subscription?.plan || 'free']}
                </Text>
                <Text style={{ fontSize: 13, color: colors.muted, marginTop: 2 }}>
                  {PLAN_DESCRIPTIONS[subscription?.plan || 'free']}
                </Text>
              </View>
              <View style={{
                backgroundColor: colors.primary + '15',
                paddingHorizontal: 14,
                paddingVertical: 8,
                borderRadius: 12,
              }}>
                <Text style={{ fontSize: 20, fontWeight: '800', color: colors.primary }}>
                  {PLAN_PRICES[subscription?.plan || 'free']?.monthly}$
                </Text>
                <Text style={{ fontSize: 11, color: colors.primary, textAlign: 'center' }}>/mois</Text>
              </View>
            </View>

            {/* Utilisation */}
            <View style={{ marginBottom: 16 }}>
              <Text style={{ fontSize: 14, fontWeight: '700', color: colors.foreground, marginBottom: 10 }}>
                Utilisation du plan
              </Text>
              <View style={{ gap: 8 }}>
                <View>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                    <Text style={{ fontSize: 13, color: colors.muted }}>Véhicules</Text>
                    <Text style={{ fontSize: 13, fontWeight: '600', color: colors.foreground }}>
                      {usage?.vehiclesCount || 0} / {PLAN_LIMITS[subscription?.plan || 'free']?.maxVehicles === Infinity ? '\u221e' : PLAN_LIMITS[subscription?.plan || 'free']?.maxVehicles}
                    </Text>
                  </View>
                  <View style={{ height: 6, backgroundColor: colors.border, borderRadius: 3 }}>
                    <View style={{
                      height: 6,
                      backgroundColor: colors.primary,
                      borderRadius: 3,
                      width: `${Math.min(((usage?.vehiclesCount || 0) / (PLAN_LIMITS[subscription?.plan || 'free']?.maxVehicles === Infinity ? 100 : PLAN_LIMITS[subscription?.plan || 'free']?.maxVehicles)) * 100, 100)}%` as any,
                    }} />
                  </View>
                </View>
                <View>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                    <Text style={{ fontSize: 13, color: colors.muted }}>Inspections ce mois</Text>
                    <Text style={{ fontSize: 13, fontWeight: '600', color: colors.foreground }}>
                      {usage?.inspectionsThisMonth || 0} / {PLAN_LIMITS[subscription?.plan || 'free']?.maxInspectionsPerMonth === Infinity ? '\u221e' : PLAN_LIMITS[subscription?.plan || 'free']?.maxInspectionsPerMonth}
                    </Text>
                  </View>
                  <View style={{ height: 6, backgroundColor: colors.border, borderRadius: 3 }}>
                    <View style={{
                      height: 6,
                      backgroundColor: colors.success,
                      borderRadius: 3,
                      width: `${Math.min(((usage?.inspectionsThisMonth || 0) / (PLAN_LIMITS[subscription?.plan || 'free']?.maxInspectionsPerMonth === Infinity ? 100 : PLAN_LIMITS[subscription?.plan || 'free']?.maxInspectionsPerMonth)) * 100, 100)}%` as any,
                    }} />
                  </View>
                </View>
              </View>
            </View>

            {/* Plans disponibles */}
            <Text style={{ fontSize: 14, fontWeight: '700', color: colors.foreground, marginBottom: 10 }}>
              Plans disponibles
            </Text>
            {(['free', 'plus', 'pro', 'enterprise'] as PlanType[]).map((plan) => (
              <Pressable
                key={plan}
                style={({ pressed }) => [{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingVertical: 12,
                  paddingHorizontal: 12,
                  borderRadius: 12,
                  marginBottom: 6,
                  backgroundColor: subscription?.plan === plan ? colors.primary + '10' : 'transparent',
                  borderWidth: subscription?.plan === plan ? 1.5 : 1,
                  borderColor: subscription?.plan === plan ? colors.primary : colors.border,
                  opacity: pressed ? 0.7 : 1,
                }]}
                onPress={() => router.push('/subscription/upgrade' as any)}
              >
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Text style={{ fontSize: 15, fontWeight: '700', color: subscription?.plan === plan ? colors.primary : colors.foreground }}>
                      {PLAN_NAMES[plan]}
                    </Text>
                    {subscription?.plan === plan && (
                      <View style={{ backgroundColor: colors.primary, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 }}>
                        <Text style={{ fontSize: 10, fontWeight: '700', color: '#fff' }}>ACTUEL</Text>
                      </View>
                    )}
                  </View>
                  <Text style={{ fontSize: 12, color: colors.muted, marginTop: 2 }}>
                    {PLAN_LIMITS[plan].maxVehicles === Infinity ? 'Véhicules illimités' : `${PLAN_LIMITS[plan].maxVehicles} véhicules`}
                    {' \u2022 '}
                    {PLAN_LIMITS[plan].maxInspectionsPerMonth === Infinity ? 'Inspections illimitées' : `${PLAN_LIMITS[plan].maxInspectionsPerMonth} insp./mois`}
                  </Text>
                </View>
                <Text style={{ fontSize: 16, fontWeight: '800', color: subscription?.plan === plan ? colors.primary : colors.foreground }}>
                  {PLAN_PRICES[plan].monthly}$/mo
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Statistiques globales */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Statistiques globales</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: colors.primary + '20' }]}>
                <Ionicons name="people" size={20} color={colors.primary} />
              </View>
              <Text style={styles.statValue}>{roleStats?.totalUsers || 0}</Text>
              <Text style={styles.statLabel}>Utilisateurs</Text>
            </View>
            <View style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: colors.success + '20' }]}>
                <Ionicons name="car" size={20} color={colors.success} />
              </View>
              <Text style={styles.statValue}>{fleetStats.vehicles}</Text>
              <Text style={styles.statLabel}>Véhicules</Text>
            </View>
            <View style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: colors.warning + '20' }]}>
                <Ionicons name="clipboard" size={20} color={colors.warning} />
              </View>
              <Text style={styles.statValue}>{fleetStats.inspections}</Text>
              <Text style={styles.statLabel}>Inspections</Text>
            </View>
            <View style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: colors.error + '20' }]}>
                <Ionicons name="construct" size={20} color={colors.error} />
              </View>
              <Text style={styles.statValue}>{fleetStats.pendingWorkOrders}</Text>
              <Text style={styles.statLabel}>Bons en attente</Text>
            </View>
          </View>
        </View>

        {/* Utilisateurs par rôle */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Utilisateurs par rôle</Text>
          {Object.entries(ROLE_CONFIGS).map(([role, config]) => (
            <Pressable
              key={role}
              style={({ pressed }) => [
                styles.roleCard,
                pressed && { opacity: 0.7 },
              ]}
              onPress={() => router.push('/teams')}
            >
              <View style={[styles.roleIcon, { backgroundColor: config.color + '20' }]}>
                <Ionicons
                  name={getRoleIcon(role as UserRole) as any}
                  size={18}
                  color={config.color}
                />
              </View>
              <View style={styles.roleInfo}>
                <Text style={styles.roleName}>{config.nameFr}</Text>
                <Text style={styles.roleCount}>
                  {roleStats?.byRole[role as UserRole] || 0} utilisateur(s)
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.muted} />
            </Pressable>
          ))}
        </View>

        {/* Actions rapides */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Actions rapides</Text>
          
          <Pressable
            style={({ pressed }) => [
              styles.quickAction,
              pressed && { opacity: 0.7 },
            ]}
            onPress={() => router.push('/teams')}
          >
            <View style={[styles.quickActionIcon, { backgroundColor: colors.primary + '20' }]}>
              <Ionicons name="person-add" size={22} color={colors.primary} />
            </View>
            <View style={styles.quickActionText}>
              <Text style={styles.quickActionTitle}>Ajouter un utilisateur</Text>
              <Text style={styles.quickActionSubtitle}>Créer un nouveau compte</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.muted} />
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.quickAction,
              pressed && { opacity: 0.7 },
            ]}
            onPress={() => router.push('/settings/permissions')}
          >
            <View style={[styles.quickActionIcon, { backgroundColor: colors.warning + '20' }]}>
              <Ionicons name="key" size={22} color={colors.warning} />
            </View>
            <View style={styles.quickActionText}>
              <Text style={styles.quickActionTitle}>Gérer les permissions</Text>
              <Text style={styles.quickActionSubtitle}>Configurer les accès par rôle</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.muted} />
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.quickAction,
              pressed && { opacity: 0.7 },
            ]}
            onPress={() => router.push('/subscription/manage')}
          >
            <View style={[styles.quickActionIcon, { backgroundColor: colors.success + '20' }]}>
              <Ionicons name="card" size={22} color={colors.success} />
            </View>
            <View style={styles.quickActionText}>
              <Text style={styles.quickActionTitle}>Abonnement</Text>
              <Text style={styles.quickActionSubtitle}>Gérer le plan et la facturation</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.muted} />
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.quickAction,
              pressed && { opacity: 0.7 },
            ]}
            onPress={() => router.push('/analytics')}
          >
            <View style={[styles.quickActionIcon, { backgroundColor: colors.error + '20' }]}>
              <Ionicons name="stats-chart" size={22} color={colors.error} />
            </View>
            <View style={styles.quickActionText}>
              <Text style={styles.quickActionTitle}>Rapports et analytics</Text>
              <Text style={styles.quickActionSubtitle}>Statistiques détaillées</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.muted} />
          </Pressable>
        </View>

        {/* Journal d'activité */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Activité récente</Text>
          {activityLogs.length === 0 ? (
            <Text style={{ color: colors.muted, textAlign: 'center', paddingVertical: 20 }}>
              Aucune activité récente
            </Text>
          ) : (
            activityLogs.slice(0, 10).map((log) => (
              <View key={log.id} style={styles.activityItem}>
                <View
                  style={[
                    styles.activityDot,
                    { backgroundColor: ROLE_CONFIGS[log.userRole]?.color || colors.muted },
                  ]}
                />
                <View style={styles.activityContent}>
                  <Text style={styles.activityAction}>{log.action.replace(/_/g, ' ')}</Text>
                  <Text style={styles.activityDetails}>{log.details}</Text>
                </View>
                <Text style={styles.activityTime}>{formatDate(log.timestamp)}</Text>
              </View>
            ))
          )}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </ScreenContainer>
  );
}
