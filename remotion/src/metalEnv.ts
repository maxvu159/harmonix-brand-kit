import { useMemo } from "react";
import * as THREE from "three";

/**
 * Moi truong phan chieu cho kim loai. Tach ra tu CoinTest de the va xu dung
 * chung mot studio — hai vat lieu duoi hai moi truong khac nhau se khong bao
 * gio trong nhu cung mot canh quay.
 *
 * `tint` la thu them so voi ban cua dong xu. Dong xu can bac trung tinh nen
 * tint = null. The thi khac: no nam tren nen aurora xanh, va canh vat danh
 * bong cua no chinh la cho mau nen di VAO the. Khong to the mau xanh — de
 * phan chieu mang mau vao, dung nhu kim loai that hoat dong.
 */
/**
 * `strips`: studio TOI voi vai DAI SANG HEP thay vi tran sang rong.
 *
 * Ban tran-sang-rong lam ra mot mang bet tren mat the — do la vet loa da phai
 * dap bo o video the. Nhung dap bang cach ha cuong do phan chieu thi mat luon
 * ca diem bat sang, va the ra phang nhu nhua. Loi khong nam o "nhieu sang" ma
 * o "NGUON SANG QUA TO": nguon rong phan chieu ra mang, nguon hep phan chieu ra
 * VET — sac, va CHAY khi vat xoay. Do dung la thu ban duoc chat kim loai.
 *
 * Cac dai phai HEP THEO CHIEU NGANG (phuong vi) thi xoay envMapRotation quanh
 * truc Y moi keo duoc vet sang chay ngang qua mat the. Dai rong het chieu ngang
 * thi xoay bao nhieu cung dung yen.
 */
export const useMetalEnv = (
  tint: { top: string; bottom: string; amount: number } | null = null,
  strips = false,
) =>
  useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 2048;
    c.height = 1024;
    const g = c.getContext("2d")!;
    const grad = g.createLinearGradient(0, 0, 0, 1024);
    if (strips) {
      // Nen XAM VUA, khong phai toi den. Ban dau toi de nen toi cho dai sang
      // noi bat, ket qua la canh vat — vong kim loai bong nhat tren the — chi
      // co bong toi de phan chieu, thanh mot vien xam duc. Canh vat can mot muc
      // sang NEN de bat, con cac dai chi la diem nhan chay tren nen do.
      grad.addColorStop(0.0, "#6e7778");
      grad.addColorStop(0.62, "#828b8c");
      grad.addColorStop(0.638, "#9aa3a4");
      grad.addColorStop(0.645, "#202628"); // duong chan troi: buoc nhay CANG SAC CANG RA KIM LOAI
      grad.addColorStop(0.80, "#394143");
      grad.addColorStop(1.0, "#1a1e20");
    } else {
      grad.addColorStop(0.0, "#eef0ef");
      grad.addColorStop(0.34, "#d6dbda");
      grad.addColorStop(0.638, "#fafbfa");
      grad.addColorStop(0.645, "#333a3b");
      grad.addColorStop(0.74, "#6b7372");
      grad.addColorStop(1.0, "#22282a");
    }
    g.fillStyle = grad;
    g.fillRect(0, 0, 2048, 1024);

    if (strips) {
      // Bon dai sang dung, rong 100-165px tren 2048 — moi dai chiem 5-8% phuong
      // vi, nen phan chieu ra mot vet manh chu khong phai mot mang.
      for (const [x, y, w, h, a] of [
        [150, 40, 150, 600, 1.0],
        [560, 90, 105, 500, 0.88],
        [900, 20, 190, 620, 1.0],
        [1330, 70, 120, 540, 0.94],
        [1700, 40, 165, 600, 1.0],
      ] as const) {
        const glow = g.createLinearGradient(x - w, 0, x + w * 2, 0);
        glow.addColorStop(0, "rgba(255,255,255,0)");
        glow.addColorStop(0.5, `rgba(255,255,255,${a * 0.28})`);
        glow.addColorStop(1, "rgba(255,255,255,0)");
        g.fillStyle = glow;
        g.fillRect(x - w, y - 60, w * 3, h + 120);
        g.fillStyle = `rgba(255,255,255,${a})`;
        g.fillRect(x, y, w, h);
      }
      // Mot dai mo nam ngang duoi chan troi: nang mat duoi cua vanh len mot chut
      g.fillStyle = "#7c8587";
      g.fillRect(0, 700, 2048, 46);
    } else {
      // Tam hat sang canh cung — phan chieu cua canh SAC moi ra kim loai.
      g.fillStyle = "#ffffff";
      for (const [x, y, w, h] of [
        [150, 90, 620, 210],
        [980, 40, 430, 150],
        [1560, 130, 330, 190],
        [640, 560, 520, 90],
      ] as const) {
        g.fillRect(x, y, w, h);
      }
      g.fillStyle = "#202627";
      for (const [x, y, w, h] of [
        [0, 330, 2048, 34],
        [820, 250, 90, 300],
      ] as const) {
        g.fillRect(x, y, w, h);
      }
      for (const [x, y, r, a] of [
        [420, 220, 300, 0.7],
        [1150, 150, 190, 0.5],
        [1700, 300, 240, 0.45],
        [900, 760, 300, 0.3],
        [1024, 430, 560, 0.55],
      ] as const) {
        const spot = g.createRadialGradient(x, y, 0, x, y, r);
        spot.addColorStop(0, `rgba(255,255,255,${a})`);
        spot.addColorStop(1, "rgba(255,255,255,0)");
        g.fillStyle = spot;
        g.fillRect(0, 0, 2048, 1024);
      }
    }

    // Lop mau, chong len o cuong do thap. Phai la 'multiply' chu khong phai
    // 've de': 've de' se xoa mat cac tam hat sang, ma chinh chung moi lam ra
    // vet sang sac tren canh vat.
    if (tint) {
      g.globalAlpha = tint.amount;
      g.globalCompositeOperation = "multiply";
      const tg = g.createLinearGradient(0, 0, 0, 1024);
      tg.addColorStop(0.0, tint.top);
      tg.addColorStop(1.0, tint.bottom);
      g.fillStyle = tg;
      g.fillRect(0, 0, 2048, 1024);
      g.globalAlpha = 1;
      g.globalCompositeOperation = "source-over";
    }

    const tex = new THREE.CanvasTexture(c);
    tex.mapping = THREE.EquirectangularReflectionMapping;
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, [tint?.top, tint?.bottom, tint?.amount, strips]);
