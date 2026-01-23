import React, { Suspense, lazy } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "@/context/CartContext";
import { WishlistProvider } from "@/context/WishlistContext";
import { AdminAuthProvider } from "@/context/AdminAuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import ScrollToTop from "@/components/ScrollToTop";
import { Loader2 } from 'lucide-react';

// Page-level loader
const FullPageLoader = () => (
  <div className="w-screen h-screen flex items-center justify-center">
    <Loader2 className="w-8 h-8 animate-spin text-primary" />
  </div>
);

// Lazy-loaded pages
const Index = lazy(() => import('./pages/Index'));
const ProductDetails = lazy(() => import('./pages/ProductDetails'));
const CategoryPage = lazy(() => import('./pages/CategoryPage'));
const SearchResults = lazy(() => import('./pages/SearchResults'));
const AllProducts = lazy(() => import('./pages/AllProducts'));
const AboutUs = lazy(() => import('./pages/AboutUs'));
const ContactUs = lazy(() => import('./pages/ContactUs'));
const Checkout = lazy(() => import('./pages/Checkout'));
const NotFound = lazy(() => import('./pages/NotFound'));

// Lazy-loaded admin pages
const AdminLogin = lazy(() => import('./pages/admin/AdminLogin'));
const AdminLayout = lazy(() => import('./pages/admin/AdminLayout'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminTarifs = lazy(() => import('./pages/admin/AdminTarifs'));
const AdminOrders = lazy(() => import('./pages/admin/AdminOrders'));
const AdminProducts = lazy(() => import('./pages/admin/AdminProducts'));
const AdminCategories = lazy(() => import('./pages/admin/AdminCategories'));

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <CartProvider>
        <WishlistProvider>
          <AdminAuthProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
              <ScrollToTop />
              <Suspense fallback={<FullPageLoader />}>
                <Routes>
                  {/* Storefront Routes */}
                  <Route path="/" element={<Index />} />
                  <Route path="/product/:id" element={<ProductDetails />} />
                  <Route path="/category/:categoryId" element={<CategoryPage />} />
                  <Route path="/search" element={<SearchResults />} />
                  <Route path="/products" element={<AllProducts />} />
                  <Route path="/about" element={<AboutUs />} />
                  <Route path="/contact" element={<ContactUs />} />
                  <Route path="/checkout" element={<Checkout />} />
                  
                  {/* Admin Routes */}
<Route path="/superadmin/login" element={<AdminLogin />} />
              
              {/* Protected Admin Routes */}
              <Route path="/superadmin" element={<AdminLayout />}>
                      <Route index element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
                      <Route path="tarifs" element={<ProtectedRoute><AdminTarifs /></ProtectedRoute>} />
                      <Route path="orders" element={<ProtectedRoute><AdminOrders /></ProtectedRoute>} />
                      <Route path="products" element={<ProtectedRoute><AdminProducts /></ProtectedRoute>} />
                      <Route path="categories" element={<ProtectedRoute><AdminCategories /></ProtectedRoute>} />
                    </Route>
                  
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </BrowserRouter>
          </AdminAuthProvider>
        </WishlistProvider>
      </CartProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
