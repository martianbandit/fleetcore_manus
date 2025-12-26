// Fallback for using MaterialIcons on Android and web.

import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { SymbolWeight } from "expo-symbols";
import { ComponentProps } from "react";
import { OpaqueColorValue, type StyleProp, type TextStyle } from "react-native";

type MaterialIconName = ComponentProps<typeof MaterialIcons>["name"];

/**
 * FleetCore icon mappings - SF Symbols to Material Icons
 */
const MAPPING: Record<string, MaterialIconName> = {
  // Navigation
  "house.fill": "dashboard",
  "car.fill": "local-shipping",
  "clipboard.fill": "assignment",
  "gearshape.fill": "settings",
  // Actions
  "plus.circle.fill": "add-circle",
  "magnifyingglass": "search",
  "camera.fill": "camera-alt",
  "photo.fill": "photo",
  "mic.fill": "mic",
  // Status
  "checkmark.circle.fill": "check-circle",
  "exclamationmark.triangle.fill": "warning",
  "xmark.circle.fill": "cancel",
  "clock.fill": "schedule",
  // Navigation arrows
  "chevron.right": "chevron-right",
  "chevron.left": "chevron-left",
  "arrow.left": "arrow-back",
  // Misc
  "doc.text.fill": "description",
  "chart.bar.fill": "bar-chart",
  "bell.fill": "notifications",
  "person.fill": "person",
  "info.circle.fill": "info",
  "trash.fill": "delete",
  "pencil": "edit",
  "paperplane.fill": "send",
  "chevron.left.forwardslash.chevron.right": "code",
  "play.fill": "play-arrow",
  "pause.fill": "pause",
  "stop.fill": "stop",
  "arrow.clockwise": "refresh",
  "calendar": "event",
  "location.fill": "location-on",
  "fuel.pump.fill": "local-gas-station",
  "wrench.fill": "build",
  "speedometer": "speed",
  "gauge.fill": "speed",
  "video.fill": "videocam",
  "arrow.triangle.2.circlepath.camera.fill": "flip-camera-ios",
  "funnel.fill": "filter-list",
  "gear": "settings",
};

type IconSymbolName = keyof typeof MAPPING;

/**
 * An icon component that uses native SF Symbols on iOS, and Material Icons on Android and web.
 * This ensures a consistent look across platforms, and optimal resource usage.
 * Icon `name`s are based on SF Symbols and require manual mapping to Material Icons.
 */
export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  const iconName = MAPPING[name] || "help";
  return <MaterialIcons color={color} size={size} name={iconName} style={style} />;
}

export type { IconSymbolName };
