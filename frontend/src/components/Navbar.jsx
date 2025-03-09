import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from 'react-router-dom';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);


  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        isScrolled 
          ? "bg-white/90 backdrop-blur-md py-3 shadow-sm" 
          : "bg-transparent py-5"
      )}
    >
      <div className="container mx-auto px-6 flex items-center justify-between">
  
        <a href="/" className="flex items-center">
          <div className="w-8 h-8 mr-2 rounded-lg purple-gradient-bg flex items-center justify-center text-white font-bold">P</div>
          <span className="font-bold text-xl">Paymint</span>
        </a>

  
       

      
        <div className="hidden md:block">
        <Link to="/dashboard">

          <Button
            variant="default"
            className="bg-purple hover:bg-purple-dark text-white rounded-full px-6"
          >
            Get Started
          </Button>
          </Link>
        </div>

      
        <button 
          className="md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? (
            <X className="h-6 w-6 text-foreground" />
          ) : (
            <Menu className="h-6 w-6 text-foreground" />
          )}
        </button>
      </div>

   
      <div
        className={cn(
          "md:hidden fixed inset-x-0 bg-white/95 backdrop-blur-lg transition-all duration-300 ease-in-out transform shadow-lg",
          mobileMenuOpen 
            ? "top-[57px] opacity-100" 
            : "-top-full opacity-0"
        )}
      >
        <nav className="container mx-auto px-6 py-8 flex flex-col space-y-6">
          <a 
            href="#features" 
            className="text-foreground/80 hover:text-purple text-lg font-medium"
            onClick={() => setMobileMenuOpen(false)}
          >
            Features
          </a>
          <a 
            href="#pricing" 
            className="text-foreground/80 hover:text-purple text-lg font-medium"
            onClick={() => setMobileMenuOpen(false)}
          >
            Pricing
          </a>
          <a 
            href="#testimonials" 
            className="text-foreground/80 hover:text-purple text-lg font-medium"
            onClick={() => setMobileMenuOpen(false)}
          >
            Testimonials
          </a>
          <a 
            href="#insights" 
            className="text-foreground/80 hover:text-purple text-lg font-medium"
            onClick={() => setMobileMenuOpen(false)}
          >
            Insights
          </a>
          <Link to="/dashboard">

          <Button
            variant="default"
            className="bg-purple hover:bg-purple-dark text-white rounded-full w-full px-6 py-6"
            onClick={() => setMobileMenuOpen(false)}
          >
            Get Started
          </Button>
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
