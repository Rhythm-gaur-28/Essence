import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Banner {
  id: number;
  image_url: string;
  title: string | null;
  subtitle: string | null;
  link: string | null;
}

const API = 'http://localhost:5000';

const imgSrc = (url: string) => (url.startsWith('http') ? url : `${API}${url}`);

const HomeBanner = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    fetch(`${API}/api/banners`)
      .then(r => r.json())
      .then(data => setBanners(Array.isArray(data) ? data : []))
      .catch(() => setBanners([]));
  }, []);

  const prev = useCallback(() => setCurrent(c => (c - 1 + banners.length) % banners.length), [banners.length]);
  const next = useCallback(() => setCurrent(c => (c + 1) % banners.length), [banners.length]);

  // Auto-slide every 4 s, paused on hover
  useEffect(() => {
    if (banners.length <= 1 || paused) return;
    const timer = setInterval(next, 4000);
    return () => clearInterval(timer);
  }, [banners.length, paused, next]);

  if (banners.length === 0) return null;

  const banner = banners[current];
  const hasMultiple = banners.length > 1;

  const Wrapper = ({ children }: { children: React.ReactNode }) =>
    banner.link ? (
      <a href={banner.link} className="block w-full h-full">
        {children}
      </a>
    ) : (
      <div className="w-full h-full">{children}</div>
    );

  return (
    <section
      className="relative overflow-hidden select-none"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Slides */}
      <div
        className="flex transition-transform duration-700 ease-in-out"
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {banners.map((b, i) => {
          const Inner = b.link
            ? ({ children }: { children: React.ReactNode }) => <a href={b.link!} className="block w-full h-full">{children}</a>
            : ({ children }: { children: React.ReactNode }) => <div className="w-full h-full">{children}</div>;

          return (
            <div key={b.id} className="min-w-full relative">
              <Inner>
                <img
                  src={imgSrc(b.image_url)}
                  alt={b.title || `Banner ${i + 1}`}
                  className="w-full object-cover max-h-[420px] min-h-[200px]"
                />
                {(b.title || b.subtitle) && (
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent flex flex-col items-center justify-end pb-8 text-white text-center px-4">
                    {b.title && (
                      <h3 className="font-heading text-2xl md:text-3xl font-bold drop-shadow-lg mb-1">
                        {b.title}
                      </h3>
                    )}
                    {b.subtitle && (
                      <p className="text-sm md:text-base text-white/85 drop-shadow">
                        {b.subtitle}
                      </p>
                    )}
                  </div>
                )}
              </Inner>
            </div>
          );
        })}
      </div>

      {/* Arrows — only when multiple banners */}
      {hasMultiple && (
        <>
          <button
            onClick={prev}
            aria-label="Previous banner"
            className="absolute left-3 top-1/2 -translate-y-1/2 bg-background/70 hover:bg-background/90 backdrop-blur-sm text-foreground rounded-full p-2 transition-all shadow"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={next}
            aria-label="Next banner"
            className="absolute right-3 top-1/2 -translate-y-1/2 bg-background/70 hover:bg-background/90 backdrop-blur-sm text-foreground rounded-full p-2 transition-all shadow"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Dot indicators */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
            {banners.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                aria-label={`Go to banner ${i + 1}`}
                className={`rounded-full transition-all duration-300 ${
                  i === current
                    ? 'w-5 h-2 bg-white'
                    : 'w-2 h-2 bg-white/50 hover:bg-white/75'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
};

export default HomeBanner;
