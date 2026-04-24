import React from 'react';
import Svg, { Path, Circle, Rect, G, Line } from 'react-native-svg';

const paths = {
  home: 'M3 10.5L12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1v-9.5z',
  plus: 'M12 5v14M5 12h14',
  list: 'M4 6h16M4 12h16M4 18h16',
  chart: 'M4 20V10M10 20V4M16 20v-7M22 20H2',
  user: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
  chev: 'M9 6l6 6-6 6',
  chevLeft: 'M15 6l-6 6 6 6',
  close: 'M18 6L6 18M6 6l12 12',
  check: 'M20 6L9 17l-5-5',
  arrowUp: 'M12 19V5M5 12l7-7 7 7',
  arrowDn: 'M12 5v14M19 12l-7 7-7-7',
  back: 'M19 12H5M12 19l-7-7 7-7',
  settings: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
  clock: 'M12 7v5l3 2',
  bolt: 'M13 2L3 14h7l-1 8 10-12h-7l1-8z',
  trash: 'M3 6h18M8 6V4h8v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6',
  pencil: 'M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z',
  calendar: 'M3 9h18M3 5h18v16H3zM8 3v4M16 3v4',
  flame: 'M12 2s4 4 4 8a4 4 0 1 1-8 0c0-1 .5-2 1-3 .5 1 1 2 2 2-1-2 0-5 1-7z',
  trophy: 'M8 3h8v4a4 4 0 1 1-8 0V3zM6 5H3v2a3 3 0 0 0 3 3M18 5h3v2a3 3 0 0 1-3 3M10 13h4v4h-4zM8 20h8',
  target: '',
  info: '',
  export: 'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3',
  import: 'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12',
  cloud: 'M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z',
  mail: 'M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2zM22 6l-10 7L2 6',
} as const;

type IconName = keyof typeof paths;

interface IconProps {
  name: IconName;
  size?: number;
  stroke?: string;
  fill?: string;
  sw?: number;
}

export default function Icon({
  name,
  size = 24,
  stroke = 'currentColor',
  fill = 'none',
  sw = 2,
}: IconProps) {
  const d = paths[name];
  const extra: Record<string, unknown> = {};

  if (name === 'clock') {
    extra.children = (
      <>
        <Circle cx="12" cy="12" r="9" stroke={stroke} strokeWidth={sw} fill={fill} />
        <Path d="M12 7v5l3 2" stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" />
      </>
    );
  } else if (name === 'target') {
    extra.children = (
      <>
        <Circle cx="12" cy="12" r="9" stroke={stroke} strokeWidth={sw} fill={fill} />
        <Circle cx="12" cy="12" r="5" stroke={stroke} strokeWidth={sw} fill={fill} />
        <Circle cx="12" cy="12" r="1.5" fill={stroke} />
      </>
    );
  } else if (name === 'info') {
    extra.children = (
      <>
        <Circle cx="12" cy="12" r="9" stroke={stroke} strokeWidth={sw} fill={fill} />
        <Path d="M12 8v4M12 16h.01" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
      </>
    );
  }

  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={fill}
      stroke={stroke}
      strokeWidth={sw}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {extra.children ? extra.children as React.ReactNode : <Path d={d} />}
    </Svg>
  );
}
