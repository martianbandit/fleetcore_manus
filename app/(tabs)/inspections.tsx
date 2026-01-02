import { useEffect, useState, useCallback } from 'react';
import { FlatList, Text, View, RefreshControl, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

import { ScreenContainer } from '@/components/screen-container';
import { InspectionCard } from '@/components/ui/inspection-card';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { AdBanner } from '@/components/ui/ad-banner';
import { getInspections } from '@/lib/data-service';
import type { Inspection, InspectionStatus } from '@/lib/types';

const statusFilters: { key: InspectionStatus | 'all'; label: string }[] = [
  { key: 'all', label: 'Toutes' },
  { key: 'IN_PROGRESS', label: 'En cours' },
  { key: 'COMPLETED', label: 'Complétées' },
  { key: 'BLOCKED', label: 'Bloquées' },
  { key: 'DRAFT', label: 'Brouillons' },
];

export default function InspectionsScreen() {
  const router = useRouter();
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [filteredInspections, setFilteredInspections] = useState<Inspection[]>([]);
  const [activeFilter, setActiveFilter] = useState<InspectionStatus | 'all'>('all');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const data = await getInspections();
      // Sort by date, most recent first
      const sorted = data.sort((a, b) => 
        new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()
      );
      setInspections(sorted);
      applyFilter(sorted, activeFilter);
    } catch (error) {
      console.error('Error loading inspections:', error);
    } finally {
      setLoading(false);
    }
  }, [activeFilter]);

  useEffect(() => {
    loadData();
  }, []);

  const applyFilter = (data: Inspection[], filter: InspectionStatus | 'all') => {
    if (filter === 'all') {
      setFilteredInspections(data);
    } else {
      setFilteredInspections(data.filter(i => i.status === filter));
    }
  };

  const handleFilterChange = (filter: InspectionStatus | 'all') => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setActiveFilter(filter);
    applyFilter(inspections, filter);
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  const renderInspection = ({ item }: { item: Inspection }) => (
    <InspectionCard
      inspection={item}
      onPress={() => router.push(`/inspection/${item.id}` as any)}
    />
  );

  const getStatusCounts = () => {
    return {
      all: inspections.length,
      IN_PROGRESS: inspections.filter(i => i.status === 'IN_PROGRESS').length,
      COMPLETED: inspections.filter(i => i.status === 'COMPLETED').length,
      BLOCKED: inspections.filter(i => i.status === 'BLOCKED').length,
      DRAFT: inspections.filter(i => i.status === 'DRAFT').length,
    };
  };

  const counts = getStatusCounts();

  if (loading) {
    return (
      <ScreenContainer className="items-center justify-center">
        <Text className="text-muted">Chargement...</Text>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      {/* Header */}
      <View className="px-4 pt-2 pb-4">
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-3xl font-bold text-foreground">Inspections</Text>
            <Text className="text-base text-muted mt-1">
              {inspections.length} inspections au total
            </Text>
          </View>
          <Pressable
            onPress={() => router.push('/new-inspection' as any)}
            style={({ pressed }) => [
              styles.addButton,
              pressed && { opacity: 0.8, transform: [{ scale: 0.95 }] },
            ]}
          >
            <IconSymbol name="plus.circle.fill" size={20} color="#FFFFFF" />
            <Text style={styles.addButtonText}>Nouvelle</Text>
          </Pressable>
        </View>
      </View>

      {/* Filters */}
      <View className="px-4 mb-4">
        <FlatList
          horizontal
          data={statusFilters}
          keyExtractor={(item) => item.key}
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => handleFilterChange(item.key)}
              style={({ pressed }) => [
                styles.filterChip,
                activeFilter === item.key && styles.filterChipActive,
                pressed && { opacity: 0.7 },
              ]}
            >
              <Text
                style={[
                  styles.filterChipText,
                  activeFilter === item.key && styles.filterChipTextActive,
                ]}
              >
                {item.label} ({counts[item.key]})
              </Text>
            </Pressable>
          )}
          contentContainerStyle={styles.filterList}
        />
      </View>

      {/* Inspection List */}
      <FlatList
        data={filteredInspections}
        keyExtractor={(item) => item.id}
        renderItem={renderInspection}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <AdBanner
            variant="banner"
            rotationInterval={5000}
            showIndicators={true}
            compact={true}
          />
        }
        ListEmptyComponent={
          <View className="items-center py-12">
            <IconSymbol name="clipboard.fill" size={48} color="#64748B" />
            <Text className="text-muted mt-4 text-center">
              {activeFilter !== 'all'
                ? 'Aucune inspection dans cette catégorie'
                : 'Aucune inspection'}
            </Text>
            <Pressable
              onPress={() => router.push('/new-inspection' as any)}
              style={({ pressed }) => [
                styles.emptyButton,
                pressed && { opacity: 0.8 },
              ]}
            >
              <Text style={styles.emptyButtonText}>Créer une inspection</Text>
            </Pressable>
          </View>
        }
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0066CC',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 6,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  filterList: {
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  filterChipActive: {
    backgroundColor: '#0066CC',
    borderColor: '#0066CC',
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748B',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  emptyButton: {
    marginTop: 16,
    backgroundColor: '#0066CC',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  emptyButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
});
