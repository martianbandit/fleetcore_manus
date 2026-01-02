import { useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, FlatList, RefreshControl, TextInput } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';
import { useTheme } from '@/lib/theme-context';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { 
  getInventoryItems, 
  getInventoryStats,
  searchInventory,
  type InventoryItem, 
  type InventoryCategory,
  type InventoryStatus,
  categoryLabels,
} from '@/lib/inventory-service';

const statusConfig: Record<InventoryStatus, { label: string; color: string }> = {
  IN_STOCK: { label: 'En stock', color: '#22C55E' },
  LOW_STOCK: { label: 'Stock bas', color: '#F59E0B' },
  OUT_OF_STOCK: { label: 'Rupture', color: '#EF4444' },
  ON_ORDER: { label: 'En commande', color: '#3B82F6' },
};

const categoryIcons: Record<InventoryCategory, string> = {
  PARTS: 'wrench.fill',
  TOOLS: 'hammer.fill',
  FLUIDS: 'fuel.pump.fill',
  CONSUMABLES: 'funnel.fill',
  SAFETY: 'exclamationmark.triangle.fill',
  ELECTRICAL: 'gauge.fill',
  OTHER: 'cube.box.fill',
};

export default function InventoryScreen() {
  const { colors } = useTheme();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [stats, setStats] = useState<{
    totalItems: number;
    totalValue: number;
    lowStockCount: number;
    outOfStockCount: number;
  } | null>(null);
  const [filter, setFilter] = useState<InventoryCategory | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const [itemsData, statsData] = await Promise.all([
        getInventoryItems(),
        getInventoryStats(),
      ]);
      setItems(itemsData);
      setStats(statsData);
    } catch (error) {
      console.error('Error loading inventory:', error);
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

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      const results = await searchInventory(query);
      setItems(results);
    } else {
      const allItems = await getInventoryItems();
      setItems(allItems);
    }
  };

  const filteredItems = filter === 'ALL' 
    ? items 
    : items.filter(i => i.category === filter);

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('fr-CA', {
      style: 'currency',
      currency: 'CAD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const renderItem = ({ item }: { item: InventoryItem }) => (
    <TouchableOpacity
      className="rounded-xl p-4 mb-3"
      style={{ backgroundColor: colors.surface }}
      onPress={() => router.push(`/inventory/${item.id}` as any)}
    >
      <View className="flex-row items-start justify-between mb-2">
        <View className="flex-row items-center flex-1">
          <View
            className="w-10 h-10 rounded-lg items-center justify-center mr-3"
            style={{ backgroundColor: colors.primary + '20' }}
          >
            <IconSymbol 
              name={categoryIcons[item.category] as any} 
              size={20} 
              color={colors.primary} 
            />
          </View>
          <View className="flex-1">
            <Text className="text-xs font-mono" style={{ color: colors.muted }}>
              {item.sku}
            </Text>
            <Text className="text-base font-semibold" style={{ color: colors.foreground }}>
              {item.name}
            </Text>
          </View>
        </View>
        <View
          className="px-2 py-1 rounded"
          style={{ backgroundColor: statusConfig[item.status].color + '20' }}
        >
          <Text className="text-xs font-semibold" style={{ color: statusConfig[item.status].color }}>
            {statusConfig[item.status].label}
          </Text>
        </View>
      </View>

      <View className="flex-row items-center justify-between mt-2">
        <View className="flex-row items-center gap-4">
          <View className="flex-row items-center">
            <Text className="text-sm" style={{ color: colors.muted }}>Qté: </Text>
            <Text 
              className="text-sm font-bold" 
              style={{ 
                color: item.quantity <= item.minQuantity ? colors.error : colors.foreground 
              }}
            >
              {item.quantity}
            </Text>
          </View>
          <View className="flex-row items-center">
            <Text className="text-sm" style={{ color: colors.muted }}>Min: </Text>
            <Text className="text-sm" style={{ color: colors.muted }}>
              {item.minQuantity}
            </Text>
          </View>
        </View>
        <Text className="text-sm font-semibold" style={{ color: colors.foreground }}>
          {formatCurrency(item.unitCost)}
        </Text>
      </View>

      {item.vmrsCode && (
        <View className="mt-2 pt-2 border-t" style={{ borderColor: colors.border }}>
          <Text className="text-xs" style={{ color: colors.muted }}>
            VMRS: {item.vmrsCode}
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
              FleetCrew
            </Text>
            <Text className="text-sm" style={{ color: colors.muted }}>
              Inventaire et matériel
            </Text>
          </View>
        </View>
        <TouchableOpacity
          className="w-10 h-10 rounded-full items-center justify-center"
          style={{ backgroundColor: colors.primary }}
          onPress={() => router.push('/inventory/add' as any)}
        >
          <IconSymbol name="plus" size={20} color="#FFF" />
        </TouchableOpacity>
      </View>

      {/* Stats */}
      {stats && (
        <View className="px-4 mb-4">
          <View className="flex-row gap-2">
            <View className="flex-1 rounded-xl p-3" style={{ backgroundColor: colors.surface }}>
              <Text className="text-2xl font-bold" style={{ color: colors.foreground }}>
                {stats.totalItems}
              </Text>
              <Text className="text-xs" style={{ color: colors.muted }}>Articles</Text>
            </View>
            <View className="flex-1 rounded-xl p-3" style={{ backgroundColor: colors.surface }}>
              <Text className="text-2xl font-bold" style={{ color: colors.warning }}>
                {stats.lowStockCount}
              </Text>
              <Text className="text-xs" style={{ color: colors.muted }}>Stock bas</Text>
            </View>
            <View className="flex-1 rounded-xl p-3" style={{ backgroundColor: colors.surface }}>
              <Text className="text-lg font-bold" style={{ color: colors.success }}>
                {formatCurrency(stats.totalValue)}
              </Text>
              <Text className="text-xs" style={{ color: colors.muted }}>Valeur</Text>
            </View>
          </View>
        </View>
      )}

      {/* Search */}
      <View className="px-4 mb-4">
        <View 
          className="flex-row items-center rounded-xl px-4"
          style={{ backgroundColor: colors.surface }}
        >
          <IconSymbol name="magnifyingglass" size={20} color={colors.muted} />
          <TextInput
            className="flex-1 py-3 ml-2"
            style={{ color: colors.foreground }}
            placeholder="Rechercher..."
            placeholderTextColor={colors.muted}
            value={searchQuery}
            onChangeText={handleSearch}
          />
        </View>
      </View>

      {/* Category Filters */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        className="px-4 mb-4"
        contentContainerStyle={{ gap: 8 }}
      >
        <TouchableOpacity
          className="px-4 py-2 rounded-full"
          style={{
            backgroundColor: filter === 'ALL' ? colors.primary : colors.surface,
          }}
          onPress={() => setFilter('ALL')}
        >
          <Text
            className="text-sm font-medium"
            style={{ color: filter === 'ALL' ? '#FFF' : colors.foreground }}
          >
            Tous
          </Text>
        </TouchableOpacity>
        {(Object.keys(categoryLabels) as InventoryCategory[]).map((cat) => (
          <TouchableOpacity
            key={cat}
            className="px-4 py-2 rounded-full"
            style={{
              backgroundColor: filter === cat ? colors.primary : colors.surface,
            }}
            onPress={() => setFilter(cat)}
          >
            <Text
              className="text-sm font-medium"
              style={{ color: filter === cat ? '#FFF' : colors.foreground }}
            >
              {categoryLabels[cat]}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* List */}
      <FlatList
        data={filteredItems}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View className="items-center justify-center py-12">
            <IconSymbol name="cube.box.fill" size={48} color={colors.muted} />
            <Text className="mt-4 text-center" style={{ color: colors.muted }}>
              Aucun article dans l'inventaire
            </Text>
            <TouchableOpacity
              className="mt-4 px-6 py-3 rounded-full"
              style={{ backgroundColor: colors.primary }}
              onPress={() => router.push('/inventory/add' as any)}
            >
              <Text className="text-white font-semibold">Ajouter un article</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </ScreenContainer>
  );
}
