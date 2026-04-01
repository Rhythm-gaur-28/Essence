import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { brands } from "@/data/mockData";

/* ─────────────────────────────────────────────
   SCROLL REVEAL HOOK
───────────────────────────────────────────── */
function useScrollReveal() {
  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>(".br-reveal");
    const obs = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) (e.target as HTMLElement).classList.add("br-visible");
        }),
      { threshold: 0.1 }
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);
}

/* ─────────────────────────────────────────────
   BRAND DATA (extended with visual config)
───────────────────────────────────────────── */
const brandConfig = [
  {
    id: 1,
    name: "Forest Essentials",
    tagline: "India's finest botanical luxury",
    country: "India · Est. 2000",
    story:
      "Rooted in Ayurvedic wisdom passed down through centuries, Forest Essentials distills India's botanical heritage into modern luxury. Sandalwood from Mysore, jasmine from Tamil Nadu, ancient ritual — each bottle is a living archive of Indian perfumery.",
    signature: "Mysore Sandalwood Eau de Parfum",
    accentColor: "#e8dcc8",
    bottleAsset: "/src/assets/perfume-fresh.png",
    bgPattern: "forest",
  },
  {
    id: 2,
    name: "Ajmal",
    tagline: "Seven decades of oud mastery",
    country: "Dubai · Est. 1951",
    story:
      "From the fragrance heart of Dubai, Ajmal has spent over seventy years perfecting the art of oud. Every creation is architecture — layered, profound, and unforgettable. To wear Ajmal is to carry centuries of Arabic perfumery tradition on your skin.",
    signature: "Oudh Mukhallat",
    accentColor: "#d4b896",
    bottleAsset: "/src/assets/perfume-oriental.png",
    bgPattern: "ajmal",
  },
  {
    id: 3,
    name: "Chanel",
    tagline: "The timeless benchmark",
    country: "France · Est. 1910",
    story:
      "Chanel's fragrances are not worn — they are inhabited. From the revolutionary No. 5 to the modern elegance of Chance, every Chanel creation sets the standard every perfume is secretly measured against. Iconic without effort. Timeless without trying.",
    signature: "Chance Eau Tendre",
    accentColor: "#e0d8d0",
    bottleAsset: "/src/assets/perfume-floral.png",
    bgPattern: "chanel",
  },
  {
    id: 4,
    name: "Tom Ford",
    tagline: "Bold. Sensual. Unapologetic.",
    country: "USA · Est. 2006",
    story:
      "Tom Ford fragrances do not ask for permission. Dark, rich, and intensely confident — each creation is an act of pure intention. From Oud Wood to Black Orchid, wearing Tom Ford is not a choice. It is a statement about who you are and who you refuse not to be.",
    signature: "Oud Wood",
    accentColor: "#c8b89a",
    bottleAsset: "/src/assets/perfume-woody.png",
    bgPattern: "tomford",
  },
  {
    id: 5,
    name: "Jo Malone",
    tagline: "The art of layering",
    country: "UK · Est. 1994",
    story:
      "London-born and effortlessly layerable, Jo Malone taught a generation that simplicity is its own kind of luxury. One note. Infinite depth. Their colognes are designed to be worn alone or combined — a philosophy of self-expression that changed how the world thinks about scent.",
    signature: "English Pear & Freesia",
    accentColor: "#d8e0d0",
    bottleAsset: "/src/assets/perfume-gourmand.png",
    bgPattern: "jomalone",
  },
];

/* ─────────────────────────────────────────────
   SVG BACKGROUND PATTERNS per brand
───────────────────────────────────────────── */
const BgPattern = ({ pattern, accent }: { pattern: string; accent: string }) => {
  const patterns: Record<string, React.ReactNode> = {
    forest: (
      <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style={{ position: "absolute", inset: 0, opacity: 0.07 }}>
        <defs>
          <pattern id="forest-p" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
            <path d="M40 10 L50 30 L30 30 Z" fill={accent} />
            <path d="M40 20 L55 45 L25 45 Z" fill={accent} />
            <path d="M40 35 L58 58 L22 58 Z" fill={accent} />
            <rect x="37" y="58" width="6" height="14" fill={accent} />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#forest-p)" />
      </svg>
    ),
    ajmal: (
      <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style={{ position: "absolute", inset: 0, opacity: 0.055 }}>
        <defs>
          <pattern id="ajmal-p" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
            <polygon points="30,5 35,20 50,20 38,30 43,45 30,35 17,45 22,30 10,20 25,20" fill={accent} />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#ajmal-p)" />
      </svg>
    ),
    chanel: (
      <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style={{ position: "absolute", inset: 0, opacity: 0.05 }}>
        <defs>
          <pattern id="chanel-p" x="0" y="0" width="50" height="50" patternUnits="userSpaceOnUse">
            <circle cx="25" cy="25" r="18" stroke={accent} strokeWidth="1" fill="none" />
            <circle cx="25" cy="25" r="10" stroke={accent} strokeWidth="0.5" fill="none" />
            <line x1="7" y1="25" x2="43" y2="25" stroke={accent} strokeWidth="0.5" />
            <line x1="25" y1="7" x2="25" y2="43" stroke={accent} strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#chanel-p)" />
      </svg>
    ),
    tomford: (
      <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style={{ position: "absolute", inset: 0, opacity: 0.05 }}>
        <defs>
          <pattern id="tomford-p" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
            <rect x="5" y="5" width="30" height="30" stroke={accent} strokeWidth="0.8" fill="none" />
            <rect x="12" y="12" width="16" height="16" stroke={accent} strokeWidth="0.5" fill="none" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#tomford-p)" />
      </svg>
    ),
    jomalone: (
      <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style={{ position: "absolute", inset: 0, opacity: 0.055 }}>
        <defs>
          <pattern id="jomalone-p" x="0" y="0" width="70" height="70" patternUnits="userSpaceOnUse">
            <ellipse cx="35" cy="35" rx="25" ry="12" stroke={accent} strokeWidth="0.7" fill="none" />
            <ellipse cx="35" cy="35" rx="12" ry="25" stroke={accent} strokeWidth="0.7" fill="none" />
            <circle cx="35" cy="35" r="3" fill={accent} opacity="0.4" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#jomalone-p)" />
      </svg>
    ),
  };
  return <>{patterns[pattern]}</>;
};

/* ─────────────────────────────────────────────
   SINGLE BRAND ROW
───────────────────────────────────────────── */
interface BrandRowProps {
  brand: typeof brandConfig[0];
  index: number;
  onShop: (id: number) => void;
}

const BrandRow = ({ brand, index, onShop }: BrandRowProps) => {
  const isEven = index % 2 === 0;
  const bottleRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = bottleRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width - 0.5) * 18;
    const y = ((e.clientY - r.top) / r.height - 0.5) * 18;
    el.style.transform = `perspective(800px) rotateY(${x}deg) rotateX(${-y}deg) scale(1.04)`;
  };
  const handleMouseLeave = () => {
    if (bottleRef.current) bottleRef.current.style.transform = "";
  };

  return (
    <section
      className="br-row"
      style={{ "--br-accent": brand.accentColor } as React.CSSProperties}
    >
      <div className="br-row-bg" aria-hidden="true">
        <BgPattern pattern={brand.bgPattern} accent={brand.accentColor} />
        <div
          className="br-row-wash"
          style={{
            background: `radial-gradient(ellipse 70% 80% at ${isEven ? "65%" : "35%"} 50%, ${brand.accentColor}55 0%, transparent 70%)`,
          }}
        />
      </div>

      <div className={`br-row-inner ${isEven ? "br-row-inner--normal" : "br-row-inner--reverse"}`}>

        {/* BOTTLE */}
        <div className="br-bottle-col br-reveal" style={{ "--d": "0.05s" } as React.CSSProperties}>
          <div
            className="br-bottle-stage"
            ref={bottleRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onClick={() => onShop(brand.id)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && onShop(brand.id)}
            aria-label={`Shop ${brand.name}`}
          >
            <div className="br-bottle-glow" style={{ background: brand.accentColor }} />
            <img
              src={brand.bottleAsset}
              alt={`${brand.name} signature fragrance`}
              className="br-bottle-img"
              loading="lazy"
            />
            <div className="br-bottle-cta">
              <span>Shop {brand.name} →</span>
            </div>
          </div>
        </div>

        {/* TEXT */}
        <div className="br-text-col br-reveal" style={{ "--d": "0.2s" } as React.CSSProperties}>
          <p className="br-eyebrow">{brand.country}</p>
          <h2 className="br-brand-name">{brand.name}</h2>
          <p className="br-tagline">{brand.tagline}</p>
          <div className="br-divider" aria-hidden="true" />
          <p className="br-story">{brand.story}</p>
          <p className="br-signature-label">Signature Fragrance</p>
          <p className="br-signature">{brand.signature}</p>
          <button className="br-shop-btn" onClick={() => onShop(brand.id)}>
            Explore Collection →
          </button>
        </div>

      </div>

      <span className="br-section-num" aria-hidden="true">
        {String(index + 1).padStart(2, "0")}
      </span>
    </section>
  );
};

/* ─────────────────────────────────────────────
   PAGE
───────────────────────────────────────────── */
const Brands = () => {
  useScrollReveal();
  const navigate = useNavigate();

  const handleShop = (brandId: number) => {
    navigate(`/shop?brand_id=${brandId}`);
  };

  return (
    <>
      <style>{BRANDS_CSS}</style>
      <main className="br-wrap">

        {/* HERO */}
        <div className="br-hero">
          <div className="br-hero-bg" aria-hidden="true">
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style={{ position: "absolute", inset: 0, opacity: 0.04 }}>
              <defs>
                <pattern id="hero-dots" x="0" y="0" width="32" height="32" patternUnits="userSpaceOnUse">
                  <circle cx="16" cy="16" r="1.5" fill="hsl(33,30%,30%)" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#hero-dots)" />
            </svg>
          </div>
          <p className="br-hero-eyebrow br-fade-up" style={{ animationDelay: "0.1s" }}>
            Our Curated Partners
          </p>
          <h1 className="br-hero-h1 br-fade-up" style={{ animationDelay: "0.25s" }}>
            We do not carry every brand.<br />
            <em>We carry the ones we would<br />give to someone we love.</em>
          </h1>
          <p className="br-hero-sub br-fade-up" style={{ animationDelay: "0.42s" }}>
            Five houses. Five philosophies. One uncompromising standard of quality.
          </p>
          <div className="br-hero-scroll" aria-hidden="true">
            <div className="br-hero-scroll-line" />
          </div>
        </div>

        {/* BRAND ROWS */}
        {brandConfig.map((brand, i) => (
          <BrandRow key={brand.id} brand={brand} index={i} onShop={handleShop} />
        ))}

        {/* END CTA */}
        <section className="br-end br-reveal">
          <p className="br-eyebrow">Begin Your Journey</p>
          <h2 className="br-end-h2">Every bottle tells a story.<br />Which one will be yours?</h2>
          <button className="br-shop-btn br-shop-btn--lg" onClick={() => navigate("/shop")}>
            Explore All Fragrances →
          </button>
        </section>

      </main>
    </>
  );
};

/* ─────────────────────────────────────────────
   STYLES
───────────────────────────────────────────── */
const BRANDS_CSS = `
@keyframes brFadeUp{from{opacity:0;transform:translateY(28px)}to{opacity:1;transform:none}}
@keyframes brScrollPulse{0%,100%{height:12px;opacity:.3}50%{height:28px;opacity:.8}}
@keyframes brFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}

.br-fade-up{opacity:0;animation:brFadeUp .85s cubic-bezier(.16,1,.3,1) forwards}
.br-reveal{opacity:0;transform:translateY(32px);transition:opacity .9s cubic-bezier(.16,1,.3,1) var(--d,0s),transform .9s cubic-bezier(.16,1,.3,1) var(--d,0s)}
.br-visible{opacity:1!important;transform:none!important}

.br-wrap{overflow-x:hidden;background:hsl(var(--background))}

.br-hero{position:relative;text-align:center;padding:8rem 2rem 6rem;overflow:hidden;border-bottom:1px solid hsl(var(--border))}
.br-hero-bg{position:absolute;inset:0;pointer-events:none}
.br-hero-eyebrow{font-family:'Poppins',sans-serif;font-size:.68rem;font-weight:600;letter-spacing:.24em;text-transform:uppercase;color:hsl(var(--muted-foreground));margin-bottom:1.2rem;display:block}
.br-hero-h1{font-family:'Playfair Display',serif;font-size:clamp(2.2rem,5vw,4.2rem);font-weight:500;line-height:1.15;color:hsl(var(--foreground));margin-bottom:1.5rem;max-width:760px;margin-inline:auto}
.br-hero-h1 em{font-style:italic;color:hsl(var(--muted-foreground));font-weight:400}
.br-hero-sub{font-family:'Poppins',sans-serif;font-size:.9rem;color:hsl(var(--muted-foreground));line-height:1.75;max-width:42ch;margin-inline:auto}
.br-hero-scroll{display:flex;justify-content:center;margin-top:3.5rem}
.br-hero-scroll-line{width:1px;background:hsl(var(--muted-foreground));animation:brScrollPulse 2.2s ease-in-out infinite}

.br-eyebrow{font-family:'Poppins',sans-serif;font-size:.64rem;font-weight:600;letter-spacing:.22em;text-transform:uppercase;color:hsl(var(--muted-foreground));margin-bottom:.6rem;display:block}

.br-row{position:relative;overflow:hidden;border-bottom:1px solid hsl(var(--border));min-height:520px}
.br-row-bg{position:absolute;inset:0;pointer-events:none;z-index:0}
.br-row-wash{position:absolute;inset:0}
.br-row-inner{position:relative;z-index:1;max-width:1160px;margin:0 auto;display:grid;grid-template-columns:1fr 1fr;align-items:center;gap:4rem;padding:6rem 2rem}
.br-row-inner--reverse{direction:rtl}
.br-row-inner--reverse>*{direction:ltr}

.br-bottle-col{display:flex;justify-content:center;align-items:center}
.br-bottle-stage{position:relative;cursor:pointer;transition:transform .15s ease;transform-style:preserve-3d;will-change:transform;display:flex;flex-direction:column;align-items:center;gap:1.2rem}
.br-bottle-glow{position:absolute;bottom:-20px;left:50%;transform:translateX(-50%);width:65%;height:40px;filter:blur(22px);border-radius:50%;opacity:.45;transition:opacity .3s}
.br-bottle-stage:hover .br-bottle-glow{opacity:.7}
.br-bottle-img{height:clamp(220px,24vw,340px);width:auto;object-fit:contain;filter:drop-shadow(0 20px 40px rgba(0,0,0,.10));transition:filter .3s ease;animation:brFloat 5s ease-in-out infinite;animation-play-state:paused}
.br-bottle-stage:hover .br-bottle-img{animation-play-state:running;filter:drop-shadow(0 28px 50px rgba(0,0,0,.16))}
.br-bottle-cta{font-family:'Poppins',sans-serif;font-size:.75rem;font-weight:600;letter-spacing:.12em;text-transform:uppercase;color:hsl(var(--foreground));background:hsl(var(--background)/.85);border:1px solid hsl(var(--border));backdrop-filter:blur(8px);padding:.55rem 1.4rem;border-radius:9999px;opacity:0;transform:translateY(8px);transition:opacity .25s ease,transform .25s ease}
.br-bottle-stage:hover .br-bottle-cta{opacity:1;transform:translateY(0)}

.br-text-col{display:flex;flex-direction:column;align-items:flex-start}
.br-brand-name{font-family:'Playfair Display',serif;font-size:clamp(2rem,3.5vw,3.2rem);font-weight:500;line-height:1.1;color:hsl(var(--foreground));margin-bottom:.5rem}
.br-tagline{font-family:'Poppins',sans-serif;font-size:.78rem;font-weight:600;letter-spacing:.14em;text-transform:uppercase;color:hsl(var(--peach)/.85);margin-bottom:1.5rem}
.br-divider{width:48px;height:1px;background:hsl(var(--border));margin-bottom:1.5rem}
.br-story{font-family:'Poppins',sans-serif;font-size:.88rem;line-height:1.88;color:hsl(var(--muted-foreground));max-width:46ch;margin-bottom:1.8rem}
.br-signature-label{font-family:'Poppins',sans-serif;font-size:.6rem;font-weight:600;letter-spacing:.18em;text-transform:uppercase;color:hsl(var(--muted-foreground));margin-bottom:.25rem;opacity:.7}
.br-signature{font-family:'Playfair Display',serif;font-style:italic;font-size:.98rem;color:hsl(var(--foreground));margin-bottom:2rem;opacity:.8}

.br-shop-btn{display:inline-block;font-family:'Poppins',sans-serif;font-size:.8rem;font-weight:600;letter-spacing:.06em;color:hsl(var(--foreground));background:hsl(var(--peach));border:none;padding:.68rem 1.8rem;border-radius:9999px;cursor:pointer;transition:opacity .2s,transform .2s,box-shadow .2s}
.br-shop-btn:hover{opacity:.85;transform:translateY(-2px);box-shadow:0 8px 24px hsl(var(--peach)/.3)}
.br-shop-btn--lg{font-size:.88rem;padding:.85rem 2.4rem;margin-top:2rem}

.br-section-num{position:absolute;bottom:2rem;right:2.5rem;font-family:'Playfair Display',serif;font-size:5rem;font-weight:700;color:hsl(var(--foreground));opacity:.04;line-height:1;pointer-events:none;user-select:none}

.br-end{text-align:center;padding:8rem 2rem;background:hsl(var(--card)/.5);border-top:1px solid hsl(var(--border))}
.br-end-h2{font-family:'Playfair Display',serif;font-size:clamp(1.8rem,3.5vw,2.9rem);font-weight:500;line-height:1.2;color:hsl(var(--foreground));margin:.7rem 0 0}

@media(max-width:860px){
  .br-row-inner,.br-row-inner--reverse{grid-template-columns:1fr;direction:ltr;gap:2.5rem;padding:4rem 1.5rem}
  .br-bottle-col{order:1}
  .br-text-col{order:2;align-items:center;text-align:center}
  .br-divider{margin-inline:auto}
  .br-story{max-width:54ch;margin-inline:auto}
  .br-section-num{display:none}
  .br-hero{padding:5rem 1.5rem 4rem}
}
@media(max-width:480px){.br-bottle-img{height:200px}}
@media(prefers-reduced-motion:reduce){
  .br-fade-up,.br-reveal{animation:none!important;opacity:1!important;transform:none!important}
  .br-bottle-img{animation:none!important}
}
`;

export default Brands;