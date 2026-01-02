import { useEffect, useState, useCallback } from 'react';
import { ScrollView, Text, View, Pressable, RefreshControl, StyleSheet, TextInput } from 'react-native';
import { useRouter } from 'expo-router';

import { ScreenContainer } from '@/components/screen-container';
import { SectionHeader } from '@/components/ui/section-header';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { EmptyState } from '@/components/ui/empty-state';
import { getAuditLog } from '@/lib/audit-service';

interface AuditLogEntry {
  id: string;
  action: string;
  entityType?: string;
  entityId?: string;
  description?: string;
  userName?: string;
  userId?: string;
  timestamp: string;
  ipAddress?: string;
  changes?: Record<string, any>;
}

type FilterAction = 'all' | 'CREATE' | 'UPDATE' | 'DELETE' | 'VIEW' | 'EXPORT';

const actionConfig: Record<string, { icon: string; color: string; label: string }> = {
  CREATE: { icon: 'plus.circle.fill', color: '#22C55E', label: 'Création' },
  UPDATE: { icon: 'pencil.circle.fill', color: '#3B82F6', label: 'Modification' },
  DELETE: { icon: 'trash.circle.fill', color: '#EF4444', label: 'Suppression' },
  VIEW: { icon: 'eye.circle.fill', color: '#64748B', label: 'Consultation' },
  EXPORT: { icon: 'square.and.arrow.up.circle.fill', color: '#8B5CF6', label: 'Export' },
  LOGIN: { icon: 'person.circle.fill', color: '#0891B2', label: 'Connexion' },
  LOGOUT: { icon: 'person.badge.minus', color: '#64748B', label: 'Déconnexion' },
};

const entityConfig: Record<string, { icon: string; color: string; label: string }> = {
  vehicle: { icon: 'car.fill', color: '#0891B2', label: 'Véhicule' },
  inspection: { icon: 'clipboard.fill', color: '#22C55E', label: 'Inspection' },
  defect: { icon: 'exclamationmark.triangle.fill', color: '#F59E0B', label: 'Défaut' },
  work_order: { icon: 'wrench.fill', color: '#8B5CF6', label: 'Bon de travail' },
  user: { icon: 'person.fill', color: '#3B82F6', label: 'Utilisateur' },
  document: { icon: 'doc.fill', color: '#64748B', label: 'Document' },
  report: { icon: 'chart.bar.fill', color: '#EC4899', label: 'Rapport' },
};

export default function AuditLogScreen() {
  const router = useRouter();
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<AuditLogEntry[]>([]);
  const [filter, setFilter] = useState<FilterAction>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const auditLogs = await getAuditLog();
      setLogs(auditLogs);
      setFilteredLogs(auditLogs);
    } catch (error) {
      console.error('Error loading audit logs:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    let result = logs;
    
    if (filter !== 'all') {
      result = result.filter(log => log.action === filter);
    }
    
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(log =>
        log.description?.toLowerCase().includes(query) ||
        log.userName?.toLowerCase().includes(query) ||
        log.entityType?.toLowerCase().includes(query) ||
        log.entityId?.toLowerCase().includes(query)
      );
    }
    
    setFilteredLogs(result);
  }, [logs, filter, searchQuery]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString('fr-CA', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const filters: { key: FilterAction; label: string }[] = [
    { key: 'all', label: 'Tout' },
    { key: 'CREATE', label: 'Créations' },
    { key: 'UPDATE', label: 'Modifications' },
    { key: 'DELETE', label: 'Suppressions' },
    { key: 'VIEW', label: 'Consultations' },
  ];

  if (loading) {
    return (
      <ScreenContainer className="items-center justify-center">
        <Text className="text-muted">Chargement de l'historique...</Text>
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
          <Text className="text-2xl font-bold text-foreground">Journal d'audit</Text>
          <Text className="text-sm text-muted">
            {logs.length} entrée{logs.length > 1 ? 's' : ''} enregistrée{logs.length > 1 ? 's' : ''}
          </Text>
        </View>
      </View>

      {/* Search */}
      <View className="px-4 mb-4">
        <View className="flex-row items-center bg-surface rounded-xl border border-border px-4 py-3">
          <IconSymbol name="magnifyingglass" size={18} color="#64748B" />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Rechercher dans l'historique..."
            placeholderTextColor="#94A3B8"
            className="flex-1 ml-3 text-foreground"
            style={{ fontSize: 16 }}
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery('')}>
              <IconSymbol name="xmark.circle.fill" size={18} color="#94A3B8" />
            </Pressable>
          )}
        </View>
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
            className={`px-4 py-2 rounded-full ${
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
          </Pressable>
        ))}
      </ScrollView>

      {/* Audit Log List */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {filteredLogs.length === 0 ? (
          <EmptyState
            icon="clock.fill"
            iconColor="#64748B"
            title="Aucune entrée"
            description={
              searchQuery || filter !== 'all'
                ? 'Aucun résultat pour ces critères de recherche.'
                : 'L\'historique des actions apparaîtra ici.'
            }
            action={
              searchQuery || filter !== 'all'
                ? {
                    label: 'Réinitialiser',
                    onPress: () => {
                      setSearchQuery('');
                      setFilter('all');
                    },
                  }
                : undefined
            }
          />
        ) : (
          <View className="px-4">
            {filteredLogs.map((log, index) => {
              const action = actionConfig[log.action] || actionConfig.VIEW;
              const entity = entityConfig[log.entityType || ''] || { icon: 'questionmark.circle.fill', color: '#64748B', label: 'Autre' };

              return (
                <View
                  key={log.id}
                  className={`bg-surface rounded-xl border border-border p-4 mb-3`}
                >
                  <View className="flex-row items-start">
                    {/* Action Icon */}
                    <View
                      className="w-10 h-10 rounded-full items-center justify-center mr-3"
                      style={{ backgroundColor: `${action.color}15` }}
                    >
                      <IconSymbol
                        name={action.icon as any}
                        size={20}
                        color={action.color}
                      />
                    </View>

                    {/* Content */}
                    <View className="flex-1">
                      <View className="flex-row items-center justify-between mb-1">
                        <View className="flex-row items-center flex-1">
                          <Text className="text-sm font-semibold text-foreground">
                            {action.label}
                          </Text>
                          <View
                            className="ml-2 px-2 py-0.5 rounded-full flex-row items-center"
                            style={{ backgroundColor: `${entity.color}15` }}
                          >
                            <IconSymbol
                              name={entity.icon as any}
                              size={10}
                              color={entity.color}
                            />
                            <Text
                              className="text-xs font-medium ml-1"
                              style={{ color: entity.color }}
                            >
                              {entity.label}
                            </Text>
                          </View>
                        </View>
                        <Text className="text-xs text-muted">
                          {formatTimestamp(log.timestamp)}
                        </Text>
                      </View>

                      {log.description && (
                        <Text className="text-sm text-muted mb-2" numberOfLines={2}>
                          {log.description}
                        </Text>
                      )}

                      {/* Metadata */}
                      <View className="flex-row items-center flex-wrap gap-3">
                        {log.userName && (
                          <View className="flex-row items-center">
                            <IconSymbol name="person.fill" size={12} color="#64748B" />
                            <Text className="text-xs text-muted ml-1">
                              {log.userName}
                            </Text>
                          </View>
                        )}
                        {log.entityId && (
                          <View className="flex-row items-center">
                            <IconSymbol name="number" size={12} color="#64748B" />
                            <Text className="text-xs text-muted ml-1 font-mono">
                              {log.entityId.substring(0, 8)}...
                            </Text>
                          </View>
                        )}
                        {log.ipAddress && (
                          <View className="flex-row items-center">
                            <IconSymbol name="network" size={12} color="#64748B" />
                            <Text className="text-xs text-muted ml-1">
                              {log.ipAddress}
                            </Text>
                          </View>
                        )}
                      </View>

                      {/* Changes Preview */}
                      {log.changes && Object.keys(log.changes).length > 0 && (
                        <View className="mt-2 p-2 bg-surfaceSecondary rounded-lg">
                          <Text className="text-xs font-medium text-muted mb-1">
                            Modifications:
                          </Text>
                          {Object.entries(log.changes).slice(0, 3).map(([key, value]) => (
                            <View key={key} className="flex-row items-center">
                              <Text className="text-xs text-muted">{key}: </Text>
                              <Text className="text-xs text-foreground font-medium">
                                {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                              </Text>
                            </View>
                          ))}
                          {Object.keys(log.changes).length > 3 && (
                            <Text className="text-xs text-primary mt-1">
                              +{Object.keys(log.changes).length - 3} autres modifications
                            </Text>
                          )}
                        </View>
                      )}
                    </View>
                  </View>
                </View>
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
});
