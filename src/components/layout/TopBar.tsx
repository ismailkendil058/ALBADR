import { Phone, Facebook, Instagram } from 'lucide-react';
import { Link } from 'react-router-dom';

const TopBar = () => {
  return (
    <div className="bg-secondary text-secondary-foreground py-2">
      <div className="container flex items-center justify-between">
        <a href="tel:0660408520" className="flex items-center gap-2 font-body text-sm hover:text-primary transition-colors" dir="ltr">
          <Phone className="w-4 h-4" />
          <span>0660 40 85 20</span>
        </a>

        <div className="flex items-center gap-4">
          <a
            href="https://www.facebook.com/share/1WDFD5GEc9/?mibextid=wwXIfr"
            className="hover:text-primary transition-colors"
            aria-label="Facebook"
          >
            <Facebook className="w-4 h-4" />
          </a>
          <a
            href="https://www.instagram.com/moulin_albadr?igsh=bnRweGF5a2pqZmN4"
            className="hover:text-primary transition-colors"
            aria-label="Instagram"
          >
            <Instagram className="w-4 h-4" />
          </a>
          <Link to="/contact-us" className="text-sm font-french mr-4 hover:text-primary transition-colors">Contact</Link>
        </div>
      </div>
    </div>
  );
};

export default TopBar;
