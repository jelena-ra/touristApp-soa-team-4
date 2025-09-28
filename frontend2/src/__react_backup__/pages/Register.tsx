import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MapPin, Eye, EyeOff, UserCircle, Compass } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { RegisterForm, UserRole } from '@/types';
import { toast } from '@/hooks/use-toast';

const Register = () => {
  const { user, register, isLoading } = useAuth();
  const [formData, setFormData] = useState<RegisterForm>({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'turista',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Greška",
        description: "Lozinke se ne poklapaju",
        variant: "destructive",
      });
      return;
    }

    if (formData.password.length < 6) {
      toast({
        title: "Greška",
        description: "Lozinka mora imati najmanje 6 karaktera",
        variant: "destructive",
      });
      return;
    }

    await register(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleRoleChange = (value: string) => {
    setFormData({
      ...formData,
      role: value as UserRole,
    });
  };

  const roles = [
    { value: 'turista', label: 'Turista', icon: UserCircle, description: 'Istražujte ture koje kreiraju vodiči' },
    { value: 'vodič', label: 'Vodič', icon: Compass, description: 'Kreirajte i delite svoje ture' },
  ];

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
              className="w-16 h-16 bg-gradient-secondary rounded-full mx-auto mb-4 flex items-center justify-center"
            >
              <MapPin className="w-8 h-8 text-secondary-foreground" />
            </motion.div>
            <CardTitle className="text-2xl font-bold">Pridružite se zajednici</CardTitle>
            <CardDescription>
              Kreirajte račun i počnite svoju avanturu
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
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Unesite email adresu"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="bg-glass border-glass-border"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Tip korisnika</Label>
                <Select value={formData.role} onValueChange={handleRoleChange}>
                  <SelectTrigger className="bg-glass border-glass-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="glass-card">
                    {roles.map((role) => (
                      <SelectItem key={role.value} value={role.value}>
                        <div className="flex items-center space-x-2">
                          <role.icon className="w-4 h-4" />
                          <span>{role.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formData.role && (
                  <p className="text-xs text-muted-foreground">
                    {roles.find(r => r.value === formData.role)?.description}
                  </p>
                )}
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

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Potvrdite lozinku</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Potvrdite lozinku"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    className="bg-glass border-glass-border pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
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
                  className="w-full bg-gradient-secondary hover:shadow-glow"
                  disabled={isLoading}
                >
                  {isLoading ? 'Registrovanje...' : 'Registruj se'}
                </Button>
              </motion.div>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Već imate račun?{' '}
                <Link
                  to="/login"
                  className="font-medium text-primary hover:text-primary-glow transition-colors"
                >
                  Prijavite se
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default Register;