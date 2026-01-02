/**
 * FleetCore - Dashboard Technicien
 * 
 * Interface de travail quotidien avec:
 * - Bons de travail assignés
 * - Inspections à effectuer
 * - Chronomètre de travail
 * - Accès rapide aux outils
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
import { getVehicles } from '@/lib/data-service';
import type { Vehicle } from '@/lib/types';
import { getWorkOrders, updateWorkOrder, type WorkOrder } from '@/lib/work-order-service';
import { getInventoryItems, type InventoryItem } from '@/lib/inventory-service';
import { getCurrentUser, logActivity, type UserRole } from '@/lib/role-service';

export default function TechnicianDashboard() {
  const router = useRouter();
  const colors = useColors();
  const [refreshing, setRefreshing] = useState(false);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [activeWorkOrder, setActiveWorkOrder] = useState<WorkOrder | null>(null);
  const [workTimer, setWorkTimer] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const timerRef = React.useRef<ReturnType<typeof setInterval> | null>(null);

  const loadData = useCallback(async () => {
    try {
      const [wo, v, inv, user] = await Promise.all([
        getWorkOrders(),
        getVehicles(),
        getInventoryItems(),
        getCurrentUser(),
      ]);
      setWorkOrders(wo);
      setVehicles(v);
      setInventory(inv);
      setCurrentUser(user);
      
      // Trouver le bon de travail actif
      const active = wo.find(w => w.status === 'IN_PROGRESS' && w.technicianId === user?.id);
      setActiveWorkOrder(active || null);
    } catch (error) {
      console.error('Error loading technician data:', error);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Timer
  useEffect(() => {
    if (isTimerRunning) {
      timerRef.current = setInterval(() => {
        setWorkTimer(prev => prev + 1);
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isTimerRunning]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  // Filtrer les bons assignés au technicien
  const myWorkOrders = workOrders.filter(wo => wo.technicianId === currentUser?.id);
  const pendingWorkOrders = myWorkOrders.filter(wo => wo.status === 'ASSIGNED' || wo.status === 'PENDING');
  const inProgressWorkOrders = myWorkOrders.filter(wo => wo.status === 'IN_PROGRESS');
  const completedToday = myWorkOrders.filter(wo => {
    const today = new Date().toDateString();
    return wo.status === 'COMPLETED' && new Date(wo.completedAt || '').toDateString() === today;
  });

  const lowStockItems = inventory.filter(item => item.quantity <= item.minQuantity);

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartWork = async (workOrder: WorkOrder) => {
    Alert.alert(
      'Démarrer le travail',
      `Commencer à travailler sur "${workOrder.title}"?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Démarrer',
          onPress: async () => {
            await updateWorkOrder(workOrder.id, {
              status: 'IN_PROGRESS',
              startedAt: new Date().toISOString(),
            });
            if (currentUser) {
              await logActivity(
                currentUser.id,
                'technician' as UserRole,
                'START_WORK',
                'workOrder',
                workOrder.id,
                `Travail commencé sur ${workOrder.title}`
              );
            }
            setActiveWorkOrder(workOrder);
            setWorkTimer(0);
            setIsTimerRunning(true);
            await loadData();
          },
        },
      ]
    );
  };

  const handleCompleteWork = async () => {
    if (!activeWorkOrder) return;
    
    Alert.alert(
      'Terminer le travail',
      'Marquer ce bon de travail comme terminé?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Terminer',
          onPress: async () => {
            await updateWorkOrder(activeWorkOrder.id, {
              status: 'COMPLETED',
              completedAt: new Date().toISOString(),
              actualTotalTime: workTimer,
            });
            if (currentUser) {
              await logActivity(
                currentUser.id,
                'technician' as UserRole,
                'COMPLETE_WORK',
                'workOrder',
                activeWorkOrder.id,
                `Travail terminé sur ${activeWorkOrder.title}`
              );
            }
            setActiveWorkOrder(null);
            setIsTimerRunning(false);
            setWorkTimer(0);
            await loadData();
          },
        },
      ]
    );
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT': return colors.error;
      case 'HIGH': return colors.warning;
      case 'MEDIUM': return colors.primary;
      default: return colors.muted;
    }
  };

  const styles = StyleSheet.create({
    header: {
      paddingHorizontal: 16,
      paddingVertical: 12,
    },
    greeting: {
      fontSize: 14,
      color: colors.muted,
    },
    title: {
      fontSize: 28,
      fontWeight: '700',
      color: colors.foreground,
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
    badge: {
      backgroundColor: colors.primary,
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 10,
      marginLeft: 8,
    },
    badgeText: {
      color: '#FFFFFF',
      fontSize: 12,
      fontWeight: '600',
    },
    seeAll: {
      fontSize: 14,
      color: colors.primary,
    },
    activeWorkCard: {
      backgroundColor: colors.primary,
      borderRadius: 16,
      padding: 20,
      marginHorizontal: 16,
      marginTop: 16,
    },
    activeWorkHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
    },
    activeWorkTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: '#FFFFFF',
      flex: 1,
    },
    activeWorkBadge: {
      backgroundColor: 'rgba(255,255,255,0.2)',
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 8,
    },
    activeWorkBadgeText: {
      color: '#FFFFFF',
      fontSize: 12,
      fontWeight: '600',
    },
    timerContainer: {
      alignItems: 'center',
      marginVertical: 20,
    },
    timerText: {
      fontSize: 48,
      fontWeight: '700',
      color: '#FFFFFF',
      fontVariant: ['tabular-nums'],
    },
    timerLabel: {
      fontSize: 14,
      color: 'rgba(255,255,255,0.7)',
      marginTop: 4,
    },
    timerActions: {
      flexDirection: 'row',
      gap: 12,
    },
    pauseButton: {
      flex: 1,
      backgroundColor: 'rgba(255,255,255,0.2)',
      paddingVertical: 12,
      borderRadius: 10,
      alignItems: 'center',
    },
    completeButton: {
      flex: 1,
      backgroundColor: '#FFFFFF',
      paddingVertical: 12,
      borderRadius: 10,
      alignItems: 'center',
    },
    pauseButtonText: {
      color: '#FFFFFF',
      fontWeight: '600',
      fontSize: 15,
    },
    completeButtonText: {
      color: colors.primary,
      fontWeight: '600',
      fontSize: 15,
    },
    statsRow: {
      flexDirection: 'row',
      gap: 12,
      marginTop: 16,
      paddingHorizontal: 16,
    },
    statCard: {
      flex: 1,
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 14,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border,
    },
    statValue: {
      fontSize: 24,
      fontWeight: '700',
      color: colors.foreground,
    },
    statLabel: {
      fontSize: 11,
      color: colors.muted,
      marginTop: 4,
      textAlign: 'center',
    },
    workOrderCard: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 14,
      marginBottom: 8,
      borderWidth: 1,
      borderColor: colors.border,
    },
    workOrderHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
    },
    workOrderTitle: {
      fontSize: 15,
      fontWeight: '600',
      color: colors.foreground,
      flex: 1,
    },
    priorityBadge: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 6,
    },
    priorityText: {
      fontSize: 11,
      fontWeight: '600',
      color: '#FFFFFF',
      textTransform: 'uppercase',
    },
    workOrderDetails: {
      marginTop: 8,
    },
    workOrderDetail: {
      fontSize: 13,
      color: colors.muted,
      marginTop: 2,
    },
    startButton: {
      marginTop: 12,
      backgroundColor: colors.success,
      paddingVertical: 10,
      borderRadius: 8,
      alignItems: 'center',
    },
    startButtonText: {
      color: '#FFFFFF',
      fontWeight: '600',
      fontSize: 14,
    },
    quickActions: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 12,
    },
    quickAction: {
      width: '47%',
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 16,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border,
    },
    quickActionIcon: {
      width: 48,
      height: 48,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 10,
    },
    quickActionText: {
      fontSize: 13,
      fontWeight: '500',
      color: colors.foreground,
      textAlign: 'center',
    },
    alertCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.warning + '15',
      borderRadius: 10,
      padding: 12,
      marginBottom: 8,
      borderWidth: 1,
      borderColor: colors.warning + '30',
    },
    alertIcon: {
      marginRight: 12,
    },
    alertText: {
      flex: 1,
      fontSize: 13,
      color: colors.foreground,
    },
    alertCount: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.warning,
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
          <Text style={styles.greeting}>Bonjour,</Text>
          <Text style={styles.title}>{currentUser?.name || 'Technicien'}</Text>
        </View>

        {/* Travail en cours */}
        {activeWorkOrder ? (
          <View style={styles.activeWorkCard}>
            <View style={styles.activeWorkHeader}>
              <Text style={styles.activeWorkTitle}>{activeWorkOrder.title}</Text>
              <View style={styles.activeWorkBadge}>
                <Text style={styles.activeWorkBadgeText}>EN COURS</Text>
              </View>
            </View>
            <View style={styles.timerContainer}>
              <Text style={styles.timerText}>{formatTime(workTimer)}</Text>
              <Text style={styles.timerLabel}>Temps de travail</Text>
            </View>
            <View style={styles.timerActions}>
              <Pressable
                style={styles.pauseButton}
                onPress={() => setIsTimerRunning(!isTimerRunning)}
              >
                <Text style={styles.pauseButtonText}>
                  {isTimerRunning ? 'Pause' : 'Reprendre'}
                </Text>
              </Pressable>
              <Pressable
                style={styles.completeButton}
                onPress={handleCompleteWork}
              >
                <Text style={styles.completeButtonText}>Terminer</Text>
              </Pressable>
            </View>
          </View>
        ) : (
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={[styles.statValue, { color: colors.warning }]}>
                {pendingWorkOrders.length}
              </Text>
              <Text style={styles.statLabel}>En attente</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={[styles.statValue, { color: colors.primary }]}>
                {inProgressWorkOrders.length}
              </Text>
              <Text style={styles.statLabel}>En cours</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={[styles.statValue, { color: colors.success }]}>
                {completedToday.length}
              </Text>
              <Text style={styles.statLabel}>Terminés</Text>
            </View>
          </View>
        )}

        {/* Alertes stock bas */}
        {lowStockItems.length > 0 && (
          <View style={styles.section}>
            <Pressable
              style={styles.alertCard}
              onPress={() => router.push('/inventory')}
            >
              <Ionicons name="warning" size={24} color={colors.warning} style={styles.alertIcon} />
              <Text style={styles.alertText}>Pièces en stock bas</Text>
              <Text style={styles.alertCount}>{lowStockItems.length}</Text>
              <Ionicons name="chevron-forward" size={20} color={colors.muted} />
            </Pressable>
          </View>
        )}

        {/* Bons de travail assignés */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={styles.sectionTitle}>Mes bons de travail</Text>
              {pendingWorkOrders.length > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{pendingWorkOrders.length}</Text>
                </View>
              )}
            </View>
            <Pressable onPress={() => router.push('/work-orders')}>
              <Text style={styles.seeAll}>Voir tous</Text>
            </Pressable>
          </View>
          {pendingWorkOrders.length === 0 ? (
            <Text style={styles.emptyText}>Aucun bon de travail en attente</Text>
          ) : (
            pendingWorkOrders.slice(0, 3).map((wo) => {
              const vehicle = vehicles.find(v => v.id === wo.vehicleId);
              return (
                <View key={wo.id} style={styles.workOrderCard}>
                  <View style={styles.workOrderHeader}>
                    <Text style={styles.workOrderTitle}>{wo.title}</Text>
                    <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(wo.priority) }]}>
                      <Text style={styles.priorityText}>{wo.priority}</Text>
                    </View>
                  </View>
                  <View style={styles.workOrderDetails}>
                    <Text style={styles.workOrderDetail}>
                      Véhicule: {vehicle?.plate || wo.vehicleId}
                    </Text>
                    <Text style={styles.workOrderDetail}>
                      Estimé: {Math.round((wo.estimatedTotalTime || 0) / 60)}h
                    </Text>
                  </View>
                  <Pressable
                    style={styles.startButton}
                    onPress={() => handleStartWork(wo)}
                  >
                    <Text style={styles.startButtonText}>Commencer</Text>
                  </Pressable>
                </View>
              );
            })
          )}
        </View>

        {/* Actions rapides */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Actions rapides</Text>
          <View style={styles.quickActions}>
            <Pressable
              style={styles.quickAction}
              onPress={() => router.push('/(tabs)/inspections')}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: colors.primary + '20' }]}>
                <Ionicons name="clipboard" size={24} color={colors.primary} />
              </View>
              <Text style={styles.quickActionText}>Nouvelle inspection</Text>
            </Pressable>
            <Pressable
              style={styles.quickAction}
              onPress={() => router.push('/pep')}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: colors.success + '20' }]}>
                <Ionicons name="document-text" size={24} color={colors.success} />
              </View>
              <Text style={styles.quickActionText}>Fiche PEP</Text>
            </Pressable>
            <Pressable
              style={styles.quickAction}
              onPress={() => router.push('/inventory')}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: colors.warning + '20' }]}>
                <Ionicons name="cube" size={24} color={colors.warning} />
              </View>
              <Text style={styles.quickActionText}>Inventaire</Text>
            </Pressable>
            <Pressable
              style={styles.quickAction}
              onPress={() => router.push('/(tabs)/vehicles')}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: colors.error + '20' }]}>
                <Ionicons name="car" size={24} color={colors.error} />
              </View>
              <Text style={styles.quickActionText}>Véhicules</Text>
            </Pressable>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </ScreenContainer>
  );
}
