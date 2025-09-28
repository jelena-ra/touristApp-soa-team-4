import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

const Home = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden">
      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, ease: 'easeOut' }}
        className="text-center z-10 max-w-4xl mx-auto px-4"
      >
        {/* Main Title */}
        <motion.h1 
          className="text-hero font-light mb-8"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.4, delay: 0.2, ease: 'easeOut' }}
        >
          TRAVEL PLATFORM
        </motion.h1>

        {/* Subtitle */}
        <motion.p 
          className="text-elegant text-muted-foreground mb-16 max-w-2xl mx-auto text-balance"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 0.6, ease: 'easeOut' }}
        >
          Otkrijte svet kroz nezaboravne ture. Kreirajte, istražujte i delite
          svoje putničke avanture sa zajednicom.
        </motion.p>

        {/* Action Buttons */}
        <motion.div 
          className="flex flex-col sm:flex-row gap-6 justify-center items-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1, ease: 'easeOut' }}
        >
          {user ? (
            <>
              <Link to="/dashboard">
                <Button 
                  variant="zen" 
                  size="lg"
                  className="min-w-[160px] font-light tracking-wider"
                >
                  DASHBOARD
                </Button>
              </Link>
              <Link to="/tours">
                <Button 
                  variant="outline" 
                  size="lg"
                  className="min-w-[160px] font-light tracking-wider"
                >
                  ISTRAŽITE
                </Button>
              </Link>
            </>
          ) : (
            <>
              <Link to="/register">
                <Button 
                  variant="zen" 
                  size="lg"
                  className="min-w-[160px] font-light tracking-wider"
                >
                  REGISTRUJ SE
                </Button>
              </Link>
              <Link to="/login">
                <Button 
                  variant="outline" 
                  size="lg"
                  className="min-w-[160px] font-light tracking-wider"
                >
                  PRIJAVI SE
                </Button>
              </Link>
            </>
          )}
        </motion.div>
      </motion.div>

      {/* Minimal Footer */}
      <motion.div 
        className="absolute bottom-8 text-xs text-muted-foreground/60 tracking-wider"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 2 }}
      >
        © 2024 TRAVEL PLATFORM
      </motion.div>
    </div>
  );
};

export default Home;