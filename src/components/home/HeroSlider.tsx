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



  return (
    <section 
      className="relative w-full h-[300px] md:h-[400px] lg:h-[500px] overflow-hidden"
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




    </section>
  );
};

export default HeroSlider;
