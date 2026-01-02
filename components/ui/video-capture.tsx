/**
 * Composant VideoCapture
 * Permet de capturer des vidéos courtes comme preuves lors des inspections
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  Pressable,
  Modal,
  StyleSheet,
  Platform,
  Alert,
} from 'react-native';
import { CameraView, useCameraPermissions, CameraType } from 'expo-camera';
import { Video, ResizeMode } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import * as Haptics from 'expo-haptics';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withRepeat,
} from 'react-native-reanimated';
import { useColors } from '@/hooks/use-colors';

// Durée maximale de la vidéo en secondes
const MAX_VIDEO_DURATION = 30;

interface VideoCaptureProps {
  visible: boolean;
  onClose: () => void;
  onVideoCapture: (uri: string, duration: number) => void;
  maxDuration?: number;
}

export function VideoCapture({
  visible,
  onClose,
  onVideoCapture,
  maxDuration = MAX_VIDEO_DURATION,
}: VideoCaptureProps) {
  const colors = useColors();
  const [permission, requestPermission] = useCameraPermissions();
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [previewUri, setPreviewUri] = useState<string | null>(null);
  const [facing, setFacing] = useState<CameraType>('back');
  
  const cameraRef = useRef<CameraView>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  
  // Animation pour le bouton d'enregistrement
  const recordingScale = useSharedValue(1);
  const recordingOpacity = useSharedValue(1);
  
  useEffect(() => {
    if (isRecording) {
      recordingScale.value = withRepeat(
        withTiming(1.2, { duration: 500 }),
        -1,
        true
      );
      recordingOpacity.value = withRepeat(
        withTiming(0.5, { duration: 500 }),
        -1,
        true
      );
    } else {
      recordingScale.value = withTiming(1);
      recordingOpacity.value = withTiming(1);
    }
  }, [isRecording]);
  
  // Nettoyage du timer
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);
  
  // Réinitialiser quand le modal se ferme
  useEffect(() => {
    if (!visible) {
      setPreviewUri(null);
      setRecordingTime(0);
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  }, [visible]);
  
  const recordingButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: recordingScale.value }],
    opacity: recordingOpacity.value,
  }));
  
  // Demander les permissions
  const handleRequestPermission = async () => {
    const result = await requestPermission();
    if (!result.granted) {
      Alert.alert(
        'Permission requise',
        'L\'accès à la caméra est nécessaire pour capturer des vidéos.',
        [{ text: 'OK' }]
      );
    }
  };
  
  // Démarrer l'enregistrement
  const startRecording = async () => {
    if (!cameraRef.current) return;
    
    try {
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
      
      setIsRecording(true);
      setRecordingTime(0);
      
      // Démarrer le timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => {
          if (prev >= maxDuration - 1) {
            stopRecording();
            return prev;
          }
          return prev + 1;
        });
      }, 1000);
      
      const video = await cameraRef.current.recordAsync({
        maxDuration: maxDuration,
      });
      
      if (video?.uri) {
        setPreviewUri(video.uri);
      }
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement:', error);
      Alert.alert('Erreur', 'Impossible de démarrer l\'enregistrement.');
    }
  };
  
  // Arrêter l'enregistrement
  const stopRecording = async () => {
    if (!cameraRef.current || !isRecording) return;
    
    try {
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      
      cameraRef.current.stopRecording();
      setIsRecording(false);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    } catch (error) {
      console.error('Erreur lors de l\'arrêt:', error);
    }
  };
  
  // Basculer la caméra
  const toggleCamera = () => {
    setFacing(prev => prev === 'back' ? 'front' : 'back');
  };
  
  // Confirmer la vidéo
  const confirmVideo = () => {
    if (previewUri) {
      onVideoCapture(previewUri, recordingTime);
      onClose();
    }
  };
  
  // Refaire la vidéo
  const retakeVideo = async () => {
    if (previewUri) {
      try {
        await FileSystem.deleteAsync(previewUri, { idempotent: true });
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
      }
    }
    setPreviewUri(null);
    setRecordingTime(0);
  };
  
  // Formater le temps
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Si pas de permission
  if (!permission) {
    return null;
  }
  
  if (!permission.granted) {
    return (
      <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
        <View style={[styles.container, { backgroundColor: colors.background }]}>
          <View style={styles.permissionContainer}>
            <Text style={[styles.permissionTitle, { color: colors.foreground }]}>
              Accès à la caméra requis
            </Text>
            <Text style={[styles.permissionText, { color: colors.muted }]}>
              Pour capturer des vidéos comme preuves, veuillez autoriser l'accès à la caméra.
            </Text>
            <Pressable
              onPress={handleRequestPermission}
              style={[styles.permissionButton, { backgroundColor: colors.primary }]}
            >
              <Text style={styles.permissionButtonText}>Autoriser</Text>
            </Pressable>
            <Pressable onPress={onClose} style={styles.cancelButton}>
              <Text style={[styles.cancelText, { color: colors.muted }]}>Annuler</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    );
  }
  
  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.container}>
        {previewUri ? (
          // Prévisualisation de la vidéo
          <View style={styles.previewContainer}>
            <Video
              source={{ uri: previewUri }}
              style={styles.preview}
              resizeMode={ResizeMode.CONTAIN}
              shouldPlay
              isLooping
              useNativeControls
            />
            
            <View style={[styles.previewOverlay, { backgroundColor: colors.background }]}>
              <Text style={[styles.previewTitle, { color: colors.foreground }]}>
                Vidéo capturée
              </Text>
              <Text style={[styles.previewDuration, { color: colors.muted }]}>
                Durée: {formatTime(recordingTime)}
              </Text>
              
              <View style={styles.previewButtons}>
                <Pressable
                  onPress={retakeVideo}
                  style={[styles.retakeButton, { borderColor: colors.border }]}
                >
                  <Text style={[styles.retakeText, { color: colors.foreground }]}>
                    🔄 Refaire
                  </Text>
                </Pressable>
                
                <Pressable
                  onPress={confirmVideo}
                  style={[styles.confirmButton, { backgroundColor: colors.success }]}
                >
                  <Text style={styles.confirmText}>✓ Utiliser</Text>
                </Pressable>
              </View>
            </View>
          </View>
        ) : (
          // Vue caméra
          <CameraView
            ref={cameraRef}
            style={styles.camera}
            facing={facing}
            mode="video"
          >
            {/* Header */}
            <View style={styles.header}>
              <Pressable onPress={onClose} style={styles.closeButton}>
                <Text style={styles.closeText}>✕</Text>
              </Pressable>
              
              <View style={styles.timerContainer}>
                <View style={[
                  styles.timerDot,
                  { backgroundColor: isRecording ? '#EF4444' : 'transparent' }
                ]} />
                <Text style={styles.timerText}>
                  {formatTime(recordingTime)} / {formatTime(maxDuration)}
                </Text>
              </View>
              
              <Pressable onPress={toggleCamera} style={styles.flipButton}>
                <Text style={styles.flipText}>🔄</Text>
              </Pressable>
            </View>
            
            {/* Barre de progression */}
            <View style={styles.progressBarContainer}>
              <View
                style={[
                  styles.progressBar,
                  {
                    width: `${(recordingTime / maxDuration) * 100}%`,
                    backgroundColor: recordingTime > maxDuration - 5 ? '#EF4444' : colors.primary,
                  },
                ]}
              />
            </View>
            
            {/* Contrôles */}
            <View style={styles.controls}>
              <Text style={styles.hint}>
                {isRecording
                  ? 'Appuyez pour arrêter'
                  : 'Appuyez pour enregistrer (max 30s)'}
              </Text>
              
              <Pressable
                onPress={isRecording ? stopRecording : startRecording}
                style={styles.recordButtonOuter}
              >
                <Animated.View
                  style={[
                    styles.recordButtonInner,
                    isRecording && styles.recordingActive,
                    recordingButtonStyle,
                  ]}
                />
              </Pressable>
            </View>
          </CameraView>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  permissionTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
  },
  permissionText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  permissionButton: {
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    marginBottom: 16,
  },
  permissionButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    paddingVertical: 12,
  },
  cancelText: {
    fontSize: 16,
  },
  camera: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeText: {
    color: '#FFF',
    fontSize: 20,
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  timerDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  timerText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  flipButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  flipText: {
    fontSize: 20,
  },
  progressBarContainer: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginTop: 20,
    marginHorizontal: 20,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 2,
  },
  controls: {
    position: 'absolute',
    bottom: 60,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  hint: {
    color: '#FFF',
    fontSize: 14,
    marginBottom: 20,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  recordButtonOuter: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    borderColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  recordButtonInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#EF4444',
  },
  recordingActive: {
    borderRadius: 8,
    width: 32,
    height: 32,
  },
  previewContainer: {
    flex: 1,
  },
  preview: {
    flex: 1,
  },
  previewOverlay: {
    padding: 20,
    paddingBottom: 40,
  },
  previewTitle: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 4,
  },
  previewDuration: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
  },
  previewButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
  },
  retakeButton: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 1,
  },
  retakeText: {
    fontSize: 16,
    fontWeight: '600',
  },
  confirmButton: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  confirmText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
