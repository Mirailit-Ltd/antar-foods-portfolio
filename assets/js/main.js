/* Antar Foods — motion & interactions */
(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = matchMedia("(hover: hover) and (pointer: fine)").matches;

  $("#year").textContent = new Date().getFullYear();

  // Without GSAP (CDN blocked) the page still works as a static site.
  if (!window.gsap) {
    $("#loader")?.remove();
    $$(".reveal-words").forEach((el) => (el.style.opacity = 1));
    return;
  }

  gsap.registerPlugin(ScrollTrigger);
  document.body.classList.add("is-loading");

  /* ---------- Smooth scroll ---------- */
  let lenis = null;
  if (!reduced && window.Lenis) {
    lenis = new Lenis({ duration: 1.15, smoothWheel: true });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    lenis.stop();
    window.lenis = lenis;
  }

  const scrollToHash = (hash) => {
    const target = hash === "#top" ? 0 : $(hash);
    if (target === null) return;
    if (lenis) lenis.scrollTo(target, { offset: 0, duration: 1.4 });
    else if (target === 0) window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
    else target.scrollIntoView({ behavior: reduced ? "auto" : "smooth" });
  };
  $$('a[href^="#"]').forEach((a) =>
    a.addEventListener("click", (e) => {
      const hash = a.getAttribute("href");
      if (hash.length < 2) return;
      e.preventDefault();
      closeMenu();
      scrollToHash(hash);
    })
  );

  /* ---------- Mobile menu ---------- */
  const burger = $("#burger");
  const menu = $("#menu");
  function closeMenu() {
    menu.classList.remove("is-open");
    menu.setAttribute("aria-hidden", "true");
    burger.setAttribute("aria-expanded", "false");
    lenis?.start();
  }
  burger.addEventListener("click", () => {
    const open = !menu.classList.contains("is-open");
    if (!open) return closeMenu();
    menu.classList.add("is-open");
    menu.setAttribute("aria-hidden", "false");
    burger.setAttribute("aria-expanded", "true");
    lenis?.stop();
    gsap.fromTo($$("#menu nav a"), { yPercent: 60, opacity: 0 }, { yPercent: 0, opacity: 1, stagger: 0.06, duration: 0.7, ease: "expo.out", delay: 0.25 });
  });

  /* ---------- Nav state ---------- */
  const nav = $("#nav");
  let lastY = 0;
  ScrollTrigger.create({
    start: 0,
    end: "max",
    onUpdate: (self) => {
      const y = self.scroll();
      nav.classList.toggle("is-scrolled", y > 40);
      nav.classList.toggle("is-hidden", y > 400 && y > lastY && !menu.classList.contains("is-open"));
      lastY = y;
    },
  });
  $$(".nav__links a").forEach((link) => {
    const sec = $(link.getAttribute("href"));
    if (!sec) return;
    ScrollTrigger.create({
      trigger: sec,
      start: "top 50%",
      end: "bottom 50%",
      onToggle: (s) => link.classList.toggle("is-active", s.isActive),
    });
  });

  /* ---------- Living blob behind hero ---------- */
  const blobPath = $("#blobPath");
  if (blobPath) {
    const N = 7, cx = 300, cy = 300, R = 235;
    const seeds = Array.from({ length: N }, (_, i) => ({ a: Math.random() * 6.28, s: 0.4 + Math.random() * 0.5, i }));
    const draw = (t) => {
      const pts = seeds.map(({ a, s, i }) => {
        const ang = (i / N) * Math.PI * 2;
        const r = R + Math.sin(t * s + a) * 28;
        return [cx + Math.cos(ang) * r, cy + Math.sin(ang) * r];
      });
      // Closed Catmull-Rom → cubic Bézier
      let d = `M${pts[0][0]},${pts[0][1]}`;
      for (let i = 0; i < N; i++) {
        const p0 = pts[(i - 1 + N) % N], p1 = pts[i], p2 = pts[(i + 1) % N], p3 = pts[(i + 2) % N];
        const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
        const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
        d += `C${c1[0]},${c1[1]} ${c2[0]},${c2[1]} ${p2[0]},${p2[1]}`;
      }
      blobPath.setAttribute("d", d + "Z");
    };
    draw(0);
    if (!reduced) gsap.ticker.add((time) => draw(time));
  }

  /* ---------- Preloader ---------- */
  const loader = $("#loader");
  const eagerImgs = $$("img").filter((i) => i.loading !== "lazy");
  let loaded = 0;
  const progress = { v: 0 };
  const setP = () => {
    $("#loaderCount").textContent = Math.round(progress.v);
    $("#loaderBar").style.width = progress.v + "%";
  };
  const bump = () => {
    loaded++;
    gsap.to(progress, { v: (loaded / (eagerImgs.length + 1)) * 100, duration: 0.5, onUpdate: setP });
  };
  const waits = eagerImgs.map((img) => (img.complete ? Promise.resolve() : new Promise((r) => { img.onload = img.onerror = r; })).then(bump));
  waits.push((document.fonts?.ready ?? Promise.resolve()).then(bump));
  const minTime = new Promise((r) => setTimeout(r, reduced ? 0 : 1400));
  const maxTime = new Promise((r) => setTimeout(r, 5000));

  gsap.from(".loader__logo", { scale: 0.4, rotate: -12, opacity: 0, duration: 1, ease: "back.out(2)" });

  Promise.race([Promise.all([...waits, minTime]), maxTime]).then(() => {
    gsap.to(progress, { v: 100, duration: 0.3, onUpdate: setP });
    const tl = gsap.timeline({
      delay: 0.35,
      onComplete: () => {
        loader.remove();
        document.body.classList.remove("is-loading");
        lenis?.start();
        ScrollTrigger.refresh();
      },
    });
    tl.to(".loader__inner", { scale: 0.85, opacity: 0, duration: 0.5, ease: "power2.in" })
      .to(".loader__curtain", { yPercent: -100, duration: 0.8, ease: "expo.inOut" }, "-=0.1")
      .to(loader, { clipPath: "inset(0 0 100% 0)", duration: 0.9, ease: "expo.inOut" }, "-=0.45")
      .add(heroIntro(), "-=0.55");
  });

  /* ---------- Hero intro ---------- */
  function heroIntro() {
    const tl = gsap.timeline();
    tl.from(".hero__blob", { scale: 0.3, opacity: 0, duration: 1.4, ease: "expo.out" })
      .from(".hero__title .word", { yPercent: 115, rotate: 6, duration: 1.1, stagger: 0.08, ease: "expo.out" }, 0.1)
      .from(".hero__eyebrow", { y: 20, opacity: 0, duration: 0.8, ease: "power3.out" }, 0.2)
      .from(".hero__swash path", { strokeDasharray: 320, strokeDashoffset: 320, duration: 1, ease: "power2.inOut" }, 0.7)
      .from([".hero__lead", ".hero__actions"], { y: 30, opacity: 0, duration: 0.9, stagger: 0.1, ease: "power3.out" }, 0.55)
      .from(".pack", { y: 140, opacity: 0, rotate: (i) => [-20, 18, -14][i], scale: 0.8, duration: 1.3, stagger: 0.12, ease: "back.out(1.4)" }, 0.3)
      .from([".hero__ring", ".hero__sticker"], { scale: 0, rotate: -90, duration: 1, stagger: 0.1, ease: "back.out(2)" }, 0.9)
      .from(".fx", { scale: 0, opacity: 0, duration: 0.9, stagger: 0.05, ease: "back.out(2.4)" }, 0.6)
      .from(".hero__scroll", { opacity: 0, y: 10, duration: 0.6 }, 1.2);
    return tl;
  }

  // Idle float for food graphics
  if (!reduced) {
    $$(".fx, .cfx, .story__fx, .spotlight__grain, .spotlight__wheat").forEach((el, i) => {
      gsap.to(el, {
        y: gsap.utils.random(-22, 22),
        x: gsap.utils.random(-10, 10),
        rotation: `+=${gsap.utils.random(-25, 25)}`,
        duration: gsap.utils.random(2.6, 4.2),
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
        delay: i * 0.15,
      });
    });
  }

  // Mouse parallax in hero
  const hero = $("#hero");
  if (finePointer && !reduced) {
    const layers = $$("[data-depth]", hero).map((el) => ({
      d: parseFloat(el.dataset.depth),
      x: gsap.quickTo(el, "x", { duration: 1, ease: "power3" }),
      y: gsap.quickTo(el, "y", { duration: 1, ease: "power3" }),
    }));
    hero.addEventListener("mousemove", (e) => {
      const nx = e.clientX / innerWidth - 0.5;
      const ny = e.clientY / innerHeight - 0.5;
      layers.forEach((l) => { l.x(nx * 30 * l.d); l.y(ny * 30 * l.d); });
    });
  }

  // Hero exits on scroll
  if (!reduced) {
    gsap.to(".hero__stage", { yPercent: 18, ease: "none", scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: true } });
    gsap.to(".hero__content", { yPercent: -10, opacity: 0.2, ease: "none", scrollTrigger: { trigger: hero, start: "40% top", end: "bottom top", scrub: true } });
  }

  /* ---------- Marquee (reacts to scroll velocity) ---------- */
  const marquees = $$(".marquee__track").map((track, idx) => {
    const group = $(".marquee__group", track);
    for (let i = 0; i < 3; i++) track.appendChild(group.cloneNode(true));
    const dir = idx % 2 ? 1 : -1;
    const tween = gsap.fromTo(track, { xPercent: dir < 0 ? 0 : -25 }, { xPercent: dir < 0 ? -25 : 0, duration: idx ? 40 : 28, ease: "none", repeat: -1 });
    if (reduced) tween.pause();
    return tween;
  });
  if (!reduced) {
    // Scrolling speeds the marquee up; scrolling back up reverses it
    const speed = { v: 1 };
    const apply = () => marquees.forEach((m) => m.timeScale(speed.v));
    ScrollTrigger.create({
      onUpdate: (self) => {
        const dir = self.direction;
        const boost = 1 + Math.min(Math.abs(self.getVelocity()) / 300, 5);
        gsap.timeline({ overwrite: true })
          .to(speed, { v: dir * boost, duration: 0.25, onUpdate: apply })
          .to(speed, { v: dir, duration: 1.2, ease: "power2.out", onUpdate: apply });
      },
    });
  }

  /* ---------- Story: word-by-word reveal ---------- */
  $$(".reveal-words").forEach((el) => {
    // Wrap each word; inline elements like <em> stay whole as one unit
    const parts = [...el.childNodes].flatMap((n) =>
      n.nodeType === 3 ? n.textContent.split(/\s+/).filter(Boolean).map((w) => `<span class="w">${w}</span>`) : [`<span class="w">${n.outerHTML}</span>`]
    );
    el.innerHTML = parts.join(" ");
    if (reduced) return;
    gsap.fromTo($$(".w", el), { opacity: 0.16, y: 14 }, {
      opacity: 1,
      y: 0,
      stagger: 0.1,
      ease: "none",
      scrollTrigger: { trigger: el, start: "top 80%", end: "bottom 45%", scrub: true },
    });
  });

  /* ---------- Generic reveals ---------- */
  // .no-tr suspends CSS hover transitions so they don't fight the tween
  const fadeUp = (targets, trigger, opts = {}) =>
    gsap.from(targets, {
      y: 50, opacity: 0, duration: 1, stagger: 0.1, ease: "power3.out", ...opts,
      onStart() { this.targets().forEach((t) => t.classList.add("no-tr")); },
      onComplete() { this.targets().forEach((t) => { t.classList.remove("no-tr"); gsap.set(t, { clearProps: "transform" }); }); },
      scrollTrigger: { trigger: trigger || targets, start: "top 85%" },
    });

  if (!reduced) {
    $$(".eyebrow:not(.hero__eyebrow)").forEach((e) => fadeUp(e, e, { y: 20 }));
    fadeUp(".stat", ".story__stats", { y: 60, rotate: 3 });
    gsap.fromTo(".story__card--img", { clipPath: "inset(18% 10% 18% 10% round 28px)" }, { clipPath: "inset(0% 0% 0% 0% round 28px)", ease: "none", scrollTrigger: { trigger: ".story__card--img", start: "top 95%", end: "top 40%", scrub: true } });
    gsap.to(".story__card--img img", { yPercent: 8, ease: "none", scrollTrigger: { trigger: ".story__card--img", start: "top bottom", end: "bottom top", scrub: true } });

    fadeUp(".products__title", ".products__head");
    fadeUp(".spotlight__copy > *", ".spotlight__copy", { stagger: 0.08 });
    fadeUp(".qcard", ".quality__grid", { y: 80, stagger: 0.12 });
    fadeUp(".gallery__title", ".gallery__title");
    fadeUp([".contact__title", ".contact__lead", ".contact__mail"], ".contact__inner");
    fadeUp(".contact__cols > div", ".contact__cols");
  }

  /* ---------- Counters ---------- */
  $$(".count").forEach((el) => {
    const to = parseFloat(el.dataset.to);
    const dec = parseInt(el.dataset.dec || "0", 10);
    const obj = { v: 0 };
    const render = () => (el.textContent = obj.v.toFixed(dec));
    if (reduced) { obj.v = to; return render(); }
    ScrollTrigger.create({
      trigger: el,
      start: "top 90%",
      once: true,
      onEnter: () => gsap.to(obj, { v: to, duration: 1.8, ease: "power2.out", onUpdate: render }),
    });
  });

  /* ---------- Products: pinned horizontal scroll ---------- */
  const mm = gsap.matchMedia();
  mm.add("(min-width: 761px)", () => {
    const track = $("#productsTrack");
    const dist = () => track.scrollWidth - innerWidth;
    const tween = gsap.to(track, {
      x: () => -dist(),
      ease: "none",
      scrollTrigger: {
        trigger: "#products",
        // Pin with the heading in view; on short screens align the bottom instead
        start: () => ($("#products").offsetHeight > innerHeight ? "bottom bottom" : "top top"),
        end: () => "+=" + dist(),
        pin: "#products",
        pinSpacing: true,
        scrub: 0.8,
        invalidateOnRefresh: true,
        onUpdate: (s) => gsap.set("#productsProgress", { scaleX: s.progress }),
      },
    });
    // Cards tilt into place as they travel
    if (!reduced) {
      $$(".pcard", track).forEach((card) => {
        gsap.from(card, {
          rotate: 6, y: 60, scale: 0.92,
          ease: "none",
          scrollTrigger: { trigger: card, containerAnimation: tween, start: "left 100%", end: "left 55%", scrub: true },
        });
        const img = $(".pcard__media img", card);
        if (img) gsap.fromTo(img, { xPercent: -6 }, { xPercent: 6, ease: "none", scrollTrigger: { trigger: card, containerAnimation: tween, start: "left right", end: "right left", scrub: true } });
      });
    }
    return () => gsap.set(track, { clearProps: "transform" });
  });
  mm.add("(max-width: 760px)", () => {
    if (reduced) return;
    $$(".pcard").forEach((card) => fadeUp(card, card, { y: 70 }));
  });

  /* ---------- Spotlight ---------- */
  if (!reduced) {
    const st = { trigger: ".spotlight", start: "top bottom", end: "bottom top", scrub: true };
    gsap.fromTo(".spotlight__pack", { rotate: -16, yPercent: 14, scale: 0.9 }, { rotate: 4, yPercent: -8, scale: 1.04, ease: "none", scrollTrigger: st });
    gsap.fromTo(".spotlight__disc", { scale: 0.75 }, { scale: 1.05, ease: "none", scrollTrigger: { ...st, end: "center center" } });
    gsap.utils.toArray(".spotlight__grain").forEach((g, i) => gsap.to(g, { yPercent: (i % 2 ? -1 : 1) * 160, ease: "none", scrollTrigger: st }));

    gsap.to(".hl", { "--hl": 1, duration: 1, ease: "expo.out", scrollTrigger: { trigger: ".quality__head h2", start: "top 75%" } });
  } else {
    gsap.set(".hl", { "--hl": 1 });
  }

  /* ---------- Gallery ---------- */
  $$(".gimg").forEach((fig) => {
    const inner = $(".gimg__inner", fig);
    const img = $("img", fig);
    if (reduced) return;
    gsap.fromTo(inner, { clipPath: "inset(100% 0% 0% 0% round 28px)" }, { clipPath: "inset(0% 0% 0% 0% round 28px)", duration: 1.4, ease: "expo.inOut", scrollTrigger: { trigger: fig, start: "top 85%" } });
    gsap.fromTo(img, { scale: 1.3 }, { scale: 1, duration: 1.8, ease: "expo.out", scrollTrigger: { trigger: fig, start: "top 85%" } });
    gsap.fromTo(img, { yPercent: -6 }, { yPercent: 6, ease: "none", scrollTrigger: { trigger: fig, start: "top bottom", end: "bottom top", scrub: true } });
  });

  /* ---------- Contact & footer ---------- */
  if (!reduced) {
    $$(".cfx").forEach((el, i) => gsap.fromTo(el, { yPercent: 60 + i * 30 }, { yPercent: -40 - i * 20, ease: "none", scrollTrigger: { trigger: ".contact", start: "top bottom", end: "bottom top", scrub: true } }));
    const big = $(".footer__big");
    big.innerHTML = [...big.textContent].map((c) => `<span style="display:inline-block">${c}</span>`).join("");
    gsap.from($$("span", big), { yPercent: 100, rotate: 8, stagger: 0.06, duration: 1.2, ease: "expo.out", scrollTrigger: { trigger: big, start: "top 95%" } });
  }

  /* ---------- Cursor & magnetic buttons ---------- */
  if (finePointer && !reduced) {
    const cursor = $("#cursor");
    const label = $(".cursor__label", cursor);
    const cx = gsap.quickTo(cursor, "x", { duration: 0.35, ease: "power3" });
    const cy = gsap.quickTo(cursor, "y", { duration: 0.35, ease: "power3" });
    addEventListener("mousemove", (e) => { cx(e.clientX); cy(e.clientY); });

    $$("[data-cursor]").forEach((el) => {
      el.addEventListener("mouseenter", () => { label.textContent = el.dataset.cursor; cursor.classList.add("is-big"); });
      el.addEventListener("mouseleave", () => cursor.classList.remove("is-big"));
    });
    $$("a, button").forEach((el) => {
      el.addEventListener("mouseenter", () => cursor.classList.add("is-link"));
      el.addEventListener("mouseleave", () => cursor.classList.remove("is-link"));
    });

    $$(".magnetic").forEach((el) => {
      const mx = gsap.quickTo(el, "x", { duration: 0.6, ease: "elastic.out(1, .4)" });
      const my = gsap.quickTo(el, "y", { duration: 0.6, ease: "elastic.out(1, .4)" });
      el.addEventListener("mousemove", (e) => {
        const r = el.getBoundingClientRect();
        mx((e.clientX - r.left - r.width / 2) * 0.3);
        my((e.clientY - r.top - r.height / 2) * 0.4);
      });
      el.addEventListener("mouseleave", () => { mx(0); my(0); });
    });
  } else {
    $("#cursor")?.remove();
  }

  addEventListener("load", () => ScrollTrigger.refresh());
})();
