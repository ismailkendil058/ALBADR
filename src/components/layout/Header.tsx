import { useState } from 'react';
import { Search, User, ShoppingCart, Menu, X, ChevronDown } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCart } from '@/context/CartContext';
import { useCategories } from '@/hooks/useCategories';
import CartSlideOver from '@/components/cart/CartSlideOver';

const Header = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { totalItems, totalPrice, setIsCartOpen } = useCart();
  const { categories, isLoading } = useCategories();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setIsMenuOpen(false);
    }
  };

  return (
    <header className="bg-card border-b border-border sticky top-0 z-50 shadow-header">
      <div className="container py-4">
        <div className="flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2">
            <img
              src="/Al Badr Logo HQ Transparent.png"
              alt="طاحونة البدر"
              className="h-14 md:h-12 w-auto object-contain transform transition-transform hover:scale-105 duration-300"
            />
          </Link>

          {/* Search Bar - Desktop */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-xl items-center gap-2">
            <div className="relative flex-1">
              <Input
                type="text"
                placeholder="البحث في المنتجات..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-10 pl-4 py-2 bg-muted border-border font-body"
              />
              <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2">
                <Search className="w-4 h-4 text-muted-foreground hover:text-primary transition-colors" />
              </button>
            </div>
          </form>

          {/* Actions */}
          <div className="flex items-center gap-3">

            <Button variant="ghost" size="sm" className="relative flex items-center gap-2 font-body text-foreground hover:text-primary" onClick={() => setIsCartOpen(true)}>
              <div className="relative">
                <ShoppingCart className="w-5 h-5" />
                {totalItems > 0 && <span className="cart-badge">{totalItems}</span>}
              </div>
              <span className="hidden lg:inline" dir="ltr">{totalPrice.toFixed(2)} د.ج</span>
            </Button>

            <Button variant="ghost" size="sm" className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Search */}
        <form onSubmit={handleSearch} className="md:hidden mt-3">
          <div className="relative">
            <Input type="text" placeholder="البحث في المنتجات..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pr-10 pl-4 py-2 bg-muted border-border font-body w-full" />
            <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2">
              <Search className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        </form>
      </div>

      {/* Navigation */}
      <nav className="bg-secondary text-secondary-foreground">
        <div className="container">
          <div className="hidden md:flex items-center">
            <div className="relative" onMouseEnter={() => setIsCategoryOpen(true)} onMouseLeave={() => setIsCategoryOpen(false)}>
              <button className="flex items-center gap-2 py-3 px-4 font-body bg-primary text-primary-foreground">
                <Menu className="w-5 h-5" />
                <span>جميع الأقسام</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${isCategoryOpen ? 'rotate-180' : ''}`} />
              </button>

              {isCategoryOpen && (
                <div className="absolute top-full right-0 w-64 bg-card border border-border rounded-b-lg shadow-xl z-50 animate-fade-in">
                  {isLoading ? (
                    <div className="px-4 py-3 font-body text-foreground">Loading categories...</div>
                  ) : (
                    categories?.map((category) => (
                      <Link
                        key={category.id}
                        to={`/category/${category.id}`}
                        className="flex items-center justify-between px-4 py-3 font-body hover:bg-muted transition-colors"
                      >
                        <span>
                          {category.name_ar} <span className="text-xs text-muted-foreground">- {category.name_fr}</span>
                        </span>
                        {category.products && category.products[0]?.count > 0 && (
                          <span className="text-muted-foreground text-sm">({category.products[0].count})</span>
                        )}
                      </Link>
                    ))
                  )}
                </div>
              )}
            </div>

            <Link to="/" className="py-3 px-4 font-body hover:text-primary transition-colors">الرئيسية</Link>
            <Link to="/about" className="py-3 px-4 font-body hover:text-primary transition-colors">من نحن</Link>
            <Link to="/contact" className="py-3 px-4 font-body hover:text-primary transition-colors">اتصل بنا</Link>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-card border-t border-border animate-slide-in-right">
          <div className="container py-4">
            <div className="space-y-2">
              {isLoading ? (
                <div className="px-4 py-3 font-body text-foreground">Loading categories...</div>
              ) : (
                categories?.map((category) => (
                  <Link key={category.id} to={`/category/${category.id}`} className={`flex items-center justify-between px-4 py-3 font-body hover:bg-muted rounded-lg transition-colors ${category.is_special ? 'border-r-4 border-primary bg-primary/5' : ''}`} onClick={() => setIsMenuOpen(false)}>
                    <span>
                      {category.name_ar} <span className="text-xs text-muted-foreground">- {category.name_fr}</span>
                    </span>
                    {category.products && category.products[0]?.count > 0 && (
                      <span className="text-muted-foreground text-sm">({category.products[0].count})</span>
                    )}
                  </Link>
                ))
              )}
              <hr className="border-border my-3" />
              <Link to="/" className="block px-4 py-3 font-body hover:bg-muted rounded-lg" onClick={() => setIsMenuOpen(false)}>الرئيسية</Link>
              <Link to="/about" className="block px-4 py-3 font-body hover:bg-muted rounded-lg" onClick={() => setIsMenuOpen(false)}>من نحن</Link>
              <Link to="/contact" className="block px-4 py-3 font-body hover:bg-muted rounded-lg" onClick={() => setIsMenuOpen(false)}>اتصل بنا</Link>
            </div>
          </div>
        </div>
      )}

      <CartSlideOver />
    </header>
  );
};

export default Header;
