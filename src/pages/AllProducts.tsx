import { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { ChevronLeft, Loader2 } from 'lucide-react';
import TopBar from '@/components/layout/TopBar';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ProductCard from '@/components/products/ProductCard';
import { useProducts, useFeaturedProducts, useBestSellerProducts, usePromoProducts } from '@/hooks/useProducts';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

const AllProducts = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const section = searchParams.get('section');
  const initialPage = parseInt(searchParams.get('page') || '1', 10);
  const [page, setPage] = useState(initialPage);

  let pageTitle = 'جميع المنتجات';
  let pageTitleAr = 'جميع المنتجات';
  let pageTitleFr = 'Tous les Produits';
  const PAGE_SIZE = 16;

  const { data: allProductsData, isLoading: isLoadingAll, error: errorAll } = useProducts({ page, pageSize: PAGE_SIZE });
  const { data: featuredProducts, isLoading: isLoadingFeatured, error: errorFeatured } = useFeaturedProducts();
  const { data: bestSellerProducts, isLoading: isLoadingBestSellers, error: errorBestSellers } = useBestSellerProducts();
  const { data: promoProducts, isLoading: isLoadingPromo, error: errorPromo } = usePromoProducts();

  let displayProducts = [];
  let isLoading = false;
  let error = null;
  let totalCount = 0;

  if (section === 'featured') {
    displayProducts = featuredProducts || [];
    totalCount = displayProducts.length;
    pageTitle = 'منتجات مميزة';
    pageTitleAr = 'منتجات مميزة';
    pageTitleFr = 'Produits en Vedette';
    isLoading = isLoadingFeatured;
    error = errorFeatured;
  } else if (section === 'bestsellers') {
    displayProducts = bestSellerProducts || [];
    totalCount = displayProducts.length;
    pageTitle = 'الأكثر مبيعاً';
    pageTitleAr = 'الأكثر مبيعاً';
    pageTitleFr = 'Meilleures Ventes';
    isLoading = isLoadingBestSellers;
    error = errorBestSellers;
  } else if (section === 'promo') {
    displayProducts = promoProducts || [];
    totalCount = displayProducts.length;
    pageTitle = 'عروض خاصة';
    pageTitleAr = 'عروض خاصة';
    pageTitleFr = 'Promotions Spéciales';
    isLoading = isLoadingPromo;
    error = errorPromo;
  } else {
    displayProducts = allProductsData?.data || [];
    totalCount = allProductsData?.count || 0;
    pageTitle = 'جميع المنتجات';
    pageTitleAr = 'جميع المنتجات';
    pageTitleFr = 'Tous les Produits';
    isLoading = isLoadingAll;
    error = errorAll;
  }

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    setPage(newPage);
    setSearchParams(params => {
      params.set('page', newPage.toString());
      return params;
    });
    window.scrollTo(0, 0);
  };

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
              <span className="text-foreground">{pageTitle}</span>
            </nav>
          </div>
        </div>

        {/* Products Grid */}
        <section className="py-12">
          <div className="container">
            <div className="mb-8">
              <h1 className="text-2xl md:text-3xl font-arabic-display font-bold text-secondary">
                {pageTitle}
              </h1>
              <p className="text-muted-foreground font-french mt-1">{pageTitleFr}</p>
              {!isLoading && !error && (
                <p className="text-sm text-muted-foreground font-body mt-2">
                  {totalCount} منتج
                </p>
              )}
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-destructive font-body">
                  حدث خطأ أثناء تحميل المنتجات: {error.message}
                </p>
              </div>
            ) : displayProducts.length > 0 ? (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                  {displayProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>

                {!section && totalPages > 1 && (
                  <div className="mt-12">
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious
                            href="#"
                            onClick={(e) => { e.preventDefault(); handlePageChange(page - 1); }}
                            className={page === 1 ? 'pointer-events-none text-muted-foreground' : ''}
                          />
                        </PaginationItem>
                        {[...Array(totalPages)].map((_, i) => (
                          <PaginationItem key={i}>
                            <PaginationLink
                              href="#"
                              onClick={(e) => { e.preventDefault(); handlePageChange(i + 1); }}
                              isActive={page === i + 1}
                            >
                              {i + 1}
                            </PaginationLink>
                          </PaginationItem>
                        ))}
                        <PaginationItem>
                          <PaginationNext
                            href="#"
                            onClick={(e) => { e.preventDefault(); handlePageChange(page + 1); }}
                            className={page === totalPages ? 'pointer-events-none text-muted-foreground' : ''}
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground font-body">
                  لا توجد منتجات متوفرة حالياً
                </p>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default AllProducts;
