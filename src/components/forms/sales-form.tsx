'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useLanguage } from '@/hooks/use-language'

const STATUSES = ['Estimation', 'Financing', 'Paid', 'Sold', 'Arbitration']
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

interface SalesFormProps {
  onSubmit: (data: any) => void
  onCancel: () => void
  validations?: any[]
}

export default function SalesForm({ onSubmit, onCancel, validations = [] }: SalesFormProps) {
  const { language } = useLanguage()
  const [formData, setFormData] = useState({
    stockNo: '',
    vinNumber: '',
    category: '',
    year: '',
    brand: '',
    model: '',
    kilometers: '',
    color: '',
    saleDate: '',
    salePrice: '',
    carCost: '',
    carProfit: '',
    warranty: '',
    warrantyCost: '',
    warrantyProfit: '',
    kickback: '',
    miscFees: '',
    totalProfit: '',
    salesman: '',
    commissionPercent: '',
    commissionAmount: '',
    netProfit: '',
    month: '',
    status: '',
  })

  const labels = {
    en: {
      stockNo: 'Stock No.',
      vinNumber: 'VIN Number',
      category: 'Category',
      year: 'Year',
      brand: 'Brand',
      model: 'Model',
      kilometers: 'Kilometers',
      color: 'Color',
      saleDate: 'Sale Date',
      salePrice: 'Sale Price',
      carCost: 'Car Cost',
      carProfit: 'Car Profit',
      warranty: 'Warranty',
      warrantyCost: 'Warranty Cost',
      warrantyProfit: 'Warranty Profit',
      kickback: 'Kickback',
      miscFees: 'Misc Fees',
      totalProfit: 'Total Profit',
      salesman: 'Salesman',
      commissionPercent: 'Commission %',
      commissionAmount: 'Commission Amount',
      netProfit: 'Net Profit',
      month: 'Month',
      status: 'Status',
      required: 'Required',
      cancel: 'Cancel',
      submit: 'Add Sale',
      error: 'Please fill in all required fields'
    },
    fr: {
      stockNo: 'N° de stock',
      vinNumber: 'Numéro VIN',
      category: 'Catégorie',
      year: 'Année',
      brand: 'Marque',
      model: 'Modèle',
      kilometers: 'Kilomètres',
      color: 'Couleur',
      saleDate: 'Date de vente',
      salePrice: 'Prix de vente',
      carCost: 'Coût du véhicule',
      carProfit: 'Profit du véhicule',
      warranty: 'Garantie',
      warrantyCost: 'Coût de la garantie',
      warrantyProfit: 'Profit de la garantie',
      kickback: 'Rétrocommission',
      miscFees: 'Frais divers',
      totalProfit: 'Profit total',
      salesman: 'Vendeur',
      commissionPercent: 'Commission %',
      commissionAmount: 'Montant de la commission',
      netProfit: 'Profit net',
      month: 'Mois',
      status: 'Statut',
      required: 'Obligatoire',
      cancel: 'Annuler',
      submit: 'Ajouter une vente',
      error: 'Veuillez remplir tous les champs obligatoires'
    }
  }

  const t = labels[language as keyof typeof labels]

  const getUniqueValues = (field: string) => {
    return Array.from(new Set(validations.map((v: any) => v[field]).filter(Boolean)))
  }

  const uniqueCategories = getUniqueValues('category')
  const uniqueBrands = getUniqueValues('brand')
  const uniqueColors = getUniqueValues('color')
  const uniqueStatuses = getUniqueValues('status') || STATUSES

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const requiredFields = ['stockNo', 'vinNumber', 'category', 'year', 'brand', 'model', 'kilometers', 'color', 'saleDate', 'salePrice', 'salesman', 'month']
    if (requiredFields.some(field => !formData[field as keyof typeof formData])) {
      alert(t.error)
      return
    }
    onSubmit(formData)
    setFormData({
      stockNo: '', vinNumber: '', category: '', year: '', brand: '', model: '',
      kilometers: '', color: '', saleDate: '', salePrice: '', carCost: '',
      carProfit: '', warranty: '', warrantyCost: '', warrantyProfit: '',
      kickback: '', miscFees: '', totalProfit: '', salesman: '',
      commissionPercent: '', commissionAmount: '', netProfit: '', month: '', status: '',
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">Vehicle Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="stockNo" className="text-sm font-medium">{t.stockNo} *</Label>
            <Input
              id="stockNo"
              placeholder="e.g., VH001"
              value={formData.stockNo}
              onChange={(e) => handleChange('stockNo', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="vinNumber" className="text-sm font-medium">{t.vinNumber} *</Label>
            <Input
              id="vinNumber"
              placeholder="e.g., JT2BF18K5M0051234"
              value={formData.vinNumber}
              onChange={(e) => handleChange('vinNumber', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category" className="text-sm font-medium">{t.category} *</Label>
            <Select value={formData.category} onValueChange={(value) => handleChange('category', value)}>
              <SelectTrigger id="category">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {uniqueCategories.map(cat => (
                  <SelectItem key={cat} value={cat as string}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="year" className="text-sm font-medium">{t.year} *</Label>
            <Input
              id="year"
              type="number"
              placeholder="e.g., 2023"
              value={formData.year}
              onChange={(e) => handleChange('year', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="brand" className="text-sm font-medium">{t.brand} *</Label>
            <Select value={formData.brand} onValueChange={(value) => handleChange('brand', value)}>
              <SelectTrigger id="brand">
                <SelectValue placeholder="Select brand" />
              </SelectTrigger>
              <SelectContent>
                {uniqueBrands.map(brand => (
                  <SelectItem key={brand} value={brand as string}>{brand}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="model" className="text-sm font-medium">{t.model} *</Label>
            <Input
              id="model"
              placeholder="e.g., Civic"
              value={formData.model}
              onChange={(e) => handleChange('model', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="kilometers" className="text-sm font-medium">{t.kilometers} *</Label>
            <Input
              id="kilometers"
              type="number"
              placeholder="e.g., 45000"
              value={formData.kilometers}
              onChange={(e) => handleChange('kilometers', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="color" className="text-sm font-medium">{t.color} *</Label>
            <Select value={formData.color} onValueChange={(value) => handleChange('color', value)}>
              <SelectTrigger id="color">
                <SelectValue placeholder="Select color" />
              </SelectTrigger>
              <SelectContent>
                {uniqueColors.map(color => (
                  <SelectItem key={color} value={color as string}>{color}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">Sale Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="saleDate" className="text-sm font-medium">{t.saleDate} *</Label>
            <Input
              id="saleDate"
              type="date"
              value={formData.saleDate}
              onChange={(e) => handleChange('saleDate', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="salePrice" className="text-sm font-medium">{t.salePrice} *</Label>
            <Input
              id="salePrice"
              type="number"
              placeholder="0.00"
              value={formData.salePrice}
              onChange={(e) => handleChange('salePrice', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="carCost" className="text-sm font-medium">{t.carCost}</Label>
            <Input
              id="carCost"
              type="number"
              placeholder="0.00"
              value={formData.carCost}
              onChange={(e) => handleChange('carCost', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="carProfit" className="text-sm font-medium">{t.carProfit}</Label>
            <Input
              id="carProfit"
              type="number"
              placeholder="0.00"
              value={formData.carProfit}
              onChange={(e) => handleChange('carProfit', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="warranty" className="text-sm font-medium">{t.warranty}</Label>
            <Input
              id="warranty"
              type="number"
              placeholder="0.00"
              value={formData.warranty}
              onChange={(e) => handleChange('warranty', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="warrantyCost" className="text-sm font-medium">{t.warrantyCost}</Label>
            <Input
              id="warrantyCost"
              type="number"
              placeholder="0.00"
              value={formData.warrantyCost}
              onChange={(e) => handleChange('warrantyCost', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="warrantyProfit" className="text-sm font-medium">{t.warrantyProfit}</Label>
            <Input
              id="warrantyProfit"
              type="number"
              placeholder="0.00"
              value={formData.warrantyProfit}
              onChange={(e) => handleChange('warrantyProfit', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="kickback" className="text-sm font-medium">{t.kickback}</Label>
            <Input
              id="kickback"
              type="number"
              placeholder="0.00"
              value={formData.kickback}
              onChange={(e) => handleChange('kickback', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="miscFees" className="text-sm font-medium">{t.miscFees}</Label>
            <Input
              id="miscFees"
              type="number"
              placeholder="0.00"
              value={formData.miscFees}
              onChange={(e) => handleChange('miscFees', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="totalProfit" className="text-sm font-medium">{t.totalProfit}</Label>
            <Input
              id="totalProfit"
              type="number"
              placeholder="0.00"
              value={formData.totalProfit}
              onChange={(e) => handleChange('totalProfit', e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">Commission & Salesman</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="salesman" className="text-sm font-medium">{t.salesman} *</Label>
            <Input
              id="salesman"
              placeholder="e.g., John Doe"
              value={formData.salesman}
              onChange={(e) => handleChange('salesman', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="commissionPercent" className="text-sm font-medium">{t.commissionPercent}</Label>
            <Input
              id="commissionPercent"
              type="number"
              placeholder="0.00"
              value={formData.commissionPercent}
              onChange={(e) => handleChange('commissionPercent', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="commissionAmount" className="text-sm font-medium">{t.commissionAmount}</Label>
            <Input
              id="commissionAmount"
              type="number"
              placeholder="0.00"
              value={formData.commissionAmount}
              onChange={(e) => handleChange('commissionAmount', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="netProfit" className="text-sm font-medium">{t.netProfit}</Label>
            <Input
              id="netProfit"
              type="number"
              placeholder="0.00"
              value={formData.netProfit}
              onChange={(e) => handleChange('netProfit', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="month" className="text-sm font-medium">{t.month} *</Label>
            <Select value={formData.month} onValueChange={(value) => handleChange('month', value)}>
              <SelectTrigger id="month">
                <SelectValue placeholder="Select month" />
              </SelectTrigger>
              <SelectContent>
                {MONTHS.map(month => (
                  <SelectItem key={month} value={month}>{month}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status" className="text-sm font-medium">{t.status}</Label>
            <Select value={formData.status} onValueChange={(value) => handleChange('status', value)}>
              <SelectTrigger id="status">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {uniqueStatuses.map(status => (
                  <SelectItem key={status} value={status as string}>{status}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="flex gap-2 justify-end pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          {t.cancel}
        </Button>
        <Button type="submit" className="bg-gradient-to-r from-primary to-accent">
          {t.submit}
        </Button>
      </div>
    </form>
  )
}
