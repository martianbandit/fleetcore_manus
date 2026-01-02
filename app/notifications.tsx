import { useEffect, useState, useCallback } from 'react';
import { ScrollView, Text, View, Pressable, RefreshControl, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

import { ScreenContainer } from '@/components/screen-container';
import { SectionHeader } from '@/components/ui/section-header';
import { IconSymbol } from '@/components/ui/icon-symbol';
import {
  getNotifications,
  markNotificationRead,
  dismissNotification,
  getNotificationCounts,
  getPriorityColor,
  getPriorityLabel,
} from '@/lib/business-notification-service';

interface BusinessNotification {
  id: string;
  type: string;
  title: string;
  message: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  isRead: boolean;
  isDismissed: boolean;
  createdAt: string;
  entityType?: string;
  entityId?: string;
  actionUrl?: string;
}

type FilterType = 'all' | 'unread' | 'critical' | 'high' | 'medium' | 'low';

const typeConfig: Record<string, { icon: string; color: string }> = {
  inspection_overdue: { icon: 'clock.fill', color: '#EF4444' },
  blocking_defect_unresolved: { icon: 'exclamationmark.triangle.fill', color: '#EF4444' },
  vehicle_used_while_blocked: { icon: 'car.fill', color: '#EF4444' },
  payment_failed: { icon: 'creditcard.fill', color: '#EF4444' },
  plan_limit_approaching: { icon: 'chart.bar.fill', color: '#F59E0B' },
  document_expiring: { icon: 'doc.fill', color: '#F59E0B' },
  maintenance_due: { icon: 'wrench.fill', color: '#F59E0B' },
  inspection_completed: { icon: 'checkmark.circle.fill', color: '#22C55E' },
  defect_resolved: { icon: 'checkmark.seal.fill', color: '#22C55E' },
  system: { icon: 'bell.fill', color: '#64748B' },
};

export default function NotificationsScreen() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<BusinessNotification[]>([]);
  const [counts, setCounts] = useState<any>(null);
  const [filter, setFilter] = useState<FilterType>('all');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const [notifs, notifCounts] = await Promise.all([
        getNotifications(),
        getNotificationCounts(),
      ]);
      setNotifications(notifs);
      setCounts(notifCounts);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
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

  const handleMarkRead = async (id: string) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    await markNotificationRead(id);
    await loadData();
  };

  const handleDismiss = async (id: string) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    await dismissNotification(id);
    await loadData();
  };

  const handleNotificationPress = (notification: BusinessNotification) => {
    handleMarkRead(notification.id);
    
    // Navigate based on notification type
    if (notification.entityType === 'vehicle' && notification.entityId) {
      router.push(`/vehicle/${notification.entityId}` as any);
    } else if (notification.entityType === 'inspection' && notification.entityId) {
      router.push(`/inspection/${notification.entityId}` as any);
    } else if (notification.entityType === 'work_order' && notification.entityId) {
      router.push(`/work-order/${notification.entityId}` as any);
    }
  };

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'all') return !n.isDismissed;
    if (filter === 'unread') return !n.isRead && !n.isDismissed;
    return n.priority === filter && !n.isDismissed;
  });

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'À l\'instant';
    if (diffMins < 60) return `Il y a ${diffMins} min`;
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    if (diffDays < 7) return `Il y a ${diffDays}j`;
    return date.toLocaleDateString('fr-CA', { day: 'numeric', month: 'short' });
  };

  const filters: { key: FilterType; label: string; count?: number }[] = [
    { key: 'all', label: 'Toutes', count: counts?.total },
    { key: 'unread', label: 'Non lues', count: counts?.unread },
    { key: 'critical', label: 'Critiques', count: counts?.critical },
    { key: 'high', label: 'Élevées', count: counts?.high },
  ];

  if (loading) {
    return (
      <ScreenContainer className="items-center justify-center">
        <Text className="text-muted">Chargement...</Text>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      {/* Header */}
      <View className="px-4 pt-2 pb-4 flex-row items-center">
        <Pressable
          onPress={() => router.back()}
          className="mr-3"
          style={({ pressed }) => [pressed && { opacity: 0.7 }]}
        >
          <IconSymbol name="chevron.left" size={24} color="#64748B" />
        </Pressable>
        <View className="flex-1">
          <Text className="text-2xl font-bold text-foreground">Notifications</Text>
          <Text className="text-sm text-muted">
            {counts?.unread || 0} non lue{(counts?.unread || 0) > 1 ? 's' : ''}
          </Text>
        </View>
        {counts?.unread > 0 && (
          <Pressable
            onPress={async () => {
              for (const n of notifications.filter(n => !n.isRead)) {
                await markNotificationRead(n.id);
              }
              await loadData();
            }}
            className="px-3 py-2 bg-primary/10 rounded-lg"
            style={({ pressed }) => [pressed && { opacity: 0.7 }]}
          >
            <Text className="text-sm font-medium text-primary">Tout lire</Text>
          </Pressable>
        )}
      </View>

      {/* Filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="px-4 mb-4"
        contentContainerStyle={{ gap: 8 }}
      >
        {filters.map((f) => (
          <Pressable
            key={f.key}
            onPress={() => setFilter(f.key)}
            className={`px-4 py-2 rounded-full flex-row items-center ${
              filter === f.key
                ? 'bg-primary'
                : 'bg-surface border border-border'
            }`}
            style={({ pressed }) => [pressed && { opacity: 0.7 }]}
          >
            <Text
              className={`text-sm font-medium ${
                filter === f.key ? 'text-white' : 'text-foreground'
              }`}
            >
              {f.label}
            </Text>
            {f.count !== undefined && f.count > 0 && (
              <View
                className={`ml-2 px-1.5 py-0.5 rounded-full ${
                  filter === f.key ? 'bg-white/20' : 'bg-muted/20'
                }`}
              >
                <Text
                  className={`text-xs font-bold ${
                    filter === f.key ? 'text-white' : 'text-muted'
                  }`}
                >
                  {f.count}
                </Text>
              </View>
            )}
          </Pressable>
        ))}
      </ScrollView>

      {/* Notifications List */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {filteredNotifications.length === 0 ? (
          <View className="items-center py-12">
            <View className="w-16 h-16 rounded-full bg-surface items-center justify-center mb-4">
              <IconSymbol name="bell.fill" size={32} color="#94A3B8" />
            </View>
            <Text className="text-lg font-semibold text-foreground">Aucune notification</Text>
            <Text className="text-sm text-muted mt-1">
              {filter === 'all' ? 'Vous êtes à jour !' : 'Aucune notification dans cette catégorie'}
            </Text>
          </View>
        ) : (
          <View className="px-4">
            {filteredNotifications.map((notification, index) => {
              const config = typeConfig[notification.type] || typeConfig.system;
              const priorityColor = getPriorityColor(notification.priority);

              return (
                <Pressable
                  key={notification.id}
                  onPress={() => handleNotificationPress(notification)}
                  className={`bg-surface rounded-xl border mb-3 overflow-hidden ${
                    notification.isRead ? 'border-border' : 'border-primary/30'
                  }`}
                  style={({ pressed }) => [pressed && { opacity: 0.7 }]}
                >
                  {/* Priority indicator */}
                  <View
                    style={[styles.priorityBar, { backgroundColor: priorityColor }]}
                  />
                  
                  <View className="p-4">
                    <View className="flex-row items-start">
                      {/* Icon */}
                      <View
                        className="w-10 h-10 rounded-full items-center justify-center mr-3"
                        style={{ backgroundColor: `${config.color}15` }}
                      >
                        <IconSymbol
                          name={config.icon as any}
                          size={20}
                          color={config.color}
                        />
                      </View>

                      {/* Content */}
                      <View className="flex-1">
                        <View className="flex-row items-center justify-between mb-1">
                          <View className="flex-row items-center flex-1">
                            <Text
                              className={`text-sm font-semibold ${
                                notification.isRead ? 'text-foreground' : 'text-foreground'
                              }`}
                              numberOfLines={1}
                            >
                              {notification.title}
                            </Text>
                            {!notification.isRead && (
                              <View className="w-2 h-2 rounded-full bg-primary ml-2" />
                            )}
                          </View>
                          <Text className="text-xs text-muted ml-2">
                            {formatTimestamp(notification.createdAt)}
                          </Text>
                        </View>

                        <Text
                          className="text-sm text-muted"
                          numberOfLines={2}
                        >
                          {notification.message}
                        </Text>

                        {/* Priority badge */}
                        <View className="flex-row items-center mt-2">
                          <View
                            className="px-2 py-0.5 rounded-full"
                            style={{ backgroundColor: `${priorityColor}15` }}
                          >
                            <Text
                              className="text-xs font-medium"
                              style={{ color: priorityColor }}
                            >
                              {getPriorityLabel(notification.priority)}
                            </Text>
                          </View>
                          
                          {notification.actionUrl && (
                            <View className="flex-row items-center ml-auto">
                              <Text className="text-xs text-primary font-medium">
                                Voir détails
                              </Text>
                              <IconSymbol name="chevron.right" size={12} color="#0891B2" />
                            </View>
                          )}
                        </View>
                      </View>
                    </View>

                    {/* Actions */}
                    <View className="flex-row justify-end mt-3 pt-3 border-t border-border">
                      {!notification.isRead && (
                        <Pressable
                          onPress={(e) => {
                            e.stopPropagation();
                            handleMarkRead(notification.id);
                          }}
                          className="px-3 py-1.5 mr-2"
                          style={({ pressed }) => [pressed && { opacity: 0.7 }]}
                        >
                          <Text className="text-sm text-primary font-medium">
                            Marquer comme lu
                          </Text>
                        </Pressable>
                      )}
                      <Pressable
                        onPress={(e) => {
                          e.stopPropagation();
                          handleDismiss(notification.id);
                        }}
                        className="px-3 py-1.5"
                        style={({ pressed }) => [pressed && { opacity: 0.7 }]}
                      >
                        <Text className="text-sm text-muted font-medium">
                          Ignorer
                        </Text>
                      </Pressable>
                    </View>
                  </View>
                </Pressable>
              );
            })}
          </View>
        )}

        <View className="h-8" />
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 100,
  },
  priorityBar: {
    height: 3,
    width: '100%',
  },
});
