import TopBar from '@/components/layout/TopBar';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import HeroSlider from '@/components/home/HeroSlider';
import CategoryGrid from '@/components/home/CategoryGrid';
import ProductSection from '@/components/home/ProductSection';
import FeaturesBar from '@/components/home/FeaturesBar';
import { useFeaturedProducts, useBestSellerProducts, usePromoProducts } from '@/hooks/useProducts';
import { Loader2 } from 'lucide-react';
import { CardContent } from '@/components/ui/card';

const Index = () => {
  const { data: featuredProducts, isLoading: isLoadingFeatured, error: errorFeatured } = useFeaturedProducts();
  const { data: bestSellers, isLoading: isLoadingBestSellers, error: errorBestSellers } = useBestSellerProducts();
  const { data: promoProducts, isLoading: isLoadingPromo, error: errorPromo } = usePromoProducts();

  const isLoading = isLoadingFeatured || isLoadingBestSellers || isLoadingPromo;
  const error = errorFeatured || errorBestSellers || errorPromo;

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <CardContent>
          <p className="text-destructive font-body">Error loading products: {error.message}</p>
        </CardContent>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <TopBar />
      <Header />
      
      <main className="flex-1">
        <HeroSlider />
        <FeaturesBar />
        <CategoryGrid />

        {featuredProducts && featuredProducts.length > 0 && (
          <ProductSection
            titleAr="منتجات مميزة"
            titleFr="Produits en Vedette"
            products={featuredProducts}
            bgClass="bg-muted/50"
            sectionKey="featured"
          />
        )}

        {bestSellers && bestSellers.length > 0 && (
          <ProductSection
            titleAr="الأكثر مبيعاً"
            titleFr="Meilleures Ventes"
            products={bestSellers}
            sectionKey="bestsellers"
          />
        )}

        {promoProducts && promoProducts.length > 0 && (
          <ProductSection
            titleAr="عروض خاصة"
            titleFr="Promotions Spéciales"
            products={promoProducts}
            bgClass="bg-primary/5"
            sectionKey="promo"
          />
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Index;
