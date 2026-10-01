/* ============================================================================
   Interactive vector-point background.
   Drifting nodes, lines between near neighbours, and the cursor pulling its
   own web. Pure canvas — no library, no build step.

   Tuning knobs are all in CFG below.
   ========================================================================= */
(function () {
  "use strict";

  const canvas = document.getElementById("bg-canvas");
  if (!canvas) return;

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const ctx = canvas.getContext("2d", { alpha: true });

  const CFG = {
    density:     0.000075, // nodes per px² of viewport (≈130 nodes at 1440×900)
    maxNodes:    170,
    minNodes:    45,
    speed:       0.22,     // px per frame
    linkDist:    140,      // px — node↔node line cutoff
    mouseDist:   190,      // px — cursor↔node line cutoff
    mousePush:   58,       // px — cursor repel radius
    nodeRadius:  [1.1, 2.3],
    lineWidth:   0.7,
    // Palette (theme.css): violet, amber, lime, azure
    palette: [
      [168,  85, 247],
      [231, 152,  54],
      [ 94, 203,  60],
      [ 72, 133, 202]
    ],
    linkRGB:   [140,  90, 220],
    mouseRGB:  [231, 152,  54],
    linkAlpha:  0.40,
    mouseAlpha: 0.55,
    nodeAlpha:  0.75
  };

  let w = 0, h = 0, dpr = 1, scale = 1;  // `scale` dims the field on phones
  let nodes = [];
  let raf = null;
  const mouse = { x: -9999, y: -9999, active: false };

  const rand = (a, b) => a + Math.random() * (b - a);

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = window.innerWidth;
    h = window.innerHeight;
    canvas.width  = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    build();
  }

  function build() {
    // Phones get a thinner, quieter field so the text stays the loud thing.
    const small = w < 700;
    scale = small ? 0.55 : 1;
    const floor = small ? 26 : CFG.minNodes;
    const target = Math.round(
      Math.min(CFG.maxNodes, Math.max(floor, w * h * CFG.density * (small ? 0.75 : 1)))
    );
    nodes = Array.from({ length: target }, () => {
      const a = Math.random() * Math.PI * 2;
      return {
        x:  Math.random() * w,
        y:  Math.random() * h,
        vx: Math.cos(a) * CFG.speed * rand(0.5, 1.4),
        vy: Math.sin(a) * CFG.speed * rand(0.5, 1.4),
        r:  rand(CFG.nodeRadius[0], CFG.nodeRadius[1]),
        c:  CFG.palette[Math.floor(Math.random() * CFG.palette.length)]
      };
    });
  }

  function step(schedule) {
    ctx.clearRect(0, 0, w, h);

    // --- move ---
    for (const n of nodes) {
      n.x += n.vx;
      n.y += n.vy;

      // wrap at the edges so the field never thins out
      if (n.x < -20) n.x = w + 20; else if (n.x > w + 20) n.x = -20;
      if (n.y < -20) n.y = h + 20; else if (n.y > h + 20) n.y = -20;

      // gentle shove away from the cursor
      if (mouse.active) {
        const dx = n.x - mouse.x, dy = n.y - mouse.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < CFG.mousePush * CFG.mousePush && d2 > 0.01) {
          const d = Math.sqrt(d2);
          const f = (1 - d / CFG.mousePush) * 0.9;
          n.x += (dx / d) * f;
          n.y += (dy / d) * f;
        }
      }
    }

    // --- links between nodes ---
    ctx.lineWidth = CFG.lineWidth;
    const [lr, lg, lb] = CFG.linkRGB;
    const maxD2 = CFG.linkDist * CFG.linkDist;

    for (let i = 0; i < nodes.length; i++) {
      const a = nodes[i];
      for (let j = i + 1; j < nodes.length; j++) {
        const b = nodes[j];
        const dx = a.x - b.x, dy = a.y - b.y;
        const d2 = dx * dx + dy * dy;
        if (d2 > maxD2) continue;
        const alpha = (1 - Math.sqrt(d2) / CFG.linkDist) * CFG.linkAlpha * scale;
        ctx.strokeStyle = `rgba(${lr},${lg},${lb},${alpha.toFixed(3)})`;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }
    }

    // --- links to the cursor ---
    if (mouse.active) {
      const [mr, mg, mb] = CFG.mouseRGB;
      const mD2 = CFG.mouseDist * CFG.mouseDist;
      ctx.lineWidth = CFG.lineWidth + 0.25;
      for (const n of nodes) {
        const dx = n.x - mouse.x, dy = n.y - mouse.y;
        const d2 = dx * dx + dy * dy;
        if (d2 > mD2) continue;
        const alpha = (1 - Math.sqrt(d2) / CFG.mouseDist) * CFG.mouseAlpha * scale;
        ctx.strokeStyle = `rgba(${mr},${mg},${mb},${alpha.toFixed(3)})`;
        ctx.beginPath();
        ctx.moveTo(n.x, n.y);
        ctx.lineTo(mouse.x, mouse.y);
        ctx.stroke();
      }
    }

    // --- nodes ---
    for (const n of nodes) {
      const [r, g, b] = n.c;
      ctx.fillStyle = `rgba(${r},${g},${b},${CFG.nodeAlpha * scale})`;
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      ctx.fill();
    }

    if (schedule !== false) raf = requestAnimationFrame(step);
  }

  function start() { if (!raf) raf = requestAnimationFrame(step); }
  function stop()  { if (raf) { cancelAnimationFrame(raf); raf = null; } }

  /* ---------- events ---------- */
  window.addEventListener("resize", () => {
    clearTimeout(resize._t);
    resize._t = setTimeout(() => { resize(); if (reduced) drawOnce(); }, 150);
  });

  window.addEventListener("pointermove", (e) => {
    if (e.pointerType === "touch") return;   // leave touch scrolling alone
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    mouse.active = true;
  }, { passive: true });

  window.addEventListener("pointerleave", () => { mouse.active = false; });
  document.addEventListener("visibilitychange", () => {
    if (reduced) return;
    document.hidden ? stop() : start();
  });

  /* ---------- go ---------- */
  function drawOnce() {
    // Reduced motion: one static frame, no animation loop, no cursor web.
    stop();
    for (const n of nodes) { n.vx = 0; n.vy = 0; }
    const wasActive = mouse.active;
    mouse.active = false;
    step(false);
    mouse.active = wasActive;
  }

  resize();
  if (reduced) drawOnce(); else start();
})();
