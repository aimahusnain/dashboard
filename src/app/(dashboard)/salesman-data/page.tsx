"use client"

import { useState } from "react"
import { Loader2, Plus, Trash2, Edit2 } from "lucide-react"
import useSWR from "swr"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useLanguage } from "@/hooks/use-language"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export default function SalesmanDataPage() {
  const { language } = useLanguage()
  const { data: salesmen = [], isLoading, mutate } = useSWR("/api/salesmen", fetcher)
  const [isOpen, setIsOpen] = useState(false)
  const [formData, setFormData] = useState({ name: "", commissionRate: "" })
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editFormData, setEditFormData] = useState({ name: "", commissionRate: "" })
  const [editDialogOpen, setEditDialogOpen] = useState(false)

  const labels = {
    en: {
      title: "Salesman Data",
      subtitle: "Manage salesman information and commission rates",
      addSalesman: "Add Salesman",
      name: "Salesman Name",
      rate: "Commission Rate (%)",
      records: "Salesman Records",
      delete: "Delete",
      edit: "Edit",
      save: "Save",
      cancel: "Cancel",
      noRecords: "No salesmen yet",
      confirmDelete: "Are you sure you want to delete this salesman?",
      fillAllFields: "Please fill in all fields",
      errorDeleting: "Error deleting salesman",
      errorUpdating: "Error updating salesman",
    },
    fr: {
      title: "Données des vendeurs",
      subtitle: "Gérer les informations des vendeurs et les taux de commission",
      addSalesman: "Ajouter un vendeur",
      name: "Nom du vendeur",
      rate: "Taux de commission (%)",
      records: "Enregistrements des vendeurs",
      delete: "Supprimer",
      edit: "Modifier",
      save: "Enregistrer",
      cancel: "Annuler",
      noRecords: "Aucun vendeur pour le moment",
      confirmDelete: "Êtes-vous sûr de vouloir supprimer ce vendeur?",
      fillAllFields: "Veuillez remplir tous les champs",
      errorDeleting: "Erreur lors de la suppression du vendeur",
      errorUpdating: "Erreur lors de la mise à jour du vendeur",
    },
  }

  const t = labels[language as keyof typeof labels]

  const handleAddSalesman = async () => {
    if (!formData.name || !formData.commissionRate) return
    try {
      await fetch("/api/salesmen", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })
      mutate()
      setFormData({ name: "", commissionRate: "" })
      setIsOpen(false)
    } catch (error) {
      console.error("Error adding salesman:", error)
    }
  }

  const handleEditSalesman = async (id: string) => {
    if (!editFormData.name.trim() || !editFormData.commissionRate) {
      alert(t.fillAllFields)
      return
    }
    try {
      const response = await fetch(`/api/salesmen/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editFormData.name,
          commissionRate: editFormData.commissionRate,
        }),
      })
      
      if (!response.ok) {
        throw new Error("Update failed")
      }
      
      mutate()
      setEditingId(null)
      setEditFormData({ name: "", commissionRate: "" })
      setEditDialogOpen(false)
    } catch (error) {
      console.error("Error updating salesman:", error)
      alert(t.errorUpdating)
    }
  }

  const handleDelete = async (id: string) => {
    if (!id) {
      alert("Error: Invalid ID")
      return
    }
    
    if (!window.confirm(t.confirmDelete)) return
    
    try {
      const response = await fetch(`/api/salesmen/${id}`, { 
        method: "DELETE" 
      })
      
      if (!response.ok) {
        throw new Error("Delete failed")
      }
      
      mutate()
    } catch (error) {
      console.error("Error deleting salesman:", error)
      alert(t.errorDeleting)
    }
  }

  const startEdit = (salesman: any) => {
    setEditingId(salesman.id)
    setEditFormData({
      name: salesman.name,
      commissionRate: salesman.commissionRate.toString(),
    })
    setEditDialogOpen(true)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
      <header className="border-b border-border/50 bg-card/50 backdrop-blur sticky top-0 z-10">
        <div className="px-8 py-8 flex justify-between items-center">
          <div>
            <h2 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              {t.title}
            </h2>
            <p className="text-muted-foreground mt-2">{t.subtitle}</p>
          </div>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-primary to-accent hover:shadow-lg">
                <Plus size={18} className="mr-2" />
                {t.addSalesman}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t.addSalesman}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">{t.name}</label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Jimmy"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">{t.rate}</label>
                  <Input
                    type="number"
                    value={formData.commissionRate}
                    onChange={(e) => setFormData({ ...formData, commissionRate: e.target.value })}
                    placeholder="e.g., 25"
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleAddSalesman} className="flex-1">
                    {t.save}
                  </Button>
                  <Button onClick={() => setIsOpen(false)} variant="outline" className="flex-1">
                    {t.cancel}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      <div className="p-8">
        <Card className="bg-card/80 backdrop-blur border-border/50">
          <CardHeader>
            <CardTitle>{t.records}</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="animate-spin text-primary" />
              </div>
            ) : salesmen.length === 0 ? (
              <p className="text-muted-foreground text-sm">{t.noRecords}</p>
            ) : (
              <div className="w-full overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t.name}</TableHead>
                      <TableHead>{t.rate}</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {salesmen.map((salesman: any) => (
                      <TableRow key={salesman.id}>
                        <TableCell className="font-medium">{salesman.name}</TableCell>
                        <TableCell>{`${salesman.commissionRate}%`}</TableCell>
                        <TableCell className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => startEdit(salesman)}
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          >
                            <Edit2 size={16} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(salesman.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 size={16} />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.edit}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">{t.name}</label>
              <Input
                value={editFormData.name}
                onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                placeholder="e.g., Jimmy"
              />
            </div>
            <div>
              <label className="text-sm font-medium">{t.rate}</label>
              <Input
                type="number"
                value={editFormData.commissionRate}
                onChange={(e) => setEditFormData({ ...editFormData, commissionRate: e.target.value })}
                placeholder="e.g., 25"
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => {
                  if (editingId) {
                    handleEditSalesman(editingId)
                  }
                }}
                className="flex-1"
              >
                {t.save}
              </Button>
              <Button onClick={() => setEditDialogOpen(false)} variant="outline" className="flex-1">
                {t.cancel}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}