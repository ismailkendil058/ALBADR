import { lazy, Suspense } from 'react';
import TopBar from '@/components/layout/TopBar';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import HeroSlider from '@/components/home/HeroSlider';
import CategoryGrid from '@/components/home/CategoryGrid';
import { useFeaturedProducts, useBestSellerProducts, usePromoProducts } from '@/hooks/useProducts';
import { Loader2 } from 'lucide-react';
import { CardContent } from '@/components/ui/card';
import SEO from '@/components/seo/SEO';
import JSONLD from '@/components/seo/JSONLD';

// Lazy load FeaturesBar and ProductSection
const FeaturesBar = lazy(() => import('@/components/home/FeaturesBar'));
const ProductSection = lazy(() => import('@/components/home/ProductSection'));

// Loading skeleton
const SectionLoader = () => (
  <div className="py-12 md:py-16 flex items-center justify-center">
    <Loader2 className="w-8 h-8 animate-spin text-primary" />
  </div>
);

const Index = () => {
  // Use staleTime to prevent refetching on focus, reduce network calls
  const { data: featuredProducts, isLoading: isLoadingFeatured, error: errorFeatured } = useFeaturedProducts();
  const { data: bestSellers, isLoading: isLoadingBestSellers, error: errorBestSellers } = useBestSellerProducts();
  const { data: promoProducts, isLoading: isLoadingPromo, error: errorPromo } = usePromoProducts();

  const isLoading = isLoadingFeatured || isLoadingBestSellers || isLoadingPromo;
  const error = errorFeatured || errorBestSellers || errorPromo;

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <CardContent>
          <p className="text-destructive font-body">خطأ أثناء تحميل المنتجات: {error.message}</p>
        </CardContent>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <SEO
        description="طاحونة البدر - أفضل التوابل والأعشاب الطبيعية بجودة عالية من الجزائر. اكتشف عالمًا من النكهات الأصيلة."
        canonical="/"
      />
      <JSONLD
        data={{
          '@type': 'LocalBusiness',
          'name': 'طاحونة البدر',
          'image': '/Al Badr Logo HQ Transparent.png',
          'address': {
            '@type': 'PostalAddress',
            'addressLocality': 'Laghouat',
            'addressCountry': 'DZ'
          },
          'priceRange': '$$'
        }}
      />
      <TopBar />
      <Header />

      <main className="flex-1">
        <HeroSlider />
        
        <Suspense fallback={<SectionLoader />}>
          <FeaturesBar />
        </Suspense>

        <CategoryGrid />

        {featuredProducts && featuredProducts.length > 0 && (
          <Suspense fallback={<SectionLoader />}>
            <ProductSection
              titleAr="منتجات مميزة"
              titleFr="Produits en Vedette"
              products={featuredProducts}
              bgClass="bg-muted/50"
              sectionKey="featured"
            />
          </Suspense>
        )}

        {bestSellers && bestSellers.length > 0 && (
          <Suspense fallback={<SectionLoader />}>
            <ProductSection
              titleAr="الأكثر مبيعاً"
              titleFr="Meilleures Ventes"
              products={bestSellers}
              sectionKey="bestsellers"
            />
          </Suspense>
        )}

        {promoProducts && promoProducts.length > 0 && (
          <Suspense fallback={<SectionLoader />}>
            <ProductSection
              titleAr="عروض خاصة"
              titleFr="Promotions Spéciales"
              products={promoProducts}
              bgClass="bg-primary/5"
              sectionKey="promo"
            />
          </Suspense>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Index;
