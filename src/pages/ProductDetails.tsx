import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Minus, Plus, ShoppingCart, ChevronLeft, Loader2 } from 'lucide-react';
import TopBar from '@/components/layout/TopBar';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ProductCard from '@/components/products/ProductCard';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/CartContext';
import { useProduct, useProducts } from '@/hooks/useProducts';
import SEO from '@/components/seo/SEO';
import JSONLD from '@/components/seo/JSONLD';

const ProductDetails = () => {
  const { id } = useParams();
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [selectedWeightId, setSelectedWeightId] = useState<string | null>(null);

  const { data: product, isLoading } = useProduct(id);
  const { data: allProductsData } = useProducts();
  const allProducts = allProductsData?.data || [];

  const relatedProducts = allProducts
    .filter(p => p.category_id === product?.category_id && p.id !== id)
    .slice(0, 4);

  const hasWeightOptions = product?.has_weight_options && product.weights && product.weights.length > 0;
  const selectedWeight = hasWeightOptions ? product.weights?.find(w => w.id === selectedWeightId) : null;
  const displayPrice = selectedWeight ? selectedWeight.price : product?.price || 0;

  if (isLoading) {
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

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col">
        <TopBar />
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-arabic-display mb-4">المنتج غير موجود</h1>
            <Link to="/" className="text-primary hover:underline font-body">
              العودة للرئيسية
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const handleAddToCart = () => {
    const cartProduct = {
      id: product.id,
      nameAr: product.name_ar || '',
      nameFr: product.name_fr,
      price: displayPrice,
      originalPrice: product.original_price || undefined,
      image: product.image || '/placeholder.svg',
      category: product.category?.name_fr || '',
      descriptionAr: product.description_ar || '',
      isNew: product.is_new || false,
      isPromo: product.is_promo || false,
      isBestSeller: product.is_best_seller || false,
      isFeatured: product.is_featured || false,
    };

    const weightOption = selectedWeight ? {
      id: selectedWeight.id,
      weight: selectedWeight.weight,
      price: selectedWeight.price,
    } : undefined;

    addItem(cartProduct, quantity, weightOption);
    setQuantity(1);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <SEO
        title={product.name_ar}
        description={product.description_ar?.substring(0, 160)}
        ogImage={product.image}
        ogType="product"
      />
      <JSONLD
        data={{
          '@type': 'Product',
          'name': product.name_ar,
          'image': product.image,
          'description': product.description_ar,
          'brand': {
            '@type': 'Brand',
            'name': 'طاحونة البدر'
          },
          'offers': {
            '@type': 'Offer',
            'price': displayPrice,
            'priceCurrency': 'DZD',
            'availability': 'https://schema.org/InStock'
          }
        }}
      />
      <TopBar />
      <Header />

      <main className="flex-1">
        {/* Breadcrumb */}
        <div className="bg-muted/50 py-3">
          <div className="container">
            <nav className="flex items-center gap-2 text-sm font-body text-muted-foreground">
              <Link to="/" className="hover:text-primary transition-colors">الرئيسية</Link>
              <ChevronLeft className="w-4 h-4" />
              {product.category && (
                <>
                  <Link to={`/category/${product.category_id}`} className="hover:text-primary transition-colors">
                    {product.category.name_ar}
                  </Link>
                  <ChevronLeft className="w-4 h-4" />
                </>
              )}
              <span className="text-foreground">{product.name_ar || ''}</span>            </nav>
          </div>
        </div>

        {/* Product Details */}
        <section className="py-8 md:py-12">
          <div className="container">
            <div className="grid md:grid-cols-2 gap-8 md:gap-12">
              {/* Image Gallery */}
              <div className="space-y-4">
                <div className="aspect-square rounded-xl overflow-hidden bg-muted">
                  <img
                    src={product.image || '/placeholder.svg'}
                    alt={product.name_ar || ''}
                    className="w-full h-full object-cover"
                  />
                </div>
                {/* Badges */}
                <div className="flex flex-wrap gap-2">
                  {product.is_new && <span className="badge-new">جديد</span>}
                  {product.is_promo && <span className="badge-promo">عرض خاص</span>}
                  {product.is_best_seller && (
                    <span className="bg-secondary text-secondary-foreground px-3 py-1 text-sm font-medium rounded-full">
                      الأكثر مبيعاً
                    </span>
                  )}
                  {product.is_featured && (
                    <span className="bg-purple-100 text-purple-800 px-3 py-1 text-sm font-medium rounded-full">
                      منتج مميز
                    </span>
                  )}
                </div>
              </div>

              {/* Product Info */}
              <div className="space-y-6">
                <div>
                  <h1 className="text-3xl md:text-4xl font-arabic-display font-bold text-secondary mb-2">
                    {product.name_ar || ''}
                  </h1>
                  <p className="text-lg font-french text-muted-foreground">
                    {product.name_fr}
                  </p>
                </div>

                {/* Price */}
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl font-bold text-primary" dir="ltr">
                    {displayPrice} د.ج
                  </span>
                  {product.original_price && !selectedWeight && (
                    <span className="text-xl text-muted-foreground line-through" dir="ltr">
                      {product.original_price} د.ج
                    </span>
                  )}
                  <span className="text-muted-foreground">/ {selectedWeight?.weight}</span>
                </div>

                {/* Weight Selector */}
                {hasWeightOptions && product.weights && (
                  <div className="border-t border-border pt-6">
                    <h3 className="text-lg font-arabic font-semibold mb-3">اختر الوزن</h3>
                    <div className="flex flex-wrap gap-2">
                      {product.weights.map((weight) => (
                        <button
                          key={weight.id}
                          onClick={() => setSelectedWeightId(weight.id)}
                          className={`px-4 py-2 rounded-lg border-2 transition-all ${selectedWeightId === weight.id
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-border hover:border-primary/50'
                            }`}
                        >
                          <span className="font-medium">{weight.weight}</span>
                          <span className="text-sm text-muted-foreground mr-2">- {weight.price} د.ج</span>
                        </button>
                      ))}
                    </div>
                    {!selectedWeightId && (
                      <p className="text-sm text-amber-600 mt-2">يرجى اختيار الوزن</p>
                    )}
                  </div>
                )}



                {/* Description */}
                <div className="border-t border-border pt-6">
                  <h3 className="text-lg font-arabic font-semibold mb-2">الوصف</h3>
                  <p className="font-body text-muted-foreground leading-relaxed">
                    {product.description_ar}
                  </p>

                </div>

                {/* Quantity & Add to Cart */}
                <div className="space-y-4 pt-4">
                  <div className="flex items-center gap-4">
                    <span className="font-body">الكمية:</span>
                    <div className="flex items-center border border-border rounded-lg">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="p-3 hover:bg-muted transition-colors"
                        disabled={quantity <= 1}
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-12 text-center font-body">{quantity}</span>
                      <button
                        onClick={() => setQuantity(quantity + 1)}
                        className="p-3 hover:bg-muted transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <Button
                    size="lg"
                    className="w-full font-body text-lg"
                    onClick={handleAddToCart}
                    disabled={hasWeightOptions && !selectedWeightId}
                  >
                    <ShoppingCart className="w-5 h-5 ml-2" />
                    أضف للسلة
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="py-12 bg-muted/50">
            <div className="container">
              <h2 className="text-2xl font-arabic-display font-bold text-secondary mb-6">
                منتجات مشابهة
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                {relatedProducts.map((p) => {
                  const cardProduct = {
                    id: p.id,
                    nameAr: p.name_ar,
                    nameFr: p.name_fr,
                    price: p.price,
                    image: p.image || '/placeholder.svg',
                    category: p.category?.name_fr || '',
                    descriptionAr: p.description_ar || '',


                    isNew: p.is_new || false,
                    isPromo: p.is_promo || false,
                    isBestSeller: p.is_best_seller || false,
                    isFeatured: p.is_featured || false,
                  };
                  return <ProductCard key={p.id} product={cardProduct} />;
                })}
              </div>
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default ProductDetails;
