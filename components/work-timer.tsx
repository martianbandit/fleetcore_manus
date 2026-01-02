/**
 * WorkTimer - Composant chronomètre de travail
 * Permet de démarrer/arrêter le suivi du temps de travail
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, Pressable, Alert } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors } from '@/hooks/use-colors';

const ACTIVE_TIMER_KEY = '@fleetcore_active_timer';

export interface TimerSession {
  id: string;
  workOrderId: string;
  workOrderItemId?: string;
  technicianId: string;
  technicianName: string;
  startTime: string;
  endTime?: string;
  duration: number; // seconds
  notes?: string;
}

interface WorkTimerProps {
  workOrderId: string;
  workOrderItemId?: string;
  technicianId: string;
  technicianName: string;
  onTimeLogged?: (session: TimerSession) => void;
  compact?: boolean;
}

// Format seconds to HH:MM:SS
function formatTime(seconds: number): string {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hrs > 0) {
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// Format seconds to human readable
function formatDuration(seconds: number): string {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  
  if (hrs > 0) {
    return `${hrs}h ${mins}min`;
  }
  return `${mins} min`;
}

export function WorkTimer({
  workOrderId,
  workOrderItemId,
  technicianId,
  technicianName,
  onTimeLogged,
  compact = false,
}: WorkTimerProps) {
  const colors = useColors();
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Load active timer on mount
  useEffect(() => {
    loadActiveTimer();
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [workOrderId, workOrderItemId]);

  // Update elapsed time every second when running
  useEffect(() => {
    if (isRunning && startTime) {
      intervalRef.current = setInterval(() => {
        const now = new Date();
        const elapsed = Math.floor((now.getTime() - startTime.getTime()) / 1000);
        setElapsedTime(elapsed);
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, startTime]);

  const loadActiveTimer = async () => {
    try {
      const data = await AsyncStorage.getItem(ACTIVE_TIMER_KEY);
      if (data) {
        const timer = JSON.parse(data);
        // Check if this timer belongs to current work order/item
        if (timer.workOrderId === workOrderId && 
            (!workOrderItemId || timer.workOrderItemId === workOrderItemId)) {
          const start = new Date(timer.startTime);
          setStartTime(start);
          setIsRunning(true);
          const elapsed = Math.floor((new Date().getTime() - start.getTime()) / 1000);
          setElapsedTime(elapsed);
        }
      }
    } catch (error) {
      console.error('Error loading active timer:', error);
    }
  };

  const handleStart = async () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    const now = new Date();
    setStartTime(now);
    setIsRunning(true);
    setElapsedTime(0);

    // Save active timer
    const timerData = {
      workOrderId,
      workOrderItemId,
      technicianId,
      technicianName,
      startTime: now.toISOString(),
    };
    await AsyncStorage.setItem(ACTIVE_TIMER_KEY, JSON.stringify(timerData));
  };

  const handleStop = async () => {
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    if (!startTime) return;

    const endTime = new Date();
    const duration = Math.floor((endTime.getTime() - startTime.getTime()) / 1000);

    // Create session
    const session: TimerSession = {
      id: `timer-${Date.now()}`,
      workOrderId,
      workOrderItemId,
      technicianId,
      technicianName,
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      duration,
    };

    // Save session to history
    await saveTimerSession(session);

    // Clear active timer
    await AsyncStorage.removeItem(ACTIVE_TIMER_KEY);

    // Reset state
    setIsRunning(false);
    setStartTime(null);
    setElapsedTime(0);

    // Callback
    if (onTimeLogged) {
      onTimeLogged(session);
    }

    Alert.alert(
      'Temps enregistré',
      `Durée: ${formatDuration(duration)}`,
      [{ text: 'OK' }]
    );
  };

  const handleCancel = () => {
    Alert.alert(
      'Annuler le chrono',
      'Voulez-vous annuler le chrono en cours? Le temps ne sera pas enregistré.',
      [
        { text: 'Non', style: 'cancel' },
        {
          text: 'Oui, annuler',
          style: 'destructive',
          onPress: async () => {
            if (Platform.OS !== 'web') {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            }
            await AsyncStorage.removeItem(ACTIVE_TIMER_KEY);
            setIsRunning(false);
            setStartTime(null);
            setElapsedTime(0);
          },
        },
      ]
    );
  };

  if (compact) {
    return (
      <View className="flex-row items-center gap-2">
        <View 
          className="flex-row items-center gap-2 px-3 py-2 rounded-lg"
          style={{ backgroundColor: isRunning ? `${colors.success}20` : colors.surface }}
        >
          <View 
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: isRunning ? colors.success : colors.muted }}
          />
          <Text 
            className="font-mono font-semibold"
            style={{ color: isRunning ? colors.success : colors.muted }}
          >
            {formatTime(elapsedTime)}
          </Text>
        </View>
        
        {!isRunning ? (
          <Pressable
            onPress={handleStart}
            className="w-10 h-10 rounded-full items-center justify-center"
            style={{ backgroundColor: colors.success }}
          >
            <IconSymbol name="play.fill" size={18} color="#FFFFFF" />
          </Pressable>
        ) : (
          <View className="flex-row gap-1">
            <Pressable
              onPress={handleStop}
              className="w-10 h-10 rounded-full items-center justify-center"
              style={{ backgroundColor: colors.primary }}
            >
              <IconSymbol name="stop.fill" size={18} color="#FFFFFF" />
            </Pressable>
            <Pressable
              onPress={handleCancel}
              className="w-10 h-10 rounded-full items-center justify-center"
              style={{ backgroundColor: colors.error }}
            >
              <IconSymbol name="xmark" size={18} color="#FFFFFF" />
            </Pressable>
          </View>
        )}
      </View>
    );
  }

  return (
    <View 
      className="rounded-xl p-4 border"
      style={{ backgroundColor: colors.surface, borderColor: colors.border }}
    >
      <View className="flex-row items-center justify-between mb-4">
        <View className="flex-row items-center gap-2">
          <IconSymbol name="clock.fill" size={20} color={colors.primary} />
          <Text className="font-semibold" style={{ color: colors.foreground }}>
            Chrono de travail
          </Text>
        </View>
        {isRunning && (
          <View 
            className="flex-row items-center gap-1 px-2 py-1 rounded-full"
            style={{ backgroundColor: `${colors.success}20` }}
          >
            <View className="w-2 h-2 rounded-full" style={{ backgroundColor: colors.success }} />
            <Text className="text-xs font-medium" style={{ color: colors.success }}>
              En cours
            </Text>
          </View>
        )}
      </View>

      {/* Timer Display */}
      <View className="items-center py-6">
        <Text 
          className="text-5xl font-mono font-bold"
          style={{ color: isRunning ? colors.success : colors.foreground }}
        >
          {formatTime(elapsedTime)}
        </Text>
        {startTime && (
          <Text className="text-sm mt-2" style={{ color: colors.muted }}>
            Démarré à {startTime.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
          </Text>
        )}
      </View>

      {/* Controls */}
      <View className="flex-row gap-3">
        {!isRunning ? (
          <Pressable
            onPress={handleStart}
            className="flex-1 flex-row items-center justify-center gap-2 py-4 rounded-xl"
            style={({ pressed }) => [
              { backgroundColor: colors.success },
              pressed && { opacity: 0.8 },
            ]}
          >
            <IconSymbol name="play.fill" size={20} color="#FFFFFF" />
            <Text className="font-semibold text-base" style={{ color: '#FFFFFF' }}>
              Démarrer
            </Text>
          </Pressable>
        ) : (
          <>
            <Pressable
              onPress={handleStop}
              className="flex-1 flex-row items-center justify-center gap-2 py-4 rounded-xl"
              style={({ pressed }) => [
                { backgroundColor: colors.primary },
                pressed && { opacity: 0.8 },
              ]}
            >
              <IconSymbol name="stop.fill" size={20} color="#FFFFFF" />
              <Text className="font-semibold text-base" style={{ color: '#FFFFFF' }}>
                Terminer
              </Text>
            </Pressable>
            <Pressable
              onPress={handleCancel}
              className="px-4 py-4 rounded-xl items-center justify-center"
              style={({ pressed }) => [
                { backgroundColor: `${colors.error}20` },
                pressed && { opacity: 0.8 },
              ]}
            >
              <IconSymbol name="xmark" size={20} color={colors.error} />
            </Pressable>
          </>
        )}
      </View>

      {/* Technician Info */}
      <View className="flex-row items-center gap-2 mt-4 pt-4 border-t" style={{ borderColor: colors.border }}>
        <IconSymbol name="person.fill" size={16} color={colors.muted} />
        <Text className="text-sm" style={{ color: colors.muted }}>
          Technicien: {technicianName}
        </Text>
      </View>
    </View>
  );
}

// Helper functions for timer sessions
const TIMER_SESSIONS_KEY = '@fleetcore_timer_sessions';

async function saveTimerSession(session: TimerSession): Promise<void> {
  try {
    const data = await AsyncStorage.getItem(TIMER_SESSIONS_KEY);
    const sessions: TimerSession[] = data ? JSON.parse(data) : [];
    sessions.push(session);
    await AsyncStorage.setItem(TIMER_SESSIONS_KEY, JSON.stringify(sessions));
  } catch (error) {
    console.error('Error saving timer session:', error);
  }
}

export async function getTimerSessions(workOrderId?: string): Promise<TimerSession[]> {
  try {
    const data = await AsyncStorage.getItem(TIMER_SESSIONS_KEY);
    const sessions: TimerSession[] = data ? JSON.parse(data) : [];
    if (workOrderId) {
      return sessions.filter(s => s.workOrderId === workOrderId);
    }
    return sessions;
  } catch (error) {
    console.error('Error getting timer sessions:', error);
    return [];
  }
}

export async function getTotalTimeForWorkOrder(workOrderId: string): Promise<number> {
  const sessions = await getTimerSessions(workOrderId);
  return sessions.reduce((total, s) => total + s.duration, 0);
}

export async function getTotalTimeForItem(workOrderId: string, itemId: string): Promise<number> {
  const sessions = await getTimerSessions(workOrderId);
  return sessions
    .filter(s => s.workOrderItemId === itemId)
    .reduce((total, s) => total + s.duration, 0);
}
