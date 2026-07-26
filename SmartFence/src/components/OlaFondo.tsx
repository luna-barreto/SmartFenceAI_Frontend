import React from "react";
import Svg, { Path } from "react-native-svg";

interface Props {
  ancho: number;
  alto: number;
  color: string;
}

export default function OlaFondo({ ancho, alto, color }: Props) {
  const w = ancho;
  const h = alto;
  return (
    <Svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      <Path
        d={`M0,${h * 0.45} C${w * 0.2},${h * 0.0} ${w * 0.4},${h * 0.8} ${w * 0.6},${h * 0.35}
           C${w * 0.8},${h * -0.1} ${w * 0.9},${h * 0.6} ${w},${h * 0.3}
           L${w},${h} L0,${h} Z`}
        fill={color}
      />
    </Svg>
  );
}
