'use client'

import ValidationTab from './tabs/validation-tab'
import CommissionTab from './tabs/commission-tab'
import SalesTab from './tabs/sales-tab'
import InventoryTab from './tabs/inventory-tab'
import DashboardTab from './tabs/dashboard-tab'

interface DashboardContentProps {
  activeTab: string
}

export default function DashboardContent({ activeTab }: DashboardContentProps) {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card sticky top-0 z-10">
        <div className="px-8 py-6">
          <h2 className="text-3xl font-bold text-foreground capitalize">
            {activeTab}
          </h2>
          <p className="text-muted-foreground mt-1">
            Manage your {activeTab} operations
          </p>
        </div>
      </header>

      <div className="p-8">
        {activeTab === 'dashboard' && <DashboardTab />}
        {activeTab === 'validation' && <ValidationTab />}
        {activeTab === 'commission' && <CommissionTab />}
        {activeTab === 'sales' && <SalesTab />}
        {activeTab === 'inventory' && <InventoryTab />}
      </div>
    </div>
  )
}
