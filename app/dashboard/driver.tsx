/**
 * FleetCore - Dashboard Chauffeur
 * 
 * Interface simplifiée pour les chauffeurs avec:
 * - Véhicule assigné
 * - Formulaires Jotform intégrés (ronde de sécurité, défauts, incidents)
 * - Signalement de défauts avec diagnostic IA
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
  Linking,
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
import { 
  JOTFORM_CONFIG, 
  getFormUrl, 
  getAllForms,
  saveSubmissionLocally,
  getJotformStats,
  type JotformFormType,
  type JotformStats,
} from '@/lib/jotform-service';
import { quickDiagnostic, getUrgencyColor, getUrgencyLabel } from '@/lib/perplexity-service';

// Éléments de la ronde de sécurité quotidienne (version simplifiée pour l'app)
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

// Catégories de défauts
const DEFECT_CATEGORIES = [
  { id: 'engine', label: 'Moteur', icon: 'cog' },
  { id: 'brakes', label: 'Freins', icon: 'stop-circle' },
  { id: 'tires', label: 'Pneus', icon: 'ellipse' },
  { id: 'electrical', label: 'Électrique', icon: 'flash' },
  { id: 'body', label: 'Carrosserie', icon: 'car' },
  { id: 'lights', label: 'Éclairage', icon: 'flashlight' },
  { id: 'steering', label: 'Direction', icon: 'navigate' },
  { id: 'other', label: 'Autre', icon: 'help-circle' },
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
  const [jotformStats, setJotformStats] = useState<JotformStats | null>(null);
  
  // Modal de signalement de défaut
  const [defectModalVisible, setDefectModalVisible] = useState(false);
  const [defectCategory, setDefectCategory] = useState<string>('');
  const [defectSeverity, setDefectSeverity] = useState<'minor' | 'major' | 'critical'>('minor');
  const [defectDescription, setDefectDescription] = useState('');
  const [defectLocation, setDefectLocation] = useState('');
  const [showDiagnostic, setShowDiagnostic] = useState(false);
  const [diagnosticResult, setDiagnosticResult] = useState<any>(null);

  const loadData = useCallback(async () => {
    try {
      const [v, rem, user, stats] = await Promise.all([
        getVehicles(),
        getReminders(),
        getCurrentUser(),
        getJotformStats(),
      ]);
      setVehicles(v);
      setReminders(rem);
      setCurrentUser(user);
      setJotformStats(stats);
      
      // Trouver le véhicule assigné au chauffeur
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
        'Des défauts ont été signalés. Voulez-vous remplir le formulaire détaillé Jotform pour documenter les problèmes avec photos?',
        [
          { 
            text: 'Plus tard', 
            style: 'cancel',
            onPress: async () => {
              await completeSafetyCheckWithDefects();
            }
          },
          {
            text: 'Ouvrir formulaire',
            onPress: () => {
              openJotformDefectReport();
            },
          },
        ]
      );
    } else {
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

  const completeSafetyCheckWithDefects = async () => {
    if (assignedVehicle && currentUser) {
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
  };

  // Ouvrir un formulaire Jotform
  const openJotformForm = async (formType: JotformFormType) => {
    const prefillData: Record<string, string> = {};
    
    if (currentUser) {
      prefillData['driverName'] = currentUser.name || '';
      prefillData['driverId'] = currentUser.id || '';
    }
    
    if (assignedVehicle) {
      prefillData['vehicleNumber'] = assignedVehicle.unit || '';
      prefillData['licensePlate'] = assignedVehicle.plate || '';
      prefillData['vehicleFleetNumber'] = assignedVehicle.unit || '';
      prefillData['vehiclePlate'] = assignedVehicle.plate || '';
    }
    
    const url = getFormUrl(formType, prefillData);
    
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
        
        if (currentUser) {
          await logActivity(
            currentUser.id,
            'driver' as UserRole,
            'OPEN_JOTFORM',
            'form',
            JOTFORM_CONFIG[formType].id,
            `Formulaire ouvert: ${JOTFORM_CONFIG[formType].name}`
          );
        }
      } else {
        Alert.alert('Erreur', 'Impossible d\'ouvrir le formulaire');
      }
    } catch (error) {
      console.error('Error opening Jotform:', error);
      Alert.alert('Erreur', 'Une erreur est survenue lors de l\'ouverture du formulaire');
    }
  };

  const openJotformDefectReport = () => {
    openJotformForm('DEFECT_REPORT');
  };

  // Signalement de défaut avec diagnostic IA
  const handleReportDefect = () => {
    if (!assignedVehicle) {
      Alert.alert('Erreur', 'Aucun véhicule assigné');
      return;
    }
    setDefectModalVisible(true);
    setDefectCategory('');
    setDefectSeverity('minor');
    setDefectDescription('');
    setDefectLocation('');
    setShowDiagnostic(false);
    setDiagnosticResult(null);
  };

  const runQuickDiagnostic = () => {
    if (!defectCategory || !defectDescription) {
      Alert.alert('Information manquante', 'Veuillez sélectionner une catégorie et décrire le problème');
      return;
    }
    
    const result = quickDiagnostic(defectCategory, defectSeverity, defectDescription);
    setDiagnosticResult(result);
    setShowDiagnostic(true);
  };

  const submitDefectReport = async () => {
    if (!defectDescription.trim() || !assignedVehicle || !currentUser || !defectCategory) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires');
      return;
    }

    // Sauvegarder localement
    await saveSubmissionLocally('DEFECT_REPORT', {
      driverName: currentUser.name || '',
      driverId: currentUser.id,
      vehicleFleetNumber: assignedVehicle.unit || '',
      vehiclePlate: assignedVehicle.plate,
      defectCategory: defectCategory as any,
      severityLevel: defectSeverity,
      description: defectDescription,
      locationOnVehicle: defectLocation,
      photos: [],
      dateTimeNoticed: new Date().toISOString(),
      isSafeToDrive: defectSeverity !== 'critical',
      recommendedAction: diagnosticResult?.recommendations?.[0] || 'Inspection requise',
      signature: currentUser.name || '',
    });

    // Créer un bon de travail
    await createWorkOrder({
      title: `Défaut ${defectCategory} - ${assignedVehicle.plate}`,
      vehicleId: assignedVehicle.id,
      vehicleName: `${assignedVehicle.make} ${assignedVehicle.model} - ${assignedVehicle.plate}`,
      priority: defectSeverity === 'critical' ? 'URGENT' : defectSeverity === 'major' ? 'HIGH' : 'MEDIUM',
      status: 'PENDING',
      description: `Catégorie: ${defectCategory}\nSévérité: ${defectSeverity}\nLocalisation: ${defectLocation}\n\nDescription: ${defectDescription}\n\n${diagnosticResult ? `Diagnostic préliminaire:\n${diagnosticResult.probableCauses?.map((c: any) => `- ${c.cause}`).join('\n') || 'N/A'}` : ''}`,
      items: [],
      estimatedTotalTime: diagnosticResult?.costEstimate?.laborMax ? diagnosticResult.costEstimate.laborMax / 50 * 60 : 60,
      estimatedTotalCost: diagnosticResult?.costEstimate?.totalMax || 200,
    });
    
    await logActivity(
      currentUser.id,
      'driver' as UserRole,
      'REPORT_DEFECT',
      'vehicle',
      assignedVehicle.id,
      `${defectCategory}: ${defectDescription}`
    );
    
    setDefectModalVisible(false);
    
    Alert.alert(
      'Signalé',
      'Le défaut a été signalé. Voulez-vous remplir le formulaire Jotform complet avec photos?',
      [
        { text: 'Non merci', style: 'cancel' },
        { text: 'Ouvrir formulaire', onPress: () => openJotformForm('DEFECT_REPORT') },
      ]
    );
  };

  const upcomingReminders = reminders
    .filter(r => new Date(r.dueDate) > new Date())
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 3);

  const jotformForms = getAllForms();

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
    vehicleInfo: {
      fontSize: 14,
      color: 'rgba(255,255,255,0.9)',
      marginTop: 8,
    },
    statusBadge: {
      backgroundColor: 'rgba(255,255,255,0.2)',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 20,
    },
    statusText: {
      color: '#FFFFFF',
      fontSize: 12,
      fontWeight: '600',
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
    // Formulaires Jotform
    formCardsRow: {
      flexDirection: 'row',
      gap: 12,
    },
    formCard: {
      flex: 1,
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 16,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border,
    },
    formIcon: {
      width: 48,
      height: 48,
      borderRadius: 24,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 8,
    },
    formName: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.foreground,
      textAlign: 'center',
    },
    formDescription: {
      fontSize: 11,
      color: colors.muted,
      textAlign: 'center',
      marginTop: 4,
    },
    // Ronde de sécurité
    safetyCard: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 16,
      borderWidth: 1,
      borderColor: colors.border,
    },
    safetyHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    safetyTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.foreground,
    },
    safetyProgress: {
      fontSize: 12,
      color: colors.muted,
    },
    checkItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 10,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    checkIcon: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: colors.background,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },
    checkLabel: {
      flex: 1,
      fontSize: 14,
      color: colors.foreground,
    },
    checkButtons: {
      flexDirection: 'row',
      gap: 8,
    },
    checkButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 2,
    },
    completeButton: {
      backgroundColor: colors.primary,
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
      paddingVertical: 12,
      borderRadius: 10,
      marginTop: 16,
    },
    completedText: {
      color: colors.success,
      fontWeight: '600',
      marginLeft: 8,
    },
    // Actions rapides
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
      borderRadius: 24,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 8,
    },
    quickActionLabel: {
      fontSize: 12,
      fontWeight: '500',
      color: colors.foreground,
      textAlign: 'center',
    },
    // Rappels
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
      width: 40,
      height: 40,
      borderRadius: 20,
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
      marginTop: 2,
    },
    emptyText: {
      textAlign: 'center',
      color: colors.muted,
      paddingVertical: 20,
    },
    noVehicle: {
      backgroundColor: colors.warning + '20',
      borderRadius: 12,
      padding: 20,
      marginHorizontal: 16,
      marginTop: 16,
      alignItems: 'center',
    },
    noVehicleText: {
      fontSize: 16,
      color: colors.warning,
      fontWeight: '500',
      marginTop: 8,
    },
    // Modal
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'flex-end',
    },
    modalContent: {
      backgroundColor: colors.background,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      padding: 20,
      maxHeight: '90%',
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 20,
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: colors.foreground,
    },
    modalLabel: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.foreground,
      marginBottom: 8,
      marginTop: 16,
    },
    categoryGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    categoryButton: {
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    categoryButtonSelected: {
      borderColor: colors.primary,
      backgroundColor: colors.primary + '20',
    },
    categoryText: {
      fontSize: 13,
      color: colors.foreground,
    },
    severityRow: {
      flexDirection: 'row',
      gap: 8,
    },
    severityButton: {
      flex: 1,
      paddingVertical: 12,
      borderRadius: 8,
      borderWidth: 2,
      alignItems: 'center',
    },
    severityText: {
      fontSize: 13,
      fontWeight: '600',
    },
    textInput: {
      backgroundColor: colors.surface,
      borderRadius: 10,
      padding: 14,
      fontSize: 14,
      color: colors.foreground,
      borderWidth: 1,
      borderColor: colors.border,
      minHeight: 80,
      textAlignVertical: 'top',
    },
    textInputSmall: {
      minHeight: 44,
    },
    diagnosticButton: {
      backgroundColor: colors.primary + '20',
      paddingVertical: 12,
      borderRadius: 10,
      alignItems: 'center',
      marginTop: 16,
      flexDirection: 'row',
      justifyContent: 'center',
      gap: 8,
    },
    diagnosticButtonText: {
      color: colors.primary,
      fontWeight: '600',
    },
    diagnosticResult: {
      backgroundColor: colors.surface,
      borderRadius: 10,
      padding: 14,
      marginTop: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    diagnosticHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
    },
    diagnosticTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.foreground,
      marginLeft: 8,
    },
    diagnosticCause: {
      fontSize: 13,
      color: colors.foreground,
      marginBottom: 4,
    },
    diagnosticCost: {
      fontSize: 13,
      color: colors.muted,
      marginTop: 8,
    },
    submitButton: {
      backgroundColor: colors.primary,
      paddingVertical: 14,
      borderRadius: 10,
      alignItems: 'center',
      marginTop: 20,
    },
    submitButtonText: {
      color: '#FFFFFF',
      fontWeight: '600',
      fontSize: 16,
    },
    jotformLink: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 12,
      marginTop: 8,
    },
    jotformLinkText: {
      color: colors.primary,
      fontSize: 14,
      marginLeft: 6,
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
          <Text style={styles.greeting}>Bonjour{currentUser?.name ? `, ${currentUser.name}` : ''}</Text>
          <Text style={styles.title}>Mon véhicule</Text>
        </View>

        {/* Véhicule assigné */}
        {assignedVehicle ? (
          <View style={styles.vehicleCard}>
            <View style={styles.vehicleHeader}>
              <View>
                <Text style={styles.vehicleLabel}>Véhicule assigné</Text>
                <Text style={styles.vehiclePlate}>{assignedVehicle.plate}</Text>
              </View>
              <View style={styles.statusBadge}>
                <Text style={styles.statusText}>
                  {assignedVehicle.status === 'active' ? 'Actif' : 'En maintenance'}
                </Text>
              </View>
            </View>
            <Text style={styles.vehicleInfo}>
              {assignedVehicle.make} {assignedVehicle.model} • {assignedVehicle.year}
            </Text>
            <Text style={styles.vehicleInfo}>
              Unité: {assignedVehicle.unit}
            </Text>
          </View>
        ) : (
          <View style={styles.noVehicle}>
            <Ionicons name="car-outline" size={48} color={colors.warning} />
            <Text style={styles.noVehicleText}>Aucun véhicule assigné</Text>
          </View>
        )}

        {/* Formulaires Jotform */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Formulaires</Text>
            {jotformStats && (
              <Text style={styles.seeAll}>{jotformStats.todaySubmissions} aujourd'hui</Text>
            )}
          </View>
          <View style={styles.formCardsRow}>
            {jotformForms.map((form) => (
              <Pressable
                key={form.type}
                style={({ pressed }) => [
                  styles.formCard,
                  pressed && { opacity: 0.7 },
                ]}
                onPress={() => openJotformForm(form.type)}
              >
                <View style={[styles.formIcon, { 
                  backgroundColor: form.type === 'DAILY_INSPECTION' ? colors.primary + '20' :
                                   form.type === 'DEFECT_REPORT' ? colors.warning + '20' :
                                   colors.error + '20'
                }]}>
                  <Ionicons 
                    name={form.icon as any} 
                    size={24} 
                    color={form.type === 'DAILY_INSPECTION' ? colors.primary :
                           form.type === 'DEFECT_REPORT' ? colors.warning :
                           colors.error} 
                  />
                </View>
                <Text style={styles.formName}>{form.name}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Ronde de sécurité rapide */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ronde de sécurité rapide</Text>
          <View style={styles.safetyCard}>
            <View style={styles.safetyHeader}>
              <Text style={styles.safetyTitle}>Vérification quotidienne</Text>
              <Text style={styles.safetyProgress}>{checkedCount}/{SAFETY_CHECK_ITEMS.length}</Text>
            </View>
            
            {SAFETY_CHECK_ITEMS.map((item, index) => (
              <View 
                key={item.id} 
                style={[
                  styles.checkItem,
                  index === SAFETY_CHECK_ITEMS.length - 1 && { borderBottomWidth: 0 }
                ]}
              >
                <View style={styles.checkIcon}>
                  <Ionicons name={item.icon as any} size={18} color={colors.primary} />
                </View>
                <Text style={styles.checkLabel}>{item.label}</Text>
                <View style={styles.checkButtons}>
                  <Pressable
                    style={[
                      styles.checkButton,
                      { borderColor: colors.success },
                      safetyChecks[item.id] === true && { backgroundColor: colors.success },
                    ]}
                    onPress={() => handleSafetyCheck(item.id, true)}
                  >
                    <Ionicons 
                      name="checkmark" 
                      size={18} 
                      color={safetyChecks[item.id] === true ? '#FFFFFF' : colors.success} 
                    />
                  </Pressable>
                  <Pressable
                    style={[
                      styles.checkButton,
                      { borderColor: colors.error },
                      safetyChecks[item.id] === false && { backgroundColor: colors.error },
                    ]}
                    onPress={() => handleSafetyCheck(item.id, false)}
                  >
                    <Ionicons 
                      name="close" 
                      size={18} 
                      color={safetyChecks[item.id] === false ? '#FFFFFF' : colors.error} 
                    />
                  </Pressable>
                </View>
              </View>
            ))}
            
            {safetyCheckCompleted ? (
              <View style={styles.completedBadge}>
                <Ionicons name="checkmark-circle" size={20} color={colors.success} />
                <Text style={styles.completedText}>Ronde complétée</Text>
              </View>
            ) : (
              <>
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
                <Pressable
                  style={styles.jotformLink}
                  onPress={() => openJotformForm('DAILY_INSPECTION')}
                >
                  <Ionicons name="document-text-outline" size={18} color={colors.primary} />
                  <Text style={styles.jotformLinkText}>Formulaire complet avec photos</Text>
                </Pressable>
              </>
            )}
          </View>
        </View>

        {/* Actions rapides */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Actions rapides</Text>
          <View style={styles.quickActions}>
            <Pressable
              style={({ pressed }) => [
                styles.quickAction,
                pressed && { opacity: 0.7 },
              ]}
              onPress={handleReportDefect}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: colors.warning + '20' }]}>
                <Ionicons name="warning" size={24} color={colors.warning} />
              </View>
              <Text style={styles.quickActionLabel}>Signaler{'\n'}un défaut</Text>
            </Pressable>
            
            <Pressable
              style={({ pressed }) => [
                styles.quickAction,
                pressed && { opacity: 0.7 },
              ]}
              onPress={() => openJotformForm('INCIDENT_REPORT')}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: colors.error + '20' }]}>
                <Ionicons name="alert-circle" size={24} color={colors.error} />
              </View>
              <Text style={styles.quickActionLabel}>Rapport{'\n'}d'incident</Text>
            </Pressable>
            
            <Pressable
              style={({ pressed }) => [
                styles.quickAction,
                pressed && { opacity: 0.7 },
              ]}
              onPress={() => router.push('/reminders')}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: colors.primary + '20' }]}>
                <Ionicons name="calendar" size={24} color={colors.primary} />
              </View>
              <Text style={styles.quickActionLabel}>Mes{'\n'}rappels</Text>
            </Pressable>
          </View>
        </View>

        {/* Rappels */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Prochains rappels</Text>
            <Pressable onPress={() => router.push('/reminders')}>
              <Text style={styles.seeAll}>Voir tous</Text>
            </Pressable>
          </View>
          {upcomingReminders.length === 0 ? (
            <Text style={styles.emptyText}>Aucun rappel à venir</Text>
          ) : (
            upcomingReminders.map((reminder) => (
              <View key={reminder.id} style={styles.reminderCard}>
                <View style={[styles.reminderIcon, { backgroundColor: colors.primary + '20' }]}>
                  <Ionicons name="notifications" size={20} color={colors.primary} />
                </View>
                <View style={styles.reminderInfo}>
                  <Text style={styles.reminderTitle}>{reminder.title}</Text>
                  <Text style={styles.reminderDate}>
                    {new Date(reminder.dueDate).toLocaleDateString('fr-CA')}
                  </Text>
                </View>
              </View>
            ))
          )}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Modal de signalement de défaut */}
      <Modal
        visible={defectModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setDefectModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <ScrollView style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Signaler un défaut</Text>
              <Pressable onPress={() => setDefectModalVisible(false)}>
                <Ionicons name="close" size={24} color={colors.foreground} />
              </Pressable>
            </View>

            <Text style={styles.modalLabel}>Catégorie *</Text>
            <View style={styles.categoryGrid}>
              {DEFECT_CATEGORIES.map((cat) => (
                <Pressable
                  key={cat.id}
                  style={[
                    styles.categoryButton,
                    defectCategory === cat.id && styles.categoryButtonSelected,
                  ]}
                  onPress={() => setDefectCategory(cat.id)}
                >
                  <Ionicons 
                    name={cat.icon as any} 
                    size={16} 
                    color={defectCategory === cat.id ? colors.primary : colors.muted} 
                  />
                  <Text style={styles.categoryText}>{cat.label}</Text>
                </Pressable>
              ))}
            </View>

            <Text style={styles.modalLabel}>Sévérité *</Text>
            <View style={styles.severityRow}>
              {(['minor', 'major', 'critical'] as const).map((sev) => (
                <Pressable
                  key={sev}
                  style={[
                    styles.severityButton,
                    {
                      borderColor: sev === 'minor' ? colors.success :
                                   sev === 'major' ? colors.warning : colors.error,
                      backgroundColor: defectSeverity === sev ? 
                        (sev === 'minor' ? colors.success + '20' :
                         sev === 'major' ? colors.warning + '20' : colors.error + '20') :
                        'transparent',
                    },
                  ]}
                  onPress={() => setDefectSeverity(sev)}
                >
                  <Text style={[
                    styles.severityText,
                    {
                      color: sev === 'minor' ? colors.success :
                             sev === 'major' ? colors.warning : colors.error,
                    },
                  ]}>
                    {sev === 'minor' ? 'Mineur' : sev === 'major' ? 'Majeur' : 'Critique'}
                  </Text>
                </Pressable>
              ))}
            </View>

            <Text style={styles.modalLabel}>Description du problème *</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Décrivez le problème en détail..."
              placeholderTextColor={colors.muted}
              multiline
              value={defectDescription}
              onChangeText={setDefectDescription}
            />

            <Text style={styles.modalLabel}>Localisation sur le véhicule</Text>
            <TextInput
              style={[styles.textInput, styles.textInputSmall]}
              placeholder="Ex: Roue avant gauche, tableau de bord..."
              placeholderTextColor={colors.muted}
              value={defectLocation}
              onChangeText={setDefectLocation}
            />

            {/* Bouton diagnostic IA */}
            <Pressable
              style={styles.diagnosticButton}
              onPress={runQuickDiagnostic}
            >
              <Ionicons name="analytics" size={20} color={colors.primary} />
              <Text style={styles.diagnosticButtonText}>Obtenir un diagnostic préliminaire</Text>
            </Pressable>

            {/* Résultat du diagnostic */}
            {showDiagnostic && diagnosticResult && (
              <View style={styles.diagnosticResult}>
                <View style={styles.diagnosticHeader}>
                  <Ionicons 
                    name="medical" 
                    size={20} 
                    color={getUrgencyColor(diagnosticResult.urgencyLevel)} 
                  />
                  <Text style={styles.diagnosticTitle}>
                    Urgence: {getUrgencyLabel(diagnosticResult.urgencyLevel)}
                  </Text>
                </View>
                
                <Text style={{ fontSize: 12, color: colors.muted, marginBottom: 8 }}>
                  Causes probables:
                </Text>
                {diagnosticResult.probableCauses?.slice(0, 3).map((cause: any, i: number) => (
                  <Text key={i} style={styles.diagnosticCause}>
                    • {cause.cause}
                  </Text>
                ))}
                
                {diagnosticResult.costEstimate && (
                  <Text style={styles.diagnosticCost}>
                    💰 Coût estimé: {diagnosticResult.costEstimate.totalMin} - {diagnosticResult.costEstimate.totalMax} {diagnosticResult.costEstimate.currency}
                  </Text>
                )}
              </View>
            )}

            <Pressable
              style={styles.submitButton}
              onPress={submitDefectReport}
            >
              <Text style={styles.submitButtonText}>Soumettre le signalement</Text>
            </Pressable>

            <Pressable
              style={styles.jotformLink}
              onPress={() => {
                setDefectModalVisible(false);
                openJotformForm('DEFECT_REPORT');
              }}
            >
              <Ionicons name="camera-outline" size={18} color={colors.primary} />
              <Text style={styles.jotformLinkText}>Formulaire complet avec photos</Text>
            </Pressable>

            <View style={{ height: 40 }} />
          </ScrollView>
        </View>
      </Modal>
    </ScreenContainer>
  );
}
