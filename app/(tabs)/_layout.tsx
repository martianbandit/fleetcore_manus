import { Tabs } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { View, Text, StyleSheet } from "react-native";
import { useEffect, useState } from "react";

import { HapticTab } from "@/components/haptic-tab";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Platform } from "react-native";
import { useColors } from "@/hooks/use-colors";
import { getAlerts } from "@/lib/data-service";
import { getWorkOrderStats } from "@/lib/work-order-service";

interface TabIconProps {
  name: string;
  color: string;
  size?: number;
  badge?: number;
}

function TabIcon({ name, color, size = 26, badge }: TabIconProps) {
  return (
    <View style={styles.iconContainer}>
      <IconSymbol size={size} name={name as any} color={color} />
      {badge !== undefined && badge > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>
            {badge > 99 ? '99+' : badge}
          </Text>
        </View>
      )}
    </View>
  );
}

export default function TabLayout() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const bottomPadding = Platform.OS === "web" ? 12 : Math.max(insets.bottom, 8);
  const tabBarHeight = 60 + bottomPadding;
  
  const [alertCount, setAlertCount] = useState(0);
  const [pendingWorkOrders, setPendingWorkOrders] = useState(0);

  useEffect(() => {
    const loadBadges = async () => {
      try {
        const [alerts, woStats] = await Promise.all([
          getAlerts(),
          getWorkOrderStats(),
        ]);
        setAlertCount(alerts.filter(a => a.severity === 'critical' && !a.isRead).length);
        setPendingWorkOrders(woStats.pending || 0);
      } catch (error) {
        console.error('Error loading badge counts:', error);
      }
    };
    
    loadBadges();
    // Refresh badges every 30 seconds
    const interval = setInterval(loadBadges, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          paddingTop: 8,
          paddingBottom: bottomPadding,
          height: tabBarHeight,
          backgroundColor: colors.background,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.05,
          shadowRadius: 8,
          elevation: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Tableau de bord",
          tabBarIcon: ({ color }) => (
            <TabIcon 
              name="house.fill" 
              color={color} 
              badge={alertCount > 0 ? alertCount : undefined}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="vehicles"
        options={{
          title: "Véhicules",
          tabBarIcon: ({ color }) => (
            <TabIcon name="car.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="inspections"
        options={{
          title: "Inspections",
          tabBarIcon: ({ color }) => (
            <TabIcon 
              name="clipboard.fill" 
              color={color}
              badge={pendingWorkOrders > 0 ? pendingWorkOrders : undefined}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Paramètres",
          tabBarIcon: ({ color }) => (
            <TabIcon name="gearshape.fill" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -10,
    backgroundColor: '#EF4444',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
});
