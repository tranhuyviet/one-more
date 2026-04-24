import React from 'react';
import { View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useTheme } from '@/hooks/useTheme';

interface Props {
  size?: number;
  color?: string;
  bg?: string;
}

export default function AppLogo({ size = 56, color = '#fff', bg }: Props) {
  const { colors } = useTheme();
  const bgColor = bg ?? colors.accent;
  const r = Math.round(size * 0.26);
  const svgSize = size * 0.7;

  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: r,
        backgroundColor: bgColor,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Svg width={svgSize} height={svgSize} viewBox="0 0 64 64" fill="none">
        <Path
          d="M14 38 L32 20 L50 38"
          stroke={color}
          strokeWidth={5}
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={0.45}
        />
        <Path
          d="M14 48 L32 30 L50 48"
          stroke={color}
          strokeWidth={5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    </View>
  );
}
