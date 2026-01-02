import { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, FlatList, RefreshControl } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';
import { useTheme } from '@/lib/theme-context';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { AdBanner } from '@/components/ui/ad-banner';
import { 
  getWorkOrders, 
  getWorkOrderStats,
  type WorkOrder, 
  type WorkOrderStatus,
  type WorkOrderPriority 
} from '@/lib/work-order-service';

const statusConfig: Record<WorkOrderStatus, { label: string; color: string }> = {
  DRAFT: { label: 'Brouillon', color: '#64748B' },
  PENDING: { label: 'En attente', color: '#F59E0B' },
  ASSIGNED: { label: 'Assigné', color: '#3B82F6' },
  IN_PROGRESS: { label: 'En cours', color: '#8B5CF6' },
  COMPLETED: { label: 'Complété', color: '#22C55E' },
  CANCELLED: { label: 'Annulé', color: '#EF4444' },
};

const priorityConfig: Record<WorkOrderPriority, { label: string; color: string }> = {
  LOW: { label: 'Basse', color: '#64748B' },
  MEDIUM: { label: 'Moyenne', color: '#3B82F6' },
  HIGH: { label: 'Haute', color: '#F59E0B' },
  URGENT: { label: 'Urgente', color: '#EF4444' },
};

export default function WorkOrdersScreen() {
  const { colors } = useTheme();
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [stats, setStats] = useState<{
    total: number;
    pending: number;
    inProgress: number;
    completed: number;
  } | null>(null);
  const [filter, setFilter] = useState<WorkOrderStatus | 'ALL'>('ALL');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const [ordersData, statsData] = await Promise.all([
        getWorkOrders(),
        getWorkOrderStats(),
      ]);
      setWorkOrders(ordersData);
      setStats(statsData);
    } catch (error) {
      console.error('Error loading work orders:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const filteredOrders = filter === 'ALL' 
    ? workOrders 
    : workOrders.filter(o => o.status === filter);

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('fr-CA', {
      day: 'numeric',
      month: 'short',
    });
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('fr-CA', {
      style: 'currency',
      currency: 'CAD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const renderWorkOrder = ({ item }: { item: WorkOrder }) => (
    <TouchableOpacity
      className="rounded-xl p-4 mb-3"
      style={{ backgroundColor: colors.surface }}
      onPress={() => router.push(`/work-orders/${item.id}` as any)}
    >
      <View className="flex-row items-start justify-between mb-2">
        <View className="flex-1">
          <Text className="text-xs font-mono" style={{ color: colors.muted }}>
            {item.orderNumber}
          </Text>
          <Text className="text-base font-semibold mt-1" style={{ color: colors.foreground }}>
            {item.title}
          </Text>
        </View>
        <View
          className="px-2 py-1 rounded"
          style={{ backgroundColor: priorityConfig[item.priority].color + '20' }}
        >
          <Text className="text-xs font-semibold" style={{ color: priorityConfig[item.priority].color }}>
            {priorityConfig[item.priority].label}
          </Text>
        </View>
      </View>

      <Text className="text-sm mb-3" style={{ color: colors.muted }} numberOfLines={2}>
        {item.vehicleName}
      </Text>

      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-4">
          <View className="flex-row items-center">
            <IconSymbol name="wrench.fill" size={14} color={colors.muted} />
            <Text className="text-sm ml-1" style={{ color: colors.muted }}>
              {item.items.length} tâches
            </Text>
          </View>
          <View className="flex-row items-center">
            <IconSymbol name="dollarsign.circle.fill" size={14} color={colors.muted} />
            <Text className="text-sm ml-1" style={{ color: colors.muted }}>
              {formatCurrency(item.estimatedTotalCost)}
            </Text>
          </View>
        </View>
        <View
          className="px-2 py-1 rounded-full"
          style={{ backgroundColor: statusConfig[item.status].color + '20' }}
        >
          <Text className="text-xs" style={{ color: statusConfig[item.status].color }}>
            {statusConfig[item.status].label}
          </Text>
        </View>
      </View>

      {item.technicianName && (
        <View className="flex-row items-center mt-3 pt-3 border-t" style={{ borderColor: colors.border }}>
          <IconSymbol name="person.fill" size={14} color={colors.primary} />
          <Text className="text-sm ml-2" style={{ color: colors.foreground }}>
            {item.technicianName}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <ScreenContainer className="items-center justify-center">
        <Text style={{ color: colors.muted }}>Chargement...</Text>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-4">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => router.back()} className="mr-3">
            <IconSymbol name="chevron.left" size={24} color={colors.foreground} />
          </TouchableOpacity>
          <View>
            <Text className="text-2xl font-bold" style={{ color: colors.foreground }}>
              FleetCommand
            </Text>
            <Text className="text-sm" style={{ color: colors.muted }}>
              Bons de travail
            </Text>
          </View>
        </View>
        <TouchableOpacity
          className="w-10 h-10 rounded-full items-center justify-center"
          style={{ backgroundColor: colors.primary }}
          onPress={() => router.push('/work-orders/create' as any)}
        >
          <IconSymbol name="plus" size={20} color="#FFF" />
        </TouchableOpacity>
      </View>

      {/* Stats */}
      {stats && (
        <View className="px-4 mb-4">
          <View className="flex-row gap-2">
            <View className="flex-1 rounded-xl p-3" style={{ backgroundColor: colors.surface }}>
              <Text className="text-2xl font-bold" style={{ color: colors.warning }}>
                {stats.pending}
              </Text>
              <Text className="text-xs" style={{ color: colors.muted }}>En attente</Text>
            </View>
            <View className="flex-1 rounded-xl p-3" style={{ backgroundColor: colors.surface }}>
              <Text className="text-2xl font-bold" style={{ color: colors.primary }}>
                {stats.inProgress}
              </Text>
              <Text className="text-xs" style={{ color: colors.muted }}>En cours</Text>
            </View>
            <View className="flex-1 rounded-xl p-3" style={{ backgroundColor: colors.surface }}>
              <Text className="text-2xl font-bold" style={{ color: colors.success }}>
                {stats.completed}
              </Text>
              <Text className="text-xs" style={{ color: colors.muted }}>Complétés</Text>
            </View>
          </View>
        </View>
      )}

      {/* Filters */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        className="px-4 mb-4"
        contentContainerStyle={{ gap: 8 }}
      >
        {(['ALL', 'PENDING', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED'] as const).map((status) => (
          <TouchableOpacity
            key={status}
            className="px-4 py-2 rounded-full"
            style={{
              backgroundColor: filter === status ? colors.primary : colors.surface,
            }}
            onPress={() => setFilter(status)}
          >
            <Text
              className="text-sm font-medium"
              style={{ color: filter === status ? '#FFF' : colors.foreground }}
            >
              {status === 'ALL' ? 'Tous' : statusConfig[status].label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* List */}
      <FlatList
        data={filteredOrders}
        renderItem={renderWorkOrder}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListHeaderComponent={
          <AdBanner
            variant="banner"
            rotationInterval={5000}
            showIndicators={true}
            compact={true}
          />
        }
        ListEmptyComponent={
          <View className="items-center justify-center py-12">
            <IconSymbol name="doc.text" size={48} color={colors.muted} />
            <Text className="mt-4 text-center" style={{ color: colors.muted }}>
              Aucun bon de travail
            </Text>
            <TouchableOpacity
              className="mt-4 px-6 py-3 rounded-full"
              style={{ backgroundColor: colors.primary }}
              onPress={() => router.push('/work-orders/create' as any)}
            >
              <Text className="text-white font-semibold">Créer un bon</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </ScreenContainer>
  );
}
