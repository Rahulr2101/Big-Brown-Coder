
import React from 'react';
import { cn } from '@/lib/utils';



const RadialChart = ({ 
  percentage, 
  color, 
  size = 120, 
  strokeWidth = 10 
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center h-full">
      <svg height={size} width={size} className="rotate-[-90deg]">
        <circle
          className="text-dashboard-card"
          strokeWidth={strokeWidth}
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        <circle
          className={cn("transition-all duration-1000 ease-in-out")}
          strokeWidth={strokeWidth}
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          stroke={color}
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
      </svg>
      <div className="absolute flex items-center justify-center text-2xl font-bold">
        {percentage}%
      </div>
    </div>
  );
};

export default RadialChart;