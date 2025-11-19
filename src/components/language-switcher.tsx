'use client'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useLanguage } from '@/hooks/use-language'

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage()

  return (
    <Select value={language} onValueChange={(value) => setLanguage(value as 'en' | 'fr')}>
      <SelectTrigger className="w-full">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="en">English</SelectItem>
        <SelectItem value="fr">Français</SelectItem>
      </SelectContent>
    </Select>
  )
}
