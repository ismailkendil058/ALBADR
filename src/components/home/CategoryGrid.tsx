import { Link } from 'react-router-dom';
import { useCategories } from '@/hooks/useCategories';
import { Loader2 } from 'lucide-react';
import { CardContent } from '@/components/ui/card';

const CategoryGrid = () => {
  const { categories, isLoading, error } = useCategories();

  if (isLoading) {
    return (
      <section className="py-12 md:py-16 bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-12 md:py-16 bg-background flex items-center justify-center">
        <CardContent>
          <p className="text-destructive font-body">Error loading categories: {error.message}</p>
        </CardContent>
      </section>
    );
  }

  if (!categories || categories.length === 0) {
    return (
      <section className="py-12 md:py-16 bg-background flex items-center justify-center">
        <CardContent>
          <p className="text-muted-foreground font-body">No categories available</p>
        </CardContent>
      </section>
    );
  }

  return (
    <section className="py-12 md:py-16 bg-background">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">الأقسام</h2>
          <p className="section-subtitle font-french">Découvrez nos catégories</p>
        </div>

        <div className="flex flex-nowrap md:flex-wrap justify-start md:justify-center gap-4 md:gap-6 overflow-x-auto md:overflow-x-visible pb-4 md:pb-0 scrollbar-hide snap-x snap-mandatory px-4 md:px-0 -mx-4 md:mx-0">
          {categories.map((category) => (
            <Link
              key={category.id}
              to={`/category/${category.id}`}
              className={`category-card group aspect-square flex-shrink-0 w-[160px] md:w-[calc(33.333%-16px)] lg:w-[calc(20%-20px)] md:flex-shrink md:min-w-[180px] max-w-[240px] snap-center ${category.is_special ? 'ring-2 ring-primary ring-offset-2' : ''}`}
            >
              <img src={category.image || '/placeholder.svg'} alt={category.name_ar} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" loading="lazy" decoding="async" />

              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center text-center p-4">
                {category.is_special && <span className="badge-promo mb-2 text-xs">عرض خاص</span>}
                <h3 className="text-xl md:text-2xl font-arabic-display font-bold text-primary-foreground">{category.name_ar}</h3>
                <p className="text-sm font-french text-primary-foreground/80 mt-1">{category.name_fr}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoryGrid;
