import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, Phone, Mail, MapPin, Clock, Send } from 'lucide-react';
import TopBar from '@/components/layout/TopBar';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

const ContactUs = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1000));

    toast({
      title: "تم إرسال رسالتك بنجاح",
      description: "سنتواصل معك في أقرب وقت ممكن",
    });

    setFormData({ name: '', phone: '', email: '', message: '' });
    setIsSubmitting(false);
  };

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
              <span className="text-foreground">اتصل بنا</span>
            </nav>
          </div>
        </div>

        {/* Hero Section */}
        <section className="py-12 md:py-16 bg-secondary/5">
          <div className="container">
            <div className="text-center max-w-3xl mx-auto">
              <h1 className="text-3xl md:text-4xl font-arabic-display font-bold text-secondary mb-4">
                اتصل بنا
              </h1>
              <p className="text-lg font-french text-muted-foreground">
                Contactez-nous
              </p>
            </div>
          </div>
        </section>

        {/* Contact Content */}
        <section className="py-12 md:py-16">
          <div className="container">
            <div className="grid md:grid-cols-2 gap-12">
              {/* Contact Info */}
              <div>
                <h2 className="text-2xl font-arabic-display font-bold text-secondary mb-6">
                  معلومات الاتصال
                </h2>
                
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <Phone className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-arabic font-semibold mb-1">الهاتف</h3>
                      <p className="text-muted-foreground font-body" dir="ltr">0660 40 85 20</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <Mail className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-arabic font-semibold mb-1">البريد الإلكتروني</h3>
                      <p className="text-muted-foreground font-body">moulinalbadr@gmail.com</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-arabic font-semibold mb-1">العنوان</h3>
                      <a 
                        href="https://maps.app.goo.gl/N45Q79s4Xfm2tFm69?g_st=ipc" 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-muted-foreground font-body hover:text-primary transition-colors"
                      >
                        Laghouat,Algeria
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <Clock className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-arabic font-semibold mb-1">ساعات العمل</h3>
                      <p className="text-muted-foreground font-body">
                        السبت - الخميس: 9:00 صباحاً - 6:00 مساءً
                        <br />
                        الجمعة: مغلق
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Form */}
              <div>
                <h2 className="text-2xl font-arabic-display font-bold text-secondary mb-6">
                  أرسل لنا رسالة
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block font-body text-sm mb-2">الاسم الكامل</label>
                    <Input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="أدخل اسمك"
                      required
                      className="font-body"
                    />
                  </div>

                  <div>
                    <label className="block font-body text-sm mb-2">رقم الهاتف</label>
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

                  <div>
                    <label className="block font-body text-sm mb-2">البريد الإلكتروني (اختياري)</label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="email@example.com"
                      className="font-body"
                      dir="ltr"
                    />
                  </div>

                  <div>
                    <label className="block font-body text-sm mb-2">رسالتك</label>
                    <Textarea
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="اكتب رسالتك هنا..."
                      required
                      rows={5}
                      className="font-body"
                    />
                  </div>

                  <Button type="submit" className="w-full font-body" disabled={isSubmitting}>
                    {isSubmitting ? (
                      'جاري الإرسال...'
                    ) : (
                      <>
                        <Send className="w-4 h-4 ml-2" />
                        إرسال الرسالة
                      </>
                    )}
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default ContactUs;
