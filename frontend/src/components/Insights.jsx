import { useEffect, useRef, useState } from 'react';
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

const InsightCard = ({ 
  title, 
  description, 
  imageUrl, 
  category, 
  readTime, 
  index 
}) => {
  const cardRef = useRef(null);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setTimeout(() => {
              entry.target.classList.add('opacity-100', 'translate-y-0');
              entry.target.classList.remove('opacity-0', 'translate-y-12');
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

  const handleImageLoad = () => {
    setIsImageLoaded(true);
  };

  return (
    <div 
      ref={cardRef}
      className=" glass-card rounded-xl overflow-hidden opacity-0 translate-y-12 transition-all duration-700"
    >
      <div className="relative h-48 overflow-hidden">
        <div className={`absolute inset-0 bg-lavender-dark ${isImageLoaded ? 'hidden' : 'block'}`} />
        <img
          src={imageUrl}
          alt={title}
          className={cn(
            "w-full h-full object-cover transition-opacity duration-300",
            isImageLoaded ? 'opacity-100' : 'opacity-0'
          )}
          onLoad={handleImageLoad}
        />
        <div className="absolute top-3 left-3">
          <span className="chip bg-white/90 backdrop-blur-sm text-purple shadow-sm">
            {category}
          </span>
        </div>
      </div>
      
      <div className="p-6">
        <h3 className="text-lg font-bold mb-2 line-clamp-2">{title}</h3>
        <p className="text-foreground/70 text-sm mb-4 line-clamp-2">{description}</p>
        
        <div className="flex items-center justify-between">
          <span className="text-xs text-foreground/60">{readTime} min read</span>
          <Button variant="ghost" size="sm" className="text-purple hover:text-purple-dark p-0">
            Read More <ExternalLink className="w-3 h-3 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
};

const Insights = () => {
  const sectionRef = useRef(null);
  const headingRef = useRef(null);
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  const insightPosts = [
    {
      title: "5 Ways to Boost Your Savings in 2023",
      description: "Discover simple yet effective strategies to maximize your savings potential this year.",
      imageUrl: "https://images.unsplash.com/photo-1579621970588-a35d0e7ab9b6?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
      category: "Savings",
      readTime: "5"
    },
    {
      title: "How to Create Your First Budget: A Step-by-Step Guide",
      description: "Learn how to build a budget that works for your lifestyle and financial goals.",
      imageUrl: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
      category: "Budgeting",
      readTime: "7"
    },
    {
      title: "Understanding Crypto: Should You Invest?",
      description: "An objective look at cryptocurrency investments and what to consider before getting started.",
      imageUrl: "https://images.unsplash.com/photo-1621761191319-c6fb62004040?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
      category: "Investing",
      readTime: "6"
    }
  ];
  
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

  return (
    <section ref={sectionRef} id="insights" className="section-padding relative overflow-hidden bg-lavender/30">
  <div className="container container-padding text-center">
    <div className="text-center max-w-3xl mx-auto mb-16">
      <span className="chip bg-purple/10 text-purple mb-4">Insights & Resources</span>
      <h2 ref={headingRef} className="heading-lg mb-6">Insights, Tips, And News About Fintech</h2>
      <p className="body-lg text-foreground/70">
        Stay informed with our latest articles, guides, and industry updates to make smarter financial decisions.
      </p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto justify-center items-center">
      {insightPosts.map((post, index) => (
        <InsightCard
          key={index}
          title={post.title}
          description={post.description}
          imageUrl={post.imageUrl}
          category={post.category}
          readTime={post.readTime}
          index={index}
        />
      ))}
    </div>

    <div className="text-center mt-12">
      <Button variant="outline" className="border-purple/20 hover:bg-purple/5 text-purple rounded-full px-6">
        View All Articles
      </Button>
    </div>
  </div>
</section>

  );
};

export default Insights;
