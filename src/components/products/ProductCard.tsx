import React from 'react';
import { Eye } from 'lucide-react';
import { Product } from '@/hooks/useProducts';
import { Link } from 'react-router-dom';

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  return (
    <div className="product-card group">
      {/* Image Container */}
      <div className="block relative aspect-square overflow-hidden">
        <img
          loading="lazy"
          decoding="async"
          src={product.image || '/placeholder.svg'}
          alt={product.name_ar}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />



        {/* Quick Actions Overlay */}
        <Link to={`/product/${product.id}`} className="quick-view-overlay gap-3">
          <div
            className="wishlist-btn"
            aria-label="Quick view"
          >
            <Eye className="w-4 h-4" />
          </div>
        </Link>
      </div>

      {/* Content */}
      <div className="p-4">
        <Link to={`/product/${product.id}`}>
          <h3 className="font-arabic font-medium text-foreground mb-1 line-clamp-1 hover:text-primary transition-colors">
            {product.name_ar || ''}
          </h3>
        </Link>
        <p className="text-sm font-french text-muted-foreground mb-2 line-clamp-1">
          {product.name_fr}
        </p>
        
        {/* Price */}
        <div className="flex items-baseline gap-2">
          <span className="text-lg font-bold text-primary" dir="ltr">
            {product.price} DZD
          </span>
          {product.original_price && (
            <span className="text-sm text-muted-foreground line-through" dir="ltr">
              {product.original_price} DZD
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default React.memo(ProductCard);
