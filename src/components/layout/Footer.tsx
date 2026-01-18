import { Phone, Mail, MapPin, Facebook, Instagram } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-secondary text-secondary-foreground">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <h3 className="text-xl font-arabic-display font-bold mb-4">طاحونة البدر</h3>
            <p className="text-sm font-body leading-relaxed opacity-90">
              طاحونة البدر هي وجهتكم الأولى للتوابل والأعشاب الطبيعية. نقدم لكم منتجات أصيلة بجودة عالية من الجزائر، مع التزامنا بالمحافظة على الطرق التقليدية في التحضير.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-arabic font-bold mb-4">روابط سريعة</h3>
            <ul className="space-y-2 font-body text-sm">
              <li>
                <a href="/" className="hover:text-primary transition-colors">الرئيسية</a>
              </li>
              <li>
                <a href="#spices" className="hover:text-primary transition-colors">التوابل</a>
              </li>
              <li>
                <a href="#herbs" className="hover:text-primary transition-colors">الأعشاب</a>
              </li>
              <li>
                <a href="#about" className="hover:text-primary transition-colors">من نحن</a>
              </li>
              <li>
                <a href="#contact" className="hover:text-primary transition-colors">اتصل بنا</a>
              </li>
            </ul>
          </div>


          {/* Contact */}
          <div>
            <h3 className="text-lg font-arabic font-bold mb-4">اتصل بنا</h3>
            <ul className="space-y-3 font-body text-sm">
              <li className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-primary flex-shrink-0" />
                <a href="https://maps.app.goo.gl/N45Q79s4Xfm2tFm69?g_st=ipc" target="_blank" rel="noopener noreferrer">
                  شارع التحرير، رقم 45 الجزائر العاصمة، الجزائر
                </a>
              </li>
              <li className="flex items-center gap-3" dir="ltr">
                <Phone className="w-5 h-5 text-primary flex-shrink-0" />
                <span>0660 40 85 20</span>
              </li>
              <li className="flex items-center gap-3" dir="ltr">
                <Mail className="w-5 h-5 text-primary flex-shrink-0" />
                <span>moulinalbadr@gmail.com</span>
              </li>
            </ul>
            
            {/* Social */}
            <div className="flex items-center gap-4 mt-6">
              <a 
                href="https://www.facebook.com/share/1WDFD5GEc9/?mibextid=wwXIfr" 
                className="w-10 h-10 rounded-full bg-secondary-foreground/10 flex items-center justify-center hover:bg-primary transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a 
                href="https://www.instagram.com/moulin_albadr?igsh=bnRweGF5a2pqZmN4" 
                className="w-10 h-10 rounded-full bg-secondary-foreground/10 flex items-center justify-center hover:bg-primary transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-secondary-foreground/20 mt-8 pt-6 text-center">
          <p className="text-sm font-body opacity-80">
            © {new Date().getFullYear()} طاحونة البدر. جميع الحقوق محفوظة.
          </p>
          <p className="text-xs font-french opacity-60 mt-1">
            Tous droits réservés - Tahounat Al Badr
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
