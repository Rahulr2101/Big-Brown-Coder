import React from "react";

import { cn } from "@/lib/utils";


const FeatureCard = ({
  icon: Icon,
  title,
  description,
  className,
  iconClassName,
  index = 0,
}) => {
  return (
   
        <div className="glass-panel p-8 hover:shadow-2xl group border border-white/10 flex flex-col  ">
      <div className={cn(
        "w-16 h-16 rounded-2xl flex items-center justify-center bg-gradient-to-br from-primary/30 to-secondary/30 mb-6 group-hover:from-primary/40 group-hover:to-secondary/40 transition-all duration-300",
        iconClassName
      )}>
        <Icon size={24} className="text-primary group-hover:text-white transition-colors" />
      </div>
      <span className="text-2xl font-bold mb-3 group-hover:text-gradient transition-all duration-300  ">{title}</span>
      <p className="text-muted-foreground text-base leading-relaxed">{description}</p>
      </div>
  
  );
};

export default FeatureCard;
