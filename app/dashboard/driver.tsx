/**
 * FleetCore - Dashboard Chauffeur
 * 
 * Interface simplifiée pour les chauffeurs avec:
 * - Véhicule assigné
 * - Ronde de sécurité quotidienne
 * - Signalement de défauts
 * - Rappels importants
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
  TextInput,
  Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer } from '@/components/screen-container';
import { useColors } from '@/hooks/use-colors';
import { getVehicles } from '@/lib/data-service';
import type { Vehicle } from '@/lib/types';
import { getReminders, type FleetCoreReminder } from '@/lib/calendar-service';
import { getCurrentUser, logActivity, type UserRole } from '@/lib/role-service';
import { createWorkOrder } from '@/lib/work-order-service';

// Éléments de la ronde de sécurité quotidienne
const SAFETY_CHECK_ITEMS = [
  { id: 'lights', label: 'Feux et clignotants', icon: 'flashlight' },
  { id: 'tires', label: 'Pneus et pression', icon: 'ellipse' },
  { id: 'brakes', label: 'Freins', icon: 'stop-circle' },
  { id: 'mirrors', label: 'Rétroviseurs', icon: 'eye' },
  { id: 'wipers', label: 'Essuie-glaces', icon: 'water' },
  { id: 'horn', label: 'Klaxon', icon: 'volume-high' },
  { id: 'fluids', label: 'Niveaux de fluides', icon: 'beaker' },
  { id: 'belts', label: 'Ceintures de sécurité', icon: 'shield-checkmark' },
];

export default function DriverDashboard() {
  const router = useRouter();
  const colors = useColors();
  const [refreshing, setRefreshing] = useState(false);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [reminders, setReminders] = useState<FleetCoreReminder[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [assignedVehicle, setAssignedVehicle] = useState<Vehicle | null>(null);
  const [safetyChecks, setSafetyChecks] = useState<Record<string, boolean | null>>({});
  const [safetyCheckCompleted, setSafetyCheckCompleted] = useState(false);
  const [defectNotes, setDefectNotes] = useState<string[]>([]);
  const [defectModalVisible, setDefectModalVisible] = useState(false);
  const [defectDescription, setDefectDescription] = useState('');

  const loadData = useCallback(async () => {
    try {
      const [v, rem, user] = await Promise.all([
        getVehicles(),
        getReminders(),
        getCurrentUser(),
      ]);
      setVehicles(v);
      setReminders(rem);
      setCurrentUser(user);
      
      // Trouver le véhicule assigné au chauffeur (utiliser le premier véhicule pour la démo)
      const assigned = v.length > 0 ? v[0] : null;
      setAssignedVehicle(assigned);
      
      // Initialiser les checks
      const initialChecks: Record<string, boolean | null> = {};
      SAFETY_CHECK_ITEMS.forEach(item => {
        initialChecks[item.id] = null;
      });
      setSafetyChecks(initialChecks);
    } catch (error) {
      console.error('Error loading driver data:', error);
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

  const handleSafetyCheck = (itemId: string, passed: boolean) => {
    setSafetyChecks(prev => ({
      ...prev,
      [itemId]: passed,
    }));
    
    if (!passed) {
      const item = SAFETY_CHECK_ITEMS.find(i => i.id === itemId);
      if (item) {
        setDefectNotes(prev => [...prev, item.label]);
      }
    }
  };

  const handleCompleteSafetyCheck = async () => {
    const allChecked = Object.values(safetyChecks).every(v => v !== null);
    if (!allChecked) {
      Alert.alert('Attention', 'Veuillez vérifier tous les éléments avant de terminer.');
      return;
    }

    const hasDefects = Object.values(safetyChecks).some(v => v === false);
    
    if (hasDefects) {
      Alert.alert(
        'Défauts détectés',
        'Des défauts ont été signalés. Un bon de travail sera créé automatiquement.',
        [
          { text: 'Annuler', style: 'cancel' },
          {
            text: 'Confirmer',
            onPress: async () => {
              if (assignedVehicle && currentUser) {
                // Créer un bon de travail
                await createWorkOrder({
                  title: `Réparations suite à ronde de sécurité - ${assignedVehicle.plate}`,
                  vehicleId: assignedVehicle.id,
                  vehicleName: `${assignedVehicle.make} ${assignedVehicle.model} - ${assignedVehicle.plate}`,
                  priority: 'HIGH',
                  status: 'PENDING',
                  description: `Défauts signalés par le chauffeur:\n${defectNotes.map(d => `- ${d}`).join('\n')}`,
                  items: [],
                  estimatedTotalTime: defectNotes.length * 30,
                  estimatedTotalCost: defectNotes.length * 50,
                });
                
                await logActivity(
                  currentUser.id,
                  'driver' as UserRole,
                  'REPORT_DEFECT',
                  'vehicle',
                  assignedVehicle.id,
                  `Défauts signalés: ${defectNotes.join(', ')}`
                );
              }
              
              setSafetyCheckCompleted(true);
              Alert.alert('Terminé', 'Votre ronde de sécurité a été enregistrée et un bon de travail a été créé.');
            },
          },
        ]
      );
    } else {
      // Pas de défauts
      if (currentUser && assignedVehicle) {
        await logActivity(
          currentUser.id,
          'driver' as UserRole,
          'COMPLETE_SAFETY_CHECK',
          'vehicle',
          assignedVehicle.id,
          'Ronde de sécurité complétée sans défaut'
        );
      }
      
      setSafetyCheckCompleted(true);
      Alert.alert('Parfait!', 'Votre véhicule est prêt pour la route.');
    }
  };

  const handleReportDefect = () => {
    if (!assignedVehicle) {
      Alert.alert('Erreur', 'Aucun véhicule assigné');
      return;
    }
    setDefectModalVisible(true);
  };

  const submitDefectReport = async () => {
    if (!defectDescription.trim() || !assignedVehicle || !currentUser) {
      Alert.alert('Erreur', 'Veuillez décrire le problème');
      return;
    }

    await createWorkOrder({
      title: `Défaut signalé - ${assignedVehicle.plate}`,
      vehicleId: assignedVehicle.id,
      vehicleName: `${assignedVehicle.make} ${assignedVehicle.model} - ${assignedVehicle.plate}`,
      priority: 'MEDIUM',
      status: 'PENDING',
      description: `Signalé par le chauffeur: ${defectDescription}`,
      items: [],
      estimatedTotalTime: 60,
      estimatedTotalCost: 100,
    });
    
    await logActivity(
      currentUser.id,
      'driver' as UserRole,
      'REPORT_DEFECT',
      'vehicle',
      assignedVehicle.id,
      defectDescription
    );
    
    setDefectModalVisible(false);
    setDefectDescription('');
    Alert.alert('Signalé', 'Le défaut a été signalé et un bon de travail a été créé.');
  };

  const upcomingReminders = reminders
    .filter(r => new Date(r.dueDate) > new Date())
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 3);

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
    vehicleCard: {
      backgroundColor: colors.primary,
      borderRadius: 16,
      padding: 20,
      marginHorizontal: 16,
      marginTop: 16,
    },
    vehicleHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
    },
    vehicleLabel: {
      fontSize: 13,
      color: 'rgba(255,255,255,0.7)',
    },
    vehiclePlate: {
      fontSize: 28,
      fontWeight: '700',
      color: '#FFFFFF',
      marginTop: 4,
    },
    vehicleModel: {
      fontSize: 15,
      color: 'rgba(255,255,255,0.9)',
      marginTop: 2,
    },
    vehicleStatus: {
      backgroundColor: 'rgba(255,255,255,0.2)',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 8,
    },
    vehicleStatusText: {
      color: '#FFFFFF',
      fontSize: 12,
      fontWeight: '600',
    },
    noVehicleCard: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 24,
      marginHorizontal: 16,
      marginTop: 16,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border,
    },
    noVehicleText: {
      fontSize: 16,
      color: colors.muted,
      marginTop: 12,
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
    safetyCheckCard: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 16,
      borderWidth: 1,
      borderColor: colors.border,
    },
    safetyCheckHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    safetyCheckTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.foreground,
    },
    safetyCheckProgress: {
      fontSize: 13,
      color: colors.muted,
    },
    checkItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    checkItemIcon: {
      width: 36,
      height: 36,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },
    checkItemLabel: {
      flex: 1,
      fontSize: 15,
      color: colors.foreground,
    },
    checkButtons: {
      flexDirection: 'row',
      gap: 8,
    },
    checkButton: {
      width: 40,
      height: 40,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
    },
    completeButton: {
      backgroundColor: colors.success,
      paddingVertical: 14,
      borderRadius: 10,
      alignItems: 'center',
      marginTop: 16,
    },
    completeButtonDisabled: {
      backgroundColor: colors.muted,
    },
    completeButtonText: {
      color: '#FFFFFF',
      fontWeight: '600',
      fontSize: 16,
    },
    completedBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.success + '20',
      paddingVertical: 16,
      borderRadius: 10,
      marginTop: 16,
    },
    completedText: {
      color: colors.success,
      fontWeight: '600',
      fontSize: 16,
      marginLeft: 8,
    },
    quickActions: {
      flexDirection: 'row',
      gap: 12,
    },
    quickAction: {
      flex: 1,
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
    reminderCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderRadius: 10,
      padding: 12,
      marginBottom: 8,
      borderWidth: 1,
      borderColor: colors.border,
    },
    reminderIcon: {
      width: 36,
      height: 36,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },
    reminderInfo: {
      flex: 1,
    },
    reminderTitle: {
      fontSize: 14,
      fontWeight: '500',
      color: colors.foreground,
    },
    reminderDate: {
      fontSize: 12,
      color: colors.muted,
    },
    emptyText: {
      textAlign: 'center',
      color: colors.muted,
      paddingVertical: 20,
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
      padding: 20,
      width: '85%',
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.foreground,
      marginBottom: 16,
    },
    modalInput: {
      backgroundColor: colors.surface,
      borderRadius: 10,
      padding: 12,
      minHeight: 100,
      textAlignVertical: 'top',
      color: colors.foreground,
      borderWidth: 1,
      borderColor: colors.border,
    },
    modalActions: {
      flexDirection: 'row',
      gap: 12,
      marginTop: 16,
    },
    modalButton: {
      flex: 1,
      paddingVertical: 12,
      borderRadius: 10,
      alignItems: 'center',
    },
  });

  const checkedCount = Object.values(safetyChecks).filter(v => v !== null).length;
  const allChecked = checkedCount === SAFETY_CHECK_ITEMS.length;

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
          <Text style={styles.title}>{currentUser?.name || 'Chauffeur'}</Text>
        </View>

        {/* Véhicule assigné */}
        {assignedVehicle ? (
          <View style={styles.vehicleCard}>
            <View style={styles.vehicleHeader}>
              <View>
                <Text style={styles.vehicleLabel}>Mon véhicule</Text>
                <Text style={styles.vehiclePlate}>{assignedVehicle.plate}</Text>
                <Text style={styles.vehicleModel}>
                  {assignedVehicle.make} {assignedVehicle.model} {assignedVehicle.year}
                </Text>
              </View>
              <View style={styles.vehicleStatus}>
                <Text style={styles.vehicleStatusText}>
                  {assignedVehicle.status === 'active' ? 'Actif' : 'En maintenance'}
                </Text>
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.noVehicleCard}>
            <Ionicons name="car-outline" size={48} color={colors.muted} />
            <Text style={styles.noVehicleText}>Aucun véhicule assigné</Text>
          </View>
        )}

        {/* Ronde de sécurité */}
        {assignedVehicle && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Ronde de sécurité quotidienne</Text>
            <View style={styles.safetyCheckCard}>
              <View style={styles.safetyCheckHeader}>
                <Text style={styles.safetyCheckTitle}>Vérifications</Text>
                <Text style={styles.safetyCheckProgress}>
                  {checkedCount}/{SAFETY_CHECK_ITEMS.length}
                </Text>
              </View>
              
              {SAFETY_CHECK_ITEMS.map((item, index) => (
                <View
                  key={item.id}
                  style={[
                    styles.checkItem,
                    index === SAFETY_CHECK_ITEMS.length - 1 && { borderBottomWidth: 0 },
                  ]}
                >
                  <View style={[styles.checkItemIcon, { backgroundColor: colors.primary + '20' }]}>
                    <Ionicons name={item.icon as any} size={18} color={colors.primary} />
                  </View>
                  <Text style={styles.checkItemLabel}>{item.label}</Text>
                  <View style={styles.checkButtons}>
                    <Pressable
                      style={[
                        styles.checkButton,
                        {
                          backgroundColor:
                            safetyChecks[item.id] === true
                              ? colors.success
                              : colors.success + '20',
                        },
                      ]}
                      onPress={() => handleSafetyCheck(item.id, true)}
                    >
                      <Ionicons
                        name="checkmark"
                        size={20}
                        color={safetyChecks[item.id] === true ? '#FFFFFF' : colors.success}
                      />
                    </Pressable>
                    <Pressable
                      style={[
                        styles.checkButton,
                        {
                          backgroundColor:
                            safetyChecks[item.id] === false
                              ? colors.error
                              : colors.error + '20',
                        },
                      ]}
                      onPress={() => handleSafetyCheck(item.id, false)}
                    >
                      <Ionicons
                        name="close"
                        size={20}
                        color={safetyChecks[item.id] === false ? '#FFFFFF' : colors.error}
                      />
                    </Pressable>
                  </View>
                </View>
              ))}
              
              {safetyCheckCompleted ? (
                <View style={styles.completedBadge}>
                  <Ionicons name="checkmark-circle" size={24} color={colors.success} />
                  <Text style={styles.completedText}>Ronde complétée</Text>
                </View>
              ) : (
                <Pressable
                  style={[
                    styles.completeButton,
                    !allChecked && styles.completeButtonDisabled,
                  ]}
                  onPress={handleCompleteSafetyCheck}
                  disabled={!allChecked}
                >
                  <Text style={styles.completeButtonText}>Terminer la ronde</Text>
                </Pressable>
              )}
            </View>
          </View>
        )}

        {/* Actions rapides */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Actions rapides</Text>
          <View style={styles.quickActions}>
            <Pressable
              style={styles.quickAction}
              onPress={handleReportDefect}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: colors.error + '20' }]}>
                <Ionicons name="warning" size={24} color={colors.error} />
              </View>
              <Text style={styles.quickActionText}>Signaler un défaut</Text>
            </Pressable>
            <Pressable
              style={styles.quickAction}
              onPress={() => router.push('/reminders')}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: colors.warning + '20' }]}>
                <Ionicons name="calendar" size={24} color={colors.warning} />
              </View>
              <Text style={styles.quickActionText}>Mes rappels</Text>
            </Pressable>
            <Pressable
              style={styles.quickAction}
              onPress={() => router.push('/(tabs)/settings')}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: colors.primary + '20' }]}>
                <Ionicons name="help-circle" size={24} color={colors.primary} />
              </View>
              <Text style={styles.quickActionText}>Aide</Text>
            </Pressable>
          </View>
        </View>

        {/* Rappels */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Prochains rappels</Text>
          {upcomingReminders.length === 0 ? (
            <Text style={styles.emptyText}>Aucun rappel à venir</Text>
          ) : (
            upcomingReminders.map((reminder) => (
              <View key={reminder.id} style={styles.reminderCard}>
                <View style={[styles.reminderIcon, { backgroundColor: colors.warning + '20' }]}>
                  <Ionicons name="notifications" size={18} color={colors.warning} />
                </View>
                <View style={styles.reminderInfo}>
                  <Text style={styles.reminderTitle}>{reminder.title}</Text>
                  <Text style={styles.reminderDate}>
                    {new Date(reminder.dueDate).toLocaleDateString('fr-CA', {
                      day: 'numeric',
                      month: 'short',
                    })}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.muted} />
              </View>
            ))
          )}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Modal de signalement de défaut */}
      <Modal
        visible={defectModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setDefectModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Signaler un défaut</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Décrivez le problème observé..."
              placeholderTextColor={colors.muted}
              value={defectDescription}
              onChangeText={setDefectDescription}
              multiline
            />
            <View style={styles.modalActions}>
              <Pressable
                style={[styles.modalButton, { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }]}
                onPress={() => setDefectModalVisible(false)}
              >
                <Text style={{ color: colors.foreground, fontWeight: '600' }}>Annuler</Text>
              </Pressable>
              <Pressable
                style={[styles.modalButton, { backgroundColor: colors.error }]}
                onPress={submitDefectReport}
              >
                <Text style={{ color: '#FFFFFF', fontWeight: '600' }}>Signaler</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}
