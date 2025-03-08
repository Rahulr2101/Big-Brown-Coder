
import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { cn } from '@/lib/utils';



const FinancialCard = ({ title, amount, percentChange, children }) => {
  const isPositiveChange = percentChange >= 0;
  
  return (
    <div className=" bg-white/90 shadow-lg rounded-lg p-6 flex flex-col">
      <h2 className="text-dashboard-muted text-lg font-medium mb-2">{title}</h2>
      <div className="text-3xl font-bold mb-4">{amount}</div>
      <div className="flex justify-between items-end">
        <div className={cn(
          "flex items-center text-sm",
          isPositiveChange ? "text-dashboard-green" : "text-dashboard-red"
        )}>
          {isPositiveChange ? (
            <ArrowUpRight size={16} className="mr-1" />
          ) : (
            <ArrowDownRight size={16} className="mr-1" />
          )}
          <span>{Math.abs(percentChange)}%</span>
        </div>
        <div className="flex-1">{children}</div>
      </div>
    </div>
  );
};

export default FinancialCard;