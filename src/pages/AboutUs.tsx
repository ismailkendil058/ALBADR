import { Link } from 'react-router-dom';
import { ChevronLeft, Heart, Leaf, Shield, Users } from 'lucide-react';
import TopBar from '@/components/layout/TopBar';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

const AboutUs = () => {
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
              <span className="text-foreground">من نحن</span>
            </nav>
          </div>
        </div>

        {/* Hero Section */}
        <section className="py-12 md:py-16 bg-secondary/5">
          <div className="container">
            <div className="text-center max-w-3xl mx-auto">
              <h1 className="text-3xl md:text-4xl font-arabic-display font-bold text-secondary mb-4">
                من نحن
              </h1>
              <p className="text-lg font-french text-muted-foreground">
                À propos de Tahounat Al Badr
              </p>
            </div>
          </div>
        </section>

        {/* Story Section */}
        <section className="py-12 md:py-16">
          <div className="container">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl md:text-3xl font-arabic-display font-bold text-secondary mb-6">
                قصتنا
              </h2>
              <div className="prose prose-lg font-body text-muted-foreground space-y-4">
                <p>
                  تأسست طاحونة البدر على يد عائلة جزائرية عريقة تمتد جذورها في تجارة التوابل والأعشاب الطبيعية لأكثر من ثلاثة أجيال. بدأت الرحلة من طاحونة صغيرة في قلب المدينة القديمة، حيث كان جدنا يطحن التوابل يدوياً ويقدمها للعائلات الجزائرية.
                </p>
                <p>
                  اليوم، نفخر بأننا نحافظ على نفس التقاليد والجودة التي بدأ بها أجدادنا، مع تطوير أساليب العمل لنصل إلى كل بيت جزائري. نختار توابلنا وأعشابنا بعناية فائقة من أفضل المصادر المحلية والعالمية.
                </p>
                <p className="font-french text-base">
                  Notre histoire familiale dans le commerce des épices remonte à plus de trois générations. Nous perpétuons les traditions de qualité et d'authenticité qui ont fait notre réputation.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-12 md:py-16 bg-muted/50">
          <div className="container">
            <h2 className="text-2xl md:text-3xl font-arabic-display font-bold text-secondary text-center mb-12">
              قيمنا
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
              <div className="bg-card p-6 rounded-xl text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Leaf className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-arabic font-semibold text-lg mb-2">طبيعي 100%</h3>
                <p className="text-muted-foreground font-body text-sm">
                  جميع منتجاتنا طبيعية بالكامل بدون أي إضافات كيميائية
                </p>
              </div>

              <div className="bg-card p-6 rounded-xl text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-arabic font-semibold text-lg mb-2">جودة مضمونة</h3>
                <p className="text-muted-foreground font-body text-sm">
                  نختار أفضل المنتجات ونضمن جودتها قبل وصولها إليكم
                </p>
              </div>

              <div className="bg-card p-6 rounded-xl text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-arabic font-semibold text-lg mb-2">صنع بحب</h3>
                <p className="text-muted-foreground font-body text-sm">
                  نضع قلوبنا في كل منتج نقدمه لعائلتكم
                </p>
              </div>

              <div className="bg-card p-6 rounded-xl text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-arabic font-semibold text-lg mb-2">عائلة واحدة</h3>
                <p className="text-muted-foreground font-body text-sm">
                  نعتبر كل زبائننا جزءاً من عائلتنا الكبيرة
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Mission Section */}
        <section className="py-12 md:py-16">
          <div className="container">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-2xl md:text-3xl font-arabic-display font-bold text-secondary mb-6">
                رسالتنا
              </h2>
              <p className="text-xl font-body text-muted-foreground leading-relaxed">
                نسعى لإيصال أجود التوابل والأعشاب الطبيعية إلى كل بيت جزائري، مع الحفاظ على الموروث الثقافي والتقاليد الأصيلة التي تميز مطبخنا العريق.
              </p>
              <p className="font-french text-muted-foreground mt-4">
                Notre mission est d'apporter les meilleures épices naturelles à chaque foyer algérien, tout en préservant notre héritage culinaire authentique.
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default AboutUs;
