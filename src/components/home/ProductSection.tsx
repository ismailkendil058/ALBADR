import { ChevronLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import ProductCard from '@/components/products/ProductCard';
import { Product } from '@/hooks/useProducts';

interface ProductSectionProps {
  titleAr: string;
  titleFr: string;
  products: Product[];
  showViewAll?: boolean;
  bgClass?: string;
  sectionKey?: string;
}

const ProductSection = ({ titleAr, titleFr, products, showViewAll = true, bgClass = 'bg-background', sectionKey = 'featured' }: ProductSectionProps) => {
  return (
    <section className={`py-12 md:py-16 ${bgClass}`}>
      <div className="container">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-arabic-display font-bold text-secondary">{titleAr}</h2>
            <p className="text-muted-foreground font-french mt-1">{titleFr}</p>
          </div>
          {showViewAll && (
            <Link to={`/products?section=${sectionKey}`}>
              <Button variant="outline" className="font-body hidden sm:flex">
                عرض الكل
                <ChevronLeft className="w-4 h-4 mr-1" />
              </Button>
            </Link>
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {products.map((product) => {
            console.log("Product data in ProductSection:", product);
            return <ProductCard key={product.id} product={product} />;
          })}
        </div>

        {showViewAll && (
          <div className="mt-6 text-center sm:hidden">
            <Link to={`/products?section=${sectionKey}`}>
              <Button variant="outline" className="font-body">
                عرض الكل
                <ChevronLeft className="w-4 h-4 mr-1" />
              </Button>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
};

export default ProductSection;
