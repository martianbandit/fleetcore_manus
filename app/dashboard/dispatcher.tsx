/**
 * FleetCore - Dashboard Dispatcher
 * 
 * Gestion des affectations avec:
 * - Planification des véhicules
 * - Assignation des techniciens
 * - Vue calendrier des tâches
 * - Notifications en temps réel
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
import { getTechnicians, type Technician } from '@/lib/team-service';
import { getReminders, type FleetCoreReminder } from '@/lib/calendar-service';
import { logActivity, getCurrentUser, type UserRole } from '@/lib/role-service';

export default function DispatcherDashboard() {
  const router = useRouter();
  const colors = useColors();
  const [refreshing, setRefreshing] = useState(false);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [reminders, setReminders] = useState<FleetCoreReminder[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const loadData = useCallback(async () => {
    try {
      const [v, wo, tech, rem, user] = await Promise.all([
        getVehicles(),
        getWorkOrders(),
        getTechnicians(),
        getReminders(),
        getCurrentUser(),
      ]);
      setVehicles(v);
      setWorkOrders(wo);
      setTechnicians(tech);
      setReminders(rem);
      setCurrentUser(user);
    } catch (error) {
      console.error('Error loading dispatcher data:', error);
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

  // Calculs
  const unassignedWorkOrders = workOrders.filter(wo => !wo.technicianId && wo.status !== 'CANCELLED');
  const activeTechnicians = technicians.filter(t => t.isActive);
  const todayReminders = reminders.filter(r => {
    const today = new Date().toDateString();
    return new Date(r.dueDate).toDateString() === today;
  });
  const urgentWorkOrders = workOrders.filter(wo => wo.priority === 'URGENT' && wo.status !== 'COMPLETED');

  const handleAssignTechnician = async (workOrderId: string, technicianId: string) => {
    const technician = technicians.find(t => t.id === technicianId);
    if (!technician) return;

    Alert.alert(
      'Assigner le technicien',
      `Assigner ${technician.firstName} ${technician.lastName} à ce bon de travail?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Assigner',
          onPress: async () => {
            await updateWorkOrder(workOrderId, {
              technicianId: technicianId,
              technicianName: `${technician.firstName} ${technician.lastName}`,
              status: 'ASSIGNED',
            });
            if (currentUser) {
              await logActivity(
                currentUser.id,
                'dispatcher' as UserRole,
                'ASSIGN_TECHNICIAN',
                'workOrder',
                workOrderId,
                `Technicien ${technician.firstName} ${technician.lastName} assigné`
              );
            }
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return colors.success;
      case 'IN_PROGRESS': return colors.primary;
      case 'ASSIGNED': return colors.warning;
      default: return colors.muted;
    }
  };

  // Générer les jours de la semaine
  const weekDays = [];
  const startOfWeek = new Date(selectedDate);
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
  for (let i = 0; i < 7; i++) {
    const day = new Date(startOfWeek);
    day.setDate(day.getDate() + i);
    weekDays.push(day);
  }

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
    badge: {
      backgroundColor: colors.error,
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
    calendarCard: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 16,
      borderWidth: 1,
      borderColor: colors.border,
    },
    calendarHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    calendarMonth: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.foreground,
    },
    calendarNav: {
      flexDirection: 'row',
      gap: 8,
    },
    navButton: {
      width: 32,
      height: 32,
      borderRadius: 8,
      backgroundColor: colors.background,
      alignItems: 'center',
      justifyContent: 'center',
    },
    weekRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    dayColumn: {
      alignItems: 'center',
      flex: 1,
    },
    dayLabel: {
      fontSize: 11,
      color: colors.muted,
      marginBottom: 8,
    },
    dayNumber: {
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: 'center',
      justifyContent: 'center',
    },
    dayNumberText: {
      fontSize: 14,
      fontWeight: '500',
      color: colors.foreground,
    },
    daySelected: {
      backgroundColor: colors.primary,
    },
    daySelectedText: {
      color: '#FFFFFF',
    },
    dayToday: {
      borderWidth: 2,
      borderColor: colors.primary,
    },
    dayHasEvents: {
      position: 'relative',
    },
    eventDot: {
      position: 'absolute',
      bottom: 2,
      width: 4,
      height: 4,
      borderRadius: 2,
      backgroundColor: colors.error,
    },
    technicianCard: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 14,
      marginBottom: 8,
      borderWidth: 1,
      borderColor: colors.border,
    },
    technicianHeader: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    technicianAvatar: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: colors.primary + '20',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },
    technicianInitials: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.primary,
    },
    technicianInfo: {
      flex: 1,
    },
    technicianName: {
      fontSize: 15,
      fontWeight: '600',
      color: colors.foreground,
    },
    technicianRole: {
      fontSize: 12,
      color: colors.muted,
    },
    statusBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 8,
    },
    statusDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      marginRight: 6,
    },
    statusText: {
      fontSize: 11,
      fontWeight: '600',
    },
    technicianStats: {
      flexDirection: 'row',
      marginTop: 12,
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    techStat: {
      flex: 1,
      alignItems: 'center',
    },
    techStatValue: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.foreground,
    },
    techStatLabel: {
      fontSize: 10,
      color: colors.muted,
      marginTop: 2,
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
    },
    workOrderDetails: {
      marginTop: 8,
    },
    workOrderDetail: {
      fontSize: 13,
      color: colors.muted,
      marginTop: 2,
    },
    assignButton: {
      marginTop: 12,
      backgroundColor: colors.primary,
      paddingVertical: 10,
      borderRadius: 8,
      alignItems: 'center',
    },
    assignButtonText: {
      color: '#FFFFFF',
      fontWeight: '600',
      fontSize: 14,
    },
    urgentCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.error + '15',
      borderRadius: 10,
      padding: 12,
      marginBottom: 8,
      borderWidth: 1,
      borderColor: colors.error + '30',
    },
    urgentIcon: {
      marginRight: 12,
    },
    urgentText: {
      flex: 1,
      fontSize: 13,
      color: colors.foreground,
    },
    urgentCount: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.error,
    },
    emptyText: {
      textAlign: 'center',
      color: colors.muted,
      paddingVertical: 20,
    },
  });

  const today = new Date().toDateString();
  const dayNames = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
  const monthNames = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

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
          <Text style={styles.title}>Répartition</Text>
          <Text style={styles.subtitle}>Gestion des affectations</Text>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: colors.warning }]}>
              {unassignedWorkOrders.length}
            </Text>
            <Text style={styles.statLabel}>Non assignés</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: colors.success }]}>
              {activeTechnicians.length}
            </Text>
            <Text style={styles.statLabel}>Techniciens actifs</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: colors.primary }]}>
              {todayReminders.length}
            </Text>
            <Text style={styles.statLabel}>Rappels</Text>
          </View>
        </View>

        {/* Alertes urgentes */}
        {urgentWorkOrders.length > 0 && (
          <View style={styles.section}>
            <Pressable
              style={styles.urgentCard}
              onPress={() => router.push('/work-orders')}
            >
              <Ionicons name="alert-circle" size={24} color={colors.error} style={styles.urgentIcon} />
              <Text style={styles.urgentText}>Bons de travail urgents</Text>
              <Text style={styles.urgentCount}>{urgentWorkOrders.length}</Text>
              <Ionicons name="chevron-forward" size={20} color={colors.muted} />
            </Pressable>
          </View>
        )}

        {/* Calendrier */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Calendrier</Text>
          <View style={styles.calendarCard}>
            <View style={styles.calendarHeader}>
              <Text style={styles.calendarMonth}>
                {monthNames[selectedDate.getMonth()]} {selectedDate.getFullYear()}
              </Text>
              <View style={styles.calendarNav}>
                <Pressable
                  style={styles.navButton}
                  onPress={() => {
                    const newDate = new Date(selectedDate);
                    newDate.setDate(newDate.getDate() - 7);
                    setSelectedDate(newDate);
                  }}
                >
                  <Ionicons name="chevron-back" size={18} color={colors.foreground} />
                </Pressable>
                <Pressable
                  style={styles.navButton}
                  onPress={() => {
                    const newDate = new Date(selectedDate);
                    newDate.setDate(newDate.getDate() + 7);
                    setSelectedDate(newDate);
                  }}
                >
                  <Ionicons name="chevron-forward" size={18} color={colors.foreground} />
                </Pressable>
              </View>
            </View>
            <View style={styles.weekRow}>
              {weekDays.map((day, index) => {
                const isToday = day.toDateString() === today;
                const isSelected = day.toDateString() === selectedDate.toDateString();
                const hasEvents = reminders.some(r => new Date(r.dueDate).toDateString() === day.toDateString());
                
                return (
                  <Pressable
                    key={index}
                    style={styles.dayColumn}
                    onPress={() => setSelectedDate(day)}
                  >
                    <Text style={styles.dayLabel}>{dayNames[day.getDay()]}</Text>
                    <View
                      style={[
                        styles.dayNumber,
                        isToday && styles.dayToday,
                        isSelected && styles.daySelected,
                        hasEvents && styles.dayHasEvents,
                      ]}
                    >
                      <Text
                        style={[
                          styles.dayNumberText,
                          isSelected && styles.daySelectedText,
                        ]}
                      >
                        {day.getDate()}
                      </Text>
                      {hasEvents && !isSelected && <View style={styles.eventDot} />}
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </View>
        </View>

        {/* Techniciens */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Techniciens</Text>
            <Pressable onPress={() => router.push('/teams')}>
              <Text style={styles.seeAll}>Voir tous</Text>
            </Pressable>
          </View>
          {activeTechnicians.length === 0 ? (
            <Text style={styles.emptyText}>Aucun technicien actif</Text>
          ) : (
            activeTechnicians.slice(0, 4).map((tech) => {
              const techWorkOrders = workOrders.filter(wo => wo.technicianId === tech.id);
              const inProgress = techWorkOrders.filter(wo => wo.status === 'IN_PROGRESS').length;
              const completedToday = techWorkOrders.filter(wo => {
                return wo.status === 'COMPLETED' && 
                  wo.completedAt && 
                  new Date(wo.completedAt).toDateString() === today;
              }).length;
              
              return (
                <Pressable
                  key={tech.id}
                  style={styles.technicianCard}
                  onPress={() => router.push('/teams')}
                >
                  <View style={styles.technicianHeader}>
                    <View style={styles.technicianAvatar}>
                      <Text style={styles.technicianInitials}>
                        {tech.firstName[0]}{tech.lastName[0]}
                      </Text>
                    </View>
                    <View style={styles.technicianInfo}>
                      <Text style={styles.technicianName}>{tech.firstName} {tech.lastName}</Text>
                      <Text style={styles.technicianRole}>
                        {tech.specialties.length > 0 ? tech.specialties[0] : 'Technicien'}
                      </Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: tech.isActive ? colors.success + '20' : colors.muted + '20' }]}>
                      <View style={[styles.statusDot, { backgroundColor: tech.isActive ? colors.success : colors.muted }]} />
                      <Text style={[styles.statusText, { color: tech.isActive ? colors.success : colors.muted }]}>
                        {tech.isActive ? 'Actif' : 'Inactif'}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.technicianStats}>
                    <View style={styles.techStat}>
                      <Text style={styles.techStatValue}>{inProgress}</Text>
                      <Text style={styles.techStatLabel}>En cours</Text>
                    </View>
                    <View style={styles.techStat}>
                      <Text style={styles.techStatValue}>{completedToday}</Text>
                      <Text style={styles.techStatLabel}>Terminés</Text>
                    </View>
                    <View style={styles.techStat}>
                      <Text style={styles.techStatValue}>{tech.certifications.length}</Text>
                      <Text style={styles.techStatLabel}>Certifications</Text>
                    </View>
                  </View>
                </Pressable>
              );
            })
          )}
        </View>

        {/* Bons non assignés */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={styles.sectionTitle}>À assigner</Text>
              {unassignedWorkOrders.length > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{unassignedWorkOrders.length}</Text>
                </View>
              )}
            </View>
            <Pressable onPress={() => router.push('/work-orders')}>
              <Text style={styles.seeAll}>Voir tous</Text>
            </Pressable>
          </View>
          {unassignedWorkOrders.length === 0 ? (
            <Text style={styles.emptyText}>Tous les bons sont assignés</Text>
          ) : (
            unassignedWorkOrders.slice(0, 3).map((wo) => (
              <View key={wo.id} style={styles.workOrderCard}>
                <View style={styles.workOrderHeader}>
                  <Text style={styles.workOrderTitle}>{wo.title}</Text>
                  <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(wo.priority) }]}>
                    <Text style={styles.priorityText}>{wo.priority}</Text>
                  </View>
                </View>
                <View style={styles.workOrderDetails}>
                  <Text style={styles.workOrderDetail}>Véhicule: {wo.vehicleName || wo.vehicleId}</Text>
                  <Text style={styles.workOrderDetail}>Estimé: {Math.round((wo.estimatedTotalTime || 0) / 60)}h</Text>
                </View>
                <Pressable
                  style={styles.assignButton}
                  onPress={() => router.push(`/work-orders/${wo.id}`)}
                >
                  <Text style={styles.assignButtonText}>Assigner</Text>
                </Pressable>
              </View>
            ))
          )}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </ScreenContainer>
  );
}
