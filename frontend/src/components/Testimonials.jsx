
import { useEffect, useRef } from 'react';
import { cn } from "@/lib/utils";
import { Star } from "lucide-react";

const TestimonialCard = ({ 
  quote, 
  author, 
  position, 
  rating, 
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
              entry.target.classList.remove('opacity-0', 'translate-y-8');
            }, index * 150);
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
      className="glass-card rounded-2xl p-6 opacity-0 translate-y-8 transition-all duration-500"
    >
      <div className="flex mb-3">
        {[...Array(5)].map((_, i) => (
          <Star 
            key={i} 
            size={16} 
            className={i < rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"} 
          />
        ))}
      </div>
      <p className="text-foreground/80 mb-4 text-sm leading-relaxed">{quote}</p>
      <div className="flex items-center">
        <div className="w-10 h-10 rounded-full bg-lavender-dark mr-3 flex items-center justify-center">
          <span className="text-sm font-medium text-purple">{author.charAt(0)}</span>
        </div>
        <div>
          <h4 className="font-medium text-sm">{author}</h4>
          <p className="text-foreground/60 text-xs">{position}</p>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ 
  value, 
  label, 
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
              entry.target.classList.remove('opacity-0', 'translate-y-8');
            }, index * 150);
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
      className="text-center translate-y-8 transition-all duration-500"
    >
      <div className="text-3xl md:text-4xl font-bold text-purple mb-2">{value}</div>
      <div className="text-sm text-foreground/70">{label}</div>
    </div>
  );
};

const Testimonials = () => {
  const sectionRef = useRef(null);
  const headingRef = useRef(null);
  
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

  const testimonials = [
    {
      quote: "Paymint has completely transformed how I manage my finances. The interface is intuitive and the insights are incredibly valuable.",
      author: "Jennifer Lai",
      position: "Small Business Owner",
      rating: 5
    },
    {
      quote: "The budgeting features have helped me save over $300 monthly. The automatic categorization is scary accurate!",
      author: "Michael Chen",
      position: "Software Engineer",
      rating: 5
    },
    {
      quote: "As someone who travels frequently, the multi-currency support and zero foreign transaction fees are game changers.",
      author: "Sarah Johnson",
      position: "Digital Nomad",
      rating: 4
    },
    {
      quote: "I've tried many financial apps, but Paymint's combination of powerful features and clean design puts it in a league of its own.",
      author: "David Rodriguez",
      position: "Financial Analyst",
      rating: 5
    },
    {
      quote: "The customer service is exceptional. Had an issue with a transaction and it was resolved within minutes.",
      author: "Emma Thompson",
      position: "Healthcare Professional",
      rating: 5
    },
    {
      quote: "Being able to create virtual cards for different subscriptions has helped me finally gain control over my recurring expenses.",
      author: "Alex Morgan",
      position: "Marketing Director",
      rating: 4
    }
  ];

  const stats = [
    { value: "99%", label: "Customer Satisfaction" },
    { value: "$12,000+", label: "Average Annual Savings" },
    { value: "85%", label: "Less Time Managing Finances" },
    { value: "50K+", label: "Active Users" }
  ];

  return (
    <section ref={sectionRef} id="testimonials" className="section-padding relative overflow-hidden bg-white">
      <div className="container container-padding">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="chip bg-purple/10 text-purple mb-4">Testimonials</span>
          <h2 ref={headingRef} className="heading-lg mb-6 ">The Stories Trusted By Thousands</h2>
          <p className="body-lg text-foreground/70">
            Don't just take our word for it. Here's what our users have to say about their Paymint experience.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {testimonials.map((testimonial, index) => (
            <TestimonialCard
              key={index}
              quote={testimonial.quote}
              author={testimonial.author}
              position={testimonial.position}
              rating={testimonial.rating}
              index={index}
            />
          ))}
        </div>
        
        <div className="bg-lavender rounded-2xl p-8 md:p-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <StatCard
                key={index}
                value={stat.value}
                label={stat.label}
                index={index}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
