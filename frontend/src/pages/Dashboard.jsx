import { AppSidebar } from "@/components/app-sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { useEffect, useState } from "react"
import {fetchStackData} from '../api/fetchStockData.js'
import  AreaChart from '../components/ui/areaChart.jsx'
import FinancialCard from "@/components/FinancialCard.jsx"
import BarChart from "@/components/BarChart.jsx"
import LineChart from "@/components/LineChart.jsx"
import RadialChart from "@/components/RadialChart.jsx"
export default function Dashboard() {

  const balanceData = [
    { value: 48000 }, { value: 49200 }, { value: 48500 }, 
    { value: 49800 }, { value: 52400 }, { value: 50100 }, 
    { value: 51900 }, { value: 54130 }
  ];
  
  const incomeData = [
    { value: 8100 }, { value: 8300 }, { value: 8200 }, 
    { value: 8600 }, { value: 9200 }, { value: 9500 }, 
    { value: 10000 }, { value: 10150 }
  ];
  
  const savingsData = [
    { value: 1800 }, { value: 1400 }, { value: 2200 }, 
    { value: 1600 }, { value: 1800 }
  ];
  
    const [stockPrice,setStockPrice] = useState([])
   useEffect(()=>{
    setStockPrice(fetchStackData());
   },[])
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="#">
                    Building Your Application
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Data Fetching</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
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
      </SidebarInset>
    </SidebarProvider>
  )
}
