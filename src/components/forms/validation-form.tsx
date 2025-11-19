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

interface ValidationFormProps {
  onSubmit: (data: any) => void
  onCancel: () => void
}

export default function ValidationForm({ onSubmit, onCancel }: ValidationFormProps) {
  const { language } = useLanguage()
  const [formData, setFormData] = useState({
    brand: '',
    category: '',
    color: '',
    status: '',
  })

  const labels = {
    en: { brand: 'Brand', category: 'Category', color: 'Color', status: 'Status', required: 'Required', cancel: 'Cancel', submit: 'Add Validation', error: 'Please fill in all required fields' },
    fr: { brand: 'Marque', category: 'Catégorie', color: 'Couleur', status: 'Statut', required: 'Obligatoire', cancel: 'Annuler', submit: 'Ajouter une validation', error: 'Veuillez remplir tous les champs obligatoires' }
  }

  const t = labels[language as keyof typeof labels]

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.brand || !formData.category || !formData.color || !formData.status) {
      alert(t.error)
      return
    }
    onSubmit(formData)
    setFormData({ brand: '', category: '', color: '', status: '' })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="brand" className="text-sm font-medium">{t.brand} *</Label>
          <Select value={formData.brand} onValueChange={(value) => handleChange('brand', value)}>
            <SelectTrigger id="brand">
              <SelectValue placeholder="Select brand" />
            </SelectTrigger>
            <SelectContent>
              {BRANDS.map(brand => (
                <SelectItem key={brand} value={brand}>{brand}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="category" className="text-sm font-medium">{t.category} *</Label>
          <Select value={formData.category} onValueChange={(value) => handleChange('category', value)}>
            <SelectTrigger id="category">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map(cat => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="color" className="text-sm font-medium">{t.color} *</Label>
          <Select value={formData.color} onValueChange={(value) => handleChange('color', value)}>
            <SelectTrigger id="color">
              <SelectValue placeholder="Select color" />
            </SelectTrigger>
            <SelectContent>
              {COLORS.map(color => (
                <SelectItem key={color} value={color}>{color}</SelectItem>
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
              {STATUSES.map(status => (
                <SelectItem key={status} value={status}>{status}</SelectItem>
              ))}
            </SelectContent>
          </Select>
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
