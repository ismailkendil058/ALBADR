import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ChevronLeft,
  Truck,
  Building2,
  Store,
  CheckCircle,
  MapPin,
  Phone,
  Package,
  CalendarIcon,
} from 'lucide-react';
import { format, startOfDay } from 'date-fns';
import { arDZ } from 'date-fns/locale';
import TopBar from '@/components/layout/TopBar';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCart } from '@/context/CartContext';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { useCreateOrder, DeliveryType, OrderStatus } from '@/hooks/useOrders'; // Import useCreateOrder
import { useWilayaTariffs } from '@/hooks/useTariffs';

const WILAYAS = [
  "01 - أدرار", "02 - الشلف", "03 - الأغواط", "04 - أم البواقي", "05 - باتنة",
  "06 - بجاية", "07 - بسكرة", "08 - بشار", "09 - البليدة", "10 - البويرة",
  "11 - تمنراست", "12 - تبسة", "13 - تلمسان", "14 - تيارت", "15 - تيزي وزو",
  "16 - الجزائر", "17 - الجلفة", "18 - جيجل", "19 - سطيف", "20 - سعيدة",
  "21 - سكيكدة", "22 - سيدي بلعباس", "23 - عنابة", "24 - قالمة", "25 - قسنطينة",
  "26 - المدية", "27 - مستغانم", "28 - المسيلة", "29 - معسكر", "30 - ورقلة",
  "31 - وهران", "32 - البيض", "33 - إليزي", "34 - برج بوعريريج", "35 - بومرداس",
  "36 - الطارف", "37 - تندوف", "38 - تيسمسيلت", "39 - الوادي", "40 - خنشلة",
  "41 - سوق أهراس", "42 - تيبازة", "43 - ميلة", "44 - عين الدفلى", "45 - النعامة",
  "46 - عين تموشنت", "47 - غرداية", "48 - غليزان", "49 - تيميمون", "50 - برج باجي مختار",
  "51 - أولاد جلال", "52 - بني عباس", "53 - عين صالح", "54 - عين قزام", "55 - تقرت",
  "56 - جانت", "57 - المغير", "58 - المنيعة"
];

const STORES = [
  {
    id: 'laghouat',
    name: 'Laghouat',
    nameAr: 'الأغواط',
    wilaya: 'الأغواط',
    phone: '0555 123 456',
    address: 'شارع الأمير عبد القادر، الأغواط'
  },
  {
    id: 'aflou',
    name: 'Aflou',
    nameAr: 'أفلو',
    wilaya: 'الأغواط',
    phone: '0555 789 012',
    address: 'حي النصر، أفلو'
  }
];

type DeliveryMethod = 'home' | 'bureau' | 'pickup';

type CheckoutFormData = {
  firstName: string;
  phone: string;
  wilaya: string;
  deliveryMethod: DeliveryMethod;
  address: string;
  selectedStore: string;
  pickupDate?: Date;
};

const Checkout = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { items, totalPrice, clearCart, isLoading } = useCart();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderNumber, setOrderNumber] = useState<string | null>(null);

  const createOrder = useCreateOrder(); // Instantiate the hook

  const [formData, setFormData] = useState<CheckoutFormData>({
    firstName: '',
    phone: '',
    wilaya: '',
    deliveryMethod: 'home',
    address: '',
    selectedStore: '',
    pickupDate: undefined,
  });

  const selectedWilayaCode = formData.wilaya
    ? parseInt(formData.wilaya.split(' - ')[0], 10)
    : undefined;

  const { data: wilayaTariffs, isLoading: tariffsLoading, isError: tariffsError } =
    useWilayaTariffs(selectedWilayaCode);

  const deliveryPrices = useMemo(() => {
    if (!wilayaTariffs) return { home: null, bureau: null, homeStore: 'laghouat', bureauStore: 'laghouat' };

    const homePrices = wilayaTariffs.map(t => ({ price: t.home_price, store: t.store })).filter(p => p.price !== null);
    const bureauPrices = wilayaTariffs.map(t => ({ price: t.bureau_price, store: t.store })).filter(p => p.price !== null);

    const cheapestHome = homePrices.length > 0 ? homePrices.reduce((prev, curr) => (prev.price < curr.price ? prev : curr)) : null;
    const cheapestBureau = bureauPrices.length > 0 ? bureauPrices.reduce((prev, curr) => (prev.price < curr.price ? prev : curr)) : null;

    return {
      home: cheapestHome?.price || null,
      bureau: cheapestBureau?.price || null,
      homeStore: cheapestHome?.store || 'laghouat',
      bureauStore: cheapestBureau?.store || 'laghouat',
    };
  }, [wilayaTariffs]);

  const deliveryFee = useMemo(() => {
    if (formData.deliveryMethod === 'pickup') return 0;
    if (tariffsLoading) return 0;
    if (formData.deliveryMethod === 'home') return deliveryPrices.home ?? 0;
    if (formData.deliveryMethod === 'bureau') return deliveryPrices.bureau ?? 0;
    return 0;
  }, [formData.deliveryMethod, deliveryPrices, tariffsLoading]);

  const finalTotal = totalPrice + deliveryFee;

  const selectedStoreInfo = STORES.find((store) => store.id === formData.selectedStore);

  const today = useMemo(() => startOfDay(new Date()), []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.firstName || !formData.phone) {
      toast({
        title: "خطأ",
        description: "يرجى ملء جميع الحقول المطلوبة",
        variant: "destructive"
      });
      return;
    }

    if (formData.deliveryMethod !== 'pickup' && !formData.wilaya) {
      toast({
        title: "خطأ",
        description: "يرجى اختيار الولاية",
        variant: "destructive"
      });
      return;
    }

    if (formData.deliveryMethod === 'home' && !formData.address) {
      toast({
        title: "خطأ",
        description: "يرجى إدخال عنوان التوصيل",
        variant: "destructive"
      });
      return;
    }

    if (formData.deliveryMethod === 'pickup' && !formData.selectedStore) {
      toast({
        title: "خطأ",
        description: "يرجى اختيار المتجر",
        variant: "destructive",
      });
      return;
    }

    if (formData.deliveryMethod === 'pickup' && !formData.pickupDate) {
      toast({
        title: "خطأ",
        description: "يرجى اختيار تاريخ الاستلام",
        variant: "destructive",
      });
      return;
    }

    // If delivery is not pickup, and delivery fee is still loading or an error occurred, prevent submission
    if (formData.deliveryMethod !== 'pickup' && (tariffsLoading || tariffsError)) {
        toast({
            title: "خطأ",
            description: "جاري حساب سعر التوصيل. يرجى المحاولة مرة أخرى.",
            variant: "destructive"
        });
        return;
    }

    setIsSubmitting(true);

    try {
      let wilayaCode: number | null = null;
      let wilayaName: string | null = null;

      if (formData.deliveryMethod === 'pickup' && selectedStoreInfo) {
        // For pickup, get wilaya from the selected store
        const storeWilaya = WILAYAS.find(w => w.includes(selectedStoreInfo.wilaya));
        if (storeWilaya) {
          wilayaCode = parseInt(storeWilaya.split(' - ')[0], 10);
          wilayaName = storeWilaya.split(' - ')[1];
        }
      } else if (formData.wilaya) {
        // For home or bureau delivery, get wilaya from form data
        wilayaCode = parseInt(formData.wilaya.split(' - ')[0], 10);
        wilayaName = formData.wilaya.split(' - ')[1];
      }

      if (wilayaCode === null || wilayaName === null) {
        toast({
          title: "خطأ",
          description: "تعذر تحديد معلومات الولاية. يرجى التحقق من تحديد الولاية أو المتجر بشكل صحيح.",
          variant: "destructive"
        });
        setIsSubmitting(false);
        return;
      }
      
      // Determine sending store based on cheapest delivery
      let sendFromStoreId: string;
      if (formData.deliveryMethod === 'pickup') {
        sendFromStoreId = formData.selectedStore;
      } else if (formData.deliveryMethod === 'home') {
        sendFromStoreId = deliveryPrices.homeStore;
      } else {
        sendFromStoreId = deliveryPrices.bureauStore;
      }

      const orderPayload = {
        customer_name: formData.firstName,
        customer_phone: formData.phone,
        wilaya_code: wilayaCode,
        wilaya_name: wilayaName,
        address: formData.deliveryMethod === 'home' ? formData.address : null,
        delivery_type: formData.deliveryMethod,
        delivery_price: deliveryFee,
        subtotal: totalPrice,
        total: finalTotal,
        status: 'new' as OrderStatus, // Default status
        send_from_store: sendFromStoreId,
        notes: formData.deliveryMethod === 'pickup' && formData.pickupDate 
          ? `Pickup on: ${format(formData.pickupDate, 'yyyy-MM-dd')}` 
          : null,
      };

      const orderItemsPayload = items.map(item => ({
        product_id: item.product.id,
        product_name_ar: item.product.nameAr || item.product.nameFr || 'Unnamed Product (AR)',
        product_name_fr: item.product.nameFr || item.product.nameAr || 'Unnamed Product (FR)',
        quantity: item.quantity,
        unit_price: item.product.price,
        weight: item.selectedWeight?.weight || item.weight || null,
        total_price: item.product.price * item.quantity,
      }));

      const newOrder = await createOrder.mutateAsync({
        order: orderPayload,
        items: orderItemsPayload,
      });

      setOrderPlaced(true);
      setOrderNumber(newOrder.order_number);
      clearCart();
      toast({
        title: "نجاح",
        description: "تم تأكيد طلبك بنجاح!",
        variant: "success",
      });

    } catch (error: any) {
      console.error("Order submission error:", error);
      toast({
        title: "خطأ",
        description: `فشل تأكيد الطلب: ${error.message || "حدث خطأ غير معروف"}`,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <TopBar />
        <Header />
        <main className="flex-1 container py-8">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Skeleton className="h-48 w-full" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-64 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
            <div className="lg:col-span-1">
              <Skeleton className="h-96 w-full" />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (items.length === 0 && !orderPlaced) {
    return (
      <div className="min-h-screen flex flex-col">
        <TopBar />
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-arabic-display mb-4">سلة التسوق فارغة</h1>
            <Link to="/" className="text-primary hover:underline font-body">
              العودة للتسوق
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (orderPlaced) {
    return (
      <div className="min-h-screen flex flex-col">
        <TopBar />
        <Header />
        <main className="flex-1 flex items-center justify-center py-16">
          <div className="text-center max-w-md mx-auto px-4">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h1 className="text-2xl md:text-3xl font-arabic-display font-bold text-secondary mb-4">
              تم تأكيد طلبك بنجاح! {orderNumber && `(رقم الطلب: ${orderNumber})`}
            </h1>
            <p className="text-muted-foreground font-body mb-6">
              شكراً لك على طلبك. سنتواصل معك قريباً لتأكيد التفاصيل.
              {orderNumber && ` رقم طلبك هو: ${orderNumber}.`}
            </p>
            <Button onClick={() => navigate('/')} className="font-body">
              العودة للرئيسية
            </Button>
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
        {/* Breadcrumb */}
        <div className="bg-muted/50 py-3">
          <div className="container">
            <nav className="flex items-center gap-2 text-sm font-body text-muted-foreground">
              <Link to="/" className="hover:text-primary transition-colors">الرئيسية</Link>
              <ChevronLeft className="w-4 h-4" />
              <span className="text-foreground">تأكيد الطلب</span>
            </nav>
          </div>
        </div>

        {/* Checkout Content */}
        <section className="py-8 md:py-12">
          <div className="container">
            <h1 className="text-2xl md:text-3xl font-arabic-display font-bold text-secondary mb-8">
              تأكيد الطلب
            </h1>

            <div className="grid lg:grid-cols-3 gap-8">
              {/* Form */}
              <div className="lg:col-span-2">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Customer Info */}
                  <div className="bg-card rounded-xl p-6 border border-border">
                    <h2 className="text-xl font-arabic font-semibold mb-4">معلومات الزبون</h2>
                    
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block font-body text-sm mb-2">الاسم <span className="text-primary">*</span></label>
                        <Input
                          type="text"
                          value={formData.firstName}
                          onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                          placeholder="أدخل اسمك"
                          required
                          className="font-body"
                        />
                      </div>

                      <div>
                        <label className="block font-body text-sm mb-2">رقم الهاتف <span className="text-primary">*</span></label>
                        <Input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          placeholder="0555 123 456"
                          required
                          className="font-body"
                          dir="ltr"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Wilaya Selection - Only show if not pickup */}
                  {formData.deliveryMethod !== 'pickup' && (
                    <div className="bg-card rounded-xl p-6 border border-border">
                      <h2 className="text-xl font-arabic font-semibold mb-4">الولاية <span className="text-primary">*</span></h2>
                      
                      <Select
                        value={formData.wilaya}
                        onValueChange={(value) => setFormData({ ...formData, wilaya: value })}
                      >
                        <SelectTrigger className="w-full font-body">
                          <SelectValue placeholder="اختر الولاية" />
                        </SelectTrigger>
                        <SelectContent className="max-h-[300px]">
                          {WILAYAS.map((wilaya) => (
                            <SelectItem key={wilaya} value={wilaya} className="font-body">
                              {wilaya}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* Delivery Method */}
                  <div className="bg-card rounded-xl p-6 border border-border">
                    <h2 className="text-xl font-arabic font-semibold mb-4">طريقة التوصيل</h2>
                    
                    <div className="grid sm:grid-cols-3 gap-4">
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, deliveryMethod: 'home', selectedStore: '' })}
                        className={`p-4 rounded-lg border-2 transition-all text-right ${
                          formData.deliveryMethod === 'home'
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <Truck className={`w-8 h-8 mb-2 ${formData.deliveryMethod === 'home' ? 'text-primary' : 'text-muted-foreground'}`} />
                        <h3 className="font-arabic font-semibold">توصيل للمنزل</h3>
                        <p className="text-sm text-muted-foreground font-body">Livraison à domicile</p>
                        {formData.wilaya && deliveryPrices.home !== null && !tariffsLoading ? (
                          <p className="text-primary font-bold mt-2" dir="ltr">{deliveryPrices.home} د.ج <span className="text-muted-foreground text-sm">({STORES.find(s => s.id === deliveryPrices.homeStore)?.nameAr})</span></p>
                        ) : (
                          <p className="text-muted-foreground font-body mt-2">{tariffsLoading ? 'جاري الحساب...' : 'اختر الولاية'}</p>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, deliveryMethod: 'bureau', address: '', selectedStore: '' })}
                        className={`p-4 rounded-lg border-2 transition-all text-right ${
                          formData.deliveryMethod === 'bureau'
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <Building2 className={`w-8 h-8 mb-2 ${formData.deliveryMethod === 'bureau' ? 'text-primary' : 'text-muted-foreground'}`} />
                        <h3 className="font-arabic font-semibold">مكتب التوصيل</h3>
                        <p className="text-sm text-muted-foreground font-body">Bureau</p>
                        {formData.wilaya && deliveryPrices.bureau !== null && !tariffsLoading ? (
                          <p className="text-primary font-bold mt-2" dir="ltr">{deliveryPrices.bureau} د.ج <span className="text-muted-foreground text-sm">({STORES.find(s => s.id === deliveryPrices.bureauStore)?.nameAr})</span></p>
                        ) : (
                          <p className="text-muted-foreground font-body mt-2">{tariffsLoading ? 'جاري الحساب...' : 'اختر الولاية'}</p>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, deliveryMethod: 'pickup', address: '', wilaya: '' })}
                        className={`p-4 rounded-lg border-2 transition-all text-right ${
                          formData.deliveryMethod === 'pickup'
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <Store className={`w-8 h-8 mb-2 ${formData.deliveryMethod === 'pickup' ? 'text-primary' : 'text-muted-foreground'}`} />
                        <h3 className="font-arabic font-semibold">استلام من المتجر</h3>
                        <p className="text-sm text-muted-foreground font-body">Retrait en magasin</p>
                        <p className="text-green-600 font-bold mt-2">مجاني</p>
                      </button>
                    </div>

                    {/* Address field - only shown for home delivery */}
                    {formData.deliveryMethod === 'home' && (
                      <div className="mt-4">
                        <label className="block font-body text-sm mb-2">
                          العنوان الكامل <span className="text-primary">*</span>
                        </label>
                        <Input
                          type="text"
                          value={formData.address}
                          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                          placeholder="الحي، الشارع، رقم المنزل..."
                          required
                          className="font-body"
                        />
                      </div>
                    )}

                    {/* Store Selection - only shown for pickup */}
                    {formData.deliveryMethod === 'pickup' && (
                      <div className="mt-4 space-y-4">
                        <div>
                          <label className="block font-body text-sm mb-2">
                            اختر المتجر <span className="text-primary">*</span>
                          </label>
                          <Select
                            value={formData.selectedStore}
                            onValueChange={(value) =>
                              setFormData({ ...formData, selectedStore: value })
                            }
                          >
                            <SelectTrigger className="w-full font-body">
                              <SelectValue placeholder="اختر المتجر" />
                            </SelectTrigger>
                            <SelectContent>
                              {STORES.map((store) => (
                                <SelectItem key={store.id} value={store.id} className="font-body">
                                  {store.name} - {store.nameAr}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <label className="block font-body text-sm mb-2">
                            تاريخ الاستلام <span className="text-primary">*</span>
                          </label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                type="button"
                                variant="outline"
                                className={`w-full justify-between font-body ${
                                  !formData.pickupDate ? 'text-muted-foreground' : ''
                                }`}
                              >
                                <span>
                                  {formData.pickupDate
                                    ? format(formData.pickupDate, 'PPP', { locale: arDZ })
                                    : 'اختر تاريخ الاستلام'}
                                </span>
                                <CalendarIcon className="h-4 w-4 opacity-50" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={formData.pickupDate}
                                onSelect={(date) => setFormData({ ...formData, pickupDate: date })}
                                disabled={(date) => date < today}
                                initialFocus
                                className="p-3 pointer-events-auto"
                              />
                            </PopoverContent>
                          </Popover>
                          <p className="mt-2 text-xs text-muted-foreground font-body">
                            يمكنك اختيار تاريخ الاستلام المناسب لك.
                          </p>
                        </div>

                        {/* Store Info Card */}
                        {selectedStoreInfo && (
                          <div className="bg-muted/50 rounded-lg p-4 border border-border">
                            <div className="flex items-start justify-between mb-3">
                              <h4 className="font-arabic font-semibold text-secondary">
                                معلومات المتجر
                              </h4>
                              <span className="bg-green-100 text-green-700 text-xs font-body px-2 py-1 rounded-full">
                                بدون مصاريف توصيل
                              </span>
                            </div>
                            
                            <div className="space-y-2 text-sm">
                              <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-primary flex-shrink-0" />
                                <span className="font-body">{selectedStoreInfo.nameAr}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Package className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                                <span className="font-body text-muted-foreground">ولاية {selectedStoreInfo.wilaya}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Phone className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                                <span className="font-body text-muted-foreground" dir="ltr">{selectedStoreInfo.phone}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Store className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                                <span className="font-body text-muted-foreground">استلام شخصي من المتجر</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Submit Button */}
                  <Button 
                    type="submit" 
                    size="lg" 
                    className="w-full font-body text-lg"
                    disabled={isSubmitting || createOrder.isPending} // Use createOrder.isPending
                  >
                    {isSubmitting || createOrder.isPending ? 'جاري تأكيد الطلب...' : 'تأكيد الطلب'}
                  </Button>
                </form>
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <div className="bg-card rounded-xl p-6 border border-border sticky top-24">
                  <h2 className="text-xl font-arabic font-semibold mb-4">ملخص الطلب</h2>
                  
                  {/* Products */}
                  <div className="space-y-4 mb-6">
                    {items.map((item) => (
                      <div key={item.selectedWeight ? `${item.product.id}-${item.selectedWeight.id}` : item.product.id} className="flex gap-3">
                        <img
                          src={item.product.image}
                          alt={item.product.nameAr}
                          className="w-16 h-16 rounded-lg object-cover"
                          decoding="async"
                        />
                        <div className="flex-1">
                          <h4 className="font-arabic text-sm font-medium line-clamp-1">
                            {item.product.nameAr}
                          </h4>
                          <p className="text-xs text-muted-foreground font-body">
                            الكمية: {item.quantity}
                          </p>
                          <p className="text-primary font-semibold text-sm" dir="ltr">
                            {item.product.price * item.quantity} د.ج
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Delivery Method Info */}
                  <div className="border-t border-border pt-4 mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      {formData.deliveryMethod === 'home' && <Truck className="w-4 h-4 text-primary" />}
                      {formData.deliveryMethod === 'bureau' && <Building2 className="w-4 h-4 text-primary" />}
                      {formData.deliveryMethod === 'pickup' && <Store className="w-4 h-4 text-primary" />}
                      <span className="font-body text-sm">
                        {formData.deliveryMethod === 'home' && 'توصيل للمنزل'}
                        {formData.deliveryMethod === 'bureau' && 'مكتب التوصيل'}
                        {formData.deliveryMethod === 'pickup' && 'استلام من المتجر'}
                      </span>
                    </div>
                    {formData.deliveryMethod === 'pickup' && (
                      <div className="mr-6 space-y-1">
                        {selectedStoreInfo && (
                          <p className="text-xs text-muted-foreground font-body">
                            {selectedStoreInfo.nameAr}
                          </p>
                        )}
                        {formData.pickupDate && (
                          <p className="text-xs text-muted-foreground font-body">
                            تاريخ الاستلام: {format(formData.pickupDate, 'PPP', { locale: arDZ })}
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="border-t border-border pt-4 space-y-2">
                    <div className="flex justify-between font-body">
                      <span className="text-muted-foreground">المجموع الفرعي</span>
                      <span dir="ltr">{totalPrice} د.ج</span>
                    </div>
                    <div className="flex justify-between font-body">
                      <span className="text-muted-foreground">التوصيل</span>
                      {formData.deliveryMethod === 'pickup' ? (
                        <span className="text-green-600 font-semibold">مجاني</span>
                      ) : (
                        <span dir="ltr">{deliveryFee} د.ج</span>
                      )}
                    </div>
                    <div className="flex justify-between font-arabic font-bold text-lg pt-2 border-t border-border">
                      <span>المجموع الكلي</span>
                      <span className="text-primary" dir="ltr">{finalTotal} د.ج</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Checkout;
