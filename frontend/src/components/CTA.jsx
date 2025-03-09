import { useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Link } from 'react-router-dom';
const CTA = () => {
  const sectionRef = useRef(null);
  const contentRef = useRef(null);
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && entry.target === contentRef.current) {
            entry.target.classList.add('animate-fade-in');
          }
        });
      },
      { threshold: 0.1 }
    );
    
    if (contentRef.current) observer.observe(contentRef.current);
    
    return () => {
      if (contentRef.current) observer.unobserve(contentRef.current);
    };
  }, []);

  return (
    <section ref={sectionRef} className="purple-gradient-bg py-16 md:py-24 relative overflow-hidden flex items-center justify-center">
      {/* Background decorations */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-purple-light/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl -z-10" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-light/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl -z-10" />
      
      <div className="container container-padding flex items-center justify-center">
        <div 
          ref={contentRef}
          className="max-w-3xl mx-auto text-center"
        >
          <h2 className="heading-lg text-white mb-6">Ready To Take Control Of Your Finances?</h2>
          <p className="body-lg text-white/80 mb-8 max-w-xl mx-auto">
            Join thousands of satisfied users who have transformed their financial lives with Paymint.
            Start your journey today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            
          <Link to="/dashboard">
  <Button className="bg-white hover:bg-lavender text-purple hover:text-purple-dark rounded-full px-8 py-6 text-lg">
    Get Started
  </Button>
</Link>
            <Button variant="outline" className="border-white/30 hover:bg-white/10 text-purple rounded-full px-8 py-6 text-lg">
              Contact Sales
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;
