import { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, TextInput } from 'react-native';
import { useLocalSearchParams, router, useFocusEffect } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';
import { useTheme } from '@/lib/theme-context';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { 
  getWorkOrder, 
  updateWorkOrder,
  startWorkOrder,
  completeWorkOrder,
  cancelWorkOrder,
  updateWorkOrderItem,
  assignTechnician,
  type WorkOrder, 
  type WorkOrderItem,
  type WorkOrderStatus,
  type WorkOrderPriority 
} from '@/lib/work-order-service';
import { getTechnicians, type Technician } from '@/lib/data-service';
import { WorkTimer, getTimerSessions, getTotalTimeForWorkOrder, type TimerSession } from '@/components/work-timer';
import { PartsSelector, type SelectedPart } from '@/components/parts-selector';

const statusConfig: Record<WorkOrderStatus, { label: string; color: string; icon: string }> = {
  DRAFT: { label: 'Brouillon', color: '#64748B', icon: 'doc.fill' },
  PENDING: { label: 'En attente', color: '#F59E0B', icon: 'clock.fill' },
  ASSIGNED: { label: 'Assigné', color: '#3B82F6', icon: 'person.fill' },
  IN_PROGRESS: { label: 'En cours', color: '#8B5CF6', icon: 'wrench.fill' },
  COMPLETED: { label: 'Complété', color: '#22C55E', icon: 'checkmark.circle.fill' },
  CANCELLED: { label: 'Annulé', color: '#EF4444', icon: 'xmark.circle.fill' },
};

const priorityConfig: Record<WorkOrderPriority, { label: string; color: string }> = {
  LOW: { label: 'Basse', color: '#64748B' },
  MEDIUM: { label: 'Moyenne', color: '#3B82F6' },
  HIGH: { label: 'Haute', color: '#F59E0B' },
  URGENT: { label: 'Urgente', color: '#EF4444' },
};

export default function WorkOrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useTheme();
  const [workOrder, setWorkOrder] = useState<WorkOrder | null>(null);
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTechnicianPicker, setShowTechnicianPicker] = useState(false);
  const [totalLoggedTime, setTotalLoggedTime] = useState(0);
  const [timerSessions, setTimerSessions] = useState<TimerSession[]>([]);
  const [selectedParts, setSelectedParts] = useState<SelectedPart[]>([]);

  const loadData = async () => {
    if (!id) return;
    try {
      const [orderData, techData] = await Promise.all([
        getWorkOrder(id),
        getTechnicians(),
      ]);
      setWorkOrder(orderData);
      setTechnicians(techData);
      
      // Load timer data
      if (orderData) {
        const [totalTime, sessions] = await Promise.all([
          getTotalTimeForWorkOrder(id),
          getTimerSessions(id),
        ]);
        setTotalLoggedTime(totalTime);
        setTimerSessions(sessions);
      }
    } catch (error) {
      console.error('Error loading work order:', error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [id])
  );

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('fr-CA', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('fr-CA', {
      style: 'currency',
      currency: 'CAD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}min` : `${mins}min`;
  };

  const handleAssignTechnician = async (tech: Technician) => {
    if (!workOrder) return;
    try {
      const updated = await assignTechnician(workOrder.id, tech.id, tech.name);
      if (updated) {
        setWorkOrder(updated);
        setShowTechnicianPicker(false);
      }
    } catch (error) {
      Alert.alert('Erreur', 'Impossible d\'assigner le technicien');
    }
  };

  const handleStartWork = async () => {
    if (!workOrder) return;
    Alert.alert(
      'Démarrer le travail',
      'Voulez-vous commencer ce bon de travail ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Démarrer',
          onPress: async () => {
            const updated = await startWorkOrder(workOrder.id);
            if (updated) setWorkOrder(updated);
          },
        },
      ]
    );
  };

  const handleCompleteWork = async () => {
    if (!workOrder) return;
    Alert.alert(
      'Terminer le travail',
      'Voulez-vous marquer ce bon de travail comme complété ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Terminer',
          style: 'default',
          onPress: async () => {
            const updated = await completeWorkOrder(workOrder.id);
            if (updated) setWorkOrder(updated);
          },
        },
      ]
    );
  };

  const handleCancelWork = async () => {
    if (!workOrder) return;
    Alert.alert(
      'Annuler le bon',
      'Voulez-vous annuler ce bon de travail ?',
      [
        { text: 'Non', style: 'cancel' },
        {
          text: 'Oui, annuler',
          style: 'destructive',
          onPress: async () => {
            const updated = await cancelWorkOrder(workOrder.id);
            if (updated) setWorkOrder(updated);
          },
        },
      ]
    );
  };

  const handleToggleItemStatus = async (item: WorkOrderItem) => {
    if (!workOrder) return;
    const newStatus = item.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED';
    const updated = await updateWorkOrderItem(workOrder.id, item.id, { status: newStatus });
    if (updated) setWorkOrder(updated);
  };

  if (loading) {
    return (
      <ScreenContainer className="items-center justify-center">
        <Text style={{ color: colors.muted }}>Chargement...</Text>
      </ScreenContainer>
    );
  }

  if (!workOrder) {
    return (
      <ScreenContainer className="items-center justify-center">
        <Text style={{ color: colors.muted }}>Bon de travail non trouvé</Text>
      </ScreenContainer>
    );
  }

  const status = statusConfig[workOrder.status];
  const priority = priorityConfig[workOrder.priority];
  const completedItems = workOrder.items.filter(i => i.status === 'COMPLETED').length;
  const progress = workOrder.items.length > 0 
    ? Math.round((completedItems / workOrder.items.length) * 100) 
    : 0;

  return (
    <ScreenContainer>
      {/* Header */}
      <View className="flex-row items-center px-4 py-4">
        <TouchableOpacity onPress={() => router.back()} className="mr-3">
          <IconSymbol name="chevron.left" size={24} color={colors.foreground} />
        </TouchableOpacity>
        <View className="flex-1">
          <Text className="text-xs font-mono" style={{ color: colors.muted }}>
            {workOrder.orderNumber}
          </Text>
          <Text className="text-xl font-bold" style={{ color: colors.foreground }}>
            Bon de travail
          </Text>
        </View>
        <View
          className="flex-row items-center px-3 py-1 rounded-full"
          style={{ backgroundColor: status.color + '20' }}
        >
          <IconSymbol name={status.icon as any} size={14} color={status.color} />
          <Text className="text-sm ml-1 font-medium" style={{ color: status.color }}>
            {status.label}
          </Text>
        </View>
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Info Card */}
        <View className="mx-4 mb-4 rounded-xl p-4" style={{ backgroundColor: colors.surface }}>
          <Text className="text-lg font-semibold mb-2" style={{ color: colors.foreground }}>
            {workOrder.title}
          </Text>
          <Text className="text-sm mb-4" style={{ color: colors.muted }}>
            {workOrder.description}
          </Text>

          <View className="flex-row items-center mb-2">
            <IconSymbol name="car.fill" size={16} color={colors.primary} />
            <Text className="text-sm ml-2" style={{ color: colors.foreground }}>
              {workOrder.vehicleName}
            </Text>
          </View>

          <View className="flex-row items-center mb-2">
            <IconSymbol name="calendar" size={16} color={colors.muted} />
            <Text className="text-sm ml-2" style={{ color: colors.muted }}>
              Créé le {formatDate(workOrder.createdAt)}
            </Text>
          </View>

          <View className="flex-row items-center">
            <View
              className="px-2 py-1 rounded"
              style={{ backgroundColor: priority.color + '20' }}
            >
              <Text className="text-xs font-semibold" style={{ color: priority.color }}>
                Priorité {priority.label}
              </Text>
            </View>
          </View>
        </View>

        {/* Technician */}
        <View className="mx-4 mb-4 rounded-xl p-4" style={{ backgroundColor: colors.surface }}>
          <Text className="text-sm font-semibold mb-3" style={{ color: colors.muted }}>
            TECHNICIEN ASSIGNÉ
          </Text>
          {workOrder.technicianName ? (
            <View className="flex-row items-center">
              <View className="w-10 h-10 rounded-full items-center justify-center" style={{ backgroundColor: colors.primary + '20' }}>
                <IconSymbol name="person.fill" size={20} color={colors.primary} />
              </View>
              <Text className="text-base font-semibold ml-3" style={{ color: colors.foreground }}>
                {workOrder.technicianName}
              </Text>
            </View>
          ) : (
            <TouchableOpacity
              className="flex-row items-center justify-center py-3 rounded-lg border border-dashed"
              style={{ borderColor: colors.border }}
              onPress={() => setShowTechnicianPicker(true)}
            >
              <IconSymbol name="person.badge.plus" size={20} color={colors.primary} />
              <Text className="text-sm font-medium ml-2" style={{ color: colors.primary }}>
                Assigner un technicien
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Technician Picker Modal */}
        {showTechnicianPicker && (
          <View className="mx-4 mb-4 rounded-xl p-4" style={{ backgroundColor: colors.surface }}>
            <Text className="text-sm font-semibold mb-3" style={{ color: colors.muted }}>
              SÉLECTIONNER UN TECHNICIEN
            </Text>
            {technicians.map((tech) => (
              <TouchableOpacity
                key={tech.id}
                className="flex-row items-center py-3 border-b"
                style={{ borderColor: colors.border }}
                onPress={() => handleAssignTechnician(tech)}
              >
                <View className="w-8 h-8 rounded-full items-center justify-center" style={{ backgroundColor: colors.primary + '20' }}>
                  <Text className="text-sm font-bold" style={{ color: colors.primary }}>
                    {tech.name.charAt(0)}
                  </Text>
                </View>
                <Text className="text-base ml-3" style={{ color: colors.foreground }}>
                  {tech.name}
                </Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              className="mt-3 py-2"
              onPress={() => setShowTechnicianPicker(false)}
            >
              <Text className="text-center" style={{ color: colors.muted }}>Annuler</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Work Timer - Only show when IN_PROGRESS */}
        {workOrder.status === 'IN_PROGRESS' && workOrder.technicianId && (
          <View className="mx-4 mb-4">
            <WorkTimer
              workOrderId={workOrder.id}
              technicianId={workOrder.technicianId}
              technicianName={workOrder.technicianName || 'Technicien'}
              onTimeLogged={async (session) => {
                const newTotal = await getTotalTimeForWorkOrder(workOrder.id);
                setTotalLoggedTime(newTotal);
                const sessions = await getTimerSessions(workOrder.id);
                setTimerSessions(sessions);
              }}
            />
          </View>
        )}

        {/* Logged Time Sessions */}
        {timerSessions.length > 0 && (
          <View className="mx-4 mb-4 rounded-xl p-4" style={{ backgroundColor: colors.surface }}>
            <Text className="text-sm font-semibold mb-3" style={{ color: colors.muted }}>
              TEMPS ENREGISTRÉ ({formatDuration(Math.round(totalLoggedTime / 60))})
            </Text>
            {timerSessions.slice(-5).reverse().map((session, index) => (
              <View
                key={session.id}
                className="flex-row items-center justify-between py-2"
                style={{ borderBottomWidth: index < timerSessions.length - 1 ? 1 : 0, borderColor: colors.border }}
              >
                <View>
                  <Text className="text-sm" style={{ color: colors.foreground }}>
                    {session.technicianName}
                  </Text>
                  <Text className="text-xs" style={{ color: colors.muted }}>
                    {new Date(session.startTime).toLocaleDateString('fr-CA')}
                  </Text>
                </View>
                <Text className="text-sm font-semibold" style={{ color: colors.primary }}>
                  {formatDuration(Math.round(session.duration / 60))}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Parts Selector - Only show when IN_PROGRESS */}
        {(workOrder.status === 'IN_PROGRESS' || workOrder.status === 'COMPLETED') && (
          <View className="mx-4 mb-4">
            <PartsSelector
              workOrderId={workOrder.id}
              technicianId={workOrder.technicianId}
              technicianName={workOrder.technicianName}
              selectedParts={selectedParts}
              onPartsChange={setSelectedParts}
              readOnly={workOrder.status === 'COMPLETED'}
            />
          </View>
        )}

        {/* Progress */}
        <View className="mx-4 mb-4 rounded-xl p-4" style={{ backgroundColor: colors.surface }}>
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-sm font-semibold" style={{ color: colors.muted }}>
              PROGRESSION
            </Text>
            <Text className="text-sm font-bold" style={{ color: colors.primary }}>
              {progress}%
            </Text>
          </View>
          <View className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: colors.border }}>
            <View
              className="h-full rounded-full"
              style={{ width: `${progress}%`, backgroundColor: colors.primary }}
            />
          </View>
          <Text className="text-xs mt-2" style={{ color: colors.muted }}>
            {completedItems} / {workOrder.items.length} tâches complétées
          </Text>
        </View>

        {/* Costs */}
        <View className="mx-4 mb-4 rounded-xl p-4" style={{ backgroundColor: colors.surface }}>
          <Text className="text-sm font-semibold mb-3" style={{ color: colors.muted }}>
            ESTIMATION
          </Text>
          <View className="flex-row justify-between mb-2">
            <Text className="text-sm" style={{ color: colors.muted }}>Temps estimé</Text>
            <Text className="text-sm font-semibold" style={{ color: colors.foreground }}>
              {formatDuration(workOrder.estimatedTotalTime)}
            </Text>
          </View>
          <View className="flex-row justify-between mb-2">
            <Text className="text-sm" style={{ color: colors.muted }}>Coût estimé</Text>
            <Text className="text-sm font-semibold" style={{ color: colors.foreground }}>
              {formatCurrency(workOrder.estimatedTotalCost)}
            </Text>
          </View>
          {workOrder.actualTotalCost && (
            <>
              <View className="border-t my-2" style={{ borderColor: colors.border }} />
              <View className="flex-row justify-between mb-2">
                <Text className="text-sm" style={{ color: colors.muted }}>Temps réel</Text>
                <Text className="text-sm font-semibold" style={{ color: colors.success }}>
                  {formatDuration(workOrder.actualTotalTime || 0)}
                </Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-sm" style={{ color: colors.muted }}>Coût réel</Text>
                <Text className="text-sm font-semibold" style={{ color: colors.success }}>
                  {formatCurrency(workOrder.actualTotalCost)}
                </Text>
              </View>
            </>
          )}
        </View>

        {/* Tasks */}
        <View className="mx-4 mb-4">
          <Text className="text-sm font-semibold mb-3" style={{ color: colors.muted }}>
            TÂCHES ({workOrder.items.length})
          </Text>
          {workOrder.items.map((item, index) => (
            <TouchableOpacity
              key={item.id}
              className="rounded-xl p-4 mb-2"
              style={{ backgroundColor: colors.surface }}
              onPress={() => handleToggleItemStatus(item)}
            >
              <View className="flex-row items-start">
                <View
                  className="w-6 h-6 rounded-full items-center justify-center mr-3"
                  style={{
                    backgroundColor: item.status === 'COMPLETED' ? colors.success : colors.border,
                  }}
                >
                  {item.status === 'COMPLETED' && (
                    <IconSymbol name="checkmark" size={14} color="#FFF" />
                  )}
                </View>
                <View className="flex-1">
                  <Text
                    className="text-sm font-medium"
                    style={{
                      color: colors.foreground,
                      textDecorationLine: item.status === 'COMPLETED' ? 'line-through' : 'none',
                    }}
                  >
                    {item.description}
                  </Text>
                  <View className="flex-row items-center mt-1 gap-3">
                    <Text className="text-xs" style={{ color: colors.muted }}>
                      {item.componentCode}
                    </Text>
                    <View
                      className="px-2 py-0.5 rounded"
                      style={{
                        backgroundColor: item.defectType === 'MAJOR' ? colors.error + '20' : colors.warning + '20',
                      }}
                    >
                      <Text
                        className="text-xs"
                        style={{ color: item.defectType === 'MAJOR' ? colors.error : colors.warning }}
                      >
                        {item.defectType === 'MAJOR' ? 'Majeur' : 'Mineur'}
                      </Text>
                    </View>
                  </View>
                </View>
                <Text className="text-sm" style={{ color: colors.muted }}>
                  {formatCurrency(item.estimatedCost)}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Actions */}
        {workOrder.status !== 'COMPLETED' && workOrder.status !== 'CANCELLED' && (
          <View className="mx-4 mb-4 gap-3">
            {workOrder.status === 'ASSIGNED' && (
              <TouchableOpacity
                className="py-4 rounded-xl items-center"
                style={{ backgroundColor: colors.primary }}
                onPress={handleStartWork}
              >
                <Text className="text-white font-semibold">Démarrer le travail</Text>
              </TouchableOpacity>
            )}
            {workOrder.status === 'IN_PROGRESS' && (
              <TouchableOpacity
                className="py-4 rounded-xl items-center"
                style={{ backgroundColor: colors.success }}
                onPress={handleCompleteWork}
              >
                <Text className="text-white font-semibold">Marquer comme complété</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              className="py-4 rounded-xl items-center"
              style={{ backgroundColor: colors.error + '20' }}
              onPress={handleCancelWork}
            >
              <Text className="font-semibold" style={{ color: colors.error }}>Annuler le bon</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}
