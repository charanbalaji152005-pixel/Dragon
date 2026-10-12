import { useEffect, useRef } from "react";

const N = 46;
const GAP = 11;

export default function Home() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const cv = canvasRef.current;
    const ctx = cv.getContext("2d");
    let W, H, raf;

    const resize = () => {
      const d = Math.min(window.devicePixelRatio || 1, 2);
      W = window.innerWidth;
      H = window.innerHeight;
      cv.width = W * d;
      cv.height = H * d;
      ctx.setTransform(d, 0, 0, d, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const seg = Array.from({ length: N }, (_, i) => ({ x: W / 2 - i * GAP, y: H / 2 }));
    const target = { x: W / 2, y: H / 2 };
    let lastInput = -1e9;

    const setT = (e) => {
      target.x = e.clientX;
      target.y = e.clientY;
      lastInput = performance.now();
    };
    window.addEventListener("pointermove", setT);
    window.addEventListener("pointerdown", setT);

    function fan(x, y, ang, ribLen) {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(ang - Math.PI / 2);
      const grad = ctx.createRadialGradient(0, 0, 2, 0, 0, ribLen);
      grad.addColorStop(0, "rgba(255,120,20,.95)");
      grad.addColorStop(1, "rgba(200,40,0,.35)");

      ctx.fillStyle = grad;
      ctx.strokeStyle = "#ED8C0C";
      ctx.lineWidth = 1.8;
      ctx.shadowColor = "#ED8C0C";
      ctx.shadowBlur = 14;

      const ribCount = 6;
      const ribTips = [];
      ctx.beginPath();
      ctx.moveTo(0, 0);
      for (let r = 0; r < ribCount; r++) {
        const t = r / (ribCount - 1);
        const ribAngle = -0.8 + t * 1.6;
        const tipX = Math.sin(ribAngle) * ribLen;
        const tipY = Math.cos(ribAngle) * ribLen;
        ribTips.push({ x: tipX, y: tipY });

        if (r === 0) {
          ctx.lineTo(tipX, tipY);
        } else {
          const prevTip = ribTips[r - 1];
          const midX = (prevTip.x + tipX) * 0.5 * 0.75;
          const midY = (prevTip.y + tipY) * 0.5 * 0.75;
          ctx.quadraticCurveTo(midX, midY, tipX, tipY);
        }
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.shadowBlur = 0;
      ctx.globalAlpha = 0.7;
      ctx.beginPath();
      for (const p of ribTips) {
        ctx.moveTo(0, 0);
        ctx.lineTo(p.x, p.y);
      }
      ctx.stroke();
      ctx.restore();
    }

    function frame(now) {
      const t = now / 1000;
      if (now - lastInput > 3000) {
        target.x = W / 2 + Math.sin(t * 0.9) * W * 0.38;
        target.y = H / 2 + Math.sin(t * 1.8) * H * 0.25;
      }
      const h = seg[0];
      h.x += (target.x - h.x) * 0.06;
      h.y += (target.y - h.y) * 0.06;
      for (let i = 1; i < N; i++) {
        const p = seg[i - 1], s = seg[i];
        const a = Math.atan2(s.y - p.y, s.x - p.x);
        s.x = p.x + Math.cos(a) * GAP;
        s.y = p.y + Math.sin(a) * GAP;
      }

      ctx.fillStyle = "rgba(5,5,8,.28)";
      ctx.fillRect(0, 0, W, H);

      ctx.shadowColor = "#ff3b1c";
      ctx.shadowBlur = 10;
      ctx.fillStyle = "#ff5a2a";
      for (let i = N - 1; i >= 2; i--) {
        ctx.beginPath();
        ctx.arc(seg[i].x, seg[i].y, 1.2 + (1 - i / N) * 3, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.shadowBlur = 0;

      fan(h.x, h.y, Math.atan2(h.y - seg[2].y, h.x - seg[2].x), 64);
      const e = seg[N - 1], f = seg[N - 3];
      fan(e.x, e.y, Math.atan2(e.y - f.y, e.x - f.x) + Math.PI, 16);

      ctx.strokeStyle = "rgba(255,255,255,.8)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(target.x - 5, target.y);
      ctx.lineTo(target.x + 5, target.y);
      ctx.moveTo(target.x, target.y - 5);
      ctx.lineTo(target.x, target.y + 5);
      ctx.stroke();

      raf = requestAnimationFrame(frame);
    }
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", setT);
      window.removeEventListener("pointerdown", setT);
    };
  }, []);

  return (
    <div style={{ position: "fixed", inset: 0, background: "#050508" }}>
      <canvas ref={canvasRef} style={{ display: "block", width: "100%", height: "100%", touchAction: "none" }} />
     
    </div>
  );
}
