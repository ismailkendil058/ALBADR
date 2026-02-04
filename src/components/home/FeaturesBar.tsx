import { Truck, Shield, Clock, Award } from 'lucide-react';

const features = [
  {
    icon: Truck,
    titleAr: 'توصيل سريع',
    titleFr: 'Livraison Rapide',
    descriptionAr: 'توصيل لجميع الولايات',
  },
  {
    icon: Shield,
    titleAr: 'الدفع عند الاستلام',
    titleFr: 'Paiement à la livraison',
    descriptionAr: 'معاملات مشفرة',
  },
  {
    icon: Clock,
    titleAr: 'خدمة 24/7',
    titleFr: 'Service 24/7',
    descriptionAr: 'دعم متواصل',
  },
  {
    icon: Award,
    titleAr: 'جودة مضمونة',
    titleFr: 'Qualité Garantie',
    descriptionAr: 'منتجات طبيعية 100%',
  },
];

const FeaturesBar = () => {
  return (
    <section className="py-8 bg-muted border-y border-border">
      <div className="container">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div key={index} className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-arabic font-medium text-foreground">
                  {feature.titleAr}
                </h3>
                <p className="text-xs font-french text-muted-foreground">
                  {feature.titleFr}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesBar;
