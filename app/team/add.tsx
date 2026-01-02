import { useState, useEffect } from 'react';
import { View, Text, ScrollView, TextInput, Pressable, Alert, Switch } from 'react-native';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

import { ScreenContainer } from '@/components/screen-container';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors } from '@/hooks/use-colors';
import {
  addTeam,
  updateTeam,
  getTeamById,
  type Team,
} from '@/lib/team-service';

const teamColors = [
  '#22C55E', // Green
  '#0EA5E9', // Blue
  '#EF4444', // Red
  '#F59E0B', // Orange
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#14B8A6', // Teal
  '#6366F1', // Indigo
];

export default function AddTeamScreen() {
  const colors = useColors();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const isEditing = !!id;

  const [loading, setLoading] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [teamColor, setTeamColor] = useState(teamColors[0]);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (id) {
      loadTeam();
    }
  }, [id]);

  const loadTeam = async () => {
    if (!id) return;
    try {
      const team = await getTeamById(id);
      if (team) {
        setName(team.name);
        setDescription(team.description || '');
        setTeamColor(team.color);
        setIsActive(team.isActive);
      }
    } catch (error) {
      console.error('Error loading team:', error);
    }
  };

  const validateForm = () => {
    if (!name.trim()) {
      Alert.alert('Erreur', 'Le nom de l\'équipe est requis');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const teamData = {
        name: name.trim(),
        description: description.trim() || undefined,
        color: teamColor,
        isActive,
      };

      if (isEditing && id) {
        await updateTeam(id, teamData);
      } else {
        await addTeam(teamData);
      }

      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }

      router.back();
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de sauvegarder l\'équipe');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer edges={['top', 'left', 'right']}>
      <Stack.Screen
        options={{
          title: isEditing ? 'Modifier l\'équipe' : 'Nouvelle équipe',
          headerBackTitle: 'Annuler',
        }}
      />

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>
        {/* Basic Info */}
        <View
          style={{
            backgroundColor: colors.surface,
            borderRadius: 16,
            padding: 16,
            marginBottom: 16,
            borderWidth: 1,
            borderColor: colors.border,
          }}
        >
          <Text style={{ fontSize: 16, fontWeight: '600', color: colors.foreground, marginBottom: 16 }}>
            Informations de l'équipe
          </Text>

          <View style={{ marginBottom: 16 }}>
            <Text style={{ fontSize: 14, color: colors.muted, marginBottom: 6 }}>Nom de l'équipe *</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Ex: Équipe Maintenance"
              placeholderTextColor={colors.muted}
              style={{
                backgroundColor: colors.background,
                borderRadius: 12,
                padding: 14,
                fontSize: 16,
                color: colors.foreground,
                borderWidth: 1,
                borderColor: colors.border,
              }}
            />
          </View>

          <View>
            <Text style={{ fontSize: 14, color: colors.muted, marginBottom: 6 }}>Description</Text>
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="Description de l'équipe..."
              placeholderTextColor={colors.muted}
              multiline
              numberOfLines={3}
              style={{
                backgroundColor: colors.background,
                borderRadius: 12,
                padding: 14,
                fontSize: 16,
                color: colors.foreground,
                borderWidth: 1,
                borderColor: colors.border,
                minHeight: 80,
                textAlignVertical: 'top',
              }}
            />
          </View>
        </View>

        {/* Color Selection */}
        <View
          style={{
            backgroundColor: colors.surface,
            borderRadius: 16,
            padding: 16,
            marginBottom: 16,
            borderWidth: 1,
            borderColor: colors.border,
          }}
        >
          <Text style={{ fontSize: 16, fontWeight: '600', color: colors.foreground, marginBottom: 12 }}>
            Couleur de l'équipe
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
            {teamColors.map((color) => (
              <Pressable
                key={color}
                onPress={() => setTeamColor(color)}
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 24,
                  backgroundColor: color,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderWidth: teamColor === color ? 3 : 0,
                  borderColor: colors.foreground,
                }}
              >
                {teamColor === color && (
                  <IconSymbol name="checkmark" size={24} color="#FFF" />
                )}
              </Pressable>
            ))}
          </View>
        </View>

        {/* Preview */}
        <View
          style={{
            backgroundColor: colors.surface,
            borderRadius: 16,
            padding: 16,
            marginBottom: 16,
            borderWidth: 1,
            borderColor: colors.border,
          }}
        >
          <Text style={{ fontSize: 16, fontWeight: '600', color: colors.foreground, marginBottom: 12 }}>
            Aperçu
          </Text>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: colors.background,
              padding: 12,
              borderRadius: 12,
            }}
          >
            <View
              style={{
                width: 48,
                height: 48,
                borderRadius: 12,
                backgroundColor: teamColor + '20',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 12,
                borderWidth: 2,
                borderColor: teamColor,
              }}
            >
              <IconSymbol name="person.3.fill" size={22} color={teamColor} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 16, fontWeight: '600', color: colors.foreground }}>
                {name || 'Nom de l\'équipe'}
              </Text>
              {description ? (
                <Text style={{ fontSize: 13, color: colors.muted }} numberOfLines={1}>
                  {description}
                </Text>
              ) : null}
            </View>
          </View>
        </View>

        {/* Status */}
        <View
          style={{
            backgroundColor: colors.surface,
            borderRadius: 16,
            padding: 16,
            marginBottom: 16,
            borderWidth: 1,
            borderColor: colors.border,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 16, fontWeight: '600', color: colors.foreground }}>
                Équipe active
              </Text>
              <Text style={{ fontSize: 13, color: colors.muted, marginTop: 2 }}>
                Les équipes inactives ne peuvent pas être assignées
              </Text>
            </View>
            <Switch
              value={isActive}
              onValueChange={setIsActive}
              trackColor={{ false: colors.border, true: colors.primary + '60' }}
              thumbColor={isActive ? colors.primary : colors.muted}
            />
          </View>
        </View>

        {/* Submit Button */}
        <Pressable
          onPress={handleSubmit}
          disabled={loading}
          style={({ pressed }) => [
            {
              backgroundColor: colors.primary,
              borderRadius: 12,
              padding: 16,
              alignItems: 'center',
              opacity: loading ? 0.6 : pressed ? 0.8 : 1,
            },
          ]}
        >
          <Text style={{ fontSize: 16, fontWeight: '600', color: '#FFF' }}>
            {loading ? 'Enregistrement...' : isEditing ? 'Mettre à jour' : 'Créer l\'équipe'}
          </Text>
        </Pressable>
      </ScrollView>
    </ScreenContainer>
  );
}
