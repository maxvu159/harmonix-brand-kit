import React from "react";
import { AbsoluteFill } from "remotion";

/**
 * Kiem font. Hai cau hoi khac nhau:
 *   1. Aeonik co duoc tai khong (so voi font du phong)
 *   2. Tung WEIGHT co file that khong — thieu weight thi trinh duyet GIA LAP
 *      (kéo nét ra) chu khong bao loi.
 */
const SAMPLE = "PT-haHYPE 3.19% APY";

export const FontCheck: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: "#173132", padding: 40 }}>
    {[300, 400, 500, 700, 900].map((w) => (
      <div key={w} style={{ marginBottom: 8 }}>
        <div style={{ fontFamily: "monospace", fontSize: 20, color: "#8A8A93" }}>
          Aeonik {w}
        </div>
        <div style={{ fontFamily: "Aeonik", fontSize: 76, fontWeight: w, color: "#FAFAFA" }}>
          {SAMPLE}
        </div>
      </div>
    ))}
  </AbsoluteFill>
);
