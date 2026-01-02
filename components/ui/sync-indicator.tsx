import { useState, useEffect, useRef } from 'react';
import { View, Text, Pressable, Animated, Easing, Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import { IconSymbol } from './icon-symbol';
import { useColors } from '@/hooks/use-colors';
import { getSettings } from '@/lib/data-service';

export type SyncStatus = 'synced' | 'syncing' | 'pending' | 'error' | 'offline';

interface SyncIndicatorProps {
  status?: SyncStatus;
  lastSyncTime?: Date | null;
  onPress?: () => void;
  showLabel?: boolean;
  size?: 'small' | 'medium' | 'large';
}

export function SyncIndicator({
  status: propStatus,
  lastSyncTime: propLastSyncTime,
  onPress,
  showLabel = true,
  size = 'medium',
}: SyncIndicatorProps) {
  const colors = useColors();
  const [status, setStatus] = useState<SyncStatus>(propStatus || 'synced');
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(propLastSyncTime || null);
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (propStatus) {
      setStatus(propStatus);
    }
    if (propLastSyncTime) {
      setLastSyncTime(propLastSyncTime);
    }
  }, [propStatus, propLastSyncTime]);

  useEffect(() => {
    // Auto-detect sync status from settings
    const checkSyncStatus = async () => {
      try {
        const settings = await getSettings();
        if (!settings.autoSync) {
          setStatus('offline');
        }
      } catch {
        setStatus('error');
      }
    };
    
    if (!propStatus) {
      checkSyncStatus();
    }
  }, [propStatus]);

  useEffect(() => {
    if (status === 'syncing') {
      // Start rotation animation
      const animation = Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      );
      animation.start();
      return () => animation.stop();
    } else {
      rotateAnim.setValue(0);
    }
  }, [status, rotateAnim]);

  const handlePress = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPress?.();
  };

  const getStatusConfig = () => {
    switch (status) {
      case 'synced':
        return {
          icon: 'checkmark.circle.fill' as const,
          color: colors.success,
          label: 'Synchronisé',
          bgColor: colors.success + '15',
        };
      case 'syncing':
        return {
          icon: 'arrow.triangle.2.circlepath' as const,
          color: colors.primary,
          label: 'Synchronisation...',
          bgColor: colors.primary + '15',
        };
      case 'pending':
        return {
          icon: 'clock.fill' as const,
          color: colors.warning,
          label: 'En attente',
          bgColor: colors.warning + '15',
        };
      case 'error':
        return {
          icon: 'exclamationmark.triangle.fill' as const,
          color: colors.error,
          label: 'Erreur de sync',
          bgColor: colors.error + '15',
        };
      case 'offline':
        return {
          icon: 'wifi.slash' as const,
          color: colors.muted,
          label: 'Hors ligne',
          bgColor: colors.muted + '15',
        };
    }
  };

  const config = getStatusConfig();
  const iconSize = size === 'small' ? 14 : size === 'medium' ? 18 : 22;
  const fontSize = size === 'small' ? 11 : size === 'medium' ? 12 : 14;
  const padding = size === 'small' ? 6 : size === 'medium' ? 8 : 10;

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const formatLastSync = () => {
    if (!lastSyncTime) return '';
    const now = new Date();
    const diff = now.getTime() - lastSyncTime.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'À l\'instant';
    if (minutes < 60) return `Il y a ${minutes} min`;
    if (hours < 24) return `Il y a ${hours}h`;
    return `Il y a ${days}j`;
  };

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [
        {
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: config.bgColor,
          paddingHorizontal: padding + 4,
          paddingVertical: padding,
          borderRadius: 20,
          opacity: pressed ? 0.8 : 1,
        },
      ]}
    >
      <Animated.View
        style={{
          transform: status === 'syncing' ? [{ rotate: spin }] : [],
        }}
      >
        <IconSymbol name={config.icon} size={iconSize} color={config.color} />
      </Animated.View>
      {showLabel && (
        <View style={{ marginLeft: 6 }}>
          <Text
            style={{
              fontSize: fontSize,
              fontWeight: '600',
              color: config.color,
            }}
          >
            {config.label}
          </Text>
          {lastSyncTime && status === 'synced' && (
            <Text
              style={{
                fontSize: fontSize - 2,
                color: colors.muted,
                marginTop: 1,
              }}
            >
              {formatLastSync()}
            </Text>
          )}
        </View>
      )}
    </Pressable>
  );
}

// Hook for managing sync state
export function useSyncStatus() {
  const [status, setStatus] = useState<SyncStatus>('synced');
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(new Date());
  const [pendingChanges, setPendingChanges] = useState(0);

  const startSync = async () => {
    setStatus('syncing');
    // Simulate sync
    await new Promise(resolve => setTimeout(resolve, 2000));
    setStatus('synced');
    setLastSyncTime(new Date());
    setPendingChanges(0);
  };

  const addPendingChange = () => {
    setPendingChanges(prev => prev + 1);
    if (status === 'synced') {
      setStatus('pending');
    }
  };

  const setError = () => {
    setStatus('error');
  };

  const setOffline = () => {
    setStatus('offline');
  };

  return {
    status,
    lastSyncTime,
    pendingChanges,
    startSync,
    addPendingChange,
    setError,
    setOffline,
  };
}
