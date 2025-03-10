import { useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Link } from 'react-router-dom';
const Hero = () => {
  const phoneRef = useRef(null);
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-float');
          }
        });
      },
      { threshold: 0.1 }
    );
    
    if (phoneRef.current) {
      observer.observe(phoneRef.current);
    }
    
    return () => {
      if (phoneRef.current) observer.unobserve(phoneRef.current);
    };
  }, []);

  return (
    <section className="relative overflow-hidden pt-24 pb-16 md:pt-32 md:pb-24">
    
      <div className="absolute inset-0 bg-gradient-to-b from-purple/10 to-lavender/40 -z-10" />
      
    
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-purple/10 rounded-full blur-3xl -z-10" />
      
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
   
          <div className="max-w-2xl mx-auto lg:mx-0 text-center lg:text-left">
            <span className="chip bg-purple/10 text-purple mb-6 animate-fade-in">
              Next-Gen Financial Platform
            </span>
            
            <h1 className="heading-xl mb-6 animate-fade-in" style={{ animationDelay: "100ms" }}>
              Effortless <span className="text-purple">Financial</span> Solutions For A Digital World
            </h1>
            
            <p className="body-lg text-foreground/70 mb-8 max-w-xl mx-auto lg:mx-0 animate-fade-in" style={{ animationDelay: "200ms" }}>
            Experience modern trading tools and sustainability, enhanced with AI-powered features, offering more tools and real-time insights—all in one seamless platform.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start animate-fade-in" style={{ animationDelay: "300ms" }}>
            <Link to="/dashboard">

              <Button className="bg-purple hover:bg-purple-dark text-white rounded-full px-8 py-6 text-lg">
                Get Started
              </Button>
              </Link>
              <Button variant="outline" className="border-purple/20 bg-white/50 hover:bg-lavender text-foreground rounded-full px-8 py-6 text-lg">
                Learn More
              </Button>
            </div>
            
            <div className="mt-12 flex flex-wrap justify-center lg:justify-start gap-8 animate-fade-in" style={{ animationDelay: "400ms" }}>
              {/* {['BNP Paribas', 'UBS', 'VISA', '100+ Companies'].map((company, index) => (
                <div key={index} className="flex items-center text-gray-500 text-sm font-medium">
                  {company}
                </div>
              ))} */}
            </div>
          </div>
        
          <div 
            ref={phoneRef}
            className="relative mx-auto max-w-xs md:max-w-sm opacity-100 transition-all duration-700"
          >
            <div className="absolute inset-0 bg-purple/20 rounded-3xl blur-2xl -z-10 transform rotate-6" />
            
            <div className="relative bg-white rounded-3xl overflow-hidden shadow-2xl border border-white/20">
     
              <div className="bg-gray-800 py-3 px-4 relative">
                <div className="w-20 h-5 bg-black rounded-full absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2" />
              </div>
              

              <div className="p-4 bg-lavender/50">
          
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="font-bold">Hey Alex,</h3>
                    <p className="text-xs text-gray-500">Welcome back</p>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-gray-200" />
                </div>
                
       
                <div className="bg-white rounded-2xl p-4 mb-4 shadow-sm">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-medium text-gray-500">Total Balance</span>
                    <span className="text-xs font-medium text-green-500">+2.5%</span>
                  </div>
                  <div className="text-2xl font-bold mb-1">$1,598.00</div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">**** **** **** 4328</span>
                    <span className="text-xs font-medium text-purple">Active</span>
                  </div>
                </div>
                
      
                <div className="grid grid-cols-4 gap-2 mb-4">
                  {['Send', 'Receive', 'Loan', 'More'].map((action, i) => (
                    <div key={i} className="bg-white rounded-xl p-2 text-center shadow-sm">
                      <div className="w-6 h-6 mb-1 rounded-full bg-purple/10 mx-auto" />
                      <span className="text-xs">{action}</span>
                    </div>
                  ))}
                </div>
                

                <div className="bg-white rounded-2xl p-4 shadow-sm">
                  <div className="flex justify-between items-center mb-3">
                    <span className="font-medium text-sm">Recent Transactions</span>
                    <span className="text-xs text-purple">See all</span>
                  </div>
                  
                  {[
                    { name: 'Netflix', amount: '-$12.99', icon: '🎬' },
                    { name: 'Salary', amount: '+$850.00', icon: '💼' },
                    { name: 'Grocery', amount: '-$68.50', icon: '🛒' }
                  ].map((tx, i) => (
                    <div key={i} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-lavender flex items-center justify-center mr-2">
                          <span className="text-xs">{tx.icon}</span>
                        </div>
                        <span className="text-sm">{tx.name}</span>
                      </div>
                      <span className={`text-sm font-medium ${tx.amount.includes('+') ? 'text-green-500' : 'text-gray-700'}`}>
                        {tx.amount}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
