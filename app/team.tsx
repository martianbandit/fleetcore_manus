import { useState, useEffect, useCallback } from 'react';
import { ScrollView, Text, View, Pressable, RefreshControl, StyleSheet, Alert, TextInput } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { ScreenContainer } from '@/components/screen-container';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors } from '@/hooks/use-colors';
import { getTechnicianMetrics, type TechnicianMetrics } from '@/lib/metrics-service';

interface Technician {
  id: string;
  name: string;
  email: string;
  phone: string;
  photo?: string;
  certifications: string[];
  createdAt: string;
}

export default function TeamScreen() {
  const router = useRouter();
  const colors = useColors();
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [metrics, setMetrics] = useState<Record<string, TechnicianMetrics>>({});
  const [refreshing, setRefreshing] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    photo: '',
    certifications: '',
  });

  const loadData = useCallback(async () => {
    try {
      // Load technicians from AsyncStorage
      const stored = await AsyncStorage.getItem('technicians');
      const techList: Technician[] = stored ? JSON.parse(stored) : [];
      setTechnicians(techList);

      // Load metrics for each technician
      const metricsMap: Record<string, TechnicianMetrics> = {};
      for (const tech of techList) {
        const techMetrics = await getTechnicianMetrics(tech.id);
        metricsMap[tech.id] = techMetrics;
      }
      setMetrics(metricsMap);
    } catch (error) {
      console.error('Error loading technicians:', error);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  const handleAddTechnician = async () => {
    if (!formData.name.trim() || !formData.email.trim()) {
      Alert.alert('Erreur', 'Le nom et l\'email sont obligatoires');
      return;
    }

    const newTech: Technician = {
      id: `tech_${Date.now()}`,
      name: formData.name.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      photo: formData.photo,
      certifications: formData.certifications.split(',').map(c => c.trim()).filter(Boolean),
      createdAt: new Date().toISOString(),
    };

    const updated = [...technicians, newTech];
    await AsyncStorage.setItem('technicians', JSON.stringify(updated));
    setTechnicians(updated);
    setShowAddForm(false);
    setFormData({ name: '', email: '', phone: '', photo: '', certifications: '' });

    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  const handleDeleteTechnician = async (id: string) => {
    Alert.alert(
      'Supprimer le technicien',
      'Êtes-vous sûr de vouloir supprimer ce technicien ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            const updated = technicians.filter(t => t.id !== id);
            await AsyncStorage.setItem('technicians', JSON.stringify(updated));
            setTechnicians(updated);
            if (Platform.OS !== 'web') {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            }
          },
        },
      ]
    );
  };

  const handlePickPhoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setFormData({ ...formData, photo: result.assets[0].uri });
    }
  };

  const styles = StyleSheet.create({
    techCard: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    addButton: {
      backgroundColor: colors.primary,
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderRadius: 8,
      alignItems: 'center',
      marginBottom: 16,
    },
    input: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      padding: 12,
      marginBottom: 12,
      color: colors.foreground,
    },
  });

  return (
    <>
      <Stack.Screen options={{ title: 'Équipe', headerShown: true }} />
      <ScreenContainer className="p-4">
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          {/* Header */}
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-2xl font-bold" style={{ color: colors.foreground }}>
              Techniciens ({technicians.length})
            </Text>
            <Pressable
              onPress={() => setShowAddForm(!showAddForm)}
              style={({ pressed }) => [
                {
                  backgroundColor: colors.primary,
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  borderRadius: 8,
                  opacity: pressed ? 0.8 : 1,
                },
              ]}
            >
              <Text className="text-white font-semibold">
                {showAddForm ? 'Annuler' : '+ Ajouter'}
              </Text>
            </Pressable>
          </View>

          {/* Add Form */}
          {showAddForm && (
            <View className="mb-6 p-4 rounded-xl" style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }}>
              <Text className="text-lg font-bold mb-3" style={{ color: colors.foreground }}>
                Nouveau technicien
              </Text>

              {formData.photo ? (
                <Pressable onPress={handlePickPhoto} className="mb-3">
                  <Image source={{ uri: formData.photo }} style={{ width: 80, height: 80, borderRadius: 40 }} />
                </Pressable>
              ) : (
                <Pressable
                  onPress={handlePickPhoto}
                  style={[styles.input, { alignItems: 'center', paddingVertical: 20 }]}
                >
                  <IconSymbol name="person.circle.fill" size={40} color={colors.muted} />
                  <Text className="text-sm mt-2" style={{ color: colors.muted }}>
                    Ajouter une photo
                  </Text>
                </Pressable>
              )}

              <TextInput
                style={styles.input}
                placeholder="Nom complet *"
                placeholderTextColor={colors.muted}
                value={formData.name}
                onChangeText={(text) => setFormData({ ...formData, name: text })}
              />

              <TextInput
                style={styles.input}
                placeholder="Email *"
                placeholderTextColor={colors.muted}
                value={formData.email}
                onChangeText={(text) => setFormData({ ...formData, email: text })}
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <TextInput
                style={styles.input}
                placeholder="Téléphone"
                placeholderTextColor={colors.muted}
                value={formData.phone}
                onChangeText={(text) => setFormData({ ...formData, phone: text })}
                keyboardType="phone-pad"
              />

              <TextInput
                style={styles.input}
                placeholder="Certifications (séparées par des virgules)"
                placeholderTextColor={colors.muted}
                value={formData.certifications}
                onChangeText={(text) => setFormData({ ...formData, certifications: text })}
              />

              <Pressable
                onPress={handleAddTechnician}
                style={({ pressed }) => [
                  styles.addButton,
                  { opacity: pressed ? 0.8 : 1 },
                ]}
              >
                <Text className="text-white font-semibold">Ajouter le technicien</Text>
              </Pressable>
            </View>
          )}

          {/* Technicians List */}
          {technicians.length === 0 ? (
            <View className="items-center justify-center py-20">
              <IconSymbol name="person.2.fill" size={64} color={colors.muted} />
              <Text className="text-lg mt-4" style={{ color: colors.muted }}>
                Aucun technicien
              </Text>
              <Text className="text-sm mt-1 text-center" style={{ color: colors.muted }}>
                Ajoutez des techniciens pour suivre leurs performances
              </Text>
            </View>
          ) : (
            technicians.map((tech) => {
              const techMetrics = metrics[tech.id];
              return (
                <View key={tech.id} style={styles.techCard}>
                  <View className="flex-row items-start">
                    {tech.photo ? (
                      <Image source={{ uri: tech.photo }} style={{ width: 60, height: 60, borderRadius: 30, marginRight: 12 }} />
                    ) : (
                      <View className="w-15 h-15 rounded-full items-center justify-center mr-3" style={{ backgroundColor: colors.primary + '20' }}>
                        <IconSymbol name="person.fill" size={32} color={colors.primary} />
                      </View>
                    )}

                    <View className="flex-1">
                      <Text className="text-lg font-bold" style={{ color: colors.foreground }}>
                        {tech.name}
                      </Text>
                      <Text className="text-sm mt-1" style={{ color: colors.muted }}>
                        {tech.email}
                      </Text>
                      {tech.phone && (
                        <Text className="text-sm" style={{ color: colors.muted }}>
                          {tech.phone}
                        </Text>
                      )}
                      {tech.certifications.length > 0 && (
                        <View className="flex-row flex-wrap mt-2">
                          {tech.certifications.map((cert, idx) => (
                            <View
                              key={idx}
                              className="px-2 py-1 rounded mr-2 mb-1"
                              style={{ backgroundColor: colors.primary + '20' }}
                            >
                              <Text className="text-xs" style={{ color: colors.primary }}>
                                {cert}
                              </Text>
                            </View>
                          ))}
                        </View>
                      )}
                    </View>

                    <Pressable
                      onPress={() => handleDeleteTechnician(tech.id)}
                      style={({ pressed }) => [{
                        padding: 8,
                        opacity: pressed ? 0.6 : 1,
                      }]}
                    >
                      <IconSymbol name="trash.fill" size={20} color={colors.error} />
                    </Pressable>
                  </View>

                  {/* Metrics */}
                  {techMetrics && (
                    <View className="mt-4 pt-4" style={{ borderTopWidth: 1, borderColor: colors.border }}>
                      <Text className="text-sm font-semibold mb-2" style={{ color: colors.foreground }}>
                        Statistiques
                      </Text>
                      <View className="flex-row justify-between">
                        <View>
                          <Text className="text-xs" style={{ color: colors.muted }}>Inspections</Text>
                          <Text className="text-lg font-bold" style={{ color: colors.foreground }}>
                            {techMetrics.totalInspections}
                          </Text>
                        </View>
                        <View>
                          <Text className="text-xs" style={{ color: colors.muted }}>Temps moyen</Text>
                          <Text className="text-lg font-bold" style={{ color: colors.foreground }}>
                            {Math.round(techMetrics.averageInspectionTime)}m
                          </Text>
                        </View>
                        <View>
                          <Text className="text-xs" style={{ color: colors.muted }}>Défauts trouvés</Text>
                          <Text className="text-lg font-bold" style={{ color: colors.foreground }}>
                            {techMetrics.defectsFound}
                          </Text>
                        </View>
                        <View>
                          <Text className="text-xs" style={{ color: colors.muted }}>Efficacité</Text>
                          <Text className="text-lg font-bold" style={{ color: colors.success }}>
                            {Math.round((techMetrics.totalInspections / (techMetrics.totalInspections + 1)) * 100)}%
                          </Text>
                        </View>
                      </View>
                    </View>
                  )}
                </View>
              );
            })
          )}
        </ScrollView>
      </ScreenContainer>
    </>
  );
}
