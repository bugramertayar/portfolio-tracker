"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TotalPortfolioTab } from "./total-portfolio-tab"
import { Bist100Tab } from "./bist100-tab"
import { UsMarketsTab } from "./us-markets-tab"
import { PreciousMetalsTab } from "./precious-metals-tab"
import { LayoutDashboard, TrendingUp, Globe, Coins } from "lucide-react"

export function DashboardTabs() {
  return (
    <Tabs defaultValue="total" className="space-y-4">
      <TabsList className="grid w-full grid-cols-4 h-auto">
        <TabsTrigger value="total" className="py-2">
          <LayoutDashboard className="mr-2 h-4 w-4 hidden sm:block" />
          <span>Total</span>
        </TabsTrigger>
        <TabsTrigger value="bist100" className="py-2">
          <TrendingUp className="mr-2 h-4 w-4 hidden sm:block" />
          <span>BIST 100</span>
        </TabsTrigger>
        <TabsTrigger value="us-markets" className="py-2">
          <Globe className="mr-2 h-4 w-4 hidden sm:block" />
          <span>US Markets</span>
        </TabsTrigger>
        <TabsTrigger value="precious-metals" className="py-2">
          <Coins className="mr-2 h-4 w-4 hidden sm:block" />
          <span>Metals</span>
        </TabsTrigger>
      </TabsList>
      <TabsContent value="total" className="space-y-4">
        <TotalPortfolioTab />
      </TabsContent>
      <TabsContent value="bist100" className="space-y-4">
        <Bist100Tab />
      </TabsContent>
      <TabsContent value="us-markets" className="space-y-4">
        <UsMarketsTab />
      </TabsContent>
      <TabsContent value="precious-metals" className="space-y-4">
        <PreciousMetalsTab />
      </TabsContent>
    </Tabs>
  )
}
