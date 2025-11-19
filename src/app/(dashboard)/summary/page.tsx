'use client'

import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import useSWR from 'swr'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useLanguage } from '@/hooks/use-language'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export default function SummaryPage() {
  const { language } = useLanguage()
  const [selectedYear, setSelectedYear] = useState('all')
  const [selectedBrand, setSelectedBrand] = useState('all')
  const [selectedModel, setSelectedModel] = useState('all')

  const { data: tracker = [], isLoading } = useSWR('/api/tracker', fetcher)

  const labels = {
    en: {
      title: 'Summary',
      subtitle: 'Detailed vehicle tracking and analysis',
      chooseYear: 'Choose Year from Dropdown',
      chooseBrand: 'Choose Brand from Dropdown',
      chooseModel: 'Choose Model from Dropdown',
      dateAchat: 'Date Achat',
      stockNo: 'Stock No',
      year: 'Year',
      brand: 'Brand',
      model: 'Model',
      mileage: 'Mileage',
      color: 'Color',
      prixAchat: 'Prix Achat',
      recon: 'Recon',
      esthetique: 'Esthétique',
      transport: 'Transport',
      ajustement: 'Ajustement',
      coutantTotal: 'Coutant Total',
      acceCredit: 'Acces Crédit',
      prixAffiche: 'Prix Affiche',
      profitPotentiel: 'Profit Potentiel',
      vendu: 'Vendu',
      prix: 'Prix',
      ajut: 'Ajut',
      noData: 'No vehicles found',
      all: 'All',
    },
    fr: {
      title: 'Résumé',
      subtitle: 'Suivi et analyse détaillés des véhicules',
      chooseYear: 'Choisir année dans le menu déroulant',
      chooseBrand: 'Choisir Marque dans le menu déroulant',
      chooseModel: 'Choisir Modèle dans le menu déroulant',
      dateAchat: 'Date Achat',
      stockNo: 'Stock No',
      year: 'Année',
      brand: 'Marque',
      model: 'Modèle',
      mileage: 'Kilométrage',
      color: 'Couleur',
      prixAchat: 'Prix Achat',
      recon: 'Recon',
      esthetique: 'Esthétique',
      transport: 'Transport',
      ajustement: 'Ajustement',
      coutantTotal: 'Coutant Total',
      acceCredit: 'Acces Crédit',
      prixAffiche: 'Prix Affiche',
      profitPotentiel: 'Profit Potentiel',
      vendu: 'Vendu',
      prix: 'Prix',
      ajut: 'Ajut',
      noData: 'Aucun véhicule trouvé',
      all: 'Tous',
    }
  }

  const t = labels[language as keyof typeof labels]

  // Get unique years, brands, and models
  const years = Array.from(new Set(tracker.map((item: any) => item.year?.toString()))).filter(Boolean).sort((a: any, b: any) => b - a)
  const brands = Array.from(new Set(tracker.map((item: any) => item.make))).filter(Boolean).sort()
  const models = Array.from(new Set(
    selectedBrand === 'all' 
      ? tracker.map((item: any) => item.model)
      : tracker.filter((item: any) => item.make === selectedBrand).map((item: any) => item.model)
  )).filter(Boolean).sort()

  // Filter data
  const filteredData = tracker.filter((item: any) => {
    if (selectedYear !== 'all' && item.year?.toString() !== selectedYear) return false
    if (selectedBrand !== 'all' && item.make !== selectedBrand) return false
    if (selectedModel !== 'all' && item.model !== selectedModel) return false
    return true
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
      <header className="border-b border-border/50 bg-gradient-to-r from-blue-600 to-blue-700 sticky top-0 z-10">
        <div className="px-8 py-8">
          <h2 className="text-4xl font-bold text-white">{t.title}</h2>
          <p className="text-blue-100 mt-2">{t.subtitle}</p>
        </div>
      </header>

      <div className="p-8 space-y-6">
        {/* Filter Section */}
        <Card className="bg-card/80 backdrop-blur border-border/50">
          <CardHeader>
            <CardTitle className="text-lg">Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">{t.chooseYear}</label>
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t.all}</SelectItem>
                    {years.map((year: any) => (
                      <SelectItem key={year} value={year}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">{t.chooseBrand}</label>
                <Select value={selectedBrand} onValueChange={(val) => {
                  setSelectedBrand(val)
                  setSelectedModel('all')
                }}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t.all}</SelectItem>
                    {brands.map((brand: any) => (
                      <SelectItem key={brand} value={brand}>
                        {brand}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">{t.chooseModel}</label>
                <Select value={selectedModel} onValueChange={setSelectedModel}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t.all}</SelectItem>
                    {models.map((model: any) => (
                      <SelectItem key={model} value={model}>
                        {model}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data Table */}
        <Card className="bg-card/80 backdrop-blur border-border/50">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="animate-spin text-primary" />
              </div>
            ) : filteredData.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">{t.noData}</div>
            ) : (
              <div className="w-full overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50 hover:bg-muted/50">
                      <TableHead className="text-xs font-bold text-center">{t.dateAchat}</TableHead>
                      <TableHead className="text-xs font-bold text-center">{t.stockNo}</TableHead>
                      <TableHead className="text-xs font-bold text-center">{t.year}</TableHead>
                      <TableHead className="text-xs font-bold text-center">{t.brand}</TableHead>
                      <TableHead className="text-xs font-bold text-center">{t.model}</TableHead>
                      <TableHead className="text-xs font-bold text-center">{t.mileage}</TableHead>
                      <TableHead className="text-xs font-bold text-center">{t.color}</TableHead>
                      <TableHead className="text-xs font-bold text-center">{t.prixAchat}</TableHead>
                      <TableHead className="text-xs font-bold text-center">{t.recon}</TableHead>
                      <TableHead className="text-xs font-bold text-center">{t.esthetique}</TableHead>
                      <TableHead className="text-xs font-bold text-center">{t.transport}</TableHead>
                      <TableHead className="text-xs font-bold text-center">{t.ajustement}</TableHead>
                      <TableHead className="text-xs font-bold text-center">{t.coutantTotal}</TableHead>
                      <TableHead className="text-xs font-bold text-center">{t.acceCredit}</TableHead>
                      <TableHead className="text-xs font-bold text-center">{t.prixAffiche}</TableHead>
                      <TableHead className="text-xs font-bold text-center">{t.profitPotentiel}</TableHead>
                      <TableHead className="text-xs font-bold text-center">{t.vendu}</TableHead>
                      <TableHead className="text-xs font-bold text-center">{t.prix}</TableHead>
                      <TableHead className="text-xs font-bold text-center">{t.ajut}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredData.map((item: any, idx: number) => (
                      <TableRow key={idx} className="hover:bg-muted/30">
                        <TableCell className="text-xs text-center">{item.datePurchase || '-'}</TableCell>
                        <TableCell className="text-xs text-center font-medium">{item.stockNo || '-'}</TableCell>
                        <TableCell className="text-xs text-center">{item.year || '-'}</TableCell>
                        <TableCell className="text-xs text-center">{item.make || '-'}</TableCell>
                        <TableCell className="text-xs text-center">{item.model || '-'}</TableCell>
                        <TableCell className="text-xs text-center">{item.mileage ? item.mileage.toLocaleString() : '-'}</TableCell>
                        <TableCell className="text-xs text-center">{item.color || '-'}</TableCell>
                        <TableCell className="text-xs text-center">${item.purchasePrice?.toLocaleString() || '-'}</TableCell>
                        <TableCell className="text-xs text-center">${item.reconciliation?.toLocaleString() || '-'}</TableCell>
                        <TableCell className="text-xs text-center">${item.adjustment?.toLocaleString() || '-'}</TableCell>
                        <TableCell className="text-xs text-center">${item.transport?.toLocaleString() || '-'}</TableCell>
                        <TableCell className="text-xs text-center">${item.costTotal?.toLocaleString() || '-'}</TableCell>
                        <TableCell className="text-xs text-center">${item.costTotal?.toLocaleString() || '-'}</TableCell>
                        <TableCell className="text-xs text-center">${item.accessCredit?.toLocaleString() || '-'}</TableCell>
                        <TableCell className="text-xs text-center">${item.displayedPrice?.toLocaleString() || '-'}</TableCell>
                        <TableCell className="text-xs text-center">${item.potentialProfit?.toLocaleString() || '-'}</TableCell>
                        <TableCell className="text-xs text-center">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${item.sellStatus ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                            {item.sellStatus ? 'Yes' : 'No'}
                          </span>
                        </TableCell>
                        <TableCell className="text-xs text-center">{item.paid ? 'Yes' : 'No'}</TableCell>
                        <TableCell className="text-xs text-center">${item.netProfit?.toLocaleString() || '-'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
