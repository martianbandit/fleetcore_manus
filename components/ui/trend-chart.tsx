/**
 * Composant de graphique de tendances pour FleetCore
 * Affiche des graphiques simples sans dépendances externes
 */

import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { useColors } from '@/hooks/use-colors';
import Svg, { Path, Circle, Line, Text as SvgText, Rect, G } from 'react-native-svg';

interface DataPoint {
  label: string;
  value: number;
  color?: string;
}

interface TrendChartProps {
  data: DataPoint[];
  title?: string;
  subtitle?: string;
  type?: 'line' | 'bar' | 'pie';
  height?: number;
  showLabels?: boolean;
  showValues?: boolean;
  showGrid?: boolean;
  animate?: boolean;
  unit?: string;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export function TrendChart({
  data,
  title,
  subtitle,
  type = 'line',
  height = 200,
  showLabels = true,
  showValues = true,
  showGrid = true,
  unit = '',
}: TrendChartProps) {
  const colors = useColors();
  
  const chartWidth = SCREEN_WIDTH - 48; // Padding de 24 de chaque côté
  const chartHeight = height - 40; // Espace pour les labels
  
  const maxValue = useMemo(() => {
    const max = Math.max(...data.map(d => d.value));
    return max > 0 ? max * 1.1 : 100; // 10% de marge
  }, [data]);
  
  const minValue = useMemo(() => {
    const min = Math.min(...data.map(d => d.value));
    return min < 0 ? min * 1.1 : 0;
  }, [data]);
  
  const valueRange = maxValue - minValue;
  
  // Générer le path pour le graphique en ligne
  const linePath = useMemo(() => {
    if (data.length === 0) return '';
    
    const padding = 30;
    const availableWidth = chartWidth - padding * 2;
    const availableHeight = chartHeight - 30;
    
    const points = data.map((d, i) => {
      const x = padding + (i / (data.length - 1 || 1)) * availableWidth;
      const y = availableHeight - ((d.value - minValue) / valueRange) * availableHeight + 15;
      return { x, y };
    });
    
    if (points.length === 1) {
      return `M ${points[0].x} ${points[0].y}`;
    }
    
    // Créer une courbe lisse
    let path = `M ${points[0].x} ${points[0].y}`;
    
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      const cpx = (prev.x + curr.x) / 2;
      path += ` Q ${cpx} ${prev.y} ${cpx} ${(prev.y + curr.y) / 2}`;
      path += ` Q ${cpx} ${curr.y} ${curr.x} ${curr.y}`;
    }
    
    return path;
  }, [data, chartWidth, chartHeight, minValue, valueRange]);
  
  // Points pour le graphique en ligne
  const linePoints = useMemo(() => {
    const padding = 30;
    const availableWidth = chartWidth - padding * 2;
    const availableHeight = chartHeight - 30;
    
    return data.map((d, i) => ({
      x: padding + (i / (data.length - 1 || 1)) * availableWidth,
      y: availableHeight - ((d.value - minValue) / valueRange) * availableHeight + 15,
      value: d.value,
      label: d.label,
    }));
  }, [data, chartWidth, chartHeight, minValue, valueRange]);
  
  // Barres pour le graphique en barres
  const bars = useMemo(() => {
    const padding = 40;
    const availableWidth = chartWidth - padding * 2;
    const availableHeight = chartHeight - 30;
    const barWidth = Math.min(40, (availableWidth / data.length) * 0.7);
    const gap = (availableWidth - barWidth * data.length) / (data.length + 1);
    
    return data.map((d, i) => {
      const barHeight = ((d.value - minValue) / valueRange) * availableHeight;
      return {
        x: padding + gap + i * (barWidth + gap),
        y: availableHeight - barHeight + 15,
        width: barWidth,
        height: Math.max(2, barHeight),
        value: d.value,
        label: d.label,
        color: d.color || colors.primary,
      };
    });
  }, [data, chartWidth, chartHeight, minValue, valueRange, colors.primary]);
  
  // Segments pour le graphique en camembert
  const pieSegments = useMemo(() => {
    const total = data.reduce((sum, d) => sum + d.value, 0);
    if (total === 0) return [];
    
    const centerX = chartWidth / 2;
    const centerY = chartHeight / 2;
    const radius = Math.min(chartWidth, chartHeight) / 2 - 20;
    
    let startAngle = -90; // Commencer en haut
    
    const defaultColors = [
      colors.primary,
      colors.success,
      colors.warning,
      colors.error,
      '#8B5CF6',
      '#EC4899',
      '#14B8A6',
      '#F97316',
    ];
    
    return data.map((d, i) => {
      const percentage = d.value / total;
      const angle = percentage * 360;
      const endAngle = startAngle + angle;
      
      // Calculer le path de l'arc
      const startRad = (startAngle * Math.PI) / 180;
      const endRad = (endAngle * Math.PI) / 180;
      
      const x1 = centerX + radius * Math.cos(startRad);
      const y1 = centerY + radius * Math.sin(startRad);
      const x2 = centerX + radius * Math.cos(endRad);
      const y2 = centerY + radius * Math.sin(endRad);
      
      const largeArc = angle > 180 ? 1 : 0;
      
      const path = `M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;
      
      // Position du label
      const midAngle = ((startAngle + endAngle) / 2 * Math.PI) / 180;
      const labelRadius = radius * 0.7;
      const labelX = centerX + labelRadius * Math.cos(midAngle);
      const labelY = centerY + labelRadius * Math.sin(midAngle);
      
      const segment = {
        path,
        color: d.color || defaultColors[i % defaultColors.length],
        label: d.label,
        value: d.value,
        percentage: Math.round(percentage * 100),
        labelX,
        labelY,
      };
      
      startAngle = endAngle;
      return segment;
    });
  }, [data, chartWidth, chartHeight, colors]);
  
  // Grille horizontale
  const gridLines = useMemo(() => {
    const lines = [];
    const numLines = 4;
    const padding = 30;
    const availableHeight = chartHeight - 30;
    
    for (let i = 0; i <= numLines; i++) {
      const y = 15 + (i / numLines) * availableHeight;
      const value = maxValue - (i / numLines) * valueRange;
      lines.push({ y, value: Math.round(value) });
    }
    
    return lines;
  }, [chartHeight, maxValue, valueRange]);
  
  const renderLineChart = () => (
    <Svg width={chartWidth} height={chartHeight}>
      {/* Grille */}
      {showGrid && gridLines.map((line, i) => (
        <G key={i}>
          <Line
            x1={30}
            y1={line.y}
            x2={chartWidth - 10}
            y2={line.y}
            stroke={colors.border}
            strokeWidth={1}
            strokeDasharray="4,4"
          />
          <SvgText
            x={5}
            y={line.y + 4}
            fill={colors.muted}
            fontSize={10}
          >
            {line.value}
          </SvgText>
        </G>
      ))}
      
      {/* Ligne de tendance */}
      <Path
        d={linePath}
        fill="none"
        stroke={colors.primary}
        strokeWidth={3}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      
      {/* Points */}
      {linePoints.map((point, i) => (
        <G key={i}>
          <Circle
            cx={point.x}
            cy={point.y}
            r={6}
            fill={colors.background}
            stroke={colors.primary}
            strokeWidth={3}
          />
          {showValues && (
            <SvgText
              x={point.x}
              y={point.y - 12}
              fill={colors.foreground}
              fontSize={11}
              fontWeight="600"
              textAnchor="middle"
            >
              {point.value}{unit}
            </SvgText>
          )}
        </G>
      ))}
      
      {/* Labels */}
      {showLabels && linePoints.map((point, i) => (
        <SvgText
          key={`label-${i}`}
          x={point.x}
          y={chartHeight - 5}
          fill={colors.muted}
          fontSize={10}
          textAnchor="middle"
        >
          {point.label}
        </SvgText>
      ))}
    </Svg>
  );
  
  const renderBarChart = () => (
    <Svg width={chartWidth} height={chartHeight}>
      {/* Grille */}
      {showGrid && gridLines.map((line, i) => (
        <G key={i}>
          <Line
            x1={30}
            y1={line.y}
            x2={chartWidth - 10}
            y2={line.y}
            stroke={colors.border}
            strokeWidth={1}
            strokeDasharray="4,4"
          />
          <SvgText
            x={5}
            y={line.y + 4}
            fill={colors.muted}
            fontSize={10}
          >
            {line.value}
          </SvgText>
        </G>
      ))}
      
      {/* Barres */}
      {bars.map((bar, i) => (
        <G key={i}>
          <Rect
            x={bar.x}
            y={bar.y}
            width={bar.width}
            height={bar.height}
            fill={bar.color}
            rx={4}
            ry={4}
          />
          {showValues && (
            <SvgText
              x={bar.x + bar.width / 2}
              y={bar.y - 5}
              fill={colors.foreground}
              fontSize={11}
              fontWeight="600"
              textAnchor="middle"
            >
              {bar.value}{unit}
            </SvgText>
          )}
          {showLabels && (
            <SvgText
              x={bar.x + bar.width / 2}
              y={chartHeight - 5}
              fill={colors.muted}
              fontSize={10}
              textAnchor="middle"
            >
              {bar.label}
            </SvgText>
          )}
        </G>
      ))}
    </Svg>
  );
  
  const renderPieChart = () => (
    <View style={styles.pieContainer}>
      <Svg width={chartWidth * 0.6} height={chartHeight}>
        {pieSegments.map((segment, i) => (
          <G key={i}>
            <Path
              d={segment.path}
              fill={segment.color}
              stroke={colors.background}
              strokeWidth={2}
            />
            {segment.percentage >= 10 && (
              <SvgText
                x={segment.labelX}
                y={segment.labelY}
                fill="#FFFFFF"
                fontSize={12}
                fontWeight="600"
                textAnchor="middle"
              >
                {segment.percentage}%
              </SvgText>
            )}
          </G>
        ))}
      </Svg>
      
      {/* Légende */}
      <View style={styles.legend}>
        {pieSegments.map((segment, i) => (
          <View key={i} style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: segment.color }]} />
            <Text style={[styles.legendLabel, { color: colors.foreground }]} numberOfLines={1}>
              {segment.label}
            </Text>
            <Text style={[styles.legendValue, { color: colors.muted }]}>
              {segment.value}{unit}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
  
  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      {(title || subtitle) && (
        <View style={styles.header}>
          {title && (
            <Text style={[styles.title, { color: colors.foreground }]}>{title}</Text>
          )}
          {subtitle && (
            <Text style={[styles.subtitle, { color: colors.muted }]}>{subtitle}</Text>
          )}
        </View>
      )}
      
      <View style={[styles.chartContainer, { height }]}>
        {data.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={[styles.emptyText, { color: colors.muted }]}>
              Aucune donnée disponible
            </Text>
          </View>
        ) : (
          <>
            {type === 'line' && renderLineChart()}
            {type === 'bar' && renderBarChart()}
            {type === 'pie' && renderPieChart()}
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  header: {
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  chartContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 14,
  },
  pieContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  legend: {
    flex: 1,
    paddingLeft: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 3,
    marginRight: 8,
  },
  legendLabel: {
    flex: 1,
    fontSize: 12,
  },
  legendValue: {
    fontSize: 12,
    fontWeight: '500',
  },
});

export default TrendChart;
