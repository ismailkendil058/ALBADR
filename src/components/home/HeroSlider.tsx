import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useCMS } from '@/context/CMSContext';

const HeroSlider = () => {
  const { content, loading } = useCMS();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [slides, setSlides] = useState([]);

  // Sync slides from CMS content
  useEffect(() => {
    const activeSlides = (content.hero.slides || [])
      .filter(slide => slide.isActive)
      .sort((a, b) => a.order - b.order);
    setSlides(activeSlides);
  }, [content.hero.slides]);

  const nextSlide = useCallback(() => {
    if (slides.length === 0) return;
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const prevSlide = useCallback(() => {
    if (slides.length === 0) return;
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  }, [slides.length]);

  useEffect(() => {
    if (slides.length <= 1) return;
    const interval = content.hero.autoPlayInterval || 5000;
    const timer = setInterval(() => {
      nextSlide();
    }, interval);
    return () => clearInterval(timer);
  }, [nextSlide, slides.length, content.hero.autoPlayInterval]);

  if (loading) {
    return <div className="w-full h-[300px] md:h-[400px] lg:h-[500px] bg-muted animate-pulse" />;
  }

  if (slides.length === 0) {
    return null;
  }

  return (
    <section className="relative w-full h-[300px] md:h-[400px] lg:h-[500px] overflow-hidden">
      {/* Slides */}
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-700 ${index === currentSlide ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        >
          <img
            src={slide.image}
            alt={slide.title}
            className="w-full h-full object-cover"
            decoding="async"
            // @ts-ignore
            fetchpriority={index === currentSlide ? "high" : "auto"}
          />
          <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-center p-4">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 dir-rtl" style={{ direction: 'rtl' }}>
              {slide.title}
            </h2>
            <Link to={slide.ctaLink}>
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-white text-lg px-8 py-3">
                {slide.ctaText}
              </Button>
            </Link>
          </div>


        </div>
      ))}

      {/* Navigation */}
      {slides.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white p-2 rounded-full backdrop-blur-sm transition-all z-10"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white p-2 rounded-full backdrop-blur-sm transition-all z-10"
            aria-label="Next slide"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-2.5 h-2.5 rounded-full transition-all ${index === currentSlide ? 'bg-primary w-8' : 'bg-white/50 hover:bg-white/80'}`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
};

export default HeroSlider;
