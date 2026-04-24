import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path, Circle, Line, Defs, LinearGradient, Stop } from 'react-native-svg';
import { useTheme } from '@/hooks/useTheme';

interface LineChartProps {
  data: number[];
  width?: number;
  height?: number;
  labels?: string[];
}

export default function LineChart({
  data,
  width = 294,
  height = 120,
  labels,
}: LineChartProps) {
  const { colors } = useTheme();

  if (data.length < 2) return null;

  const max = Math.max(...data, 1);
  const stepX = width / (data.length - 1);
  const pts = data.map((v, i) => ({
    x: i * stepX,
    y: height - (v / max) * height,
  }));

  const pathD = pts.map((p, i) =>
    i === 0 ? `M${p.x},${p.y}` : `L${p.x},${p.y}`
  ).join(' ');

  const areaD = `${pathD} L${width},${height} L0,${height} Z`;

  const last = pts[pts.length - 1];

  return (
    <View>
      <Svg width={width} height={height + 4} style={{ display: 'flex' }}>
        <Defs>
          <LinearGradient id="fill" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor={colors.accent} stopOpacity="0.18" />
            <Stop offset="100%" stopColor={colors.accent} stopOpacity="0" />
          </LinearGradient>
        </Defs>

        {/* Grid lines */}
        {[0, 0.5, 1].map((p, i) => (
          <Line
            key={i}
            x1="0" y1={p * height}
            x2={width} y2={p * height}
            stroke={colors.line}
            strokeWidth="1"
            strokeDasharray={p === 1 ? undefined : '2 3'}
          />
        ))}

        {/* Area fill */}
        <Path d={areaD} fill="url(#fill)" />

        {/* Line */}
        <Path
          d={pathD}
          fill="none"
          stroke={colors.accent}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Last point */}
        <Circle cx={last.x} cy={last.y} r="8" fill={colors.accent} fillOpacity="0.18" />
        <Circle cx={last.x} cy={last.y} r="4" fill={colors.accent} />
      </Svg>

      {labels && (
        <View style={[styles.labelRow, { width }]}>
          {labels.map((l, i) => (
            <Text key={i} style={[styles.label, { color: colors.ink2 }]}>{l}</Text>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  label: {
    fontSize: 10,
  },
});
