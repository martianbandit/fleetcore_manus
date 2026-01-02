/**
 * Composant de diagramme de véhicule interactif
 * Vue de dessus avec positions numérotées pour pneus et freins
 */

import { useState } from 'react';
import { View, Text, Pressable, Modal, TextInput, ScrollView } from 'react-native';
import Svg, { Rect, Circle, Line, Text as SvgText, G, Path } from 'react-native-svg';
import { useColors } from '@/hooks/use-colors';

interface Position {
  id: number;
  x: number;
  y: number;
  type: 'pneu' | 'frein' | 'general';
  label: string;
}

interface PositionData {
  positionId: number;
  measure?: number;
  measureUnit?: string;
  status?: 'ok' | 'warning' | 'error';
}

interface VehicleDiagramProps {
  positions?: PositionData[];
  onPositionPress?: (positionId: number) => void;
  editable?: boolean;
  vehicleType?: 'truck' | 'trailer' | 'bus';
}

// Positions du diagramme selon le formulaire SAAQ
const TRUCK_POSITIONS: Position[] = [
  // Avant
  { id: 1, x: 150, y: 30, type: 'general', label: 'Avant centre' },
  { id: 2, x: 50, y: 50, type: 'general', label: 'Avant gauche' },
  { id: 3, x: 250, y: 50, type: 'general', label: 'Avant droit' },
  
  // Pneus avant
  { id: 40, x: 30, y: 80, type: 'pneu', label: 'Pneu AV-G' },
  { id: 50, x: 270, y: 80, type: 'pneu', label: 'Pneu AV-D' },
  
  // Freins avant
  { id: 20, x: 60, y: 80, type: 'frein', label: 'Frein AV-G' },
  { id: 5, x: 150, y: 80, type: 'frein', label: 'Frein AV-C' },
  { id: 30, x: 240, y: 80, type: 'frein', label: 'Frein AV-D' },
  
  // Essieu 2
  { id: 41, x: 30, y: 140, type: 'pneu', label: 'Pneu E2-G' },
  { id: 51, x: 270, y: 140, type: 'pneu', label: 'Pneu E2-D' },
  { id: 21, x: 60, y: 140, type: 'frein', label: 'Frein E2-G' },
  { id: 31, x: 240, y: 140, type: 'frein', label: 'Frein E2-D' },
  
  // Essieu 3
  { id: 42, x: 30, y: 200, type: 'pneu', label: 'Pneu E3-G' },
  { id: 52, x: 270, y: 200, type: 'pneu', label: 'Pneu E3-D' },
  { id: 22, x: 60, y: 200, type: 'frein', label: 'Frein E3-G' },
  { id: 32, x: 240, y: 200, type: 'frein', label: 'Frein E3-D' },
  
  // Côtés
  { id: 4, x: 10, y: 100, type: 'general', label: 'Côté G avant' },
  { id: 6, x: 10, y: 160, type: 'general', label: 'Côté G milieu' },
  { id: 8, x: 10, y: 220, type: 'general', label: 'Côté G arrière' },
  { id: 14, x: 290, y: 100, type: 'general', label: 'Côté D avant' },
  { id: 16, x: 290, y: 160, type: 'general', label: 'Côté D milieu' },
  { id: 18, x: 290, y: 220, type: 'general', label: 'Côté D arrière' },
  
  // Arrière
  { id: 9, x: 150, y: 280, type: 'general', label: 'Arrière centre' },
  { id: 10, x: 50, y: 260, type: 'general', label: 'Arrière gauche' },
  { id: 11, x: 100, y: 260, type: 'general', label: 'Arrière C-G' },
  { id: 12, x: 200, y: 260, type: 'general', label: 'Arrière C-D' },
  { id: 19, x: 250, y: 260, type: 'general', label: 'Arrière droit' },
  
  // Essieux arrière (remorque)
  { id: 43, x: 30, y: 320, type: 'pneu', label: 'Pneu AR1-G' },
  { id: 53, x: 270, y: 320, type: 'pneu', label: 'Pneu AR1-D' },
  { id: 23, x: 100, y: 320, type: 'frein', label: 'Frein AR1' },
  { id: 33, x: 200, y: 320, type: 'frein', label: 'Frein AR1' },
  
  { id: 44, x: 30, y: 360, type: 'pneu', label: 'Pneu AR2-G' },
  { id: 54, x: 270, y: 360, type: 'pneu', label: 'Pneu AR2-D' },
  { id: 24, x: 100, y: 360, type: 'frein', label: 'Frein AR2' },
  { id: 34, x: 200, y: 360, type: 'frein', label: 'Frein AR2' },
];

export function VehicleDiagram({
  positions = [],
  onPositionPress,
  editable = false,
  vehicleType = 'truck',
}: VehicleDiagramProps) {
  const colors = useColors();
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [measureValue, setMeasureValue] = useState('');

  const getPositionStatus = (positionId: number) => {
    const data = positions.find(p => p.positionId === positionId);
    return data?.status || 'ok';
  };

  const getPositionColor = (positionId: number, type: Position['type']) => {
    const status = getPositionStatus(positionId);
    
    if (status === 'error') return colors.error;
    if (status === 'warning') return colors.warning;
    
    switch (type) {
      case 'pneu':
        return colors.primary;
      case 'frein':
        return colors.accent || colors.primary;
      default:
        return colors.muted;
    }
  };

  const handlePositionPress = (position: Position) => {
    if (editable) {
      setSelectedPosition(position);
      setShowModal(true);
    } else if (onPositionPress) {
      onPositionPress(position.id);
    }
  };

  const handleSaveMeasure = () => {
    if (selectedPosition && onPositionPress) {
      onPositionPress(selectedPosition.id);
    }
    setShowModal(false);
    setSelectedPosition(null);
    setMeasureValue('');
  };

  return (
    <View>
      <View
        className="rounded-2xl p-4"
        style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }}
      >
        {/* Légende */}
        <View className="flex-row justify-center gap-4 mb-4">
          <View className="flex-row items-center">
            <View className="w-4 h-4 rounded-full mr-2" style={{ backgroundColor: colors.primary }} />
            <Text className="text-xs" style={{ color: colors.muted }}>Pneu</Text>
          </View>
          <View className="flex-row items-center">
            <View className="w-4 h-4 rounded mr-2" style={{ backgroundColor: colors.accent || colors.primary }} />
            <Text className="text-xs" style={{ color: colors.muted }}>Frein</Text>
          </View>
          <View className="flex-row items-center">
            <View className="w-4 h-4 rounded-full mr-2" style={{ backgroundColor: colors.muted }} />
            <Text className="text-xs" style={{ color: colors.muted }}>Position</Text>
          </View>
        </View>

        {/* Diagramme SVG */}
        <Svg width="100%" height={420} viewBox="0 0 300 420">
          {/* Contour du véhicule */}
          <G>
            {/* Cabine */}
            <Rect
              x={40}
              y={40}
              width={220}
              height={100}
              rx={20}
              fill={colors.background}
              stroke={colors.border}
              strokeWidth={2}
            />
            {/* Pare-brise */}
            <Rect
              x={60}
              y={50}
              width={180}
              height={30}
              rx={5}
              fill={colors.primary + '20'}
              stroke={colors.primary}
              strokeWidth={1}
            />
            
            {/* Remorque */}
            <Rect
              x={40}
              y={150}
              width={220}
              height={180}
              rx={5}
              fill={colors.background}
              stroke={colors.border}
              strokeWidth={2}
            />
            
            {/* Attelage */}
            <Rect
              x={140}
              y={140}
              width={20}
              height={15}
              fill={colors.muted}
            />
          </G>

          {/* Indicateurs Avant/Arrière */}
          <SvgText
            x={150}
            y={20}
            textAnchor="middle"
            fill={colors.foreground}
            fontSize={12}
            fontWeight="bold"
          >
            AVANT
          </SvgText>
          <SvgText
            x={150}
            y={410}
            textAnchor="middle"
            fill={colors.foreground}
            fontSize={12}
            fontWeight="bold"
          >
            ARRIÈRE
          </SvgText>

          {/* Positions */}
          {TRUCK_POSITIONS.map((pos) => {
            const color = getPositionColor(pos.id, pos.type);
            const size = pos.type === 'pneu' ? 16 : pos.type === 'frein' ? 14 : 10;
            
            return (
              <G key={pos.id} onPress={() => handlePositionPress(pos)}>
                {pos.type === 'pneu' ? (
                  // Pneu = cercle
                  <Circle
                    cx={pos.x}
                    cy={pos.y}
                    r={size / 2}
                    fill={color}
                    stroke={colors.background}
                    strokeWidth={2}
                  />
                ) : pos.type === 'frein' ? (
                  // Frein = carré
                  <Rect
                    x={pos.x - size / 2}
                    y={pos.y - size / 2}
                    width={size}
                    height={size}
                    fill={color}
                    stroke={colors.background}
                    strokeWidth={2}
                    rx={2}
                  />
                ) : (
                  // Position générale = petit cercle
                  <Circle
                    cx={pos.x}
                    cy={pos.y}
                    r={size / 2}
                    fill={color + '60'}
                    stroke={color}
                    strokeWidth={1}
                  />
                )}
                
                {/* Numéro de position */}
                <SvgText
                  x={pos.x}
                  y={pos.y + 4}
                  textAnchor="middle"
                  fill="#FFF"
                  fontSize={8}
                  fontWeight="bold"
                >
                  {pos.id}
                </SvgText>
              </G>
            );
          })}
        </Svg>

        {/* Instructions */}
        {editable && (
          <Text className="text-xs text-center mt-2" style={{ color: colors.muted }}>
            Appuyez sur une position pour ajouter une mesure
          </Text>
        )}
      </View>

      {/* Modal de mesure */}
      <Modal
        visible={showModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowModal(false)}
      >
        <View className="flex-1 justify-center items-center" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <View
            className="w-80 rounded-2xl p-4"
            style={{ backgroundColor: colors.background }}
          >
            <Text className="text-lg font-bold mb-2" style={{ color: colors.foreground }}>
              {selectedPosition?.label}
            </Text>
            <Text className="text-sm mb-4" style={{ color: colors.muted }}>
              Position #{selectedPosition?.id}
            </Text>
            
            <View className="mb-4">
              <Text className="text-sm font-medium mb-2" style={{ color: colors.foreground }}>
                Mesure
              </Text>
              <TextInput
                value={measureValue}
                onChangeText={setMeasureValue}
                placeholder="Ex: 5.5"
                keyboardType="decimal-pad"
                className="p-3 rounded-xl"
                style={{
                  backgroundColor: colors.surface,
                  color: colors.foreground,
                  borderWidth: 1,
                  borderColor: colors.border,
                }}
                placeholderTextColor={colors.muted}
              />
            </View>

            <View className="flex-row gap-2">
              <Pressable
                onPress={() => setShowModal(false)}
                className="flex-1 py-3 rounded-xl items-center"
                style={{ backgroundColor: colors.surface }}
              >
                <Text className="font-semibold" style={{ color: colors.foreground }}>
                  Annuler
                </Text>
              </Pressable>
              <Pressable
                onPress={handleSaveMeasure}
                className="flex-1 py-3 rounded-xl items-center"
                style={{ backgroundColor: colors.primary }}
              >
                <Text className="font-semibold text-white">
                  Enregistrer
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
