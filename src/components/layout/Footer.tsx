import { Phone, Mail, MapPin, Facebook, Instagram } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-secondary text-secondary-foreground">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 text-center">
          {/* About */}
          <div className="flex flex-col items-center">
            <img
              src="/Al Badr Logo HQ Transparent.png"
              alt="طاحونة البدر"
              className="h-32 md:h-48 w-auto object-contain mb-6"
            />
            <p className="text-sm font-body leading-relaxed opacity-90 max-w-sm">
              طاحونة البدر هي وجهتكم الأولى للتوابل والأعشاب الطبيعية. نقدم لكم منتجات أصيلة بجودة عالية من الجزائر، مع التزامنا بالمحافظة على الطرق التقليدية في التحضير.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-arabic font-bold mb-6">روابط سريعة</h3>
            <ul className="space-y-3 font-body text-sm">
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
          <div className="flex flex-col items-center">
            <h3 className="text-lg font-arabic font-bold mb-6">اتصل بنا</h3>
            <ul className="space-y-4 font-body text-sm flex flex-col items-center">
              <li className="flex items-center gap-3 justify-center" dir="ltr">
                <MapPin className="w-5 h-5 text-primary flex-shrink-0" />
                <a href="https://maps.app.goo.gl/N45Q79s4Xfm2tFm69?g_st=ipc" target="_blank" rel="noopener noreferrer">
                  Laghouat, Algeria
                </a>
              </li>
              <li className="flex items-center gap-3 justify-center" dir="ltr">
                <Phone className="w-5 h-5 text-primary flex-shrink-0" />
                <a href="tel:+213660408520" className="hover:text-primary transition-colors">0660 40 85 20</a>
              </li>
              <li className="flex items-center gap-3 justify-center" dir="ltr">
                <Mail className="w-5 h-5 text-primary flex-shrink-0" />
                <span>moulinalbadr@gmail.com</span>
              </li>
            </ul>

            {/* Social */}
            <div className="flex items-center gap-4 mt-8 justify-center">
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
