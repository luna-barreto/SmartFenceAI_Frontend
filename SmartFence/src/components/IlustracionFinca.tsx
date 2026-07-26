import React from "react";
import Svg, { Path, Ellipse, Circle } from "react-native-svg";

interface Props {
  ancho: number;
}

// Ilustración vectorial de finca: cielo, pasto, cerca, vacas, árbol, montañas
export default function IlustracionFinca({ ancho }: Props) {
  const alto = ancho * 0.42;
  const w = ancho;
  const h = alto;

  return (
    <Svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      {/* Cielo / fondo */}
      <Path d={`M0,0 L${w},0 L${w},${h} L0,${h} Z`} fill="#E8F5E0" />

      {/* Montañas fondo */}
      <Path
        d={`M0,${h * 0.55} C${w * 0.15},${h * 0.22} ${w * 0.3},${h * 0.38} ${w * 0.45},${h * 0.28}
           C${w * 0.6},${h * 0.18} ${w * 0.75},${h * 0.42} ${w},${h * 0.32} L${w},${h} L0,${h} Z`}
        fill="#C8E6B0" opacity={0.6}
      />
      <Path
        d={`M0,${h * 0.65} C${w * 0.12},${h * 0.38} ${w * 0.28},${h * 0.52} ${w * 0.4},${h * 0.42}
           C${w * 0.55},${h * 0.3} ${w * 0.7},${h * 0.55} ${w * 0.85},${h * 0.44}
           C${w * 0.92},${h * 0.38} ${w},${h * 0.5} ${w},${h * 0.48} L${w},${h} L0,${h} Z`}
        fill="#A8D880" opacity={0.55}
      />

      {/* Pasto inferior */}
      <Path
        d={`M0,${h * 0.72} C${w * 0.25},${h * 0.6} ${w * 0.5},${h * 0.68} ${w * 0.75},${h * 0.62}
           C${w * 0.88},${h * 0.58} ${w},${h * 0.65} ${w},${h * 0.65} L${w},${h} L0,${h} Z`}
        fill="#76C043" opacity={0.85}
      />

      {/* Cerca: postes */}
      {[0.12, 0.3, 0.48, 0.66, 0.84].map((xp, i) => (
        <Path
          key={i}
          d={`M${w * xp},${h * 0.62} L${w * xp},${h * 0.82}`}
          stroke="#5A8A2A" strokeWidth={3.5} strokeLinecap="round"
        />
      ))}
      {/* Cerca: alambres */}
      <Path
        d={`M${w * 0.12},${h * 0.67} L${w * 0.84},${h * 0.65}`}
        stroke="#5A8A2A" strokeWidth={1.8} opacity={0.7}
      />
      <Path
        d={`M${w * 0.12},${h * 0.74} L${w * 0.84},${h * 0.72}`}
        stroke="#5A8A2A" strokeWidth={1.8} opacity={0.7}
      />

      {/* Vaca 1 */}
      <Ellipse cx={w * 0.38} cy={h * 0.77} rx={w * 0.055} ry={h * 0.08} fill="#F0EDE8" />
      <Circle  cx={w * 0.41} cy={h * 0.71} r={w * 0.025} fill="#F0EDE8" />
      <Path d={`M${w*0.36},${h*0.84} L${w*0.36},${h*0.92}`} stroke="#9E9088" strokeWidth={2.2} strokeLinecap="round" />
      <Path d={`M${w*0.4},${h*0.84}  L${w*0.4},${h*0.92}`}  stroke="#9E9088" strokeWidth={2.2} strokeLinecap="round" />
      <Path d={`M${w*0.34},${h*0.84} L${w*0.33},${h*0.92}`} stroke="#9E9088" strokeWidth={2.2} strokeLinecap="round" />
      <Path d={`M${w*0.42},${h*0.84} L${w*0.42},${h*0.92}`} stroke="#9E9088" strokeWidth={2.2} strokeLinecap="round" />
      {/* Mancha */}
      <Ellipse cx={w * 0.37} cy={h * 0.75} rx={w * 0.018} ry={h * 0.028} fill="#C8B8A8" opacity={0.5} />

      {/* Vaca 2 (más pequeña, al fondo) */}
      <Ellipse cx={w * 0.62} cy={h * 0.73} rx={w * 0.042} ry={h * 0.065} fill="#E8E4DE" />
      <Circle  cx={w * 0.65} cy={h * 0.68} r={w * 0.02}  fill="#E8E4DE" />
      <Path d={`M${w*0.60},${h*0.79} L${w*0.60},${h*0.88}`} stroke="#9E9088" strokeWidth={1.8} strokeLinecap="round" />
      <Path d={`M${w*0.64},${h*0.79} L${w*0.64},${h*0.88}`} stroke="#9E9088" strokeWidth={1.8} strokeLinecap="round" />
      <Path d={`M${w*0.58},${h*0.79} L${w*0.57},${h*0.88}`} stroke="#9E9088" strokeWidth={1.8} strokeLinecap="round" />
      <Path d={`M${w*0.65},${h*0.79} L${w*0.65},${h*0.88}`} stroke="#9E9088" strokeWidth={1.8} strokeLinecap="round" />

      {/* Árbol izquierda */}
      <Path d={`M${w*0.06},${h*0.62} L${w*0.06},${h*0.88}`} stroke="#5A8A2A" strokeWidth={4} strokeLinecap="round" />
      <Ellipse cx={w*0.06} cy={h*0.52} rx={w*0.045} ry={h*0.12} fill="#4A8A1A" opacity={0.85} />
      <Ellipse cx={w*0.06} cy={h*0.49} rx={w*0.035} ry={h*0.09} fill="#5FA82A" opacity={0.8} />

      {/* Árbol derecha */}
      <Path d={`M${w*0.92},${h*0.65} L${w*0.92},${h*0.88}`} stroke="#5A8A2A" strokeWidth={3.5} strokeLinecap="round" />
      <Ellipse cx={w*0.92} cy={h*0.54} rx={w*0.038} ry={h*0.1} fill="#4A8A1A" opacity={0.8} />
      <Ellipse cx={w*0.92} cy={h*0.51} rx={w*0.028} ry={h*0.075} fill="#5FA82A" opacity={0.75} />

      {/* Granero */}
      <Path
        d={`M${w*0.74},${h*0.72} L${w*0.74},${h*0.88} L${w*0.88},${h*0.88} L${w*0.88},${h*0.72} Z`}
        fill="#C8855A"
      />
      <Path
        d={`M${w*0.72},${h*0.72} L${w*0.81},${h*0.62} L${w*0.9},${h*0.72} Z`}
        fill="#A86040"
      />
      {/* Puerta granero */}
      <Path
        d={`M${w*0.79},${h*0.88} L${w*0.79},${h*0.80} L${w*0.84},${h*0.80} L${w*0.84},${h*0.88}`}
        fill="#8B4A28"
      />
    </Svg>
  );
}
