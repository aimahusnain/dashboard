'use client'

import { useState } from 'react'
import { Loader2, Plus, X } from 'lucide-react'
import useSWR from 'swr'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useLanguage } from '@/hooks/use-language'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export default function ValidationPage() {
  type TabKeys = 'brand' | 'model' | 'color' | 'year'

const tabs: TabKeys[] = ['brand', 'model', 'color', 'year']

const tabLabels: Record<keyof typeof labels, Record<TabKeys, string>> = {
  en: { brand: 'Brands', model: 'Models', color: 'Colors', year: 'Years' },
  fr: { brand: 'Marques', model: 'Modèles', color: 'Couleurs', year: 'Années' },
}

// Ab aap directly type-safe access kar sakte ho

  const { language } = useLanguage()
  const [showDialog, setShowDialog] = useState(false)
  const [currentTab, setCurrentTab] = useState('brand')
  const [inputValue, setInputValue] = useState('')
  const { data: validations = [], isLoading, mutate } = useSWR('/api/validations', fetcher)

  const labels = {
    en: {
      title: 'Validation',
      subtitle: 'Manage vehicle data and validations',
      addBtn: 'Add New',
      brand: 'Brand',
      model: 'Model',
      color: 'Color',
      year: 'Year',
      status: 'Status',
      actions: 'Actions',
      addNew: 'Add New',
      enterValue: 'Enter value',
      add: 'Add',
      noItems: 'No items yet',
    },
    fr: {
      title: 'Validation',
      subtitle: 'Gérer les données et validations des véhicules',
      addBtn: 'Ajouter',
      brand: 'Marque',
      model: 'Modèle',
      color: 'Couleur',
      year: 'Année',
      status: 'Statut',
      actions: 'Actions',
      addNew: 'Ajouter nouveau',
      enterValue: 'Entrez la valeur',
      add: 'Ajouter',
      noItems: 'Aucun élément',
    }
  }

  const t = labels[language as keyof typeof labels]


  const getItemsByType = (type: string) => {
    const items = validations
      .map((v: any) => v[type])
      .filter(Boolean)
      .filter((v: any, i: number, a: any[]) => a.indexOf(v) === i)
    return items
  }

  const handleAddItem = async () => {
    if (!inputValue.trim()) return
    
    try {
      await fetch('/api/validations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [currentTab]: inputValue }),
      })
      mutate()
      setInputValue('')
    } catch (error) {
      console.error('Error adding item:', error)
    }
  }

  const handleDeleteItem = async (item: string, type: string) => {
    try {
      const validation = validations.find((v: any) => v[type] === item)
      if (validation) {
        await fetch(`/api/validations/${validation._id}`, { method: 'DELETE' })
        mutate()
      }
    } catch (error) {
      console.error('Error deleting item:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
      <header className="border-b border-border/50 bg-card/50 backdrop-blur sticky top-0 z-10">
        <div className="px-8 py-8 flex justify-between items-center">
          <div>
            <h2 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">{t.title}</h2>
            <p className="text-muted-foreground mt-2">{t.subtitle}</p>
          </div>
          <Button
            onClick={() => setShowDialog(true)}
                       className="gap-2 r from-primary to-accent hover:opacity-90 transition-all shadow-lg"

          >
            <Plus size={20} />
            {t.addBtn}
          </Button>
        </div>
      </header>

      <div className="p-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {tabs.map(tab => (
            <Card key={tab} className="bg-card/80 backdrop-blur border-border/50 hover:border-border transition-colors">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg capitalize">{tabLabels[language as keyof typeof tabLabels][tab as TabKeys]}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {isLoading ? (
                  <div className="flex justify-center py-4">
                    <Loader2 className="animate-spin text-primary" size={20} />
                  </div>
                ) : getItemsByType(tab).length === 0 ? (
                  <p className="text-muted-foreground text-sm">{t.noItems}</p>
                ) : (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {getItemsByType(tab).map((item: any, idx: number) => (
                      <div key={idx} className="flex items-center justify-between gap-2 bg-muted/50 p-2 rounded-lg hover:bg-muted transition-colors">
                        <span className="text-sm font-medium truncate">{item}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteItem(item, tab)}
                          className="h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <X size={14} />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t.addNew}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex gap-2 border-b">
              {tabs.map(tab => (
                <button
                  key={tab}
                  onClick={() => {
                    setCurrentTab(tab)
                    setInputValue('')
                  }}
                  className={`px-4 py-2 capitalize font-medium text-sm transition-colors ${
                    currentTab === tab
                      ? 'border-b-2 border-primary text-primary'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {tabLabels[language as keyof typeof tabLabels][tab as TabKeys]
}
                </button>
              ))}
            </div>
            <div className="space-y-2">
              <Label htmlFor="value" className="text-sm font-medium">
                {tabLabels[language as keyof typeof tabLabels][currentTab as TabKeys]
} *
              </Label>
              <Input
                id="value"
                placeholder={t.enterValue}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleAddItem()
                  }
                }}
              />
            </div>
            <div className="flex gap-2 justify-end pt-2">
              <Button variant="outline" onClick={() => setShowDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddItem} className="bg-gradient-to-r from-primary to-accent">
                {t.add}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
