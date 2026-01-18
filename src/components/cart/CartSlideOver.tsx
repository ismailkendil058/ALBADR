import { X, Plus, Minus, ShoppingBag, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/CartContext';

const CartSlideOver = () => {
  const { items, isCartOpen, setIsCartOpen, removeItem, updateQuantity, totalPrice } = useCart();

  if (!isCartOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-foreground/40 z-50 animate-fade-in"
        onClick={() => setIsCartOpen(false)}
      />
      
      {/* Slide Over */}
      <div className="fixed left-0 top-0 h-full w-full max-w-md bg-card z-50 shadow-xl animate-slide-in-left">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h2 className="text-xl font-arabic font-bold text-foreground">
              سلة التسوق
            </h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsCartOpen(false)}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <ShoppingBag className="w-16 h-16 text-muted-foreground mb-4" />
                <p className="text-lg font-body text-muted-foreground">
                  سلة التسوق فارغة
                </p>
                <p className="text-sm font-french text-muted-foreground mt-1">
                  Votre panier est vide
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {items.map((item) => (
                  <div 
                    key={item.product.id}
                    className="flex gap-3 p-3 bg-muted rounded-lg"
                  >
                    <img
                      src={item.product.image}
                      alt={item.product.nameAr}
                      className="w-20 h-20 object-cover rounded-md"
                    />
                    <div className="flex-1">
                      <h3 className="font-arabic font-medium text-foreground">
                        {item.product.nameAr}
                      </h3>
                      <p className="text-sm font-french text-muted-foreground">
                        {item.product.nameFr}
                      </p>
                      <p className="text-primary font-bold mt-1" dir="ltr">
                        {item.product.price} د.ج
                      </p>
                    </div>
                    <div className="flex flex-col items-end justify-between">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => removeItem(item.product.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                      <div className="flex items-center gap-2 bg-card rounded-md border border-border">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        >
                          <Minus className="w-3 h-3" />
                        </Button>
                        <span className="w-6 text-center font-body">
                          {item.quantity}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        >
                          <Plus className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {items.length > 0 && (
            <div className="p-4 border-t border-border bg-muted">
              <div className="flex items-center justify-between mb-4">
                <span className="font-arabic text-lg">المجموع:</span>
                <span className="text-xl font-bold text-primary" dir="ltr">
                  {totalPrice.toFixed(2)} د.ج
                </span>
              </div>
              <Link to="/checkout" onClick={() => setIsCartOpen(false)}>
                <Button className="w-full font-body text-lg py-6">
                  إتمام الطلب
                </Button>
              </Link>
              <Button 
                variant="outline" 
                className="w-full mt-2 font-french"
                onClick={() => setIsCartOpen(false)}
              >
                Continuer mes achats
              </Button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default CartSlideOver;
