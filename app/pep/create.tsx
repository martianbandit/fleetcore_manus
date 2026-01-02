/**
 * Écran de création/édition de fiche PEP
 * Formulaire interactif avec navigation par sections
 */

import { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  Alert,
  Modal,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors } from '@/hooks/use-colors';
import { getVehicle } from '@/lib/data-service';
import type { Vehicle } from '@/lib/types';
import {
  createEmptyPEPForm,
  savePEPForm,
  PEPForm,
  PEPSection,
  PEPComponent,
  ComponentStatus,
  PEP_SECTIONS,
  DEFECT_CODES,
} from '@/lib/pep-service';

export default function CreatePEPScreen() {
  const router = useRouter();
  const { vehicleId, pepId } = useLocalSearchParams<{ vehicleId: string; pepId?: string }>();
  const colors = useColors();
  
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [form, setForm] = useState<PEPForm | null>(null);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [showDefectModal, setShowDefectModal] = useState(false);
  const [selectedComponent, setSelectedComponent] = useState<{ sectionId: string; componentCode: number } | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, [vehicleId]);

  const loadData = async () => {
    if (!vehicleId) return;
    
    const v = await getVehicle(vehicleId);
    if (v) {
      setVehicle(v);
      
      // Créer un nouveau formulaire PEP
      const newForm = createEmptyPEPForm(vehicleId, {
        plateNumber: v.plate,
        pnbv: 4500, // Par défaut, à ajuster
        make: v.make,
        year: v.year,
        reason: 'Entretien préventif',
        vin: v.vin || '',
        model: v.model,
        odometer: 0, // À remplir manuellement
        odometerUnit: 'km',
      });
      setForm(newForm);
    }
  };

  const handleStatusChange = (sectionId: string, componentCode: number, status: ComponentStatus) => {
    if (!form) return;
    
    setForm(prev => {
      if (!prev) return prev;
      
      const newSections = prev.sections.map(section => {
        if (section.id === sectionId) {
          return {
            ...section,
            components: section.components.map(comp => {
              if (comp.code === componentCode) {
                return { ...comp, status, defectCode: status === 'Min' || status === 'Maj' ? comp.defectCode : undefined };
              }
              return comp;
            }),
          };
        }
        return section;
      });
      
      return { ...prev, sections: newSections };
    });

    // Si défaut, ouvrir le modal pour sélectionner le code
    if (status === 'Min' || status === 'Maj') {
      setSelectedComponent({ sectionId, componentCode });
      setShowDefectModal(true);
    }
  };

  const handleDefectCodeSelect = (code: string) => {
    if (!form || !selectedComponent) return;
    
    setForm(prev => {
      if (!prev) return prev;
      
      const newSections = prev.sections.map(section => {
        if (section.id === selectedComponent.sectionId) {
          return {
            ...section,
            components: section.components.map(comp => {
              if (comp.code === selectedComponent.componentCode) {
                return { ...comp, defectCode: code };
              }
              return comp;
            }),
          };
        }
        return section;
      });
      
      return { ...prev, sections: newSections };
    });
    
    setShowDefectModal(false);
    setSelectedComponent(null);
  };

  const handleSave = async () => {
    if (!form) return;
    
    setSaving(true);
    try {
      await savePEPForm(form);
      Alert.alert('Succès', 'Fiche PEP enregistrée', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error) {
      Alert.alert('Erreur', 'Impossible d\'enregistrer la fiche');
    } finally {
      setSaving(false);
    }
  };

  const handleComplete = async () => {
    if (!form) return;
    
    // Vérifier que tous les composants ont été inspectés
    const uninspected = form.sections.flatMap(s => 
      s.components.filter(c => c.status === 'SO')
    );
    
    if (uninspected.length > 0) {
      Alert.alert(
        'Inspection incomplète',
        `${uninspected.length} composant(s) n'ont pas été inspectés. Voulez-vous continuer?`,
        [
          { text: 'Annuler', style: 'cancel' },
          { text: 'Continuer', onPress: () => saveAndComplete() },
        ]
      );
      return;
    }
    
    saveAndComplete();
  };

  const saveAndComplete = async () => {
    if (!form) return;
    
    setSaving(true);
    try {
      const completedForm = { ...form, status: 'completed' as const };
      await savePEPForm(completedForm);
      router.push({
        pathname: '/pep/sign' as any,
        params: { pepId: form.id },
      });
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de compléter la fiche');
    } finally {
      setSaving(false);
    }
  };

  const currentSection = form?.sections[currentSectionIndex];

  const getStatusButtonStyle = (status: ComponentStatus, currentStatus: ComponentStatus) => {
    const isSelected = status === currentStatus;
    let bgColor = colors.surface;
    let textColor = colors.muted;
    
    if (isSelected) {
      switch (status) {
        case 'SO':
          bgColor = colors.muted + '40';
          textColor = colors.foreground;
          break;
        case 'C':
          bgColor = colors.success;
          textColor = '#FFF';
          break;
        case 'Min':
          bgColor = colors.warning;
          textColor = '#FFF';
          break;
        case 'Maj':
          bgColor = colors.error;
          textColor = '#FFF';
          break;
      }
    }
    
    return { bgColor, textColor, isSelected };
  };

  if (!form || !vehicle) {
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
        <View className="flex-row items-center justify-between mb-2">
          <View className="flex-row items-center">
            <Pressable
              onPress={() => router.back()}
              className="mr-3 p-2 rounded-xl"
              style={{ backgroundColor: colors.surface }}
            >
              <IconSymbol name="chevron.left" size={20} color={colors.foreground} />
            </Pressable>
            <View>
              <Text className="text-lg font-bold" style={{ color: colors.foreground }}>
                Fiche PEP
              </Text>
              <Text className="text-sm" style={{ color: colors.muted }}>
                {vehicle.plate} - {vehicle.make} {vehicle.model}
              </Text>
            </View>
          </View>
          <View className="flex-row gap-2">
            <Pressable
              onPress={handleSave}
              disabled={saving}
              className="px-4 py-2 rounded-xl"
              style={{ backgroundColor: colors.surface }}
            >
              <Text className="font-semibold" style={{ color: colors.primary }}>
                Sauvegarder
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Navigation sections */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-2">
          {form.sections.map((section, index) => {
            const hasDefects = section.components.some(c => c.status === 'Min' || c.status === 'Maj');
            const isComplete = section.components.every(c => c.status !== 'SO');
            
            return (
              <Pressable
                key={section.id}
                onPress={() => setCurrentSectionIndex(index)}
                className="mr-2 px-3 py-2 rounded-lg"
                style={{
                  backgroundColor: index === currentSectionIndex ? colors.primary : colors.surface,
                  borderWidth: 1,
                  borderColor: hasDefects ? colors.error : isComplete ? colors.success : colors.border,
                }}
              >
                <Text
                  className="text-xs font-medium"
                  style={{
                    color: index === currentSectionIndex ? '#FFF' : colors.foreground,
                  }}
                  numberOfLines={1}
                >
                  {index + 1}. {section.title.split(' ')[0]}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* Section actuelle */}
      <ScrollView className="flex-1 px-4 py-4">
        <View className="mb-4">
          <Text className="text-xl font-bold mb-1" style={{ color: colors.foreground }}>
            {currentSection?.title}
          </Text>
          <Text className="text-sm" style={{ color: colors.muted }}>
            {currentSection?.components.length} composants à inspecter
          </Text>
        </View>

        {/* Légende */}
        <View className="flex-row flex-wrap gap-2 mb-4 p-3 rounded-xl" style={{ backgroundColor: colors.surface }}>
          <View className="flex-row items-center">
            <View className="w-6 h-6 rounded items-center justify-center mr-1" style={{ backgroundColor: colors.muted + '40' }}>
              <Text className="text-xs font-bold" style={{ color: colors.foreground }}>S/O</Text>
            </View>
            <Text className="text-xs" style={{ color: colors.muted }}>Sans objet</Text>
          </View>
          <View className="flex-row items-center">
            <View className="w-6 h-6 rounded items-center justify-center mr-1" style={{ backgroundColor: colors.success }}>
              <Text className="text-xs font-bold text-white">C</Text>
            </View>
            <Text className="text-xs" style={{ color: colors.muted }}>Conforme</Text>
          </View>
          <View className="flex-row items-center">
            <View className="w-6 h-6 rounded items-center justify-center mr-1" style={{ backgroundColor: colors.warning }}>
              <Text className="text-xs font-bold text-white">Min</Text>
            </View>
            <Text className="text-xs" style={{ color: colors.muted }}>Mineur</Text>
          </View>
          <View className="flex-row items-center">
            <View className="w-6 h-6 rounded items-center justify-center mr-1" style={{ backgroundColor: colors.error }}>
              <Text className="text-xs font-bold text-white">Maj</Text>
            </View>
            <Text className="text-xs" style={{ color: colors.muted }}>Majeur</Text>
          </View>
        </View>

        {/* Liste des composants */}
        {currentSection?.components.map((component) => (
          <View
            key={component.code}
            className="mb-3 p-3 rounded-xl"
            style={{
              backgroundColor: colors.surface,
              borderWidth: 1,
              borderColor: component.status === 'Maj' ? colors.error : component.status === 'Min' ? colors.warning : colors.border,
            }}
          >
            <View className="flex-row items-center justify-between mb-2">
              <View className="flex-1 mr-2">
                <Text className="text-sm font-semibold" style={{ color: colors.foreground }}>
                  {component.code}. {component.name}
                </Text>
                {component.defectCode && (
                  <Text className="text-xs mt-1" style={{ color: colors.error }}>
                    Défaut: {component.defectCode} - {DEFECT_CODES[component.defectCode] || component.defectCode}
                  </Text>
                )}
              </View>
            </View>
            
            <View className="flex-row gap-2">
              {(['SO', 'C', 'Min', 'Maj'] as ComponentStatus[]).map((status) => {
                const { bgColor, textColor, isSelected } = getStatusButtonStyle(status, component.status);
                return (
                  <Pressable
                    key={status}
                    onPress={() => handleStatusChange(currentSection.id, component.code, status)}
                    className="flex-1 py-2 rounded-lg items-center"
                    style={{
                      backgroundColor: bgColor,
                      borderWidth: isSelected ? 0 : 1,
                      borderColor: colors.border,
                    }}
                  >
                    <Text className="text-xs font-bold" style={{ color: textColor }}>
                      {status === 'SO' ? 'S/O' : status}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        ))}

        {/* Navigation entre sections */}
        <View className="flex-row justify-between mt-6 mb-8">
          <Pressable
            onPress={() => setCurrentSectionIndex(prev => Math.max(0, prev - 1))}
            disabled={currentSectionIndex === 0}
            className="flex-row items-center px-4 py-3 rounded-xl"
            style={{
              backgroundColor: currentSectionIndex === 0 ? colors.surface : colors.primary + '20',
              opacity: currentSectionIndex === 0 ? 0.5 : 1,
            }}
          >
            <IconSymbol name="chevron.left" size={16} color={colors.primary} />
            <Text className="ml-2 font-semibold" style={{ color: colors.primary }}>
              Précédent
            </Text>
          </Pressable>

          {currentSectionIndex === form.sections.length - 1 ? (
            <Pressable
              onPress={handleComplete}
              disabled={saving}
              className="flex-row items-center px-6 py-3 rounded-xl"
              style={{ backgroundColor: colors.success }}
            >
              <Text className="font-bold text-white mr-2">Terminer</Text>
              <IconSymbol name="checkmark" size={16} color="#FFF" />
            </Pressable>
          ) : (
            <Pressable
              onPress={() => setCurrentSectionIndex(prev => Math.min(form.sections.length - 1, prev + 1))}
              className="flex-row items-center px-4 py-3 rounded-xl"
              style={{ backgroundColor: colors.primary }}
            >
              <Text className="mr-2 font-semibold text-white">Suivant</Text>
              <IconSymbol name="chevron.right" size={16} color="#FFF" />
            </Pressable>
          )}
        </View>
      </ScrollView>

      {/* Modal de sélection du code de défaut */}
      <Modal
        visible={showDefectModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowDefectModal(false)}
      >
        <View className="flex-1 justify-end" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <View
            className="rounded-t-3xl p-4 max-h-[70%]"
            style={{ backgroundColor: colors.background }}
          >
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-lg font-bold" style={{ color: colors.foreground }}>
                Code de défectuosité
              </Text>
              <Pressable onPress={() => setShowDefectModal(false)}>
                <IconSymbol name="xmark" size={24} color={colors.muted} />
              </Pressable>
            </View>
            
            <ScrollView>
              {Object.entries(DEFECT_CODES).map(([code, description]) => (
                <Pressable
                  key={code}
                  onPress={() => handleDefectCodeSelect(code)}
                  className="flex-row items-center p-3 mb-2 rounded-xl"
                  style={{ backgroundColor: colors.surface }}
                >
                  <View
                    className="w-10 h-10 rounded-lg items-center justify-center mr-3"
                    style={{ backgroundColor: colors.error + '20' }}
                  >
                    <Text className="font-bold" style={{ color: colors.error }}>
                      {code}
                    </Text>
                  </View>
                  <Text className="flex-1" style={{ color: colors.foreground }}>
                    {description}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}
