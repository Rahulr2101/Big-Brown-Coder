
import { useEffect, useRef } from 'react';
import { cn } from "@/lib/utils";



const Timeline = () => {
  const sectionRef = useRef(null);
  const headingRef = useRef(null);
  const itemsRef = useRef([]);
  
  const timelineItems = [
    {
      title: "Sign Up",
      description: "Create your account in less than 2 minutes."
    },
    {
      title: "Accounts Details",
      description: "Securely connect your existing bank accounts and credit cards."
    },
    {
      title: "Set Goals",
      description: "Define your savings goals and budgeting preferences."
    },
    {
      title: "Explore",
      description: "Discover insights about your spending patterns and financial health."
    },
    {
      title: "Optimize",
      description: "Receive personalized recommendations to improve your finances."
    }
  ];
  
  useEffect(() => {
    const headingObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-fade-in');
          }
        });
      },
      { threshold: 0.1 }
    );
    
    const itemObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry, index) => {
          if (entry.isIntersecting) {
            setTimeout(() => {
              entry.target.classList.add('opacity-100');
              entry.target.classList.remove('opacity-0');
            }, index * 150);
          }
        });
      },
      { threshold: 0.1 }
    );
    
    if (headingRef.current) {
      headingObserver.observe(headingRef.current);
    }
    
    itemsRef.current.forEach((item, index) => {
      if (item) {
        itemObserver.observe(item);
      }
    });
    
    return () => {
      if (headingRef.current) {
        headingObserver.unobserve(headingRef.current);
      }
      
      itemsRef.current.forEach(item => {
        if (item) {
          itemObserver.unobserve(item);
        }
      });
    };
  }, []);

  return (
    <section ref={sectionRef} className="section-padding purple-gradient-bg relative overflow-hidden">
      <div className="container container-padding">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 ref={headingRef} className="heading-lg text-white mb-6 ">A Smarter Way To Manage Your Money</h2>
          <p className="body-lg text-white/80">
            Getting started is easy. Follow these simple steps to transform your financial experience today.
          </p>
        </div>
        
        <div className="max-w-3xl mx-auto relative">

          <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px bg-purple-light/30 transform md:-translate-x-px"></div>
          
     
          {timelineItems.map((item, index) => (
            <div
              key={index}
              ref={el => itemsRef.current[index] = el}
              className={cn(
                "relative flex flex-col md:flex-row md:items-center mb-12 last:mb-0 opacity-0 transition-opacity duration-700",
                index % 2 === 0 ? "md:flex-row-reverse" : ""
              )}
            >
     
              <div className="absolute left-4 md:left-1/2 w-8 h-8 bg-white rounded-full flex items-center justify-center transform -translate-x-1/2 z-10">
                <div className="w-4 h-4 bg-purple rounded-full"></div>
              </div>
              
        
              <div className={cn(
                "ml-12 md:ml-0 md:w-1/2 p-6",
                index % 2 === 0 ? "md:pr-12" : "md:pl-12"
              )}>
                <div className="glass-card bg-white/10 backdrop-blur-md p-6 rounded-xl border border-white/20 text-white shadow-lg">
                  <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                  <p className="text-white/80">{item.description}</p>
                </div>
              </div>
              
              {/* Spacer (empty div) for alternating layout */}
              <div className="hidden md:block md:w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Timeline;
