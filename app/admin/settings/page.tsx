'use client'

import { useState } from 'react'
import toast from 'react-hot-toast'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

export default function SettingsPage() {
  const [platformName, setPlatformName] = useState('AfroCart')
  const [defaultCommission, setDefaultCommission] = useState('15')
  const [minOrderAmount, setMinOrderAmount] = useState('10')
  const [deliveryFee, setDeliveryFee] = useState('2.99')
  const [notifications, setNotifications] = useState({
    newOrders: true,
    vendorRegistrations: true,
    driverAlerts: false,
    dailyReport: true,
  })

  function handleSave() {
    toast.success('Settings saved')
  }

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Platform */}
      <Card>
        <CardHeader>
          <CardTitle>Platform Settings</CardTitle>
        </CardHeader>
        <div className="space-y-4">
          <Input
            label="Platform Name"
            value={platformName}
            onChange={(e) => setPlatformName(e.target.value)}
          />
          <Input
            label="Default Commission Rate (%)"
            type="number"
            value={defaultCommission}
            onChange={(e) => setDefaultCommission(e.target.value)}
            hint="Applied to new vendors by default"
          />
          <Input
            label="Minimum Order Amount (£)"
            type="number"
            value={minOrderAmount}
            onChange={(e) => setMinOrderAmount(e.target.value)}
          />
          <Input
            label="Default Delivery Fee (£)"
            type="number"
            value={deliveryFee}
            onChange={(e) => setDeliveryFee(e.target.value)}
          />
        </div>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle>Notification Settings</CardTitle>
        </CardHeader>
        <div className="space-y-4">
          {(Object.entries(notifications) as [keyof typeof notifications, boolean][]).map(([key, value]) => {
            const labels: Record<keyof typeof notifications, string> = {
              newOrders: 'New Order Alerts',
              vendorRegistrations: 'Vendor Registrations',
              driverAlerts: 'Driver Alerts',
              dailyReport: 'Daily Summary Report',
            }
            return (
              <div key={key} className="flex items-center justify-between py-2 border-b border-surface-dark last:border-0">
                <span className="text-sm text-text-primary">{labels[key]}</span>
                <button
                  onClick={() => setNotifications((n) => ({ ...n, [key]: !n[key] }))}
                  className={`relative inline-flex h-5 w-9 rounded-full transition-colors ${value ? 'bg-gold' : 'bg-surface-dark'}`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${value ? 'translate-x-4' : 'translate-x-0'}`}
                  />
                </button>
              </div>
            )
          })}
        </div>
      </Card>

      <Button variant="primary" size="lg" onClick={handleSave}>
        Save Settings
      </Button>
    </div>
  )
}
