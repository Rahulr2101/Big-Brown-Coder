import React from 'react'
import { SidebarInset, SidebarProvider } from './ui/sidebar'
import  AreaChart from '../components/ui/areaChart.jsx'
import FinancialCard from "@/components/FinancialCard.jsx"
import BarChart from "@/components/BarChart.jsx"
import LineChart from "@/components/LineChart.jsx"
import RadialChart from "@/components/RadialChart.jsx"
export default function Home() {
    const balanceData = [
        { value: 48000 }, { value: 40 }, { value: 0 }, 
        { value: 49800 }, { value: 52400 }, { value: 50100 }, 
        { value: 51900 }, { value: 0 }
      ];
      
      const incomeData = [
        { value: 8100 }, { value: 8300 }, { value: 8200 }, 
        { value: 8600 }, { value: 9200 }, { value: 9500 }, 
        { value: 10000 }, { value: 100000000000 }
      ];
      
      const savingsData = [
        { value: 1800 }, { value: 1400 }, { value: 2200 }, 
        { value: 1600 }, { value: 1800 }
      ];
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div className="grid auto-rows-min gap-4 md:grid-cols-3">
          <FinancialCard 
            title="Balance" 
            amount="$54,130.00" 
            percentChange={12.2}
          >
            <LineChart 
              data={balanceData} 
              color="#F44771" 
            />
          </FinancialCard>

          {/* Savings Card */}
          <FinancialCard 
            title="Savings" 
            amount="$2,333.00" 
            percentChange={3.5}
          >
            <BarChart 
              data={savingsData} 
              color="#FFFFFF" 
              highlightIndex={2} 
              highlightColor="#5ECFCA" 
            />
          </FinancialCard>

          {/* Income Card */}
          <FinancialCard 
            title="Income" 
            amount="$10,150.00" 
            percentChange={2.8}
          >
            <LineChart 
              data={incomeData} 
              color="#42A76B" 
            />
          </FinancialCard>

          {/* Expenses Card */}
          <FinancialCard 
            title="Expenses" 
            amount="$7,817.00" 
            percentChange={2.7}
          >
            <div className="flex justify-end">
              <RadialChart 
                percentage={77} 
                color="#5ECFCA" 
              />
            </div>
          </FinancialCard>
          </div>
          <AreaChart/>
        </div>
  )
}
