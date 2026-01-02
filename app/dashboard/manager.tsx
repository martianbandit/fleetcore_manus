/**
 * FleetCore - Dashboard Gestionnaire de flotte
 * 
 * Gestion opérationnelle avec:
 * - KPIs de flotte
 * - Suivi des coûts
 * - Gestion des équipes
 * - Approbation des bons de travail
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  RefreshControl,
  StyleSheet,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer } from '@/components/screen-container';
import { useColors } from '@/hooks/use-colors';
import { getVehicles, getInspections } from '@/lib/data-service';
import type { Vehicle, Inspection } from '@/lib/types';
import { getWorkOrders, updateWorkOrder, type WorkOrder } from '@/lib/work-order-service';
import { getTeams, getTechnicians, type Team, type Technician } from '@/lib/team-service';
import { getFleetMetrics } from '@/lib/metrics-service';

export default function ManagerDashboard() {
  const router = useRouter();
  const colors = useColors();
  const [refreshing, setRefreshing] = useState(false);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [metrics, setMetrics] = useState<any>(null);

  const loadData = useCallback(async () => {
    try {
      const [v, i, wo, t, tech, m] = await Promise.all([
        getVehicles(),
        getInspections(),
        getWorkOrders(),
        getTeams(),
        getTechnicians(),
        getFleetMetrics(),
      ]);
      setVehicles(v);
      setInspections(i);
      setWorkOrders(wo);
      setTeams(t);
      setTechnicians(tech);
      setMetrics(m);
    } catch (error) {
      console.error('Error loading manager data:', error);
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

  // Bons de travail complétés mais pas encore approuvés (marqués dans les notes)
  const pendingApprovals = workOrders.filter(wo => 
    wo.status === 'COMPLETED' && !(wo.notes || '').includes('[APPROVED]')
  );
  const activeVehicles = vehicles.filter(v => v.status === 'active').length;
  const maintenanceVehicles = vehicles.filter(v => v.status === 'maintenance').length;
  const todayInspections = inspections.filter(i => {
    const today = new Date().toDateString();
    return new Date(i.startedAt).toDateString() === today;
  }).length;
  const conformityRate = metrics?.conformityRate || 100;

  const handleApproveWorkOrder = async (workOrderId: string) => {
    const wo = workOrders.find(w => w.id === workOrderId);
    Alert.alert(
      'Approuver le bon de travail',
      'Voulez-vous approuver ce bon de travail?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Approuver',
          onPress: async () => {
            await updateWorkOrder(workOrderId, {
              notes: ((wo?.notes || '') + ' [APPROVED] ' + new Date().toISOString()).trim(),
            });
            await loadData();
          },
        },
      ]
    );
  };

  const styles = StyleSheet.create({
    header: {
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
    section: {
      marginTop: 24,
      paddingHorizontal: 16,
    },
    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.foreground,
    },
    seeAll: {
      fontSize: 14,
      color: colors.primary,
    },
    kpiGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 12,
    },
    kpiCard: {
      flex: 1,
      minWidth: '45%',
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 16,
      borderWidth: 1,
      borderColor: colors.border,
    },
    kpiHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    kpiIcon: {
      width: 36,
      height: 36,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
    },
    kpiTrend: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 8,
    },
    kpiTrendText: {
      fontSize: 11,
      fontWeight: '600',
      marginLeft: 2,
    },
    kpiValue: {
      fontSize: 28,
      fontWeight: '700',
      color: colors.foreground,
    },
    kpiLabel: {
      fontSize: 13,
      color: colors.muted,
      marginTop: 2,
    },
    teamCard: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 16,
      marginBottom: 8,
      borderWidth: 1,
      borderColor: colors.border,
    },
    teamHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    teamName: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.foreground,
    },
    teamStats: {
      flexDirection: 'row',
      marginTop: 12,
      gap: 16,
    },
    teamStat: {
      alignItems: 'center',
    },
    teamStatValue: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.foreground,
    },
    teamStatLabel: {
      fontSize: 11,
      color: colors.muted,
    },
    approvalCard: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 16,
      marginBottom: 8,
      borderWidth: 1,
      borderColor: colors.warning + '40',
    },
    approvalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
    },
    approvalTitle: {
      fontSize: 15,
      fontWeight: '600',
      color: colors.foreground,
      flex: 1,
    },
    approvalBadge: {
      backgroundColor: colors.warning + '20',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 6,
    },
    approvalBadgeText: {
      fontSize: 11,
      fontWeight: '600',
      color: colors.warning,
    },
    approvalDetails: {
      marginTop: 8,
    },
    approvalDetail: {
      fontSize: 13,
      color: colors.muted,
      marginTop: 2,
    },
    approvalActions: {
      flexDirection: 'row',
      marginTop: 12,
      gap: 8,
    },
    approveButton: {
      flex: 1,
      backgroundColor: colors.success,
      paddingVertical: 10,
      borderRadius: 8,
      alignItems: 'center',
    },
    approveButtonText: {
      color: '#FFFFFF',
      fontWeight: '600',
      fontSize: 14,
    },
    viewButton: {
      flex: 1,
      backgroundColor: colors.surface,
      paddingVertical: 10,
      borderRadius: 8,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border,
    },
    viewButtonText: {
      color: colors.foreground,
      fontWeight: '600',
      fontSize: 14,
    },
    quickAction: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 14,
      marginBottom: 8,
      borderWidth: 1,
      borderColor: colors.border,
    },
    quickActionIcon: {
      width: 40,
      height: 40,
      borderRadius: 10,
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
      fontSize: 12,
      color: colors.muted,
    },
    emptyText: {
      textAlign: 'center',
      color: colors.muted,
      paddingVertical: 20,
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
          <Text style={styles.title}>Gestion de flotte</Text>
          <Text style={styles.subtitle}>Tableau de bord opérationnel</Text>
        </View>

        {/* KPIs */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Indicateurs clés</Text>
          <View style={styles.kpiGrid}>
            <Pressable
              style={styles.kpiCard}
              onPress={() => router.push('/(tabs)/vehicles')}
            >
              <View style={styles.kpiHeader}>
                <View style={[styles.kpiIcon, { backgroundColor: colors.success + '20' }]}>
                  <Ionicons name="car" size={18} color={colors.success} />
                </View>
                <View style={[styles.kpiTrend, { backgroundColor: colors.success + '20' }]}>
                  <Ionicons name="arrow-up" size={10} color={colors.success} />
                  <Text style={[styles.kpiTrendText, { color: colors.success }]}>
                    {activeVehicles}
                  </Text>
                </View>
              </View>
              <Text style={styles.kpiValue}>{vehicles.length}</Text>
              <Text style={styles.kpiLabel}>Véhicules ({maintenanceVehicles} en maintenance)</Text>
            </Pressable>

            <Pressable
              style={styles.kpiCard}
              onPress={() => router.push('/(tabs)/inspections')}
            >
              <View style={styles.kpiHeader}>
                <View style={[styles.kpiIcon, { backgroundColor: colors.primary + '20' }]}>
                  <Ionicons name="clipboard" size={18} color={colors.primary} />
                </View>
              </View>
              <Text style={styles.kpiValue}>{todayInspections}</Text>
              <Text style={styles.kpiLabel}>Inspections aujourd'hui</Text>
            </Pressable>

            <Pressable
              style={styles.kpiCard}
              onPress={() => router.push('/work-orders')}
            >
              <View style={styles.kpiHeader}>
                <View style={[styles.kpiIcon, { backgroundColor: colors.warning + '20' }]}>
                  <Ionicons name="construct" size={18} color={colors.warning} />
                </View>
                {pendingApprovals.length > 0 && (
                  <View style={[styles.kpiTrend, { backgroundColor: colors.warning + '20' }]}>
                    <Text style={[styles.kpiTrendText, { color: colors.warning }]}>
                      {pendingApprovals.length} à approuver
                    </Text>
                  </View>
                )}
              </View>
              <Text style={styles.kpiValue}>{workOrders.length}</Text>
              <Text style={styles.kpiLabel}>Bons de travail</Text>
            </Pressable>

            <View style={styles.kpiCard}>
              <View style={styles.kpiHeader}>
                <View style={[styles.kpiIcon, { backgroundColor: conformityRate >= 90 ? colors.success + '20' : colors.error + '20' }]}>
                  <Ionicons
                    name="checkmark-circle"
                    size={18}
                    color={conformityRate >= 90 ? colors.success : colors.error}
                  />
                </View>
              </View>
              <Text style={styles.kpiValue}>{conformityRate}%</Text>
              <Text style={styles.kpiLabel}>Taux de conformité</Text>
            </View>
          </View>
        </View>

        {/* Approbations en attente */}
        {pendingApprovals.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Approbations en attente</Text>
              <Pressable onPress={() => router.push('/work-orders')}>
                <Text style={styles.seeAll}>Voir tout</Text>
              </Pressable>
            </View>
            {pendingApprovals.slice(0, 3).map((wo) => (
              <View key={wo.id} style={styles.approvalCard}>
                <View style={styles.approvalHeader}>
                  <Text style={styles.approvalTitle}>{wo.title}</Text>
                  <View style={styles.approvalBadge}>
                    <Text style={styles.approvalBadgeText}>{wo.priority}</Text>
                  </View>
                </View>
                <View style={styles.approvalDetails}>
                  <Text style={styles.approvalDetail}>
                    Véhicule: {wo.vehicleName || wo.vehicleId}
                  </Text>
                  <Text style={styles.approvalDetail}>
                    Coût estimé: {wo.estimatedTotalCost}$
                  </Text>
                </View>
                <View style={styles.approvalActions}>
                  <Pressable
                    style={styles.viewButton}
                    onPress={() => router.push(`/work-orders/${wo.id}`)}
                  >
                    <Text style={styles.viewButtonText}>Détails</Text>
                  </Pressable>
                  <Pressable
                    style={styles.approveButton}
                    onPress={() => handleApproveWorkOrder(wo.id)}
                  >
                    <Text style={styles.approveButtonText}>Approuver</Text>
                  </Pressable>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Équipes */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Équipes</Text>
            <Pressable onPress={() => router.push('/teams')}>
              <Text style={styles.seeAll}>Gérer</Text>
            </Pressable>
          </View>
          {teams.length === 0 ? (
            <Text style={styles.emptyText}>Aucune équipe configurée</Text>
          ) : (
            teams.slice(0, 3).map((team) => {
              const teamTechs = technicians.filter(t => t.teamId === team.id);
              const teamInspections = inspections.filter(i =>
                teamTechs.some(t => t.id === i.technicianId)
              ).length;
              return (
                <Pressable
                  key={team.id}
                  style={styles.teamCard}
                  onPress={() => router.push(`/team-detail/${team.id}`)}
                >
                  <View style={styles.teamHeader}>
                    <Text style={styles.teamName}>{team.name}</Text>
                    <Ionicons name="chevron-forward" size={20} color={colors.muted} />
                  </View>
                  <View style={styles.teamStats}>
                    <View style={styles.teamStat}>
                      <Text style={styles.teamStatValue}>{teamTechs.length}</Text>
                      <Text style={styles.teamStatLabel}>Techniciens</Text>
                    </View>
                    <View style={styles.teamStat}>
                      <Text style={styles.teamStatValue}>{teamInspections}</Text>
                      <Text style={styles.teamStatLabel}>Inspections</Text>
                    </View>
                  </View>
                </Pressable>
              );
            })
          )}
        </View>

        {/* Actions rapides */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Actions rapides</Text>
          
          <Pressable
            style={styles.quickAction}
            onPress={() => router.push('/analytics')}
          >
            <View style={[styles.quickActionIcon, { backgroundColor: colors.primary + '20' }]}>
              <Ionicons name="stats-chart" size={20} color={colors.primary} />
            </View>
            <View style={styles.quickActionText}>
              <Text style={styles.quickActionTitle}>Rapports analytiques</Text>
              <Text style={styles.quickActionSubtitle}>Statistiques et tendances</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.muted} />
          </Pressable>

          <Pressable
            style={styles.quickAction}
            onPress={() => router.push('/maintenance-costs')}
          >
            <View style={[styles.quickActionIcon, { backgroundColor: colors.success + '20' }]}>
              <Ionicons name="cash" size={20} color={colors.success} />
            </View>
            <View style={styles.quickActionText}>
              <Text style={styles.quickActionTitle}>Coûts de maintenance</Text>
              <Text style={styles.quickActionSubtitle}>Suivi des dépenses</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.muted} />
          </Pressable>

          <Pressable
            style={styles.quickAction}
            onPress={() => router.push('/reminders')}
          >
            <View style={[styles.quickActionIcon, { backgroundColor: colors.warning + '20' }]}>
              <Ionicons name="calendar" size={20} color={colors.warning} />
            </View>
            <View style={styles.quickActionText}>
              <Text style={styles.quickActionTitle}>Rappels et échéances</Text>
              <Text style={styles.quickActionSubtitle}>Planification des entretiens</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.muted} />
          </Pressable>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </ScreenContainer>
  );
}
