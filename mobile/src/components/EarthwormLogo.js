import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Line, Path, Rect } from 'react-native-svg';
import { COLORS, RADIUS, SHADOWS } from '../constants/theme';

export const EarthwormLogo = ({ size = 80, badge = true }) => {
  const scale = size / 80;
  const svgWidth = 60 * scale;
  const svgHeight = 66 * scale;

  const svgContent = (
    <Svg width={svgWidth} height={svgHeight} viewBox="0 0 200 240">
      {/* Vertical Spine Bar */}
      <Rect x="30" y="30" width="32" height="180" rx="16" fill="#348B47" />

      {/* Top Horizontal Bar (Light Green) */}
      <Rect x="30" y="30" width="100" height="32" rx="16" fill="#81C784" />

      {/* Sprouting Leaf (Pixel-Perfect Angle & Center Vein) */}
      <Path
        d="M 125 32 C 140 18, 172 -2, 186 -14 C 174 12, 150 36, 125 32 Z"
        fill="#81C784"
        stroke="#4CAF50"
        strokeWidth="1.5"
      />
      <Path
        d="M 125 32 Q 152 14, 183 -11"
        fill="none"
        stroke="#266835"
        strokeWidth="2.5"
        strokeLinecap="round"
      />

      {/* Middle Horizontal Bar (Forest Green with Earthworm Node Icon) */}
      <Rect x="30" y="104" width="112" height="32" rx="16" fill="#2E7D32" />
      <Circle cx="118" cy="120" r="5.5" fill="#FFFFFF" />
      <Line x1="123" y1="120" x2="131" y2="120" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
      <Circle cx="136" cy="120" r="5.5" fill="#FFFFFF" />

      {/* Bottom Horizontal Bar (Soil Brown) */}
      <Rect x="30" y="178" width="130" height="32" rx="16" fill="#6D4C41" />
    </Svg>
  );

  if (badge) {
    return (
      <View
        style={[
          styles.badge,
          { width: size, height: size, borderRadius: RADIUS.md * scale },
          SHADOWS.medium,
        ]}
      >
        {svgContent}
      </View>
    );
  }

  return svgContent;
};

const styles = StyleSheet.create({
  badge: {
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 6,
  },
});

export default EarthwormLogo;
