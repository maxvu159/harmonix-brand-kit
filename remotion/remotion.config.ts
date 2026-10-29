/**
 * Cau hinh render cho video chart Harmonix.
 * Luu y: khi dung Node.JS API thi file nay khong ap dung — phai truyen truc tiep.
 */
import { Config } from "@remotion/cli/config";

Config.setRspack(true);
Config.setOverwriteOutput(true);

// PNG chu khong phai JPEG cho frame trung gian.
// Chart co chu nho va net manh — nen JPEG hai chat luong ngay tu buoc chup frame.
// Doi lai render cham hon mot chut, nhung 240 frame chi mat vai giay.
Config.setVideoImageFormat("png");

// yuvj420p (full range) lam lech mau tren mot so trinh phat.
// X va phan lon noi khac mong doi limited range + bt709.
Config.setPixelFormat("yuv420p");
Config.setColorSpace("bt709");

// Chat luong cao: chart nhieu vung mau phang, artifact hien rat ro.
Config.setCrf(18);

// Bat buoc cho moi composition dung Three.js.
// Khong co dong nay: "THREE.WebGLRenderer: Error creating WebGL context".
Config.setChromiumOpenGlRenderer("angle");
