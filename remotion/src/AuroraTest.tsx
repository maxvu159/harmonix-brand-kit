import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import * as THREE from "three";
import { Aurora, AURORA_DEBUG } from "./Aurora";

/** Chi co nen — de do mau va do muot, khong bi dong xu che. */
export const AuroraTest: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  return (
    <AbsoluteFill style={{ backgroundColor: "#000000" }}>
      <ThreeCanvas
        width={width}
        height={height}
        camera={{ fov: 52, position: [0, 0, 5], near: 0.1, far: 100 }}
        style={{ background: "transparent" }}
        gl={{ toneMapping: THREE.NoToneMapping }}
      >
        <Aurora t={frame / fps} width={width} height={height} loopSeconds={14} />
      </ThreeCanvas>
      {AURORA_DEBUG > 0.5 ? (
        <>
          {/* o chuan CSS: phai ra dung 23,49,50 trong PNG */}
          <div style={{ position: "absolute", left: 0, top: 0, width: 400, height: 1440, backgroundColor: "#173132" }} />
          <div style={{ position: "absolute", left: 400, top: 0, width: 400, height: 1440, backgroundColor: "#1C3B3C" }} />
        </>
      ) : null}
    </AbsoluteFill>
  );
};
