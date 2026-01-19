import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import image1 from '@/assets/download (1).jpg';
import image2 from '@/assets/Plantes aromatiques à jolie floraison_ 8 herbes magnifiques.jpg';
import image3 from '@/assets/Hibiscus Tea Blend with Lemongrass and Rosehips - Sample Bag.jpg';

interface Slide {
  id: number;
  image: string; // This will now refer to a public path
  slogan: string;
}

const slides: Slide[] = [
  { id: 1, image: image1, slogan: "حيث تلتقي الأصالة بالجودة في كل نكهة." },
  { id: 2, image: image2, slogan: "ارتقِ بمذاقك، اكتشف عالمًا من النكهات." },
  { id: 3, image: image3, slogan: "كل طبق حكاية، كل نكهة إلهام." },
];

const HeroSlider = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const minSwipeDistance = 50;

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      nextSlide();
    }, 5000);
    return () => clearInterval(timer);
  }, [nextSlide]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    
    if (isLeftSwipe) {
      prevSlide();
    }
    if (isRightSwipe) {
      nextSlide();
    }
  };

  return (
    <section 
      className="relative w-full h-[300px] md:h-[400px] lg:h-[500px] overflow-hidden"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* Slides */}
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-700 ${
            index === currentSlide ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        >
          <img
            src={slide.image}
            alt={`Slide ${slide.id}`}
            className="w-full h-full object-cover"
            decoding="async"
            fetchpriority={index === currentSlide ? "high" : "auto"}
          />
          <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-center p-4">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 dir-rtl" style={{ direction: 'rtl' }}>
              {slide.slogan}
            </h2>
            <Link to="/products">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-white text-lg px-8 py-3">
                تسوق الآن
              </Button>
            </Link>
          </div>
        </div>
      ))}

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 rounded-full bg-card/80 hover:bg-card flex items-center justify-center transition-colors shadow-lg"
        aria-label="Previous slide"
      >
        <ChevronRight className="w-5 h-5 md:w-6 md:h-6 text-foreground" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 rounded-full bg-card/80 hover:bg-card flex items-center justify-center transition-colors shadow-lg"
        aria-label="Next slide"
      >
        <ChevronLeft className="w-5 h-5 md:w-6 md:h-6 text-foreground" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-4 md:bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 md:gap-3">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-2 h-2 md:w-3 md:h-3 rounded-full transition-all ${
              index === currentSlide 
                ? 'bg-primary w-6 md:w-8' 
                : 'bg-primary-foreground/50 hover:bg-primary-foreground'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
};

export default HeroSlider;
