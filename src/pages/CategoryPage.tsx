import { useState } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { ChevronLeft, Loader2 } from 'lucide-react';
import TopBar from '@/components/layout/TopBar';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ProductCard from '@/components/products/ProductCard';
import { useCategories } from '@/hooks/useCategories';
import { useProductsByCategory } from '@/hooks/useProducts';
import { 
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

const PAGE_SIZE = 16;

const CategoryPage = () => {
  const { categoryId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialPage = parseInt(searchParams.get('page') || '1', 10);
  const [page, setPage] = useState(initialPage);

  const { categories, isLoading: isLoadingCategories, error: errorCategories } = useCategories();
  const { data: productsData, isLoading: isLoadingProducts, error: errorProducts } = useProductsByCategory({ categoryId, page, pageSize: PAGE_SIZE });
  
  const { data: products = [], count = 0 } = productsData || {};
  const category = categories.find(c => c.id === categoryId);

  const isLoading = isLoadingCategories || isLoadingProducts;
  const error = errorCategories || errorProducts;

  const totalPages = Math.ceil(count / PAGE_SIZE);

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    setPage(newPage);
    setSearchParams({ page: newPage.toString() });
    window.scrollTo(0, 0);
  };

  if (isLoading && !category) { // Show full page loader only if category isn't loaded yet
    return (
      <div className="min-h-screen flex flex-col">
        <TopBar />
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col">
        <TopBar />
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-arabic-display mb-4">Error loading data</h1>
            <p className="text-destructive font-body">{error.message}</p>
            <Link to="/" className="text-primary hover:underline font-body">Go to Home</Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!category) {
    return (
      <div className="min-h-screen flex flex-col">
        <TopBar />
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-arabic-display mb-4">Category not found</h1>
            <Link to="/" className="text-primary hover:underline font-body">Go to Home</Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <TopBar />
      <Header />
      
      <main className="flex-1">
        <div className="bg-muted/50 py-3">
          <div className="container">
            <nav className="flex items-center gap-2 text-sm font-body text-muted-foreground">
              <Link to="/" className="hover:text-primary transition-colors">Home</Link>
              <ChevronLeft className="w-4 h-4" />
              <span className="text-foreground">{category.name_ar}</span>
            </nav>
          </div>
        </div>

        <section className="relative h-[200px] md:h-[250px] overflow-hidden">
          <img loading="lazy" src={category.image || '/placeholder.svg'} alt={category.name_ar} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-secondary/60 flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-3xl md:text-4xl font-arabic-display font-bold text-primary-foreground mb-2">{category.name_ar}</h1>
              <p className="text-lg font-french text-primary-foreground/80">{category.name_fr}</p>
              <p className="text-sm font-body text-primary-foreground/70 mt-2">{count} products</p>
            </div>
          </div>
        </section>

        <section className="py-12">
          <div className="container">
            {isLoadingProducts ? (
               <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : products && products.length > 0 ? (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
                {totalPages > 1 && (
                  <div className="mt-12">
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious href="#" onClick={(e) => { e.preventDefault(); handlePageChange(page - 1); }} className={page === 1 ? 'pointer-events-none text-muted-foreground' : ''} />
                        </PaginationItem>
                        {[...Array(totalPages)].map((_, i) => (
                           <PaginationItem key={i}>
                             <PaginationLink href="#" onClick={(e) => { e.preventDefault(); handlePageChange(i + 1); }} isActive={page === i + 1}>{i + 1}</PaginationLink>
                           </PaginationItem>
                        ))}
                        <PaginationItem>
                          <PaginationNext href="#" onClick={(e) => { e.preventDefault(); handlePageChange(page + 1); }} className={page === totalPages ? 'pointer-events-none text-muted-foreground' : ''} />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground font-body">No products in this category yet</p>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default CategoryPage;
