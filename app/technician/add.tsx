import { useState, useEffect } from 'react';
import { View, Text, ScrollView, TextInput, Pressable, Alert } from 'react-native';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

import { ScreenContainer } from '@/components/screen-container';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors } from '@/hooks/use-colors';
import {
  addTechnician,
  updateTechnician,
  getTechnicianById,
  getTeams,
  specialtyLabels,
  roleLabels,
  type Technician,
  type Team,
  type UserRole,
  type TechnicianSpecialty,
} from '@/lib/team-service';

const roleColors: Record<UserRole, string> = {
  admin: '#8B5CF6',
  manager: '#0EA5E9',
  technician: '#22C55E',
  viewer: '#64748B',
};

export default function AddTechnicianScreen() {
  const colors = useColors();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const isEditing = !!id;

  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(false);

  // Form state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<UserRole>('technician');
  const [teamId, setTeamId] = useState<string | undefined>();
  const [specialties, setSpecialties] = useState<TechnicianSpecialty[]>([]);
  const [certifications, setCertifications] = useState<string[]>([]);
  const [newCertification, setNewCertification] = useState('');

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      const teamsData = await getTeams();
      setTeams(teamsData);

      if (id) {
        const technician = await getTechnicianById(id);
        if (technician) {
          setFirstName(technician.firstName);
          setLastName(technician.lastName);
          setEmail(technician.email);
          setPhone(technician.phone);
          setRole(technician.role);
          setTeamId(technician.teamId);
          setSpecialties(technician.specialties);
          setCertifications(technician.certifications);
        }
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const toggleSpecialty = (specialty: TechnicianSpecialty) => {
    if (specialties.includes(specialty)) {
      setSpecialties(specialties.filter(s => s !== specialty));
    } else {
      setSpecialties([...specialties, specialty]);
    }
  };

  const addCertification = () => {
    if (newCertification.trim()) {
      setCertifications([...certifications, newCertification.trim()]);
      setNewCertification('');
    }
  };

  const removeCertification = (index: number) => {
    setCertifications(certifications.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    if (!firstName.trim()) {
      Alert.alert('Erreur', 'Le prénom est requis');
      return false;
    }
    if (!lastName.trim()) {
      Alert.alert('Erreur', 'Le nom est requis');
      return false;
    }
    if (!email.trim() || !email.includes('@')) {
      Alert.alert('Erreur', 'Un email valide est requis');
      return false;
    }
    if (!phone.trim()) {
      Alert.alert('Erreur', 'Le téléphone est requis');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const technicianData = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        role,
        teamId,
        specialties,
        certifications,
        hireDate: new Date().toISOString().split('T')[0],
        isActive: true,
      };

      if (isEditing && id) {
        await updateTechnician(id, technicianData);
      } else {
        await addTechnician(technicianData);
      }

      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }

      router.back();
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de sauvegarder le technicien');
    } finally {
      setLoading(false);
    }
  };

  const allSpecialties: TechnicianSpecialty[] = [
    'general', 'engine', 'brakes', 'electrical', 'transmission', 'suspension', 'tires', 'bodywork', 'hvac'
  ];

  const roles: UserRole[] = ['admin', 'manager', 'technician', 'viewer'];

  return (
    <ScreenContainer edges={['top', 'left', 'right']}>
      <Stack.Screen
        options={{
          title: isEditing ? 'Modifier technicien' : 'Nouveau technicien',
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
            Informations personnelles
          </Text>

          <View style={{ marginBottom: 16 }}>
            <Text style={{ fontSize: 14, color: colors.muted, marginBottom: 6 }}>Prénom *</Text>
            <TextInput
              value={firstName}
              onChangeText={setFirstName}
              placeholder="Jean"
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

          <View style={{ marginBottom: 16 }}>
            <Text style={{ fontSize: 14, color: colors.muted, marginBottom: 6 }}>Nom *</Text>
            <TextInput
              value={lastName}
              onChangeText={setLastName}
              placeholder="Tremblay"
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

          <View style={{ marginBottom: 16 }}>
            <Text style={{ fontSize: 14, color: colors.muted, marginBottom: 6 }}>Email *</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="jean.tremblay@exemple.com"
              placeholderTextColor={colors.muted}
              keyboardType="email-address"
              autoCapitalize="none"
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
            <Text style={{ fontSize: 14, color: colors.muted, marginBottom: 6 }}>Téléphone *</Text>
            <TextInput
              value={phone}
              onChangeText={setPhone}
              placeholder="514-555-0100"
              placeholderTextColor={colors.muted}
              keyboardType="phone-pad"
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
        </View>

        {/* Role Selection */}
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
            Rôle
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {roles.map((r) => (
              <Pressable
                key={r}
                onPress={() => setRole(r)}
                style={{
                  paddingHorizontal: 16,
                  paddingVertical: 10,
                  borderRadius: 20,
                  backgroundColor: role === r ? roleColors[r] : colors.background,
                  borderWidth: 1,
                  borderColor: role === r ? roleColors[r] : colors.border,
                }}
              >
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: '500',
                    color: role === r ? '#FFF' : colors.foreground,
                  }}
                >
                  {roleLabels[r]}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Team Selection */}
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
            Équipe
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            <Pressable
              onPress={() => setTeamId(undefined)}
              style={{
                paddingHorizontal: 16,
                paddingVertical: 10,
                borderRadius: 20,
                backgroundColor: !teamId ? colors.primary : colors.background,
                borderWidth: 1,
                borderColor: !teamId ? colors.primary : colors.border,
              }}
            >
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: '500',
                  color: !teamId ? '#FFF' : colors.foreground,
                }}
              >
                Aucune
              </Text>
            </Pressable>
            {teams.map((team) => (
              <Pressable
                key={team.id}
                onPress={() => setTeamId(team.id)}
                style={{
                  paddingHorizontal: 16,
                  paddingVertical: 10,
                  borderRadius: 20,
                  backgroundColor: teamId === team.id ? team.color : colors.background,
                  borderWidth: 1,
                  borderColor: teamId === team.id ? team.color : colors.border,
                  flexDirection: 'row',
                  alignItems: 'center',
                }}
              >
                <View
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: teamId === team.id ? '#FFF' : team.color,
                    marginRight: 8,
                  }}
                />
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: '500',
                    color: teamId === team.id ? '#FFF' : colors.foreground,
                  }}
                >
                  {team.name}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Specialties */}
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
            Spécialités
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {allSpecialties.map((specialty) => (
              <Pressable
                key={specialty}
                onPress={() => toggleSpecialty(specialty)}
                style={{
                  paddingHorizontal: 14,
                  paddingVertical: 8,
                  borderRadius: 16,
                  backgroundColor: specialties.includes(specialty) ? colors.primary + '20' : colors.background,
                  borderWidth: 1,
                  borderColor: specialties.includes(specialty) ? colors.primary : colors.border,
                }}
              >
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: '500',
                    color: specialties.includes(specialty) ? colors.primary : colors.foreground,
                  }}
                >
                  {specialtyLabels[specialty]}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Certifications */}
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
            Certifications
          </Text>

          <View style={{ flexDirection: 'row', marginBottom: 12 }}>
            <TextInput
              value={newCertification}
              onChangeText={setNewCertification}
              placeholder="Ajouter une certification..."
              placeholderTextColor={colors.muted}
              style={{
                flex: 1,
                backgroundColor: colors.background,
                borderRadius: 12,
                padding: 12,
                fontSize: 14,
                color: colors.foreground,
                borderWidth: 1,
                borderColor: colors.border,
                marginRight: 8,
              }}
              returnKeyType="done"
              onSubmitEditing={addCertification}
            />
            <Pressable
              onPress={addCertification}
              style={{
                backgroundColor: colors.primary,
                borderRadius: 12,
                paddingHorizontal: 16,
                justifyContent: 'center',
              }}
            >
              <IconSymbol name="plus" size={20} color="#FFF" />
            </Pressable>
          </View>

          {certifications.length > 0 && (
            <View style={{ gap: 8 }}>
              {certifications.map((cert, index) => (
                <View
                  key={index}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: colors.background,
                    padding: 12,
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: colors.border,
                  }}
                >
                  <IconSymbol name="checkmark.seal.fill" size={18} color={colors.success} />
                  <Text style={{ flex: 1, fontSize: 14, color: colors.foreground, marginLeft: 10 }}>
                    {cert}
                  </Text>
                  <Pressable onPress={() => removeCertification(index)}>
                    <IconSymbol name="xmark.circle.fill" size={20} color={colors.muted} />
                  </Pressable>
                </View>
              ))}
            </View>
          )}
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
            {loading ? 'Enregistrement...' : isEditing ? 'Mettre à jour' : 'Créer le technicien'}
          </Text>
        </Pressable>
      </ScrollView>
    </ScreenContainer>
  );
}
