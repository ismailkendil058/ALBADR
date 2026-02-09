import React, { Suspense, lazy } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { CartProvider } from "@/context/CartContext";
import { WishlistProvider } from "@/context/WishlistContext";
import { AdminAuthProvider } from "@/context/AdminAuthContext";
import { EmployeeAuthProvider } from "@/context/EmployeeAuthContext";
import { CMSProvider } from "@/context/CMSContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import ScrollToTop from "@/components/ScrollToTop";
import { Loader2 } from 'lucide-react';
import { HelmetProvider } from 'react-helmet-async';

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

// Lazy-loaded superadmin pages (from admin directory)
const SuperAdminLogin = lazy(() => import('./pages/admin/AdminLogin'));
const SuperAdminLayout = lazy(() => import('./pages/admin/AdminLayout'));
const SuperAdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const SuperAdminTarifs = lazy(() => import('./pages/admin/AdminTarifs'));
const SuperAdminOrders = lazy(() => import('./pages/admin/AdminOrders'));
const SuperAdminProducts = lazy(() => import('./pages/admin/AdminProducts'));
const SuperAdminCategories = lazy(() => import('./pages/admin/AdminCategories'));
const SuperAdminMessages = lazy(() => import('./pages/admin/AdminMessages'));
const SuperAdminAccess = lazy(() => import('./pages/admin/AdminAccess'));
const SuperAdminAnalytics = lazy(() => import('./pages/admin/AdminAnalytics'));
const SuperAdminCMS = lazy(() => import('./pages/admin/AdminCMS'));

// Lazy-loaded admin pages (formerly manager)
const AdminLogin = lazy(() => import('./pages/manager/ManagerLogin'));
const AdminLayout = lazy(() => import('./pages/manager/ManagerLayout'));
const AdminDashboard = lazy(() => import('./pages/manager/ManagerDashboard'));
const AdminTarifs = lazy(() => import('./pages/admin/AdminTarifs'));
const AdminOrders = lazy(() => import('./pages/admin/AdminOrders'));
const AdminProducts = lazy(() => import('./pages/admin/AdminProducts'));
const AdminCategories = lazy(() => import('./pages/admin/AdminCategories'));
const AdminMessages = lazy(() => import('./pages/admin/AdminMessages'));
const AdminAccess = lazy(() => import('./pages/admin/AdminAccess'));
const AdminAnalytics = lazy(() => import('./pages/admin/AdminAnalytics'));
const AdminCMS = lazy(() => import('./pages/admin/AdminCMS'));

import { PixelTracker } from "@/components/PixelTracker";

// Lazy-loaded employee pages
const EmployeeLogin = lazy(() => import('./pages/employee/EmployeeLogin'));
const EmployeeLayout = lazy(() => import('./pages/employee/EmployeeLayout'));
const EmployeeOrders = lazy(() => import('./pages/employee/EmployeeOrders'));

const queryClient = new QueryClient();

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <CMSProvider>
          <CartProvider>
            <WishlistProvider>
              <AdminAuthProvider>
                <EmployeeAuthProvider>
                  <Toaster />
                  <Sonner />
                  <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                    <ScrollToTop />
                    <PixelTracker />
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

                        {/* SuperAdmin Routes */}
                        <Route path="/superadmin/login" element={<SuperAdminLogin />} />
                        <Route element={<ProtectedRoute type="superadmin" />}>
                          <Route path="/superadmin" element={<SuperAdminLayout />}>
                            <Route index element={<SuperAdminDashboard />} />
                            <Route path="tarifs" element={<SuperAdminTarifs />} />
                            <Route path="orders" element={<SuperAdminOrders />} />
                            <Route path="products" element={<SuperAdminProducts />} />
                            <Route path="categories" element={<SuperAdminCategories />} />
                            <Route path="cms" element={<SuperAdminCMS />} />
                            <Route path="messages" element={<SuperAdminMessages />} />
                            <Route path="access" element={<SuperAdminAccess />} />
                            <Route path="analytics" element={<SuperAdminAnalytics />} />
                          </Route>
                        </Route>

                        {/* Admin Routes (formerly Manager) */}
                        <Route path="/admin/login" element={<AdminLogin />} />
                        <Route element={<ProtectedRoute type="admin" />}>
                          <Route path="/admin" element={<AdminLayout />}>
                            <Route index element={<AdminDashboard />} />
                            <Route path="tarifs" element={<AdminTarifs />} />
                            <Route path="orders" element={<AdminOrders />} />
                            <Route path="products" element={<AdminProducts />} />
                            <Route path="categories" element={<AdminCategories />} />
                            <Route path="messages" element={<AdminMessages />} />
                            <Route path="access" element={<AdminAccess />} />
                            <Route path="analytics" element={<AdminAnalytics />} />
                          </Route>
                        </Route>

                        {/* Employee Routes */}
                        <Route path="/employee/login" element={<EmployeeLogin />} />
                        <Route element={<ProtectedRoute type="employee" />}>
                          <Route path="/employee" element={<EmployeeLayout />}>
                            <Route index element={<Navigate to="/employee/orders" replace />} />
                            <Route path="orders" element={<EmployeeOrders />} />
                          </Route>
                        </Route>

                        <Route path="*" element={<NotFound />} />
                      </Routes>
                    </Suspense>
                  </BrowserRouter>
                </EmployeeAuthProvider>
              </AdminAuthProvider>
            </WishlistProvider>
          </CartProvider>
        </CMSProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
