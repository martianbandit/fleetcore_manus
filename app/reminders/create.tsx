/**
 * Create Reminder Screen - Création d'un nouveau rappel
 */

import { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  Pressable, 
  TextInput,
  Alert,
  StyleSheet,
  KeyboardAvoidingView,
  Platform as RNPlatform,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

import { ScreenContainer } from '@/components/screen-container';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors } from '@/hooks/use-colors';
import { getVehicles } from '@/lib/data-service';
import type { Vehicle } from '@/lib/types';
import {
  createReminder,
  type ReminderType,
  type ReminderPriority,
  reminderTypeConfig,
  priorityConfig,
} from '@/lib/calendar-service';

export default function CreateReminderScreen() {
  const colors = useColors();
  const router = useRouter();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(false);

  // Form state
  const [type, setType] = useState<ReminderType>('CUSTOM');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState<ReminderPriority>('MEDIUM');
  const [isRecurring, setIsRecurring] = useState(false);

  useEffect(() => {
    loadVehicles();
  }, []);

  const loadVehicles = async () => {
    try {
      const vehiclesData = await getVehicles();
      setVehicles(vehiclesData);
    } catch (error) {
      console.error('Error loading vehicles:', error);
    }
  };

  const handleTypeChange = (newType: ReminderType) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setType(newType);
    // Auto-fill title based on type
    const config = reminderTypeConfig[newType];
    if (!title || Object.values(reminderTypeConfig).some(c => c.label === title)) {
      setTitle(config.label);
    }
  };

  const handlePriorityChange = (newPriority: ReminderPriority) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setPriority(newPriority);
  };

  const validateForm = (): boolean => {
    if (!title.trim()) {
      Alert.alert('Erreur', 'Veuillez entrer un titre');
      return false;
    }
    if (!dueDate.trim()) {
      Alert.alert('Erreur', 'Veuillez entrer une date d\'échéance');
      return false;
    }
    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(dueDate)) {
      Alert.alert('Erreur', 'Format de date invalide. Utilisez AAAA-MM-JJ');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const selectedVehicle = vehicles.find(v => v.id === selectedVehicleId);
      const config = reminderTypeConfig[type];
      const vehicleDisplayName = selectedVehicle 
        ? `${selectedVehicle.unit} - ${selectedVehicle.make} ${selectedVehicle.model}`
        : undefined;

      await createReminder({
        type,
        title: title.trim(),
        description: description.trim(),
        vehicleId: selectedVehicleId || undefined,
        vehicleName: vehicleDisplayName,
        dueDate,
        reminderDays: config.defaultReminderDays,
        priority,
        isRecurring,
        recurrenceRule: isRecurring ? 'RRULE:FREQ=YEARLY' : undefined,
      });

      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }

      Alert.alert('Succès', 'Rappel créé avec succès', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error) {
      console.error('Error creating reminder:', error);
      Alert.alert('Erreur', 'Impossible de créer le rappel');
    } finally {
      setLoading(false);
    }
  };

  // Get today's date for min date
  const today = new Date().toISOString().split('T')[0];

  return (
    <ScreenContainer>
      <KeyboardAvoidingView 
        behavior={RNPlatform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View className="px-4 pt-2 pb-4">
            <View className="flex-row items-center gap-3">
              <Pressable
                onPress={() => router.back()}
                className="w-10 h-10 rounded-full items-center justify-center"
                style={({ pressed }) => [
                  { backgroundColor: colors.surface },
                  pressed && { opacity: 0.7 },
                ]}
              >
                <IconSymbol name="chevron.left" size={20} color={colors.foreground} />
              </Pressable>
              <View>
                <Text className="text-2xl font-bold" style={{ color: colors.foreground }}>
                  Nouveau rappel
                </Text>
                <Text className="text-sm" style={{ color: colors.muted }}>
                  Créer une alerte ou échéance
                </Text>
              </View>
            </View>
          </View>

          {/* Type Selection */}
          <View className="px-4 mb-4">
            <Text className="text-sm font-semibold mb-2" style={{ color: colors.muted }}>
              TYPE DE RAPPEL
            </Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 8 }}
            >
              {(Object.keys(reminderTypeConfig) as ReminderType[]).map((reminderType) => {
                const config = reminderTypeConfig[reminderType];
                const isActive = type === reminderType;

                return (
                  <Pressable
                    key={reminderType}
                    onPress={() => handleTypeChange(reminderType)}
                    className="px-4 py-3 rounded-xl items-center"
                    style={({ pressed }) => [
                      { 
                        backgroundColor: isActive ? `${config.color}20` : colors.surface,
                        borderWidth: 2,
                        borderColor: isActive ? config.color : colors.border,
                        minWidth: 100,
                      },
                      pressed && { opacity: 0.8 },
                    ]}
                  >
                    <IconSymbol 
                      name={config.icon as any} 
                      size={24} 
                      color={isActive ? config.color : colors.muted} 
                    />
                    <Text 
                      className="text-xs font-medium mt-1 text-center"
                      style={{ color: isActive ? config.color : colors.muted }}
                      numberOfLines={2}
                    >
                      {config.label}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>

          {/* Title */}
          <View className="px-4 mb-4">
            <Text className="text-sm font-semibold mb-2" style={{ color: colors.muted }}>
              TITRE *
            </Text>
            <TextInput
              className="rounded-xl px-4 py-3 text-base"
              style={{ 
                backgroundColor: colors.surface, 
                color: colors.foreground,
                borderWidth: 1,
                borderColor: colors.border,
              }}
              placeholder="Ex: Inspection annuelle"
              placeholderTextColor={colors.muted}
              value={title}
              onChangeText={setTitle}
              returnKeyType="next"
            />
          </View>

          {/* Description */}
          <View className="px-4 mb-4">
            <Text className="text-sm font-semibold mb-2" style={{ color: colors.muted }}>
              DESCRIPTION
            </Text>
            <TextInput
              className="rounded-xl px-4 py-3 text-base"
              style={{ 
                backgroundColor: colors.surface, 
                color: colors.foreground,
                borderWidth: 1,
                borderColor: colors.border,
                minHeight: 80,
              }}
              placeholder="Détails supplémentaires..."
              placeholderTextColor={colors.muted}
              value={description}
              onChangeText={setDescription}
              multiline
              textAlignVertical="top"
            />
          </View>

          {/* Vehicle Selection */}
          <View className="px-4 mb-4">
            <Text className="text-sm font-semibold mb-2" style={{ color: colors.muted }}>
              VÉHICULE (OPTIONNEL)
            </Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 8 }}
            >
              <Pressable
                onPress={() => setSelectedVehicleId(null)}
                className="px-4 py-2 rounded-lg"
                style={({ pressed }) => [
                  { 
                    backgroundColor: !selectedVehicleId ? colors.primary : colors.surface,
                    borderWidth: 1,
                    borderColor: !selectedVehicleId ? colors.primary : colors.border,
                  },
                  pressed && { opacity: 0.8 },
                ]}
              >
                <Text 
                  className="font-medium"
                  style={{ color: !selectedVehicleId ? '#FFFFFF' : colors.foreground }}
                >
                  Aucun
                </Text>
              </Pressable>
              {vehicles.map((vehicle) => {
                const isActive = selectedVehicleId === vehicle.id;
                return (
                  <Pressable
                    key={vehicle.id}
                    onPress={() => setSelectedVehicleId(vehicle.id)}
                    className="px-4 py-2 rounded-lg"
                    style={({ pressed }) => [
                      { 
                        backgroundColor: isActive ? colors.primary : colors.surface,
                        borderWidth: 1,
                        borderColor: isActive ? colors.primary : colors.border,
                      },
                      pressed && { opacity: 0.8 },
                    ]}
                  >
                    <Text 
                      className="font-medium"
                      style={{ color: isActive ? '#FFFFFF' : colors.foreground }}
                    >
                      {vehicle.unit}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>

          {/* Due Date */}
          <View className="px-4 mb-4">
            <Text className="text-sm font-semibold mb-2" style={{ color: colors.muted }}>
              DATE D'ÉCHÉANCE *
            </Text>
            <TextInput
              className="rounded-xl px-4 py-3 text-base"
              style={{ 
                backgroundColor: colors.surface, 
                color: colors.foreground,
                borderWidth: 1,
                borderColor: colors.border,
              }}
              placeholder="AAAA-MM-JJ (ex: 2026-02-15)"
              placeholderTextColor={colors.muted}
              value={dueDate}
              onChangeText={setDueDate}
              keyboardType="numbers-and-punctuation"
              returnKeyType="done"
            />
            <Text className="text-xs mt-1" style={{ color: colors.muted }}>
              Format: AAAA-MM-JJ (ex: {today})
            </Text>
          </View>

          {/* Priority */}
          <View className="px-4 mb-4">
            <Text className="text-sm font-semibold mb-2" style={{ color: colors.muted }}>
              PRIORITÉ
            </Text>
            <View className="flex-row gap-2">
              {(Object.keys(priorityConfig) as ReminderPriority[]).map((prio) => {
                const config = priorityConfig[prio];
                const isActive = priority === prio;

                return (
                  <Pressable
                    key={prio}
                    onPress={() => handlePriorityChange(prio)}
                    className="flex-1 py-3 rounded-xl items-center"
                    style={({ pressed }) => [
                      { 
                        backgroundColor: isActive ? config.bgColor : colors.surface,
                        borderWidth: 2,
                        borderColor: isActive ? config.color : colors.border,
                      },
                      pressed && { opacity: 0.8 },
                    ]}
                  >
                    <Text 
                      className="font-semibold"
                      style={{ color: isActive ? config.color : colors.muted }}
                    >
                      {config.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* Recurring Toggle */}
          <View className="px-4 mb-6">
            <Pressable
              onPress={() => setIsRecurring(!isRecurring)}
              className="flex-row items-center justify-between py-4 px-4 rounded-xl"
              style={({ pressed }) => [
                { 
                  backgroundColor: colors.surface,
                  borderWidth: 1,
                  borderColor: colors.border,
                },
                pressed && { opacity: 0.8 },
              ]}
            >
              <View className="flex-row items-center gap-3">
                <IconSymbol 
                  name="arrow.clockwise" 
                  size={20} 
                  color={isRecurring ? colors.primary : colors.muted} 
                />
                <View>
                  <Text className="font-medium" style={{ color: colors.foreground }}>
                    Rappel récurrent
                  </Text>
                  <Text className="text-xs" style={{ color: colors.muted }}>
                    Se répète chaque année
                  </Text>
                </View>
              </View>
              <View 
                className="w-12 h-7 rounded-full justify-center px-1"
                style={{ 
                  backgroundColor: isRecurring ? colors.primary : colors.border 
                }}
              >
                <View 
                  className="w-5 h-5 rounded-full"
                  style={{ 
                    backgroundColor: '#FFFFFF',
                    alignSelf: isRecurring ? 'flex-end' : 'flex-start',
                  }}
                />
              </View>
            </Pressable>
          </View>

          {/* Submit Button */}
          <View className="px-4 mb-8">
            <Pressable
              onPress={handleSubmit}
              disabled={loading}
              className="py-4 rounded-xl items-center"
              style={({ pressed }) => [
                { backgroundColor: colors.primary },
                pressed && { opacity: 0.8 },
                loading && { opacity: 0.5 },
              ]}
            >
              <Text className="font-bold text-lg" style={{ color: '#FFFFFF' }}>
                {loading ? 'Création...' : 'Créer le rappel'}
              </Text>
            </Pressable>
          </View>

          {/* Bottom spacing */}
          <View className="h-8" />
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
  },
});
