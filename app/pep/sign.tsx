/**
 * Écran de signature et génération PDF de la fiche PEP
 */

import { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Alert,
  TextInput,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors } from '@/hooks/use-colors';
import {
  getPEPForm,
  savePEPForm,
  PEPForm,
  generatePEPPDF,
} from '@/lib/pep-service';

export default function SignPEPScreen() {
  const router = useRouter();
  const { pepId } = useLocalSearchParams<{ pepId: string }>();
  const colors = useColors();
  
  const [form, setForm] = useState<PEPForm | null>(null);
  const [technicianName, setTechnicianName] = useState('');
  const [technicianLicense, setTechnicianLicense] = useState('');
  const [notes, setNotes] = useState('');
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    loadForm();
  }, [pepId]);

  const loadForm = async () => {
    if (!pepId) return;
    const data = await getPEPForm(pepId);
    if (data) {
      setForm(data);
      setTechnicianName(data.mechanicName || '');
      setTechnicianLicense(data.mechanicNumber || '');
      setNotes(data.remarks || '');
    }
  };

  const handleSign = async () => {
    if (!form) return;
    
    if (!technicianName.trim()) {
      Alert.alert('Erreur', 'Veuillez entrer le nom du technicien');
      return;
    }

    setGenerating(true);
    try {
      // Mettre à jour le formulaire avec les informations de signature
      const signedForm: PEPForm = {
        ...form,
        status: 'signed',
        mechanicName: technicianName.trim(),
        mechanicNumber: technicianLicense.trim(),
        remarks: notes.trim(),
      };
      
      await savePEPForm(signedForm);
      
      // Générer le PDF
      const pdfPath = await generatePEPPDF(signedForm);
      
      Alert.alert(
        'Fiche PEP complétée',
        'La fiche a été signée et le PDF a été généré.',
        [
          {
            text: 'Voir le PDF',
            onPress: () => {
              // Navigation vers le viewer PDF
              router.push({
                pathname: '/pep/view-pdf' as any,
                params: { pepId: form.id, pdfPath },
              });
            },
          },
          {
            text: 'Retour à la liste',
            onPress: () => router.push('/pep'),
          },
        ]
      );
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de générer le PDF');
    } finally {
      setGenerating(false);
    }
  };

  // Calculer les statistiques
  const stats = form ? {
    total: form.sections.reduce((acc, s) => acc + s.components.length, 0),
    conforme: form.sections.reduce((acc, s) => 
      acc + s.components.filter(c => c.status === 'C').length, 0),
    mineur: form.sections.reduce((acc, s) => 
      acc + s.components.filter(c => c.status === 'Min').length, 0),
    majeur: form.sections.reduce((acc, s) => 
      acc + s.components.filter(c => c.status === 'Maj').length, 0),
    sansObjet: form.sections.reduce((acc, s) => 
      acc + s.components.filter(c => c.status === 'SO').length, 0),
  } : null;

  if (!form) {
    return (
      <ScreenContainer className="flex-1 items-center justify-center">
        <Text style={{ color: colors.muted }}>Chargement...</Text>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="flex-1">
      {/* Header */}
      <View className="px-4 pt-4 pb-2 border-b" style={{ borderColor: colors.border }}>
        <View className="flex-row items-center">
          <Pressable
            onPress={() => router.back()}
            className="mr-3 p-2 rounded-xl"
            style={{ backgroundColor: colors.surface }}
          >
            <IconSymbol name="chevron.left" size={20} color={colors.foreground} />
          </Pressable>
          <View>
            <Text className="text-xl font-bold" style={{ color: colors.foreground }}>
              Signature et validation
            </Text>
            <Text className="text-sm" style={{ color: colors.muted }}>
              Fiche PEP - {form.vehicleInfo.plateNumber}
            </Text>
          </View>
        </View>
      </View>

      <ScrollView className="flex-1 px-4 py-4">
        {/* Résumé de l'inspection */}
        <View
          className="p-4 rounded-2xl mb-6"
          style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }}
        >
          <Text className="text-lg font-bold mb-4" style={{ color: colors.foreground }}>
            Résumé de l'inspection
          </Text>
          
          <View className="flex-row flex-wrap gap-3">
            <View className="flex-1 min-w-[45%] p-3 rounded-xl" style={{ backgroundColor: colors.success + '20' }}>
              <Text className="text-2xl font-bold" style={{ color: colors.success }}>
                {stats?.conforme || 0}
              </Text>
              <Text className="text-sm" style={{ color: colors.muted }}>Conformes</Text>
            </View>
            
            <View className="flex-1 min-w-[45%] p-3 rounded-xl" style={{ backgroundColor: colors.warning + '20' }}>
              <Text className="text-2xl font-bold" style={{ color: colors.warning }}>
                {stats?.mineur || 0}
              </Text>
              <Text className="text-sm" style={{ color: colors.muted }}>Défauts mineurs</Text>
            </View>
            
            <View className="flex-1 min-w-[45%] p-3 rounded-xl" style={{ backgroundColor: colors.error + '20' }}>
              <Text className="text-2xl font-bold" style={{ color: colors.error }}>
                {stats?.majeur || 0}
              </Text>
              <Text className="text-sm" style={{ color: colors.muted }}>Défauts majeurs</Text>
            </View>
            
            <View className="flex-1 min-w-[45%] p-3 rounded-xl" style={{ backgroundColor: colors.muted + '20' }}>
              <Text className="text-2xl font-bold" style={{ color: colors.muted }}>
                {stats?.sansObjet || 0}
              </Text>
              <Text className="text-sm" style={{ color: colors.muted }}>Sans objet</Text>
            </View>
          </View>

          {(stats?.majeur || 0) > 0 && (
            <View
              className="mt-4 p-3 rounded-xl flex-row items-center"
              style={{ backgroundColor: colors.error + '20' }}
            >
              <IconSymbol name="exclamationmark.triangle.fill" size={20} color={colors.error} />
              <Text className="ml-2 flex-1" style={{ color: colors.error }}>
                Attention: {stats?.majeur} défaut(s) majeur(s) détecté(s). Le véhicule ne devrait pas circuler avant réparation.
              </Text>
            </View>
          )}
        </View>

        {/* Informations du technicien */}
        <View
          className="p-4 rounded-2xl mb-6"
          style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }}
        >
          <Text className="text-lg font-bold mb-4" style={{ color: colors.foreground }}>
            Informations du technicien
          </Text>
          
          <View className="mb-4">
            <Text className="text-sm font-medium mb-2" style={{ color: colors.foreground }}>
              Nom complet *
            </Text>
            <TextInput
              value={technicianName}
              onChangeText={setTechnicianName}
              placeholder="Ex: Jean Tremblay"
              className="p-3 rounded-xl"
              style={{
                backgroundColor: colors.background,
                color: colors.foreground,
                borderWidth: 1,
                borderColor: colors.border,
              }}
              placeholderTextColor={colors.muted}
            />
          </View>

          <View className="mb-4">
            <Text className="text-sm font-medium mb-2" style={{ color: colors.foreground }}>
              Numéro de licence (optionnel)
            </Text>
            <TextInput
              value={technicianLicense}
              onChangeText={setTechnicianLicense}
              placeholder="Ex: MEC-12345"
              className="p-3 rounded-xl"
              style={{
                backgroundColor: colors.background,
                color: colors.foreground,
                borderWidth: 1,
                borderColor: colors.border,
              }}
              placeholderTextColor={colors.muted}
            />
          </View>
        </View>

        {/* Notes */}
        <View
          className="p-4 rounded-2xl mb-6"
          style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }}
        >
          <Text className="text-lg font-bold mb-4" style={{ color: colors.foreground }}>
            Notes et observations
          </Text>
          
          <TextInput
            value={notes}
            onChangeText={setNotes}
            placeholder="Ajoutez des notes ou observations supplémentaires..."
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            className="p-3 rounded-xl"
            style={{
              backgroundColor: colors.background,
              color: colors.foreground,
              borderWidth: 1,
              borderColor: colors.border,
              minHeight: 100,
            }}
            placeholderTextColor={colors.muted}
          />
        </View>

        {/* Déclaration */}
        <View
          className="p-4 rounded-2xl mb-6"
          style={{ backgroundColor: colors.primary + '10', borderWidth: 1, borderColor: colors.primary + '30' }}
        >
          <View className="flex-row items-start">
            <IconSymbol name="checkmark.seal.fill" size={24} color={colors.primary} />
            <View className="ml-3 flex-1">
              <Text className="text-sm font-semibold mb-2" style={{ color: colors.foreground }}>
                Déclaration
              </Text>
              <Text className="text-sm" style={{ color: colors.muted }}>
                Je certifie avoir effectué l'inspection de ce véhicule conformément aux exigences du Programme d'entretien préventif (PEP) de la SAAQ. Les informations consignées dans cette fiche sont exactes et complètes.
              </Text>
            </View>
          </View>
        </View>

        {/* Bouton de signature */}
        <Pressable
          onPress={handleSign}
          disabled={generating || !technicianName.trim()}
          className="py-4 rounded-xl items-center mb-8"
          style={{
            backgroundColor: !technicianName.trim() ? colors.muted : colors.primary,
            opacity: generating ? 0.7 : 1,
          }}
        >
          <View className="flex-row items-center">
            {generating ? (
              <Text className="text-lg font-bold text-white">Génération du PDF...</Text>
            ) : (
              <>
                <IconSymbol name="signature" size={24} color="#FFF" />
                <Text className="text-lg font-bold text-white ml-2">
                  Signer et générer le PDF
                </Text>
              </>
            )}
          </View>
        </Pressable>
      </ScrollView>
    </ScreenContainer>
  );
}
