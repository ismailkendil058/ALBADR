import { useSearchParams, Link } from 'react-router-dom';
import { ChevronLeft, Search } from 'lucide-react';
import TopBar from '@/components/layout/TopBar';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ProductCard from '@/components/products/ProductCard';
import { useProducts } from '@/hooks/useProducts';
import { Loader2 } from 'lucide-react';
import { CardContent } from '@/components/ui/card';

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';

  const { data: allProducts, isLoading, error } = useProducts();

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

  const searchResults = (allProducts || []).filter(product =>
    product.name_ar.toLowerCase().includes(query.toLowerCase()) ||
    product.name_fr.toLowerCase().includes(query.toLowerCase()) ||
    (product.description_ar && product.description_ar.toLowerCase().includes(query.toLowerCase())) ||
    (product.description_fr && product.description_fr.toLowerCase().includes(query.toLowerCase()))
  );

  return (
    <div className="min-h-screen flex flex-col">
      <TopBar />
      <Header />
      
      <main className="flex-1">
        {/* Breadcrumb */}
        <div className="bg-muted/50 py-3">
          <div className="container">
            <nav className="flex items-center gap-2 text-sm font-body text-muted-foreground">
              <Link to="/" className="hover:text-primary transition-colors">الرئيسية</Link>
              <ChevronLeft className="w-4 h-4" />
              <span className="text-foreground">نتائج البحث</span>
            </nav>
          </div>
        </div>

        {/* Search Results */}
        <section className="py-12">
          <div className="container">
            <div className="flex items-center gap-3 mb-8">
              <Search className="w-6 h-6 text-primary" />
              <h1 className="text-2xl md:text-3xl font-arabic-display font-bold text-secondary">
                نتائج البحث: "{query}"
              </h1>
            </div>

            {searchResults.length > 0 ? (
              <>
                <p className="text-muted-foreground font-body mb-6">
                  تم العثور على {searchResults.length} منتج
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                  {searchResults.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground font-body text-lg mb-4">
                  لم يتم العثور على منتجات تطابق بحثك
                </p>
                <Link to="/" className="text-primary hover:underline font-body">
                  العودة للرئيسية
                </Link>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default SearchResults;
