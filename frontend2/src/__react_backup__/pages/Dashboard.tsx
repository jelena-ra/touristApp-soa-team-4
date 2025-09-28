import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  MapPin,
  Compass,
  BookOpen,
  Users,
  TrendingUp,
  Clock,
  Star,
  ShoppingCart,
  Activity,
  Cpu,
  HardDrive,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { user } = useAuth();

  const quickActions = [
    {
      title: 'Kreiraj Turu',
      description: 'Napravite novu turu sa ključnim tačkama',
      icon: MapPin,
      href: '/tours/create',
      color: 'bg-gradient-primary',
      condition: user?.role === 'vodič' || user?.role === 'admin',
    },
    {
      title: 'Napiši Blog',
      description: 'Podelite svoja iskustva',
      icon: BookOpen,
      href: '/blog/create',
      color: 'bg-gradient-secondary',
    },
    {
      title: 'Istražite Ture',
      description: 'Otkrijte nove destinacije',
      icon: Compass,
      href: '/tours',
      color: 'bg-gradient-accent',
    },
    {
      title: 'Zajednica',
      description: 'Povežite se sa drugim putnicima',
      icon: Users,
      href: '/followers',
      color: 'bg-gradient-primary',
    },
  ].filter(action => action.condition !== false);

  const stats = [
    { label: 'Aktivne Ture', value: '12', icon: MapPin, trend: '+2 ova nedelja' },
    { label: 'Blog Postovi', value: '5', icon: BookOpen, trend: '+1 danas' },
    { label: 'Pratioci', value: '248', icon: Users, trend: '+15 ova nedelja' },
    { label: 'Ukupno Poena', value: '1,234', icon: Star, trend: '+89 danas' },
  ];

  const recentActivity = [
    { action: 'Nova tura kreirana', time: '2 sata', icon: MapPin },
    { action: 'Blog post objavljen', time: '5 sati', icon: BookOpen },
    { action: 'Novi pratilac', time: '1 dan', icon: Users },
    { action: 'Recenzija dobila', time: '2 dana', icon: Star },
  ];

  const systemMetrics = [
    { name: 'CPU Korišćenje', value: 65, icon: Cpu, color: 'text-primary' },
    { name: 'RAM Memorija', value: 78, icon: HardDrive, color: 'text-secondary' },
    { name: 'Disk Prostor', value: 45, icon: Activity, color: 'text-accent' },
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              Dobrodošli, {user?.username}!
            </h1>
            <p className="text-muted-foreground">
              Evo pregleda vaše aktivnosti i brzih akcija
            </p>
          </div>
          <Badge 
            variant="secondary" 
            className="px-3 py-1 text-sm font-medium capitalize bg-gradient-primary text-primary-foreground"
          >
            {user?.role}
          </Badge>
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="mb-8"
      >
        <h2 className="text-xl font-semibold mb-4">Brze Akcije</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, index) => (
            <motion.div
              key={action.title}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Link to={action.href}>
                <Card className="glass-card hover:shadow-hover transition-all duration-300 h-full">
                  <CardContent className="p-6">
                    <div className={`w-12 h-12 rounded-lg ${action.color} flex items-center justify-center mb-4`}>
                      <action.icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-semibold mb-2">{action.title}</h3>
                    <p className="text-sm text-muted-foreground">{action.description}</p>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Stats Overview */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="lg:col-span-2"
        >
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5" />
                <span>Statistike</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {stats.map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="flex items-center space-x-4"
                  >
                    <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center">
                      <stat.icon className="w-6 h-6 text-primary-foreground" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold">{stat.value}</div>
                      <div className="text-sm text-muted-foreground">{stat.label}</div>
                      <div className="text-xs text-success">{stat.trend}</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="w-5 h-5" />
                <span>Poslednja Aktivnost</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="flex items-center space-x-3"
                  >
                    <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                      <activity.icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm">{activity.action}</div>
                      <div className="text-xs text-muted-foreground">pre {activity.time}</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* System Monitoring - Demo */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="mt-8"
      >
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="w-5 h-5" />
              <span>Sistemsko Praćenje (Demo)</span>
            </CardTitle>
            <CardDescription>
              Pregled performansi servera i kontejnera
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {systemMetrics.map((metric, index) => (
                <motion.div
                  key={metric.name}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="flex items-center space-x-4"
                >
                  <metric.icon className={`w-8 h-8 ${metric.color}`} />
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium">{metric.name}</span>
                      <span className="text-sm text-muted-foreground">{metric.value}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <motion.div
                        className="h-2 rounded-full bg-gradient-primary"
                        initial={{ width: 0 }}
                        animate={{ width: `${metric.value}%` }}
                        transition={{ duration: 1, delay: index * 0.2 }}
                      />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default Dashboard;