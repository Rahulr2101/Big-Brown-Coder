
import { useEffect, useRef, useState } from 'react';
import { Button } from "@/components/ui/button";
import { CheckCircle } from 'lucide-react';
import { cn } from "@/lib/utils";



const PricingCard = ({ 
  plan, 
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
              entry.target.classList.remove('opacity-0', 'translate-y-16');
            }, index * 200);
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
      className={cn(
        "rounded-2xl p-8 flex flex-col h-full transition-all duration-700 ease-out relative",
        "opacity-0 translate-y-16",
        plan.bgColor
      )}
    >
      {plan.isPopular && (
        <div className="absolute -top-3 right-8">
          <span className="chip bg-purple text-white px-4 py-1 shadow-lg">
            Popular
          </span>
        </div>
      )}
      
      <div className="mb-6">
        <h3 className={cn("text-xl font-bold mb-2", plan.textColor)}>{plan.name}</h3>
        <p className="text-foreground/70 text-sm">{plan.description}</p>
      </div>
      
      <div className="mb-6">
        <div className="flex items-baseline">
          <span className={cn("text-3xl font-bold", plan.textColor)}>${plan.price}</span>
          <span className="text-foreground/60 ml-1">/month</span>
        </div>
        {plan.price === 300 && (
          <div className="mt-1">
            <span className="text-green-500 text-sm font-medium">Save 15%</span>
          </div>
        )}
      </div>
      
      <ul className="space-y-3 mb-8 flex-grow">
        {plan.features.map((feature, i) => (
          <li key={i} className="flex items-start">
            <CheckCircle className="w-5 h-5 mr-2 text-purple flex-shrink-0 mt-0.5" />
            <span className="text-foreground/80 text-sm">{feature}</span>
          </li>
        ))}
      </ul>
      
      <Button 
        variant={plan.buttonVariant}
        className={cn(
          "rounded-lg w-full mt-auto",
          plan.buttonVariant === 'default' ? "bg-purple hover:bg-purple-dark" : "",
          plan.buttonVariant === 'outline' ? "border-purple/20 hover:bg-purple/5 text-purple" : "",
          plan.name === "Professional Plan" ? "bg-purple hover:bg-purple-dark text-white" : ""
        )}
      >
        Get Started
      </Button>
    </div>
  );
};

const Pricing = () => {
  const sectionRef = useRef(null);
  const headingRef = useRef(null);
  const [billingPeriod, setBillingPeriod] = useState('monthly');
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && entry.target === headingRef.current) {
            entry.target.classList.add('animate-fade-in');
          }
        });
      },
      { threshold: 0.1 }
    );
    
    if (headingRef.current) observer.observe(headingRef.current);
    
    return () => {
      if (headingRef.current) observer.unobserve(headingRef.current);
    };
  }, []);

  const pricingPlans= [
    {
      name: "Starter Plan",
      price: 150,
      description: "Perfect for personal finance management",
      features: [
        "Up to 5 accounts",
        "Basic budgeting tools",
        "Standard transaction categorization",
        "Email support",
        "Mobile app access"
      ],
      bgColor: "bg-white shadow-lg",
      textColor: "text-foreground",
      buttonVariant: "outline"
    },
    {
      name: "Professional Plan",
      price: 300,
      description: "Advanced features for financial optimization",
      features: [
        "Unlimited accounts",
        "Advanced analytics and insights",
        "Custom budgeting templates",
        "Priority support",
        "Investment tracking",
        "Bill payment automation",
        "Finance coach access"
      ],
      isPopular: true,
      bgColor: "glass-card shadow-xl border-purple/20",
      textColor: "text-foreground",
      buttonVariant: "default"
    },
    {
      name: "Enterprise Plan",
      price: 500,
      description: "Complete solution for businesses",
      features: [
        "Multi-user access",
        "Team permission controls",
        "Corporate expense tracking",
        "API access",
        "Dedicated account manager",
        "Custom integrations",
        "Advanced security features"
      ],
      bgColor: "bg-white shadow-lg",
      textColor: "text-foreground",
      buttonVariant: "outline"
    }
  ];

  return (
    <section ref={sectionRef} id="pricing" className="section-padding relative overflow-hidden bg-lavender/50">
      <div className="container container-padding">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="chip bg-purple/10 text-purple mb-4">Pricing Plans</span>
          <h2 ref={headingRef} className="heading-lg mb-6 opacity-0">Transforming Financial Experiences</h2>
          <p className="body-lg text-foreground/70 mb-8">
            Choose the plan that fits your needs. All plans include our core features.
          </p>
          
          <div className="inline-flex items-center bg-white p-1 rounded-full border border-lavender-dark shadow-sm mb-4">
            <button
              onClick={() => setBillingPeriod('monthly')}
              className={cn(
                "px-6 py-2 rounded-full text-sm font-medium transition-all",
                billingPeriod === 'monthly' 
                  ? "bg-purple text-white shadow-sm" 
                  : "text-foreground/70 hover:text-foreground"
              )}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingPeriod('yearly')}
              className={cn(
                "px-6 py-2 rounded-full text-sm font-medium transition-all",
                billingPeriod === 'yearly' 
                  ? "bg-purple text-white shadow-sm" 
                  : "text-foreground/70 hover:text-foreground"
              )}
            >
              Yearly <span className="text-green-500 text-xs">Save 20%</span>
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {pricingPlans.map((plan, index) => (
            <PricingCard key={index} plan={plan} index={index} />
          ))}
        </div>
        
        <div className="text-center mt-12 text-sm text-foreground/60 max-w-2xl mx-auto">
          All plans come with a 14-day free trial. No credit card required. Cancel anytime.
          Prices shown in USD. Additional fees may apply for currency conversion.
        </div>
      </div>
    </section>
  );
};

export default Pricing;
