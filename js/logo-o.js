/* ── Animated O — ellipses for nav + footer logos ── */
(function() {
  const ns  = 'http://www.w3.org/2000/svg';
  const cx  = 150, cy = 150;
  // Color claro para tema oscuro
  const INK = 'rgba(204,214,246,0.55)';
  const INK_RING = 'rgba(204,214,246,0.75)';

  const R_MID  = 138;
  const MIN_HW = 3;
  const MAX_HW = 14;
  const R_CLIP = R_MID - MAX_HW - 1;
  const RX     = R_CLIP;
  const RY     = 50;

  function buildLogoO(svgEl) {
    // defs + clip
    const defs = document.createElementNS(ns, 'defs');
    const clipId = 'ic-' + Math.random().toString(36).slice(2);
    const clipPath   = document.createElementNS(ns, 'clipPath');
    clipPath.id      = clipId;
    const clipCircle = document.createElementNS(ns, 'circle');
    clipCircle.setAttribute('cx', cx);
    clipCircle.setAttribute('cy', cy);
    clipCircle.setAttribute('r',  R_CLIP);
    clipPath.appendChild(clipCircle);
    defs.appendChild(clipPath);
    svgEl.appendChild(defs);

    // brush ring
    const THICK_AT = 205 * Math.PI / 180;
    const STEPS    = 720;
    const outer = [], inner = [];
    for (let i = 0; i <= STEPS; i++) {
      const a    = (i / STEPS) * Math.PI * 2;
      const diff = Math.abs(((a - THICK_AT + Math.PI * 3) % (Math.PI * 2)) - Math.PI);
      const t    = (1 - Math.cos(diff)) / 2;
      const hw   = MIN_HW + t * (MAX_HW - MIN_HW);
      outer.push([cx + (R_MID + hw) * Math.cos(a), cy + (R_MID + hw) * Math.sin(a)]);
      inner.push([cx + (R_MID - hw) * Math.cos(a), cy + (R_MID - hw) * Math.sin(a)]);
    }
    let d = `M${outer[0][0].toFixed(2)},${outer[0][1].toFixed(2)}`;
    for (let i = 1; i < outer.length; i++)
      d += `L${outer[i][0].toFixed(2)},${outer[i][1].toFixed(2)}`;
    d += `L${inner[inner.length-1][0].toFixed(2)},${inner[inner.length-1][1].toFixed(2)}`;
    for (let i = inner.length-2; i >= 0; i--)
      d += `L${inner[i][0].toFixed(2)},${inner[i][1].toFixed(2)}`;
    d += 'Z';
    const ring = document.createElementNS(ns, 'path');
    ring.setAttribute('d', d);
    ring.setAttribute('fill', INK_RING);
    svgEl.appendChild(ring);

    // clipped group with ellipses + dots
    const g = document.createElementNS(ns, 'g');
    g.setAttribute('clip-path', `url(#${clipId})`);
    svgEl.appendChild(g);

    function makeEll() {
      const el = document.createElementNS(ns, 'ellipse');
      el.setAttribute('cx', cx); el.setAttribute('cy', cy);
      el.setAttribute('rx', RX); el.setAttribute('ry', RY);
      el.setAttribute('fill', 'none');
      el.setAttribute('stroke', INK);
      el.setAttribute('stroke-width', '1.3');
      g.appendChild(el);
      return el;
    }
    const e1 = makeEll(), e2 = makeEll();
    const dg = document.createElementNS(ns, 'g');
    g.appendChild(dg);

    return { e1, e2, dg };
  }

  // Intersection helpers
  function ptOn(t, angle) {
    const ca = Math.cos(angle), sa = Math.sin(angle);
    return {
      x: cx + RX * Math.cos(t) * ca - RY * Math.sin(t) * sa,
      y: cy + RX * Math.cos(t) * sa + RY * Math.sin(t) * ca,
    };
  }
  function eF(x, y, angle) {
    const ca = Math.cos(angle), sa = Math.sin(angle);
    const dx = x - cx, dy = y - cy;
    const u  =  dx * ca + dy * sa;
    const v  = -dx * sa + dy * ca;
    return (u / RX) ** 2 + (v / RY) ** 2 - 1;
  }
  function intersect(a1, a2) {
    const pts = [], N = 800;
    let pF = null, pT = null;
    for (let i = 0; i <= N; i++) {
      const t = (i / N) * Math.PI * 2;
      const p = ptOn(t, a1);
      const f = eF(p.x, p.y, a2);
      if (pF !== null && Math.sign(pF) !== Math.sign(f)) {
        let lo = pT, hi = t;
        for (let k = 0; k < 24; k++) {
          const m = (lo + hi) / 2, pm = ptOn(m, a1), fm = eF(pm.x, pm.y, a2);
          if (Math.sign(fm) === Math.sign(pF)) lo = m; else hi = m;
        }
        const pf = ptOn((lo + hi) / 2, a1);
        if (!pts.some(q => Math.hypot(q.x - pf.x, q.y - pf.y) < 5)) pts.push(pf);
      }
      pF = f; pT = t;
    }
    return pts;
  }

  function updateDots(dg, pool, pts) {
    while (pool.length < pts.length) {
      const c = document.createElementNS(ns, 'circle');
      c.setAttribute('r', '5.2');
      c.setAttribute('fill', INK);
      dg.appendChild(c);
      pool.push(c);
    }
    pool.forEach((c, i) => {
      if (i < pts.length) {
        c.setAttribute('cx', pts[i].x.toFixed(3));
        c.setAttribute('cy', pts[i].y.toFixed(3));
        c.style.display = '';
      } else {
        c.style.display = 'none';
      }
    });
  }

  function setAngle(el, angle) {
    el.setAttribute('transform', `rotate(${(angle * 180 / Math.PI).toFixed(4)},${cx},${cy})`);
  }

  // Build both instances
  const svgNav    = document.getElementById('logoONav');
  const svgFooter = document.getElementById('logoOFooter');
  if (!svgNav || !svgFooter) return;

  const nav    = buildLogoO(svgNav);
  const footer = buildLogoO(svgFooter);
  const navPool = [], footPool = [];

  // Speeds — mismo que web-o-nada: reposo 6s/4.5s
  const BASE1 =  (2 * Math.PI) / (6   * 1000);
  const BASE2 = -(2 * Math.PI) / (4.5 * 1000);
  const INTRO_MULT = 12;
  const INTRO_DUR  = 2200;

  // Nav y footer corren independientes pero mismas velocidades
  let a1 = -22 * Math.PI / 180;
  let a2 =  40 * Math.PI / 180;
  let last = null, startTime = null;
  let scrollBoost = 0;

  window.addEventListener('wheel', (e) => {
    scrollBoost = Math.min(scrollBoost + Math.abs(e.deltaY) * 0.006, 5);
  }, { passive: true });
  let lty = 0;
  window.addEventListener('touchstart', (e) => { lty = e.touches[0].clientY; }, { passive: true });
  window.addEventListener('touchmove',  (e) => {
    const dy = Math.abs(e.touches[0].clientY - lty);
    lty = e.touches[0].clientY;
    scrollBoost = Math.min(scrollBoost + dy * 0.018, 5);
  }, { passive: true });

  function frame(ts) {
    if (startTime === null) startTime = ts;
    const elapsed = ts - startTime;

    if (last !== null) {
      const dt = Math.min(ts - last, 50);
      let mult;
      if (elapsed < INTRO_DUR) {
        const eased = 1 - Math.pow(1 - elapsed / INTRO_DUR, 4);
        mult = INTRO_MULT - (INTRO_MULT - 1) * eased;
      } else {
        scrollBoost *= 0.94;
        if (scrollBoost < 0.01) scrollBoost = 0;
        mult = 1 + scrollBoost;
      }
      a1 += BASE1 * mult * dt;
      a2 += BASE2 * mult * dt;
    }
    last = ts;

    // Actualizar nav
    setAngle(nav.e1, a1); setAngle(nav.e2, a2);
    updateDots(nav.dg, navPool, intersect(a1, a2));

    // Actualizar footer (mismo ángulo, visualmente sincronizados)
    setAngle(footer.e1, a1); setAngle(footer.e2, a2);
    updateDots(footer.dg, footPool, intersect(a1, a2));

    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();
