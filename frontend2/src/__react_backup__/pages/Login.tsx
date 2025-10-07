import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { LoginForm } from '@/types';

const Login = () => {
  const { user, login, isLoading } = useAuth();
  const [formData, setFormData] = useState<LoginForm>({
    username: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="glass-card">
          <CardHeader className="text-center">
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="w-16 h-16 bg-gradient-primary rounded-full mx-auto mb-4 flex items-center justify-center"
            >
              <MapPin className="w-8 h-8 text-primary-foreground" />
            </motion.div>
            <CardTitle className="text-2xl font-bold">Dobrodošli nazad</CardTitle>
            <CardDescription>
              Prijavite se na vaš račun da nastavite avanturu
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="username">Korisničko ime</Label>
                <Input
                  id="username"
                  name="username"
                  type="text"
                  placeholder="Unesite korisničko ime"
                  value={formData.username}
                  onChange={handleChange}
                  required
                  className="bg-glass border-glass-border"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Lozinka</Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Unesite lozinku"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="bg-glass border-glass-border pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  type="submit"
                  className="w-full bg-gradient-primary hover:shadow-glow"
                  disabled={isLoading}
                >
                  {isLoading ? 'Prijavljivanje...' : 'Prijavi se'}
                </Button>
              </motion.div>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Nemate račun?{' '}
                <Link
                  to="/register"
                  className="font-medium text-primary hover:text-primary-glow transition-colors"
                >
                  Registruj se
                </Link>
              </p>
            </div>

            {/* Demo accounts */}
            <div className="mt-6 p-4 bg-muted rounded-lg">
              <p className="text-sm font-medium mb-2">Demo računi:</p>
              <div className="text-xs space-y-1 text-muted-foreground">
                <p>Admin: admin / admin123</p>
                <p>Vodič: vodic1 / vodic123</p>
                <p>Turista: turista1 / turista123</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default Login;