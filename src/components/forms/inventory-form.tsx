'use client'

import { useState, useEffect } from 'react'
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

const BRANDS = [
  'SUBARU', 'JEEP', 'MINI', 'FORD', 'NISSAN', 'VOLVO', 'VOLKSWAGEN', 'HYUNDAI',
  'BMW', 'INFINITI', 'CHEVROLET', 'GMC', 'MAZDA', 'HONDA', 'MITSUBISHI',
  'CHRYSLER', 'LAND ROVER', 'BUICK', 'TOYOTA', 'CADILLAC', 'DODGE', 'MERCEDES', 'KIA'
]

const COLORS = [
  'BLANC', 'NOIR', 'ARGENT', 'GRIS', 'ROUGE', 'BLEU', 'Orange', 'Jaune', 'Marron', 'Vert citron'
]

const STATUSES = ['Estimation', 'Financing', 'Paid', 'Sold', 'Arbitration']
const CATEGORIES = ['1', '2', '3']

interface InventoryFormProps {
  onSubmit: (data: any) => void
  onCancel: () => void
  validations?: any[]
}

export default function InventoryForm({ onSubmit, onCancel, validations = [] }: InventoryFormProps) {
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
    status: '',
    purchasePrice: '',
    recon: '',
    aesthetic: '',
    transport: '',
    adjustment: '',
    totalCost: '',
    bankLimit: '',
    advertisedPrice: '',
    potentialProfit: '',
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
      status: 'Status',
      purchasePrice: 'Purchase Price',
      recon: 'Recon',
      aesthetic: 'Aesthetic',
      transport: 'Transport',
      adjustment: 'Adjustment',
      totalCost: 'Total Cost',
      bankLimit: 'Bank Limit',
      advertisedPrice: 'Advertised Price',
      potentialProfit: 'Potential Profit',
      required: 'Required',
      cancel: 'Cancel',
      submit: 'Add Vehicle',
      optional: 'Optional',
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
      status: 'Statut',
      purchasePrice: 'Prix d\'achat',
      recon: 'Recon',
      aesthetic: 'Esthétique',
      transport: 'Transport',
      adjustment: 'Ajustement',
      totalCost: 'Coût total',
      bankLimit: 'Limite bancaire',
      advertisedPrice: 'Prix annoncé',
      potentialProfit: 'Profit potentiel',
      required: 'Obligatoire',
      cancel: 'Annuler',
      submit: 'Ajouter un véhicule',
      optional: 'Optionnel',
      error: 'Veuillez remplir tous les champs obligatoires'
    }
  }

  const t = labels[language as keyof typeof labels]

  const getUniqueValues = (field: string) => {
    return Array.from(new Set(validations.map((v: any) => v[field]).filter(Boolean)))
  }

  const uniqueCategories = getUniqueValues('category') || CATEGORIES
  const uniqueBrands = getUniqueValues('brand') || BRANDS
  const uniqueColors = getUniqueValues('color') || COLORS
  const uniqueStatuses = getUniqueValues('status') || STATUSES

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const requiredFields = ['stockNo', 'vinNumber', 'category', 'year', 'brand', 'model', 'kilometers', 'color', 'status', 'purchasePrice']
    if (requiredFields.some(field => !formData[field as keyof typeof formData])) {
      alert(t.error)
      return
    }
    onSubmit(formData)
    setFormData({
      stockNo: '', vinNumber: '', category: '', year: '', brand: '', model: '',
      kilometers: '', color: '', status: '', purchasePrice: '', recon: '',
      aesthetic: '', transport: '', adjustment: '', totalCost: '', bankLimit: '',
      advertisedPrice: '', potentialProfit: '',
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Basic Info */}
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

        <div className="space-y-2">
          <Label htmlFor="status" className="text-sm font-medium">{t.status} *</Label>
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

        {/* Pricing & Costs */}
        <div className="space-y-2">
          <Label htmlFor="purchasePrice" className="text-sm font-medium">{t.purchasePrice} *</Label>
          <Input
            id="purchasePrice"
            type="number"
            placeholder="0.00"
            value={formData.purchasePrice}
            onChange={(e) => handleChange('purchasePrice', e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="recon" className="text-sm font-medium">{t.recon}</Label>
          <Input
            id="recon"
            type="number"
            placeholder="0.00"
            value={formData.recon}
            onChange={(e) => handleChange('recon', e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="aesthetic" className="text-sm font-medium">{t.aesthetic}</Label>
          <Input
            id="aesthetic"
            type="number"
            placeholder="0.00"
            value={formData.aesthetic}
            onChange={(e) => handleChange('aesthetic', e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="transport" className="text-sm font-medium">{t.transport}</Label>
          <Input
            id="transport"
            type="number"
            placeholder="0.00"
            value={formData.transport}
            onChange={(e) => handleChange('transport', e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="adjustment" className="text-sm font-medium">{t.adjustment}</Label>
          <Input
            id="adjustment"
            type="number"
            placeholder="0.00"
            value={formData.adjustment}
            onChange={(e) => handleChange('adjustment', e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="totalCost" className="text-sm font-medium">{t.totalCost}</Label>
          <Input
            id="totalCost"
            type="number"
            placeholder="0.00"
            value={formData.totalCost}
            onChange={(e) => handleChange('totalCost', e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="bankLimit" className="text-sm font-medium">{t.bankLimit}</Label>
          <Input
            id="bankLimit"
            type="number"
            placeholder="0.00"
            value={formData.bankLimit}
            onChange={(e) => handleChange('bankLimit', e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="advertisedPrice" className="text-sm font-medium">{t.advertisedPrice}</Label>
          <Input
            id="advertisedPrice"
            type="number"
            placeholder="0.00"
            value={formData.advertisedPrice}
            onChange={(e) => handleChange('advertisedPrice', e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="potentialProfit" className="text-sm font-medium">{t.potentialProfit}</Label>
          <Input
            id="potentialProfit"
            type="number"
            placeholder="0.00"
            value={formData.potentialProfit}
            onChange={(e) => handleChange('potentialProfit', e.target.value)}
          />
        </div>
      </div>

      <div className="flex gap-2 justify-end pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          {t.cancel}
        </Button>
        <Button type="submit">
          {t.submit}
        </Button>
      </div>
    </form>
  )
}
