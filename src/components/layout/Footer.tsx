import { Phone, Mail, MapPin, Facebook, Instagram } from 'lucide-react';
import { useCMS } from '@/context/CMSContext';

const Footer = () => {
  const { content } = useCMS();
  const { logo, aboutText, contactInfo, socialMedia } = content.footer;

  const getSocialIcon = (platform: string) => {
    switch (platform) {
      case 'facebook': return <Facebook className="w-5 h-5" />;
      case 'instagram': return <Instagram className="w-5 h-5" />;
      default: return null;
    }
  };

  return (
    <footer className="bg-secondary text-secondary-foreground">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 text-center">
          {/* About */}
          <div className="flex flex-col items-center">
            <img
              src={logo || "/Al Badr Logo HQ Transparent.png"}
              alt="طاحونة البدر"
              className="h-32 md:h-48 w-auto object-contain mb-6"
            />
            <p className="text-sm font-body leading-relaxed opacity-90 max-w-sm">
              {aboutText || "طاحونة البدر هي وجهتكم الأولى للتوابل والأعشاب الطبيعية. نقدم لكم منتجات أصيلة بجودة عالية من الجزائر، مع التزامنا بالمحافظة على الطرق التقليدية في التحضير."}
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
                <a href="/products" className="hover:text-primary transition-colors">منتجاتنا</a>
              </li>
              <li>
                <a href="/about" className="hover:text-primary transition-colors">من نحن</a>
              </li>
              <li>
                <a href="/contact" className="hover:text-primary transition-colors">اتصل بنا</a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="flex flex-col items-center">
            <h3 className="text-lg font-arabic font-bold mb-6">اتصل بنا</h3>
            <ul className="space-y-4 font-body text-sm flex flex-col items-center">
              <li className="flex items-center gap-3 justify-center" dir="ltr">
                <MapPin className="w-5 h-5 text-primary flex-shrink-0" />
                <a href={contactInfo.addressLink || "#"} target="_blank" rel="noopener noreferrer">
                  {contactInfo.address || "Laghouat, Algeria"}
                </a>
              </li>
              <li className="flex items-center gap-3 justify-center" dir="ltr">
                <Phone className="w-5 h-5 text-primary flex-shrink-0" />
                <a href={`tel:${contactInfo.phone}`} className="hover:text-primary transition-colors">
                  {contactInfo.phone || "0660 40 85 20"}
                </a>
              </li>
              <li className="flex items-center gap-3 justify-center" dir="ltr">
                <Mail className="w-5 h-5 text-primary flex-shrink-0" />
                <span>{contactInfo.email || "moulinalbadr@gmail.com"}</span>
              </li>
            </ul>

            {/* Social */}
            {socialMedia.length > 0 && (
              <div className="flex items-center gap-4 mt-8 justify-center">
                {socialMedia.map((social) => (
                  <a
                    key={social.id}
                    href={social.url}
                    className="w-10 h-10 rounded-full bg-secondary-foreground/10 flex items-center justify-center hover:bg-primary transition-colors"
                    aria-label={social.platform}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {getSocialIcon(social.platform)}
                  </a>
                ))}
              </div>
            )}
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
