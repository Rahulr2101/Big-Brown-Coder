
import { useEffect, useRef } from 'react';
import { cn } from "@/lib/utils";
import { BarChart4, Globe, Shield, PiggyBank, CreditCard, Zap } from "lucide-react";

const FeatureCard = ({ 
  icon, 
  title, 
  description, 
  index 
}) => {
  const cardRef = useRef(null);
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setTimeout(() => {
              entry.target.classList.add('opacity-100', 'translate-y-0');
              entry.target.classList.remove('opacity-0', 'translate-y-10');
            }, index * 100);
          }
        });
      },
      { threshold: 0.1 }
    );
    
    if (cardRef.current) {
      observer.observe(cardRef.current);
    }
    
    return () => {
      if (cardRef.current) observer.unobserve(cardRef.current);
    };
  }, [index]);

  return (
    <div 
      ref={cardRef}
      className="glass-card rounded-2xl p-6 md:p-8 h-full opacity-0 translate-y-10 transition-all duration-700"
    >
      <div className="w-12 h-12 bg-purple/10 rounded-xl flex items-center justify-center mb-6 text-purple">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-3">{title}</h3>
      <p className="text-foreground/70 leading-relaxed">{description}</p>
    </div>
  );
};

const Features = () => {
  const sectionRef = useRef(null);
  const headingRef = useRef(null);
  const captionRef = useRef(null);
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            if (entry.target === headingRef.current) {
              entry.target.classList.add('animate-fade-in');
            } else if (entry.target === captionRef.current) {
              entry.target.classList.add('animate-fade-in');
            }
          }
        });
      },
      { threshold: 0.1 }
    );
    
    if (headingRef.current) observer.observe(headingRef.current);
    if (captionRef.current) observer.observe(captionRef.current);
    
    return () => {
      if (headingRef.current) observer.unobserve(headingRef.current);
      if (captionRef.current) observer.unobserve(captionRef.current);
    };
  }, []);

  const features = [
    {
      icon: <BarChart4 className="w-6 h-6" />,
      title: "Financial Tracking",
      description: "Get real-time insights into your spending habits and income patterns with detailed analytics and custom reports."
    },
    {
      icon: <Globe className="w-6 h-6" />,
      title: "Global Accessibility",
      description: "Access your finances from anywhere in the world with support for multiple currencies and international transfers."
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "AI-Driven Stock Insights",
      description: "Stay ahead with real-time stock analysis, predictive trends, and personalized recommendations for smarter investing."
    },
    {
      icon: <PiggyBank className="w-6 h-6" />,
      title: "Smart Budgeting",
      description: "Set personalized budgets, savings goals, and receive intelligent recommendations to optimize your finances."
    },
    {
      icon: <CreditCard className="w-6 h-6" />,
      title: "Focus on Sustainability",
      description: "Track and reduce your environmental impact by calculating your carbon footprint, helping you make informed decisions for a greener future."
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Instant Sentiment Analysis on Current News",
      description: "Analyze public sentiment on current news events to gain insights into societal reactions, trends, and opinions, helping you understand how people feel about major topics and issues in real-time."
    }
  ];

  return (
    <section ref={sectionRef} id="features" className="section-padding relative overflow-hidden bg-white">

      <div className="absolute top-0 right-0 w-96 h-96 bg-lavender rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl -z-10" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple/5 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl -z-10" />
      
      <div className="container container-padding">
        <div className="text-center max-w-3xl mx-auto mb-16 md:mb-24">
          <span className="chip bg-purple/10 text-purple mb-4">Our Features</span>
          <h2 ref={headingRef} className="heading-lg mb-6 ">Transforming Financial Experiences</h2>
          <p ref={captionRef} className="body-lg text-foreground/70 ">
            Our platform combines powerful technology with intuitive design to give you unparalleled control over your financial life.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              index={index}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
