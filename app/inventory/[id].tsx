import { useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, TextInput, Modal } from 'react-native';
import { useLocalSearchParams, router, useFocusEffect } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';
import { useTheme } from '@/lib/theme-context';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { 
  getInventoryItem, 
  getItemTransactions,
  addStock,
  removeStock,
  adjustStock,
  deleteInventoryItem,
  type InventoryItem, 
  type InventoryTransaction,
  type InventoryStatus,
  categoryLabels,
} from '@/lib/inventory-service';

const statusConfig: Record<InventoryStatus, { label: string; color: string }> = {
  IN_STOCK: { label: 'En stock', color: '#22C55E' },
  LOW_STOCK: { label: 'Stock bas', color: '#F59E0B' },
  OUT_OF_STOCK: { label: 'Rupture', color: '#EF4444' },
  ON_ORDER: { label: 'En commande', color: '#3B82F6' },
};

export default function InventoryDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useTheme();
  const [item, setItem] = useState<InventoryItem | null>(null);
  const [transactions, setTransactions] = useState<InventoryTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showStockModal, setShowStockModal] = useState(false);
  const [stockAction, setStockAction] = useState<'add' | 'remove' | 'adjust'>('add');
  const [stockQuantity, setStockQuantity] = useState('');
  const [stockReason, setStockReason] = useState('');

  const loadData = async () => {
    if (!id) return;
    try {
      const [itemData, transactionsData] = await Promise.all([
        getInventoryItem(id),
        getItemTransactions(id),
      ]);
      setItem(itemData);
      setTransactions(transactionsData);
    } catch (error) {
      console.error('Error loading inventory item:', error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [id])
  );

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('fr-CA', {
      style: 'currency',
      currency: 'CAD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('fr-CA', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleStockAction = async () => {
    if (!item) return;
    const qty = parseInt(stockQuantity);
    if (isNaN(qty) || qty <= 0) {
      Alert.alert('Erreur', 'Veuillez entrer une quantité valide');
      return;
    }

    try {
      let updated: InventoryItem | null = null;
      
      if (stockAction === 'add') {
        updated = await addStock(item.id, qty, stockReason || undefined);
      } else if (stockAction === 'remove') {
        if (qty > item.quantity) {
          Alert.alert('Erreur', 'Quantité insuffisante en stock');
          return;
        }
        updated = await removeStock(item.id, qty, undefined, undefined, undefined, stockReason || undefined);
      } else {
        updated = await adjustStock(item.id, qty, stockReason || 'Ajustement manuel');
      }

      if (updated) {
        setItem(updated);
        const newTransactions = await getItemTransactions(item.id);
        setTransactions(newTransactions);
        setShowStockModal(false);
        setStockQuantity('');
        setStockReason('');
      }
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de mettre à jour le stock');
    }
  };

  const handleDelete = () => {
    if (!item) return;
    Alert.alert(
      'Supprimer l\'article',
      `Voulez-vous vraiment supprimer "${item.name}" de l'inventaire ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            await deleteInventoryItem(item.id);
            router.back();
          },
        },
      ]
    );
  };

  const openStockModal = (action: 'add' | 'remove' | 'adjust') => {
    setStockAction(action);
    setStockQuantity('');
    setStockReason('');
    setShowStockModal(true);
  };

  if (loading) {
    return (
      <ScreenContainer className="items-center justify-center">
        <Text style={{ color: colors.muted }}>Chargement...</Text>
      </ScreenContainer>
    );
  }

  if (!item) {
    return (
      <ScreenContainer className="items-center justify-center">
        <Text style={{ color: colors.muted }}>Article non trouvé</Text>
      </ScreenContainer>
    );
  }

  const status = statusConfig[item.status];
  const totalValue = item.quantity * item.unitCost;

  return (
    <ScreenContainer>
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-4">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => router.back()} className="mr-3">
            <IconSymbol name="chevron.left" size={24} color={colors.foreground} />
          </TouchableOpacity>
          <View>
            <Text className="text-xs font-mono" style={{ color: colors.muted }}>
              {item.sku}
            </Text>
            <Text className="text-xl font-bold" style={{ color: colors.foreground }}>
              {item.name}
            </Text>
          </View>
        </View>
        <TouchableOpacity onPress={handleDelete}>
          <IconSymbol name="trash.fill" size={24} color={colors.error} />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Status Card */}
        <View className="mx-4 mb-4 rounded-xl p-4" style={{ backgroundColor: colors.surface }}>
          <View className="flex-row items-center justify-between mb-4">
            <View
              className="px-3 py-1 rounded-full"
              style={{ backgroundColor: status.color + '20' }}
            >
              <Text className="text-sm font-semibold" style={{ color: status.color }}>
                {status.label}
              </Text>
            </View>
            <Text className="text-sm" style={{ color: colors.muted }}>
              {categoryLabels[item.category]}
            </Text>
          </View>

          <View className="flex-row justify-between items-end">
            <View>
              <Text className="text-sm" style={{ color: colors.muted }}>Quantité</Text>
              <Text 
                className="text-4xl font-bold" 
                style={{ 
                  color: item.quantity <= item.minQuantity ? colors.error : colors.foreground 
                }}
              >
                {item.quantity}
              </Text>
              <Text className="text-xs" style={{ color: colors.muted }}>
                Min: {item.minQuantity}
              </Text>
            </View>
            <View className="items-end">
              <Text className="text-sm" style={{ color: colors.muted }}>Valeur totale</Text>
              <Text className="text-2xl font-bold" style={{ color: colors.success }}>
                {formatCurrency(totalValue)}
              </Text>
              <Text className="text-xs" style={{ color: colors.muted }}>
                {formatCurrency(item.unitCost)} / unité
              </Text>
            </View>
          </View>
        </View>

        {/* Stock Actions */}
        <View className="mx-4 mb-4 flex-row gap-2">
          <TouchableOpacity
            className="flex-1 py-3 rounded-xl items-center flex-row justify-center"
            style={{ backgroundColor: colors.success + '20' }}
            onPress={() => openStockModal('add')}
          >
            <IconSymbol name="arrow.up.circle.fill" size={20} color={colors.success} />
            <Text className="ml-2 font-semibold" style={{ color: colors.success }}>
              Entrée
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="flex-1 py-3 rounded-xl items-center flex-row justify-center"
            style={{ backgroundColor: colors.error + '20' }}
            onPress={() => openStockModal('remove')}
          >
            <IconSymbol name="arrow.down.circle.fill" size={20} color={colors.error} />
            <Text className="ml-2 font-semibold" style={{ color: colors.error }}>
              Sortie
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="flex-1 py-3 rounded-xl items-center flex-row justify-center"
            style={{ backgroundColor: colors.primary + '20' }}
            onPress={() => openStockModal('adjust')}
          >
            <IconSymbol name="pencil" size={20} color={colors.primary} />
            <Text className="ml-2 font-semibold" style={{ color: colors.primary }}>
              Ajuster
            </Text>
          </TouchableOpacity>
        </View>

        {/* Details */}
        <View className="mx-4 mb-4 rounded-xl p-4" style={{ backgroundColor: colors.surface }}>
          <Text className="text-sm font-semibold mb-3" style={{ color: colors.muted }}>
            DÉTAILS
          </Text>
          
          {item.description && (
            <View className="mb-3">
              <Text className="text-xs" style={{ color: colors.muted }}>Description</Text>
              <Text className="text-sm" style={{ color: colors.foreground }}>
                {item.description}
              </Text>
            </View>
          )}

          {item.vmrsCode && (
            <View className="mb-3">
              <Text className="text-xs" style={{ color: colors.muted }}>Code VMRS</Text>
              <Text className="text-sm font-mono" style={{ color: colors.foreground }}>
                {item.vmrsCode}
              </Text>
            </View>
          )}

          {item.supplier && (
            <View className="mb-3">
              <Text className="text-xs" style={{ color: colors.muted }}>Fournisseur</Text>
              <Text className="text-sm" style={{ color: colors.foreground }}>
                {item.supplier}
              </Text>
            </View>
          )}

          {item.location && (
            <View className="mb-3">
              <Text className="text-xs" style={{ color: colors.muted }}>Emplacement</Text>
              <Text className="text-sm" style={{ color: colors.foreground }}>
                {item.location}
              </Text>
            </View>
          )}

          {item.lastRestocked && (
            <View>
              <Text className="text-xs" style={{ color: colors.muted }}>Dernier réapprovisionnement</Text>
              <Text className="text-sm" style={{ color: colors.foreground }}>
                {formatDate(item.lastRestocked)}
              </Text>
            </View>
          )}
        </View>

        {/* Transactions */}
        <View className="mx-4 mb-4">
          <Text className="text-sm font-semibold mb-3" style={{ color: colors.muted }}>
            HISTORIQUE DES MOUVEMENTS
          </Text>
          
          {transactions.length === 0 ? (
            <View className="rounded-xl p-4 items-center" style={{ backgroundColor: colors.surface }}>
              <Text style={{ color: colors.muted }}>Aucun mouvement enregistré</Text>
            </View>
          ) : (
            transactions.slice(0, 10).map((tx) => (
              <View 
                key={tx.id} 
                className="rounded-xl p-3 mb-2 flex-row items-center"
                style={{ backgroundColor: colors.surface }}
              >
                <View
                  className="w-8 h-8 rounded-full items-center justify-center mr-3"
                  style={{
                    backgroundColor: tx.type === 'IN' 
                      ? colors.success + '20' 
                      : tx.type === 'OUT' 
                        ? colors.error + '20' 
                        : colors.primary + '20',
                  }}
                >
                  <IconSymbol
                    name={tx.type === 'IN' ? 'arrow.up.circle.fill' : tx.type === 'OUT' ? 'arrow.down.circle.fill' : 'pencil'}
                    size={16}
                    color={tx.type === 'IN' ? colors.success : tx.type === 'OUT' ? colors.error : colors.primary}
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-medium" style={{ color: colors.foreground }}>
                    {tx.type === 'IN' ? 'Entrée' : tx.type === 'OUT' ? 'Sortie' : 'Ajustement'}: {tx.quantity}
                  </Text>
                  {tx.reason && (
                    <Text className="text-xs" style={{ color: colors.muted }}>
                      {tx.reason}
                    </Text>
                  )}
                </View>
                <View className="items-end">
                  <Text className="text-xs" style={{ color: colors.muted }}>
                    {formatDate(tx.createdAt)}
                  </Text>
                  <Text className="text-xs" style={{ color: colors.muted }}>
                    {tx.previousQuantity} → {tx.newQuantity}
                  </Text>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {/* Stock Modal */}
      <Modal
        visible={showStockModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowStockModal(false)}
      >
        <View className="flex-1 justify-end" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <View className="rounded-t-3xl p-6" style={{ backgroundColor: colors.background }}>
            <Text className="text-xl font-bold mb-4" style={{ color: colors.foreground }}>
              {stockAction === 'add' ? 'Entrée de stock' : stockAction === 'remove' ? 'Sortie de stock' : 'Ajustement'}
            </Text>

            <View className="mb-4">
              <Text className="text-sm font-semibold mb-2" style={{ color: colors.muted }}>
                {stockAction === 'adjust' ? 'NOUVELLE QUANTITÉ' : 'QUANTITÉ'}
              </Text>
              <TextInput
                className="rounded-xl p-4"
                style={{ backgroundColor: colors.surface, color: colors.foreground }}
                placeholder="0"
                placeholderTextColor={colors.muted}
                value={stockQuantity}
                onChangeText={setStockQuantity}
                keyboardType="numeric"
                autoFocus
              />
            </View>

            <View className="mb-6">
              <Text className="text-sm font-semibold mb-2" style={{ color: colors.muted }}>
                RAISON (optionnel)
              </Text>
              <TextInput
                className="rounded-xl p-4"
                style={{ backgroundColor: colors.surface, color: colors.foreground }}
                placeholder="Ex: Réapprovisionnement, Utilisation pour réparation..."
                placeholderTextColor={colors.muted}
                value={stockReason}
                onChangeText={setStockReason}
              />
            </View>

            <View className="flex-row gap-3">
              <TouchableOpacity
                className="flex-1 py-4 rounded-xl items-center"
                style={{ backgroundColor: colors.surface }}
                onPress={() => setShowStockModal(false)}
              >
                <Text className="font-semibold" style={{ color: colors.foreground }}>
                  Annuler
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 py-4 rounded-xl items-center"
                style={{ backgroundColor: colors.primary }}
                onPress={handleStockAction}
              >
                <Text className="font-semibold text-white">
                  Confirmer
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}
