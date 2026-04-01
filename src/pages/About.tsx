import React, { useEffect, useRef, useState, useCallback } from "react";
import { Link } from "react-router-dom";

/* ── HOOKS ── */
function useCountUp(target: number, duration = 2000, triggered = false, decimals = 0) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!triggered) return;
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(parseFloat(start.toFixed(decimals)));
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration, triggered, decimals]);
  return decimals > 0 ? count.toFixed(decimals) : Math.floor(count);
}

function useInView(threshold = 0.25) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setInView(true); obs.disconnect(); } },
      { threshold }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, inView };
}

function useScrollReveal() {
  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>(".about-reveal");
    const obs = new IntersectionObserver(
      (entries) => entries.forEach(e => {
        if (e.isIntersecting) (e.target as HTMLElement).classList.add("visible");
      }),
      { threshold: 0.12 }
    );
    els.forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);
}

/* ── ANIMATED STAT ── */
interface StatProps { value: number; suffix?: string; label: string; triggered: boolean; decimals?: number; }
function AnimatedStat({ value, suffix = "", label, triggered, decimals = 0 }: StatProps) {
  const count = useCountUp(value, 2000, triggered, decimals);
  return (
    <div className="about-stat">
      <span className="about-stat-number">{count}{suffix}</span>
      <span className="about-stat-label">{label}</span>
    </div>
  );
}

/* ── MAGNETIC CARD ── */
function MagneticCard({ children, className = "", style }: {
  children: React.ReactNode; className?: string; style?: React.CSSProperties;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const handleMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current; if (!el) return;
    const r = el.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width - 0.5) * 16;
    const y = ((e.clientY - r.top) / r.height - 0.5) * 16;
    el.style.transform = `perspective(900px) rotateY(${x}deg) rotateX(${-y}deg) scale(1.03)`;
  }, []);
  const handleLeave = useCallback(() => {
    if (ref.current) ref.current.style.transform = "";
  }, []);
  return (
    <div ref={ref} className={"about-magnetic " + className} style={style}
      onMouseMove={handleMove} onMouseLeave={handleLeave}>{children}</div>
  );
}

/* ── PAGE ── */
const About = () => {
  useScrollReveal();
  const statsView = useInView(0.3);
  const bottleRef = useRef<HTMLDivElement>(null);

  // Parallax
  useEffect(() => {
    const onScroll = () => {
      if (bottleRef.current)
        bottleRef.current.style.transform = `translateY(${window.scrollY * 0.18}px)`;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Smooth cursor
  useEffect(() => {
    const cursor = document.getElementById("essence-cursor");
    if (!cursor) return;
    let raf = 0, tx = 0, ty = 0, cx = 0, cy = 0;
    const onMove = (e: MouseEvent) => { tx = e.clientX; ty = e.clientY; };
    const animate = () => {
      cx += (tx - cx) * 0.12; cy += (ty - cy) * 0.12;
      cursor.style.left = cx + "px"; cursor.style.top = cy + "px";
      raf = requestAnimationFrame(animate);
    };
    window.addEventListener("mousemove", onMove);
    raf = requestAnimationFrame(animate);
    return () => { window.removeEventListener("mousemove", onMove); cancelAnimationFrame(raf); };
  }, []);

  const brands = [
    { name: "Forest Essentials", tagline: "India's finest botanical luxury", desc: "Rooted in Ayurvedic wisdom, Forest Essentials brings India's botanical heritage into modern luxury — sandalwood, jasmine, and ancient ritual distilled into glass." },
    { name: "Ajmal", tagline: "Seven decades of oud mastery", desc: "From Dubai's fragrance heart, Ajmal has perfected the art of oud for over seventy years. Every bottle is architecture — layered, profound, and unforgettable." },
    { name: "Chanel", tagline: "The timeless benchmark", desc: "Chanel's fragrances are not worn — they're inhabited. Iconic without effort, timeless without trying. The gold standard every perfume is secretly measured against." },
    { name: "Tom Ford", tagline: "Bold. Sensual. Unapologetic.", desc: "Tom Ford fragrances don't ask for permission. Dark, rich, and intensely confident — wearing one is not a choice, it's a statement." },
    { name: "Jo Malone", tagline: "The art of layering", desc: "London-born and effortlessly layerable, Jo Malone taught a generation that simplicity is its own kind of luxury. One note. Infinite depth." },
  ];

  const values = [
    { title: "Authenticity", icon: "◈", body: "Every fragrance we carry is genuine — sourced directly, never discounted into doubt. We do not chase trends. We chase truth in a bottle." },
    { title: "Accessibility", icon: "◇", body: "Luxury should not be a closed door. We curate premium fragrances at honest prices, with knowledge and care that turns a purchase into a discovery." },
    { title: "Craft", icon: "◉", body: "Perfumery is an art form. Every scent we select carries a story of ingredients chosen over years, formulas refined over decades, a perfumer's soul poured into glass." },
  ];

  const scentFamilies = [
    { name: "Floral",    emoji: "🌸", feel: "Soft, romantic, alive",       when: "When you want to feel like springtime",    color: "#f9d8df" },
    { name: "Woody",     emoji: "🪵", feel: "Grounded, warm, confident",   when: "When you want a room to remember you",     color: "#dfc9b0" },
    { name: "Oriental",  emoji: "✦",  feel: "Deep, spiced, mysterious",    when: "When you want to feel like a secret",      color: "#e8d0a0" },
    { name: "Fresh",     emoji: "🌿", feel: "Clean, airy, free",           when: "When you want to breathe easier",          color: "#c8dcc4" },
    { name: "Gourmand",  emoji: "◎",  feel: "Warm, indulgent, comforting", when: "When you want to feel held",               color: "#eeddb8" },
  ];

  return (
    <>
      {/* Smooth trailing cursor */}
      <div id="essence-cursor" aria-hidden="true" style={{
        position: "fixed", pointerEvents: "none", zIndex: 9999,
        width: 9, height: 9, borderRadius: "50%",
        background: "hsl(var(--peach))", opacity: 0.65,
        transform: "translate(-50%,-50%)",
      }} />

      <style>{ABOUT_CSS}</style>

      <main className="about-wrap">

        {/* ── HERO ── */}
        <section className="about-hero">
          <div className="about-hero-grain" aria-hidden="true" />

          <div className="about-hero-content">
            <p className="about-eyebrow about-fade-up" style={{ animationDelay: "0.1s" }}>
              Our Story
            </p>
            <h1 className="about-hero-h1 about-fade-up" style={{ animationDelay: "0.28s" }}>
              Where Every<br /><em>Scent Tells</em><br />a Story
            </h1>
            <p className="about-hero-sub about-fade-up" style={{ animationDelay: "0.48s" }}>
              Essence: Distilling Indian heritage with global artistry.<br />
              Discover the vision behind every drop.
            </p>
            <div className="about-hero-ctas about-fade-up" style={{ animationDelay: "0.66s" }}>
              <Link to="/shop" className="about-btn-solid">Explore the Collection →</Link>
              <Link to="/shop?is_new_arrival=true" className="about-btn-ghost">New Arrivals</Link>
            </div>
          </div>

          <div className="about-hero-right about-fade-in" style={{ animationDelay: "0.3s" }}>
            <div className="about-hero-bottle-wrap" ref={bottleRef}>
              <img
                src="/src/assets/about-us-hero-perfume2.png"
                alt="Essence signature perfume bottle"
                className="about-hero-bottle-img"
              />
              <div className="about-hero-glow" aria-hidden="true" />
            </div>
          </div>

          <div className="about-scroll-hint" aria-hidden="true">
            <div className="about-scroll-line" />
            <span>Scroll</span>
          </div>
        </section>

        {/* ── STATS ── */}
        <div className="about-stats" ref={statsView.ref}>
          <AnimatedStat value={150} suffix="+" label="Fragrances Curated" triggered={statsView.inView} />
          <div className="about-stats-sep" aria-hidden="true" />
          <AnimatedStat value={5} label="Premium Brand Partners" triggered={statsView.inView} />
          <div className="about-stats-sep" aria-hidden="true" />
          <AnimatedStat value={4.8} suffix="★" label="Average Rating" triggered={statsView.inView} decimals={1} />
          <div className="about-stats-sep" aria-hidden="true" />
          <AnimatedStat value={10000} suffix="+" label="Bottles Delivered" triggered={statsView.inView} />
        </div>

        {/* ── STORY ── */}
        <section className="about-section">
          <div className="about-story">
            <div className="about-story-left about-reveal">
              <div className="about-story-img-wrap">
                <img
                  src="/src/assets/perfume-collection.jpg"
                  alt="Perfume collection surrounded by rose petals and sandalwood"
                  loading="lazy"
                  className="about-story-img"
                />
              </div>
              <div className="about-story-badge">
                <span className="about-story-badge-yr">2024</span>
                <span className="about-story-badge-sub">Est. India</span>
              </div>
            </div>

            <div className="about-story-right about-reveal" style={{ "--d": "0.18s" } as React.CSSProperties}>
              <p className="about-eyebrow">Where It All Began</p>
              <h2 className="about-h2">A single bottle changed everything.</h2>
              <div className="about-prose">
                <p>
                  It started with a single bottle of Ajmal Oud — gifted, unwrapped on an unremarkable
                  Tuesday, and utterly unforgettable. That moment sparked a question:{" "}
                  <em>why does India, a land with one of the richest perfumery traditions on earth,
                  have no single destination that honours both its heritage and the global art of fragrance?</em>
                </p>
                <p>
                  Essence was our answer. We set out to build a space where Forest Essentials sits
                  beside Chanel, where Ajmal's centuries-old oud craftsmanship is held in the same
                  breath as Tom Ford's Black Orchid — not as contradiction, but as conversation.
                  Because great perfume has no borders, only depth.
                </p>
                <p>
                  We spent months curating — through old Delhi's perfume bazaars, through Kannauj
                  (India's fragrance capital), through international houses. Each bottle was held,
                  considered, and chosen with the same care a sommelier gives to wine.
                  If it did not move us, it did not make the cut.
                </p>
              </div>
              <blockquote className="about-blockquote">
                "If it did not move us, it did not make the cut."
              </blockquote>
            </div>
          </div>
        </section>

        {/* ── VALUES ── */}
        <section className="about-section about-section--tinted">
          <div
            className="about-reveal"
            style={{ textAlign: "center", padding: "100px 2rem 0", maxWidth: 1200, margin: "0 auto" } as React.CSSProperties}
          >
            <p className="about-eyebrow">What We Stand For</p>
            <h2 className="about-h2 about-h2--center">
              Three principles.<br />One uncompromising standard.
            </h2>
          </div>
          <div className="about-values-grid">
            {values.map((v, i) => (
              <MagneticCard
                key={v.title}
                className="about-value-card about-reveal"
                style={{ "--d": `${i * 0.14}s` } as React.CSSProperties}
              >
                <span className="about-value-icon" aria-hidden="true">{v.icon}</span>
                <h3 className="about-value-h3">{v.title}</h3>
                <p className="about-value-p">{v.body}</p>
              </MagneticCard>
            ))}
          </div>
        </section>

        {/* ── BRAND PARTNERS ── */}
        <section className="about-section">
          <div className="about-brands-hd about-reveal" style={{ textAlign: "center" } as React.CSSProperties}>
            <p className="about-eyebrow">Our Curated Partners</p>
            <h2 className="about-h2 about-h2--center">
              We do not carry every brand.<br />
              We carry the ones we would give to someone we love.
            </h2>
          </div>

          {/* Auto ticker */}
          <div className="about-ticker-outer about-reveal">
            <div className="about-ticker-inner">
              {[...brands, ...brands, ...brands].map((b, i) => (
                <span key={i} className="about-ticker-item">{b.name}</span>
              ))}
            </div>
          </div>

          <div className="about-brands-grid">
            {brands.map((b, i) => (
              <div
                key={b.name}
                className="about-brand-card about-reveal"
                style={{ "--d": `${i * 0.1}s` } as React.CSSProperties}
              >
                <p className="about-brand-name">{b.name}</p>
                <p className="about-brand-tag">{b.tagline}</p>
                <p className="about-brand-desc">{b.desc}</p>
                <div className="about-brand-underline" aria-hidden="true" />
              </div>
            ))}
          </div>
        </section>

        {/* ── SCENT FAMILIES ── */}
        <section className="about-section about-section--tinted">
          <div
            className="about-reveal"
            style={{ textAlign: "center", padding: "100px 2rem 0", maxWidth: 1200, margin: "0 auto" } as React.CSSProperties}
          >
            <p className="about-eyebrow">Find Your Profile</p>
            <h2 className="about-h2 about-h2--center">
              Your scent is an extension of who you are.
            </h2>
          </div>
          <div className="about-scents-grid">
            {scentFamilies.map((s, i) => (
              <Link
                to="/shop"
                key={s.name}
                className="about-scent-card about-reveal"
                style={{ "--d": `${i * 0.1}s`, "--sc": s.color } as React.CSSProperties}
              >
                <span className="about-scent-icon">{s.emoji}</span>
                <h3 className="about-scent-name">{s.name}</h3>
                <p className="about-scent-feel">{s.feel}</p>
                <p className="about-scent-when">{s.when}</p>
              </Link>
            ))}
          </div>
        </section>

        {/* ── PROMISE ── */}
        <section className="about-promise about-reveal">
          <div className="about-promise-inner">
            <p className="about-eyebrow" style={{ opacity: 0.6 }}>Our Promise</p>
            <h2 className="about-promise-h2">
              High quality is the only core value for us.
            </h2>
            <p className="about-promise-p">
              Every fragrance in our collection is handpicked from the finest perfumeries across
              India and around the world. We believe luxury should be accessible, authentic, and
              unforgettable — not a performance, but a presence.
            </p>
            <p className="about-promise-p">
              When you find your scent with Essence, you do not just buy a fragrance.
              You find a piece of yourself you did not know was missing.
            </p>
            <em className="about-promise-quote">
              "The right fragrance changes everything. We are here to help you find it."
            </em>
            <div className="about-promise-bottles" aria-hidden="true">
              <img src="/src/assets/perfume-floral.png"  alt="" loading="lazy" className="about-pb about-pb--1" />
              <img src="/src/assets/perfume-fresh.png"   alt="" loading="lazy" className="about-pb about-pb--2" />
              <img src="/src/assets/perfume-woody.png"   alt="" loading="lazy" className="about-pb about-pb--3" />
            </div>
          </div>
        </section>

        {/* ── FINAL CTA ── */}
        <section className="about-section about-cta-section about-reveal">
          <p className="about-eyebrow">Begin Here</p>
          <h2 className="about-h2 about-h2--center">Your scent is waiting.</h2>
          <p className="about-cta-sub">
            150+ fragrances. 5 world-class brands. One place that takes your nose seriously.
          </p>
          <div className="about-cta-row">
            <Link to="/shop" className="about-btn-solid">Explore the Collection →</Link>
            <Link to="/shop?is_new_arrival=true" className="about-btn-ghost">Shop New Arrivals</Link>
          </div>
        </section>

      </main>
    </>
  );
};

/* ── ALL STYLES (injected via <style> tag) ── */
const ABOUT_CSS = `
.about-reveal{opacity:0;transform:translateY(30px);transition:opacity .85s cubic-bezier(.16,1,.3,1) var(--d,0s),transform .85s cubic-bezier(.16,1,.3,1) var(--d,0s)}
.about-reveal.visible{opacity:1;transform:translateY(0)}
@keyframes aFadeUp{from{opacity:0;transform:translateY(26px)}to{opacity:1;transform:none}}
@keyframes aFadeIn{from{opacity:0}to{opacity:1}}
.about-fade-up{opacity:0;animation:aFadeUp .8s cubic-bezier(.16,1,.3,1) forwards}
.about-fade-in{opacity:0;animation:aFadeIn 1s cubic-bezier(.16,1,.3,1) forwards}
.about-wrap{overflow-x:hidden}
.about-section{max-width:1200px;margin:0 auto;padding:100px 2rem}
.about-section--tinted{max-width:100%;background:hsl(var(--card)/.5);border-top:1px solid hsl(var(--border));border-bottom:1px solid hsl(var(--border))}
.about-eyebrow{font-family:'Poppins',sans-serif;font-size:.68rem;font-weight:600;letter-spacing:.22em;text-transform:uppercase;color:hsl(var(--muted-foreground));margin-bottom:.7rem;display:block}
.about-h2{font-family:'Playfair Display',serif;font-size:clamp(1.9rem,3.5vw,2.9rem);font-weight:500;line-height:1.2;color:hsl(var(--foreground));margin-bottom:1.5rem}
.about-h2--center{text-align:center}
.about-hero{position:relative;display:grid;grid-template-columns:1fr 1fr;align-items:center;max-width:1200px;margin:0 auto;padding:6rem 2rem 5rem;gap:3rem;min-height:88vh}
.about-hero-grain{position:absolute;inset:0;pointer-events:none;z-index:0;opacity:.4;background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.05'/%3E%3C/svg%3E");background-size:180px}
.about-hero-content{position:relative;z-index:1}
.about-hero-h1{font-family:'Playfair Display',serif;font-size:clamp(2.8rem,5.5vw,5rem);font-weight:600;line-height:1.08;color:hsl(var(--foreground));margin-bottom:1.4rem}
.about-hero-h1 em{font-style:italic;color:hsl(var(--peach)/.8)}
.about-hero-sub{font-family:'Poppins',sans-serif;font-size:.92rem;color:hsl(var(--muted-foreground));line-height:1.75;max-width:38ch;margin-bottom:2.5rem}
.about-hero-ctas{display:flex;gap:1rem;align-items:center;flex-wrap:wrap}
.about-btn-solid{display:inline-block;padding:.72rem 1.75rem;border-radius:9999px;font-family:'Poppins',sans-serif;font-size:.84rem;font-weight:500;text-decoration:none;background:hsl(var(--peach));color:hsl(var(--foreground));transition:opacity .2s,transform .2s,box-shadow .2s}
.about-btn-solid:hover{opacity:.85;transform:translateY(-2px);box-shadow:0 8px 22px hsl(var(--peach)/.3)}
.about-btn-ghost{font-family:'Poppins',sans-serif;font-size:.82rem;font-weight:500;color:hsl(var(--muted-foreground));text-decoration:none;border-bottom:1px solid hsl(var(--border));padding-bottom:2px;transition:color .2s}
.about-btn-ghost:hover{color:hsl(var(--foreground))}
.about-hero-right{display:flex;justify-content:center;align-items:center;position:relative;z-index:1}
.about-hero-bottle-wrap{position:relative;will-change:transform}
.about-hero-bottle-img{width:clamp(200px,26vw,360px);height:auto;filter:drop-shadow(0 24px 50px hsl(var(--peach)/.22))}
.about-hero-glow{position:absolute;bottom:-16px;left:50%;transform:translateX(-50%);width:55%;height:36px;background:hsl(var(--peach)/.16);filter:blur(18px);border-radius:50%}
.about-scroll-hint{position:absolute;bottom:2.5rem;left:2rem;display:flex;align-items:center;gap:.55rem;font-family:'Poppins',sans-serif;font-size:.62rem;letter-spacing:.2em;text-transform:uppercase;color:hsl(var(--muted-foreground));opacity:.5}
@keyframes scrollPulse{0%,100%{height:14px;opacity:.4}50%{height:26px;opacity:1}}
.about-scroll-line{width:1px;background:hsl(var(--muted-foreground));animation:scrollPulse 2.2s ease-in-out infinite}
.about-stats{background:hsl(var(--card));border-top:1px solid hsl(var(--border));border-bottom:1px solid hsl(var(--border));display:flex;align-items:center;justify-content:center;flex-wrap:wrap;padding:3rem 2rem}
.about-stat{display:flex;flex-direction:column;align-items:center;gap:.28rem;padding:.5rem 2.8rem;flex:1;min-width:130px}
.about-stat-number{font-family:'Playfair Display',serif;font-size:clamp(2rem,3.2vw,2.7rem);font-weight:600;color:hsl(var(--foreground));line-height:1}
.about-stat-label{font-family:'Poppins',sans-serif;font-size:.68rem;font-weight:500;letter-spacing:.1em;text-transform:uppercase;color:hsl(var(--muted-foreground));text-align:center}
.about-stats-sep{width:1px;height:44px;background:hsl(var(--border));flex-shrink:0}
.about-story{display:grid;grid-template-columns:1fr 1fr;gap:5rem;align-items:center}
.about-story-left{position:relative}
.about-story-img-wrap{border-radius:1.5rem;overflow:hidden;aspect-ratio:4/5;background:hsl(var(--muted))}
.about-story-img{width:100%;height:100%;object-fit:cover;transition:transform .6s ease}
.about-story-img-wrap:hover .about-story-img{transform:scale(1.04)}
.about-story-badge{position:absolute;bottom:-1.4rem;right:-1.4rem;background:hsl(var(--background)/.85);border:1px solid hsl(var(--border));border-radius:1rem;padding:1rem 1.5rem;text-align:center;backdrop-filter:blur(10px);box-shadow:0 8px 24px hsl(var(--foreground)/.06)}
.about-story-badge-yr{display:block;font-family:'Playfair Display',serif;font-size:1.4rem;font-weight:600;color:hsl(var(--foreground))}
.about-story-badge-sub{font-family:'Poppins',sans-serif;font-size:.62rem;letter-spacing:.16em;text-transform:uppercase;color:hsl(var(--muted-foreground))}
.about-prose p{font-family:'Poppins',sans-serif;font-size:.9rem;line-height:1.85;color:hsl(var(--muted-foreground));margin-bottom:1rem;max-width:54ch}
.about-prose em{color:hsl(var(--foreground));font-style:italic}
.about-blockquote{display:block;font-family:'Playfair Display',serif;font-size:1rem;font-style:italic;color:hsl(var(--foreground));border-left:2px solid hsl(var(--peach)/.55);padding-left:1.1rem;margin-top:1.4rem;opacity:.7}
.about-values-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:1.25rem;max-width:1200px;margin:0 auto;padding:2rem 2rem 100px}
.about-magnetic{transition:transform .12s ease,box-shadow .12s ease;transform-style:preserve-3d;will-change:transform}
.about-value-card{background:hsl(var(--background));border:1px solid hsl(var(--border));border-radius:1.25rem;padding:2.5rem 2rem;cursor:default}
.about-value-icon{font-size:1.3rem;margin-bottom:1.1rem;display:block;color:hsl(var(--peach)/.8)}
.about-value-h3{font-family:'Playfair Display',serif;font-size:1.25rem;font-weight:500;margin-bottom:.65rem;color:hsl(var(--foreground))}
.about-value-p{font-family:'Poppins',sans-serif;font-size:.86rem;line-height:1.75;color:hsl(var(--muted-foreground));max-width:38ch}
.about-brands-hd{text-align:center;margin-bottom:2.5rem}
.about-ticker-outer{overflow:hidden;border-top:1px solid hsl(var(--border));border-bottom:1px solid hsl(var(--border));padding:.9rem 0;margin-bottom:3rem}
.about-ticker-outer:hover .about-ticker-inner{animation-play-state:paused}
@keyframes ticker{from{transform:translateX(0)}to{transform:translateX(-33.333%)}}
.about-ticker-inner{display:flex;width:max-content;animation:ticker 24s linear infinite}
.about-ticker-item{font-family:'Playfair Display',serif;font-size:.88rem;font-weight:500;letter-spacing:.14em;text-transform:uppercase;color:hsl(var(--muted-foreground));padding:0 3rem;white-space:nowrap;transition:color .2s}
.about-ticker-item:hover{color:hsl(var(--foreground))}
.about-brands-grid{display:grid;grid-template-columns:repeat(5,1fr);gap:1rem}
.about-brand-card{background:hsl(var(--card));border:1px solid hsl(var(--border));border-radius:1rem;padding:1.75rem 1.2rem;position:relative;overflow:hidden;transition:transform .25s ease,box-shadow .25s ease,border-color .25s ease;cursor:default}
.about-brand-card:hover{transform:translateY(-5px);box-shadow:0 14px 36px hsl(var(--foreground)/.07);border-color:hsl(var(--peach)/.4)}
.about-brand-underline{position:absolute;bottom:0;left:0;right:0;height:2px;background:linear-gradient(90deg,hsl(var(--peach)/0),hsl(var(--peach)/.55),hsl(var(--peach)/0));transform:scaleX(0);transition:transform .3s ease}
.about-brand-card:hover .about-brand-underline{transform:scaleX(1)}
.about-brand-name{font-family:'Playfair Display',serif;font-size:.95rem;font-weight:600;color:hsl(var(--foreground));margin-bottom:.28rem}
.about-brand-tag{font-family:'Poppins',sans-serif;font-size:.66rem;font-weight:600;letter-spacing:.1em;text-transform:uppercase;color:hsl(var(--peach)/.8);margin-bottom:.7rem}
.about-brand-desc{font-family:'Poppins',sans-serif;font-size:.78rem;line-height:1.65;color:hsl(var(--muted-foreground))}
.about-scents-grid{display:grid;grid-template-columns:repeat(5,1fr);gap:1rem;max-width:1200px;margin:0 auto;padding:2rem 2rem 100px}
.about-scent-card{background:hsl(var(--card));border:1px solid hsl(var(--border));border-radius:1.25rem;padding:2rem 1.2rem;text-align:center;text-decoration:none;display:block;cursor:pointer;transition:transform .25s ease,box-shadow .25s ease,background .25s ease,border-color .25s ease}
.about-scent-card:hover{transform:translateY(-6px);background:color-mix(in srgb,var(--sc,#e5ddd5) 18%,hsl(var(--card)));border-color:color-mix(in srgb,var(--sc,#e5ddd5) 60%,transparent);box-shadow:0 14px 38px hsl(0 0% 0%/.06)}
.about-scent-icon{font-size:2rem;margin-bottom:.8rem;display:block;transition:transform .3s ease}
.about-scent-card:hover .about-scent-icon{transform:scale(1.18) rotate(-4deg)}
.about-scent-name{font-family:'Playfair Display',serif;font-size:1rem;font-weight:500;color:hsl(var(--foreground));margin-bottom:.35rem}
.about-scent-feel{font-family:'Poppins',sans-serif;font-size:.66rem;font-weight:600;letter-spacing:.1em;text-transform:uppercase;color:hsl(var(--muted-foreground));margin-bottom:.45rem}
.about-scent-when{font-family:'Poppins',sans-serif;font-size:.76rem;line-height:1.5;color:hsl(var(--muted-foreground))}
.about-promise{background:linear-gradient(140deg,hsl(var(--peach)/.18) 0%,hsl(var(--fennel)/.1) 55%,hsl(var(--peony)/.08) 100%);border-top:1px solid hsl(var(--border));border-bottom:1px solid hsl(var(--border));padding:7rem 2rem}
.about-promise-inner{max-width:660px;margin:0 auto;text-align:center}
.about-promise-h2{font-family:'Playfair Display',serif;font-size:clamp(1.8rem,3.2vw,2.7rem);font-weight:500;line-height:1.2;color:hsl(var(--foreground));margin-bottom:1.8rem}
.about-promise-p{font-family:'Poppins',sans-serif;font-size:.9rem;line-height:1.85;color:hsl(var(--muted-foreground));margin-bottom:.9rem;max-width:50ch;margin-inline:auto}
.about-promise-quote{display:block;font-family:'Playfair Display',serif;font-size:1.1rem;font-style:italic;color:hsl(var(--foreground));margin-top:1.8rem;opacity:.7}
.about-promise-bottles{display:flex;justify-content:center;align-items:flex-end;gap:1rem;margin-top:3rem}
@keyframes bottleFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-9px)}}
.about-pb{height:115px;width:auto;object-fit:contain;filter:drop-shadow(0 8px 18px hsl(var(--peach)/.2))}
.about-pb--1{animation:bottleFloat 3.6s ease-in-out infinite}
.about-pb--2{animation:bottleFloat 3.6s ease-in-out .65s infinite;height:135px}
.about-pb--3{animation:bottleFloat 3.6s ease-in-out 1.2s infinite}
.about-cta-section{text-align:center}
.about-cta-sub{font-family:'Poppins',sans-serif;font-size:.9rem;color:hsl(var(--muted-foreground));margin-bottom:2.5rem;max-width:44ch;margin-inline:auto;line-height:1.7}
.about-cta-row{display:flex;justify-content:center;align-items:center;gap:1.25rem;flex-wrap:wrap}
@media(max-width:900px){
  .about-hero{grid-template-columns:1fr;text-align:center;min-height:auto;padding:4rem 1.5rem 3rem}
  .about-hero-sub{margin:0 auto 2rem}
  .about-hero-ctas{justify-content:center}
  .about-hero-right{order:-1}
  .about-hero-bottle-img{width:180px}
  .about-scroll-hint{display:none}
  .about-story{grid-template-columns:1fr;gap:3rem}
  .about-story-badge{right:.5rem}
  .about-values-grid{grid-template-columns:1fr}
  .about-brands-grid{grid-template-columns:repeat(2,1fr)}
  .about-scents-grid{grid-template-columns:repeat(2,1fr)}
  .about-stats-sep{display:none}
  .about-stat{padding:1rem}
}
@media(max-width:540px){
  .about-brands-grid{grid-template-columns:1fr}
  .about-scents-grid{grid-template-columns:1fr 1fr}
  .about-pb{height:85px}
  .about-pb--2{height:105px}
}
@media(prefers-reduced-motion:reduce){
  .about-fade-up,.about-fade-in,.about-reveal{animation:none!important;opacity:1!important;transform:none!important}
  .about-pb{animation:none!important}
  .about-ticker-inner{animation:none!important}
}
`;

export default About;