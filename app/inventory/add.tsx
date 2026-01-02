import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { router } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';
import { useTheme } from '@/lib/theme-context';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { 
  createInventoryItem, 
  type InventoryCategory,
  categoryLabels,
} from '@/lib/inventory-service';

const categories: { value: InventoryCategory; label: string; icon: string }[] = [
  { value: 'PARTS', label: 'Pièces de rechange', icon: 'wrench.fill' },
  { value: 'TOOLS', label: 'Outils', icon: 'hammer.fill' },
  { value: 'FLUIDS', label: 'Fluides', icon: 'fuel.pump.fill' },
  { value: 'CONSUMABLES', label: 'Consommables', icon: 'funnel.fill' },
  { value: 'SAFETY', label: 'Équipements de sécurité', icon: 'exclamationmark.triangle.fill' },
  { value: 'ELECTRICAL', label: 'Composants électriques', icon: 'gauge.fill' },
  { value: 'OTHER', label: 'Autres', icon: 'cube.box.fill' },
];

export default function AddInventoryScreen() {
  const { colors } = useTheme();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<InventoryCategory>('PARTS');
  const [quantity, setQuantity] = useState('');
  const [minQuantity, setMinQuantity] = useState('5');
  const [unitCost, setUnitCost] = useState('');
  const [vmrsCode, setVmrsCode] = useState('');
  const [supplier, setSupplier] = useState('');
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) {
      Alert.alert('Erreur', 'Veuillez entrer un nom');
      return;
    }
    if (!quantity || parseInt(quantity) < 0) {
      Alert.alert('Erreur', 'Veuillez entrer une quantité valide');
      return;
    }
    if (!unitCost || parseFloat(unitCost) < 0) {
      Alert.alert('Erreur', 'Veuillez entrer un coût unitaire valide');
      return;
    }

    setLoading(true);
    try {
      const item = await createInventoryItem({
        name: name.trim(),
        description: description.trim() || undefined,
        category,
        quantity: parseInt(quantity),
        minQuantity: parseInt(minQuantity) || 5,
        unitCost: parseFloat(unitCost),
        vmrsCode: vmrsCode.trim() || undefined,
        supplier: supplier.trim() || undefined,
        location: location.trim() || undefined,
      });

      Alert.alert(
        'Article créé',
        `L'article ${item.name} (${item.sku}) a été ajouté à l'inventaire.`,
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de créer l\'article');
    } finally {
      setLoading(false);
    }
  };

  const selectedCategory = categories.find(c => c.value === category);

  return (
    <ScreenContainer>
      {/* Header */}
      <View className="flex-row items-center px-4 py-4">
        <TouchableOpacity onPress={() => router.back()} className="mr-3">
          <IconSymbol name="chevron.left" size={24} color={colors.foreground} />
        </TouchableOpacity>
        <Text className="text-xl font-bold" style={{ color: colors.foreground }}>
          Nouvel article
        </Text>
      </View>

      <ScrollView className="flex-1 px-4" contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Name */}
        <View className="mb-4">
          <Text className="text-sm font-semibold mb-2" style={{ color: colors.muted }}>
            NOM DE L'ARTICLE *
          </Text>
          <TextInput
            className="rounded-xl p-4"
            style={{ backgroundColor: colors.surface, color: colors.foreground }}
            placeholder="Ex: Filtre à huile"
            placeholderTextColor={colors.muted}
            value={name}
            onChangeText={setName}
          />
        </View>

        {/* Category */}
        <View className="mb-4">
          <Text className="text-sm font-semibold mb-2" style={{ color: colors.muted }}>
            CATÉGORIE *
          </Text>
          <TouchableOpacity
            className="rounded-xl p-4"
            style={{ backgroundColor: colors.surface }}
            onPress={() => setShowCategoryPicker(!showCategoryPicker)}
          >
            <View className="flex-row items-center">
              <IconSymbol 
                name={selectedCategory?.icon as any || 'cube.box.fill'} 
                size={20} 
                color={colors.primary} 
              />
              <Text className="text-base ml-3" style={{ color: colors.foreground }}>
                {selectedCategory?.label || 'Sélectionner'}
              </Text>
            </View>
          </TouchableOpacity>

          {showCategoryPicker && (
            <View className="mt-2 rounded-xl overflow-hidden" style={{ backgroundColor: colors.surface }}>
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat.value}
                  className="flex-row items-center p-4 border-b"
                  style={{ 
                    borderColor: colors.border,
                    backgroundColor: category === cat.value ? colors.primary + '10' : 'transparent',
                  }}
                  onPress={() => {
                    setCategory(cat.value);
                    setShowCategoryPicker(false);
                  }}
                >
                  <IconSymbol name={cat.icon as any} size={20} color={colors.primary} />
                  <Text className="text-base ml-3" style={{ color: colors.foreground }}>
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Description */}
        <View className="mb-4">
          <Text className="text-sm font-semibold mb-2" style={{ color: colors.muted }}>
            DESCRIPTION
          </Text>
          <TextInput
            className="rounded-xl p-4"
            style={{ backgroundColor: colors.surface, color: colors.foreground, minHeight: 80 }}
            placeholder="Description de l'article..."
            placeholderTextColor={colors.muted}
            value={description}
            onChangeText={setDescription}
            multiline
            textAlignVertical="top"
          />
        </View>

        {/* Quantity and Min Quantity */}
        <View className="flex-row gap-4 mb-4">
          <View className="flex-1">
            <Text className="text-sm font-semibold mb-2" style={{ color: colors.muted }}>
              QUANTITÉ *
            </Text>
            <TextInput
              className="rounded-xl p-4"
              style={{ backgroundColor: colors.surface, color: colors.foreground }}
              placeholder="0"
              placeholderTextColor={colors.muted}
              value={quantity}
              onChangeText={setQuantity}
              keyboardType="numeric"
            />
          </View>
          <View className="flex-1">
            <Text className="text-sm font-semibold mb-2" style={{ color: colors.muted }}>
              QUANTITÉ MIN
            </Text>
            <TextInput
              className="rounded-xl p-4"
              style={{ backgroundColor: colors.surface, color: colors.foreground }}
              placeholder="5"
              placeholderTextColor={colors.muted}
              value={minQuantity}
              onChangeText={setMinQuantity}
              keyboardType="numeric"
            />
          </View>
        </View>

        {/* Unit Cost */}
        <View className="mb-4">
          <Text className="text-sm font-semibold mb-2" style={{ color: colors.muted }}>
            COÛT UNITAIRE ($) *
          </Text>
          <TextInput
            className="rounded-xl p-4"
            style={{ backgroundColor: colors.surface, color: colors.foreground }}
            placeholder="0.00"
            placeholderTextColor={colors.muted}
            value={unitCost}
            onChangeText={setUnitCost}
            keyboardType="decimal-pad"
          />
        </View>

        {/* VMRS Code */}
        <View className="mb-4">
          <Text className="text-sm font-semibold mb-2" style={{ color: colors.muted }}>
            CODE VMRS
          </Text>
          <TextInput
            className="rounded-xl p-4"
            style={{ backgroundColor: colors.surface, color: colors.foreground }}
            placeholder="Ex: 015-001-001"
            placeholderTextColor={colors.muted}
            value={vmrsCode}
            onChangeText={setVmrsCode}
          />
        </View>

        {/* Supplier */}
        <View className="mb-4">
          <Text className="text-sm font-semibold mb-2" style={{ color: colors.muted }}>
            FOURNISSEUR
          </Text>
          <TextInput
            className="rounded-xl p-4"
            style={{ backgroundColor: colors.surface, color: colors.foreground }}
            placeholder="Nom du fournisseur"
            placeholderTextColor={colors.muted}
            value={supplier}
            onChangeText={setSupplier}
          />
        </View>

        {/* Location */}
        <View className="mb-6">
          <Text className="text-sm font-semibold mb-2" style={{ color: colors.muted }}>
            EMPLACEMENT
          </Text>
          <TextInput
            className="rounded-xl p-4"
            style={{ backgroundColor: colors.surface, color: colors.foreground }}
            placeholder="Ex: Étagère A-3"
            placeholderTextColor={colors.muted}
            value={location}
            onChangeText={setLocation}
          />
        </View>

        {/* Create Button */}
        <TouchableOpacity
          className="py-4 rounded-xl items-center"
          style={{ backgroundColor: colors.primary, opacity: loading ? 0.7 : 1 }}
          onPress={handleCreate}
          disabled={loading}
        >
          <Text className="text-white font-semibold text-base">
            {loading ? 'Création...' : 'Ajouter à l\'inventaire'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </ScreenContainer>
  );
}
