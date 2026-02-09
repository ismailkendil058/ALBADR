import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Lock, Phone, AlertCircle, ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';

const ManagerLogin: React.FC = () => {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Query the managers table to find a match
      const { data: manager, error: queryError } = await supabase
        .from('managers')
        .select('id, phone, password, name, is_active')
        .eq('phone', phone)
        .single();

      if (queryError || !manager) {
        setError('Invalid phone number or password');
        setIsLoading(false);
        return;
      }

      // Check if manager account is active
      if (!manager.is_active) {
        setError('This manager account has been deactivated');
        setIsLoading(false);
        return;
      }

      // Check if password matches
      if (manager.password !== password) {
        setError('Invalid phone number or password');
        setIsLoading(false);
        return;
      }

      // Create a session or store the manager info
      // Store manager authentication in localStorage
      localStorage.setItem('manager_id', manager.id);
      localStorage.setItem('manager_name', manager.name);
      localStorage.setItem('manager_phone', manager.phone);
      localStorage.setItem('manager_authenticated', 'true');
      
      navigate('/admin');
    } catch (err: any) {
      setError(err.message || 'An error occurred during sign in');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4 relative">
      <Link
        to="/"
        className="absolute top-4 left-4 flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors font-body"
      >
        <ArrowLeft className="w-4 h-4" />
        العودة للموقع
      </Link>
      <Card className="w-full max-w-md">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto mb-4 w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            <Lock className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">Manager Dashboard</CardTitle>
          <p className="text-muted-foreground mt-2">طاحونة البدر</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-destructive/10 border border-destructive/20 text-destructive rounded-lg p-3 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="pl-10"
                  placeholder="+213 5XX XXX XXX"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ManagerLogin;
