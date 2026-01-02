/**
 * PartsSelector - Composant de sélection de pièces depuis l'inventaire
 * Permet de consommer des pièces de FleetCrew pour un bon de travail
 */

import { useState, useEffect, useCallback } from 'react';
import { View, Text, Pressable, TextInput, FlatList, Alert, Modal } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors } from '@/hooks/use-colors';
import { 
  getInventoryItems, 
  removeStock,
  type InventoryItem 
} from '@/lib/inventory-service';

export interface SelectedPart {
  inventoryItemId: string;
  itemName: string;
  sku: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
}

interface PartsSelectorProps {
  workOrderId: string;
  technicianId?: string;
  technicianName?: string;
  selectedParts: SelectedPart[];
  onPartsChange: (parts: SelectedPart[]) => void;
  readOnly?: boolean;
}

const categoryLabels: Record<string, string> = {
  PARTS: 'Pièces',
  TOOLS: 'Outils',
  FLUIDS: 'Fluides',
  CONSUMABLES: 'Consommables',
  SAFETY: 'Sécurité',
  ELECTRICAL: 'Électrique',
  OTHER: 'Autres',
};

export function PartsSelector({
  workOrderId,
  technicianId,
  technicianName,
  selectedParts,
  onPartsChange,
  readOnly = false,
}: PartsSelectorProps) {
  const colors = useColors();
  const [showPicker, setShowPicker] = useState(false);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  const loadInventory = useCallback(async () => {
    try {
      const items = await getInventoryItems();
      // Only show items with stock
      setInventoryItems(items.filter(i => i.quantity > 0));
    } catch (error) {
      console.error('Error loading inventory:', error);
    }
  }, []);

  useEffect(() => {
    loadInventory();
  }, [loadInventory]);

  const filteredItems = inventoryItems.filter(item => {
    const query = searchQuery.toLowerCase();
    return (
      item.name.toLowerCase().includes(query) ||
      item.sku.toLowerCase().includes(query) ||
      (item.vmrsCode && item.vmrsCode.toLowerCase().includes(query))
    );
  });

  const handleAddPart = async (item: InventoryItem) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    // Check if already selected
    const existingIndex = selectedParts.findIndex(p => p.inventoryItemId === item.id);
    
    if (existingIndex >= 0) {
      // Increment quantity
      const updated = [...selectedParts];
      const newQty = updated[existingIndex].quantity + 1;
      
      // Check stock availability
      if (newQty > item.quantity) {
        Alert.alert('Stock insuffisant', `Seulement ${item.quantity} unité(s) disponible(s)`);
        return;
      }
      
      updated[existingIndex] = {
        ...updated[existingIndex],
        quantity: newQty,
        totalCost: newQty * updated[existingIndex].unitCost,
      };
      onPartsChange(updated);
    } else {
      // Add new part
      const newPart: SelectedPart = {
        inventoryItemId: item.id,
        itemName: item.name,
        sku: item.sku,
        quantity: 1,
        unitCost: item.unitCost,
        totalCost: item.unitCost,
      };
      onPartsChange([...selectedParts, newPart]);
    }
    
    setShowPicker(false);
    setSearchQuery('');
  };

  const handleRemovePart = (inventoryItemId: string) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPartsChange(selectedParts.filter(p => p.inventoryItemId !== inventoryItemId));
  };

  const handleUpdateQuantity = (inventoryItemId: string, delta: number) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    const updated = selectedParts.map(part => {
      if (part.inventoryItemId === inventoryItemId) {
        const newQty = Math.max(1, part.quantity + delta);
        
        // Check stock availability
        const item = inventoryItems.find(i => i.id === inventoryItemId);
        if (item && newQty > item.quantity) {
          Alert.alert('Stock insuffisant', `Seulement ${item.quantity} unité(s) disponible(s)`);
          return part;
        }
        
        return {
          ...part,
          quantity: newQty,
          totalCost: newQty * part.unitCost,
        };
      }
      return part;
    });
    
    onPartsChange(updated);
  };

  const handleConfirmUsage = async () => {
    if (selectedParts.length === 0) return;

    Alert.alert(
      'Confirmer l\'utilisation',
      `Voulez-vous confirmer l'utilisation de ${selectedParts.length} article(s) ? Le stock sera mis à jour automatiquement.`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Confirmer',
          onPress: async () => {
            setLoading(true);
            try {
              // Remove stock for each part
              for (const part of selectedParts) {
                await removeStock(
                  part.inventoryItemId,
                  part.quantity,
                  workOrderId,
                  technicianId,
                  technicianName,
                  `Utilisé pour bon de travail`
                );
              }
              
              if (Platform.OS !== 'web') {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              }
              
              Alert.alert('Succès', 'Le stock a été mis à jour');
              await loadInventory(); // Refresh inventory
            } catch (error) {
              console.error('Error updating stock:', error);
              Alert.alert('Erreur', 'Impossible de mettre à jour le stock');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const totalPartsCost = selectedParts.reduce((sum, p) => sum + p.totalCost, 0);

  return (
    <View 
      className="rounded-xl p-4 border"
      style={{ backgroundColor: colors.surface, borderColor: colors.border }}
    >
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center gap-2">
          <IconSymbol name="cube.box.fill" size={20} color="#8B5CF6" />
          <Text className="font-semibold" style={{ color: colors.foreground }}>
            Pièces utilisées
          </Text>
        </View>
        {!readOnly && (
          <Pressable
            onPress={() => setShowPicker(true)}
            className="flex-row items-center gap-1 px-3 py-1.5 rounded-lg"
            style={{ backgroundColor: `#8B5CF620` }}
          >
            <IconSymbol name="plus" size={16} color="#8B5CF6" />
            <Text className="text-sm font-medium" style={{ color: '#8B5CF6' }}>
              Ajouter
            </Text>
          </Pressable>
        )}
      </View>

      {/* Selected Parts List */}
      {selectedParts.length > 0 ? (
        <View className="gap-2">
          {selectedParts.map((part) => (
            <View
              key={part.inventoryItemId}
              className="flex-row items-center py-2 border-b"
              style={{ borderColor: colors.border }}
            >
              <View className="flex-1">
                <Text className="font-medium" style={{ color: colors.foreground }}>
                  {part.itemName}
                </Text>
                <Text className="text-xs" style={{ color: colors.muted }}>
                  {part.sku} • {part.unitCost.toFixed(2)} $ / unité
                </Text>
              </View>
              
              {!readOnly ? (
                <View className="flex-row items-center gap-2">
                  <Pressable
                    onPress={() => handleUpdateQuantity(part.inventoryItemId, -1)}
                    className="w-8 h-8 rounded-full items-center justify-center"
                    style={{ backgroundColor: colors.border }}
                  >
                    <IconSymbol name="minus" size={14} color={colors.foreground} />
                  </Pressable>
                  <Text className="w-8 text-center font-semibold" style={{ color: colors.foreground }}>
                    {part.quantity}
                  </Text>
                  <Pressable
                    onPress={() => handleUpdateQuantity(part.inventoryItemId, 1)}
                    className="w-8 h-8 rounded-full items-center justify-center"
                    style={{ backgroundColor: colors.border }}
                  >
                    <IconSymbol name="plus" size={14} color={colors.foreground} />
                  </Pressable>
                  <Pressable
                    onPress={() => handleRemovePart(part.inventoryItemId)}
                    className="w-8 h-8 rounded-full items-center justify-center ml-2"
                    style={{ backgroundColor: `${colors.error}20` }}
                  >
                    <IconSymbol name="xmark" size={14} color={colors.error} />
                  </Pressable>
                </View>
              ) : (
                <Text className="font-semibold" style={{ color: colors.foreground }}>
                  x{part.quantity}
                </Text>
              )}
              
              <Text className="w-20 text-right font-semibold" style={{ color: colors.primary }}>
                {part.totalCost.toFixed(2)} $
              </Text>
            </View>
          ))}

          {/* Total */}
          <View className="flex-row items-center justify-between pt-2">
            <Text className="font-semibold" style={{ color: colors.muted }}>
              Total pièces
            </Text>
            <Text className="text-lg font-bold" style={{ color: colors.primary }}>
              {totalPartsCost.toFixed(2)} $
            </Text>
          </View>

          {/* Confirm Button */}
          {!readOnly && (
            <Pressable
              onPress={handleConfirmUsage}
              disabled={loading}
              className="mt-3 py-3 rounded-xl items-center"
              style={({ pressed }) => [
                { backgroundColor: '#8B5CF6' },
                pressed && { opacity: 0.8 },
                loading && { opacity: 0.5 },
              ]}
            >
              <Text className="font-semibold" style={{ color: '#FFFFFF' }}>
                {loading ? 'Mise à jour...' : 'Confirmer l\'utilisation'}
              </Text>
            </Pressable>
          )}
        </View>
      ) : (
        <View className="py-6 items-center">
          <IconSymbol name="cube.box" size={32} color={colors.muted} />
          <Text className="text-sm mt-2" style={{ color: colors.muted }}>
            Aucune pièce sélectionnée
          </Text>
          {!readOnly && (
            <Text className="text-xs mt-1" style={{ color: colors.muted }}>
              Appuyez sur "Ajouter" pour sélectionner des pièces
            </Text>
          )}
        </View>
      )}

      {/* Parts Picker Modal */}
      <Modal
        visible={showPicker}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowPicker(false)}
      >
        <View className="flex-1" style={{ backgroundColor: colors.background }}>
          {/* Modal Header */}
          <View 
            className="flex-row items-center justify-between px-4 py-4 border-b"
            style={{ borderColor: colors.border }}
          >
            <Pressable onPress={() => setShowPicker(false)}>
              <Text style={{ color: colors.primary }}>Annuler</Text>
            </Pressable>
            <Text className="text-lg font-semibold" style={{ color: colors.foreground }}>
              Sélectionner une pièce
            </Text>
            <View style={{ width: 60 }} />
          </View>

          {/* Search */}
          <View className="px-4 py-3">
            <View 
              className="flex-row items-center px-3 py-2 rounded-lg"
              style={{ backgroundColor: colors.surface }}
            >
              <IconSymbol name="magnifyingglass" size={18} color={colors.muted} />
              <TextInput
                className="flex-1 ml-2 text-base"
                style={{ color: colors.foreground }}
                placeholder="Rechercher..."
                placeholderTextColor={colors.muted}
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoCapitalize="none"
              />
            </View>
          </View>

          {/* Items List */}
          <FlatList
            data={filteredItems}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32 }}
            renderItem={({ item }) => {
              const selectedQty = selectedParts.find(p => p.inventoryItemId === item.id)?.quantity || 0;
              
              return (
                <Pressable
                  onPress={() => handleAddPart(item)}
                  className="py-3 border-b"
                  style={({ pressed }) => [
                    { borderColor: colors.border },
                    pressed && { opacity: 0.7 },
                  ]}
                >
                  <View className="flex-row items-center justify-between">
                    <View className="flex-1">
                      <Text className="font-medium" style={{ color: colors.foreground }}>
                        {item.name}
                      </Text>
                      <View className="flex-row items-center gap-2 mt-1">
                        <Text className="text-xs" style={{ color: colors.muted }}>
                          {item.sku}
                        </Text>
                        <View 
                          className="px-2 py-0.5 rounded"
                          style={{ backgroundColor: `#8B5CF620` }}
                        >
                          <Text className="text-xs" style={{ color: '#8B5CF6' }}>
                            {categoryLabels[item.category]}
                          </Text>
                        </View>
                      </View>
                    </View>
                    <View className="items-end">
                      <Text className="font-semibold" style={{ color: colors.primary }}>
                        {item.unitCost.toFixed(2)} $
                      </Text>
                      <Text 
                        className="text-xs"
                        style={{ 
                          color: item.quantity <= item.minQuantity ? colors.warning : colors.muted 
                        }}
                      >
                        {item.quantity} en stock
                      </Text>
                      {selectedQty > 0 && (
                        <View 
                          className="px-2 py-0.5 rounded-full mt-1"
                          style={{ backgroundColor: colors.success }}
                        >
                          <Text className="text-xs font-medium" style={{ color: '#FFFFFF' }}>
                            {selectedQty} sélectionné(s)
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                </Pressable>
              );
            }}
            ListEmptyComponent={
              <View className="py-12 items-center">
                <IconSymbol name="cube.box" size={48} color={colors.muted} />
                <Text className="text-base mt-4" style={{ color: colors.muted }}>
                  {searchQuery ? 'Aucun résultat' : 'Inventaire vide'}
                </Text>
              </View>
            }
          />
        </View>
      </Modal>
    </View>
  );
}
