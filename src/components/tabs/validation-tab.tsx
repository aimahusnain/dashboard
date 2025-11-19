'use client'

import useSWR from 'swr'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle, Loader2 } from 'lucide-react'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export default function ValidationTab() {
  const { data: validations = [], isLoading, error } = useSWR('/api/validations', fetcher)

  const defaultValidations = [
    { item: 'Email Validation', status: 'Passed', count: 2345 },
    { item: 'Phone Validation', status: 'Passed', count: 1234 },
    { item: 'Address Validation', status: 'Pending', count: 567 },
    { item: 'Payment Validation', status: 'Passed', count: 890 },
  ]

  const displayValidations = validations.length > 0 ? validations : defaultValidations

  return (
    <div className="space-y-6">
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="text-green-500" />
            Validation Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="animate-spin" />
            </div>
          ) : (
            <div className="space-y-4">
              {displayValidations.map((validation: any) => (
                <div
                  key={validation.item || validation._id}
                  className="flex items-center justify-between rounded-lg border border-border p-4"
                >
                  <div>
                    <p className="font-medium text-foreground">{validation.item}</p>
                    <p className="text-sm text-muted-foreground">{validation.count || 0} records</p>
                  </div>
                  <span
                    className={`rounded px-3 py-1 text-xs font-semibold ${
                      validation.status === 'Passed'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                    }`}
                  >
                    {validation.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
