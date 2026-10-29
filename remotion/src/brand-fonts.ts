import { delayRender, continueRender } from "remotion";

// colors_and_type.css khai bao @font-face voi font-display: swap.
// Trinh duyet chi tai font khi thuc su dung, nen phai ep tai truoc
// roi moi cho Remotion chup frame — neu khong se co vai frame dau
// hien font du phong.
const WEIGHTS = [300, 400, 500, 700, 900];

const handle = delayRender("Doi font Aeonik tai xong");

Promise.all(WEIGHTS.map((w) => document.fonts.load(`${w} 100px Aeonik`)))
  .then(() => document.fonts.ready)
  .then(() => continueRender(handle))
  .catch((err) => {
    console.error("Khong tai duoc Aeonik:", err);
    continueRender(handle);
  });

export const AEONIK_WEIGHTS = WEIGHTS;
