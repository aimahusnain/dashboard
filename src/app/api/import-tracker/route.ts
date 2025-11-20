import { type NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import * as csv from "csv-parse/sync"
import { parse } from "date-fns"
import { calculateTotalProfit, calculateCommission, calculateNetProfit } from "@/lib/profit-calculator"

const prisma = new PrismaClient()

const cleanNumber = (value: string | null | number) => {
  if (value === null || value === undefined || value === "") return null
  const numValue =
    typeof value === "number"
      ? value
      : Number.parseFloat(String(value).replace(/\$/g, "").replace(/,/g, "").replace(/\s+/g, ""))
  return Number.isNaN(numValue) ? null : numValue
}

const cleanMileage = (value: string | null) => {
  if (!value) return null
  const cleaned = Number.parseFloat(String(value).replace(/KM/i, "").replace(/,/g, "").trim())
  return Number.isNaN(cleaned) ? null : cleaned
}

const cleanDate = (value: string | null) => {
  if (!value) return null
  try {
    const parsed = parse(String(value), "d-MMM-yy", new Date())
    return parsed.toISOString()
  } catch {
    return null
  }
}

const cleanString = (value: any) => {
  if (!value) return null
  const trimmed = String(value).trim()
  return trimmed.length > 0 ? trimmed : null
}

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData()
    const file = form.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "CSV file missing" }, { status: 400 })
    }

    const text = await file.text()
    const records = csv.parse(text, {
      columns: true,
      skip_empty_lines: true,
      relax_column_count: true,
    })

    const salesmen = await prisma.salesman.findMany()
    const salesmanMap = new Map(salesmen.map((s) => [s.name.toLowerCase(), s.commissionRate]))

    const mapped = records.map((row: any) => {
      const potentialProfit = cleanNumber(row.potentialProfit || row["PROFIT POTENTIEL"])
      const prGP = cleanNumber(row.prGP || row["PR GP"])
      const rebate = cleanNumber(row.RISTOURNE || row["RISTOURNE"])
      const prAss = cleanNumber(row.PRASS || row["PR ASS"])
      const fraisDivers = cleanNumber(row.FRAISDIVERS || row["FRAIS DIVERS"])
      const salesperson = cleanString(row.Vendeur || row.salesperson || row["Vendeur"])

      let totalProfit = cleanNumber(row.PROFITTOTAL || row["PROFIT TOTAL"] || row.totalProfit)
      if (
        !totalProfit &&
        (potentialProfit !== null || prGP !== null || rebate !== null || prAss !== null || fraisDivers !== null)
      ) {
        const calculatedTotal = calculateTotalProfit({
          potentialProfit: potentialProfit || 0,
          prGP: prGP || 0,
          rebate: rebate || 0,
          prAss: prAss || 0,
          miscellaneousExpenses: fraisDivers || 0,
        })
        totalProfit = calculatedTotal > 0 || calculatedTotal < 0 ? calculatedTotal : null
      }

      let commission = cleanNumber(row.Commission || row.commission || row["Commission"])
      if (!commission && totalProfit && salesperson) {
        const commissionRate = salesmanMap.get(salesperson.toLowerCase()) || 0
        commission = calculateCommission(totalProfit, commissionRate)
      }

      let netProfit = cleanNumber(row.PROFITNET || row["PROFIT NET"] || row.netProfit)
      if (!netProfit && totalProfit !== null && commission !== null) {
        netProfit = calculateNetProfit(totalProfit, commission)
      }

      return {
        datePurchase: cleanString(row.datePurchase || row["DATE ACHAT"]),
        action: cleanString(row.action || row["ACTION"]),
        stockNo: cleanString(row.stockNo || row["# STOCK (NIV)"]),
        category: cleanString(row.category || row["Catégories"]),
        year: row.year ? Number.parseInt(String(row.year)) : null,
        make: cleanString(row.make || row["MARQUE"]),
        model: cleanString(row.model || row["MODÈLE"]),
        mileage: cleanMileage(row.mileage || row["KILOMÉTRAGE"]),
        color: cleanString(row.color || row["COULEUR"]),
        purchasePrice: cleanNumber(row.purchasePrice || row["PRIX ACHAT"]),
        reconciliation: cleanNumber(row.reconciliation || row["RECON"]),
        esthetique: cleanNumber(row.esthetique || row["ESTHÉTIQUE"]),
        transport: cleanNumber(row.transport || row["TRANSPORT"]),
        adjustment: cleanNumber(row.adjustment || row["AJUSTEMENT"]),
        costTotal: cleanNumber(row.costTotal || row["COUTANT TOTAL"]),
        accessCredit: cleanNumber(row.accessCredit || row["ACCES CRÉDIT"]),
        displayedPrice: cleanNumber(row.displayedPrice || row["PRIX AFFICHÉ"]),
        potentialProfit: potentialProfit,
        sellStatus:
          cleanString(row.sellStatus || row["STATUT VENDU"])?.toLowerCase() === "true" || row.sellStatus === true
            ? true
            : false,
        customerName: cleanString(row.customerName || row["Nom du client"]),
        saleDate: cleanDate(row.saleDate || row["Date de vente"]),
        paid: cleanString(row.paid || row["PAYÉ"]),
        arbitration: cleanString(row.arbitration || row["ARBIT."]),
        variableGrossProfit: cleanNumber(row.variableGrossProfit || row["Bénéfice brut variable"]),
        costGP: cleanNumber(row.costGP || row["COST GP"]),
        prGP: prGP,
        rebate: rebate,
        vassCost: cleanNumber(row.vassCost || row["V ASS"] || row.VASS),
        prAss: prAss,
        miscellaneousExpenses: fraisDivers,
        totalProfit: totalProfit,
        commission: commission,
        netProfit: netProfit,
        salesperson: salesperson,
        notes: cleanString(row.Notes || row.notes || row["Notes"]),
      }
    })

    console.log("[v0] Mapped data sample:", mapped[0])

    await prisma.tracker.createMany({
      data: mapped,
    })

    return NextResponse.json({
      message: "CSV imported successfully!",
      count: mapped.length,
    })
  } catch (error: any) {
    console.error("[v0] CSV import error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
