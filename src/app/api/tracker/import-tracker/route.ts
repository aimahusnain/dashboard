import { prisma } from "@/lib/prisma"
import { calculateTotalProfit, calculateCommission, calculateNetProfit } from "@/lib/profit-calculator"

function parseCSV(text: string) {
  const lines = text.trim().split("\n")
  const headers = lines[0].split(",").map((h) => h.trim().toLowerCase().replace(/"/g, ""))
  const records = []
  
  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue
    const values = lines[i].split(",").map((v) => v.trim().replace(/"/g, ""))
    const record: Record<string, any> = {}
    
    headers.forEach((header, index) => {
      const value = values[index] || ""
      const fieldMap: Record<string, string> = {
        dateachat: "datePurchase",
        action: "action",
        stockno: "stockNo",
        categories: "category",
        annee: "year",
        marque: "make",
        modele: "model",
        kilometrage: "mileage",
        couleur: "color",
        prixachat: "purchasePrice",
        recon: "reconciliation",
        esthetique: "esthetique",
        transport: "transport",
        ajustement: "adjustment",
        coutanttotal: "costTotal",
        accescredit: "accessCredit",
        prixaffiche: "displayedPrice",
        profitpotentiel: "potentialProfit",
        sellstatus: "sellStatus",
        nomclient: "customerName",
        datevente: "saleDate",
        paye: "paid",
        arbit: "arbitration",
        beneficebrutvariable: "variableGrossProfit",
        costgp: "costGP",
        prgp: "prGP",
        ristourne: "rebate",
        vasscost: "vassCost",
        prass: "prAss",
        fraisdivers: "miscellaneousExpenses",
        profittotal: "totalProfit",
        commission: "commission",
        profitnet: "netProfit",
        vendeur: "salesperson",
        notes: "notes",
      }
      const fieldName = fieldMap[header] || header
      record[fieldName] = value
    })
    records.push(record)
  }
  return records
}

function cleanValue(value: string, fieldName: string) {
  if (!value) return null
  const cleaned = value.replace(/[$,\s]/g, "")
  
  if (fieldName === "sellStatus" || fieldName === "reserve") {
    return cleaned.toLowerCase() === "true" || cleaned.toLowerCase() === "yes"
  }
  
  if (
    [
      "year",
      "mileage",
      "purchasePrice",
      "reconciliation",
      "transport",
      "adjustment",
      "costTotal",
      "accessCredit",
      "displayedPrice",
      "potentialProfit",
      "variableGrossProfit",
      "costGP",
      "prGP",
      "rebate",
      "vassCost",
      "prAss",
      "miscellaneousExpenses",
      "totalProfit",
      "commission",
      "netProfit",
      "esthetique",
    ].includes(fieldName)
  ) {
    const num = Number.parseFloat(cleaned)
    return isNaN(num) ? null : num
  }
  return cleaned
}

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get("content-type")
    console.log("[Import] POST /api/import-tracker - Content-Type:", contentType)
    
    if (!contentType?.includes("multipart/form-data")) {
      return Response.json({ error: "Only multipart/form-data (file upload) is supported" }, { status: 400 })
    }

    const formData = await request.formData()
    const file = formData.get("file") as File
    
    if (!file) {
      return Response.json({ error: "No file provided" }, { status: 400 })
    }

    const text = await file.text()
    const records = parseCSV(text)

    const salesmen = await prisma.salesman.findMany()
    const salesmanMap = new Map(salesmen.map((s) => [s.name.toLowerCase(), s.commissionRate]))

    const results = []
    for (const row of records) {
      try {
        const potentialProfit = cleanValue(row.potentialProfit?.toString() || "", "potentialProfit")
        const prGP = cleanValue(row.prGP?.toString() || "", "prGP")
        const rebate = cleanValue(row.rebate?.toString() || "", "rebate")
        const prAss = cleanValue(row.prAss?.toString() || "", "prAss")
        const miscellaneousExpenses = cleanValue(row.miscellaneousExpenses?.toString() || "", "miscellaneousExpenses")
        const salesperson = row.salesperson

        let totalProfit = cleanValue(row.totalProfit?.toString() || "", "totalProfit")
        if (!totalProfit && (potentialProfit || prGP || rebate || prAss || miscellaneousExpenses)) {
          totalProfit = calculateTotalProfit({
            potentialProfit: typeof potentialProfit === "number" ? potentialProfit : Number(potentialProfit) || 0,
            prGP: typeof prGP === "number" ? prGP : Number(prGP) || 0,
            rebate: typeof rebate === "number" ? rebate : Number(rebate) || 0,
            prAss: typeof prAss === "number" ? prAss : Number(prAss) || 0,
            miscellaneousExpenses:
              typeof miscellaneousExpenses === "number" ? miscellaneousExpenses : Number(miscellaneousExpenses) || 0,
          })
        }

        let commission = cleanValue(row.commission?.toString() || "", "commission")
        if (!commission && totalProfit && salesperson) {
          const commissionRate = salesmanMap.get(salesperson.toLowerCase()) || 0
          const totalProfitNumber = typeof totalProfit === "number" ? totalProfit : Number(totalProfit)
          commission = calculateCommission(totalProfitNumber, commissionRate)
        }

        let netProfit = cleanValue(row.netProfit?.toString() || "", "netProfit")
        if (
          !netProfit &&
          totalProfit !== null &&
          totalProfit !== undefined &&
          commission !== null &&
          commission !== undefined
        ) {
          const tp = typeof totalProfit === "number" ? totalProfit : Number(totalProfit)
          const com = typeof commission === "number" ? commission : Number(commission)
          if (!Number.isNaN(tp) && !Number.isNaN(com)) {
            netProfit = calculateNetProfit(tp, com)
          } else {
            netProfit = null
          }
        }

        const data: any = {
          datePurchase: row.datePurchase,
          action: row.action,
          stockNo: row.stockNo,
          category: row.category,
          year: row.year ? Number.parseInt(row.year.toString()) : undefined,
          make: row.make,
          model: row.model,
          mileage: row.mileage ? Number.parseFloat(row.mileage.toString()) : undefined,
          color: row.color,
          purchasePrice: row.purchasePrice ? Number.parseFloat(row.purchasePrice.toString()) : undefined,
          reconciliation: row.reconciliation ? Number.parseFloat(row.reconciliation.toString()) : undefined,
          esthetique: row.esthetique ? Number.parseFloat(row.esthetique.toString()) : undefined,
          transport: row.transport ? Number.parseFloat(row.transport.toString()) : undefined,
          adjustment: row.adjustment ? Number.parseFloat(row.adjustment.toString()) : undefined,
          costTotal: row.costTotal ? Number.parseFloat(row.costTotal.toString()) : undefined,
          accessCredit: row.accessCredit ? Number.parseFloat(row.accessCredit.toString()) : undefined,
          displayedPrice: row.displayedPrice ? Number.parseFloat(row.displayedPrice.toString()) : undefined,
          potentialProfit: potentialProfit,
          sellStatus: row.sellStatus ? true : false,
          customerName: row.customerName,
          saleDate: row.saleDate,
          paid: row.paid,
          arbitration: row.arbitration,
          variableGrossProfit: row.variableGrossProfit
            ? Number.parseFloat(row.variableGrossProfit.toString())
            : undefined,
          costGP: row.costGP ? Number.parseFloat(row.costGP.toString()) : undefined,
          prGP: prGP,
          rebate: rebate,
          vassCost: row.vassCost ? Number.parseFloat(row.vassCost.toString()) : undefined,
          prAss: prAss,
          miscellaneousExpenses: miscellaneousExpenses,
          totalProfit: totalProfit,
          commission: commission,
          netProfit: netProfit,
          salesperson: salesperson,
          notes: row.notes,
        }

        Object.keys(data).forEach((key) => data[key] === null && delete data[key])

        const result = await prisma.tracker.create({ data })
        results.push(result)
      } catch (error) {
        console.error("Error creating individual record:", error)
        continue
      }
    }

    console.log("[Import] Created records:", results.length)
    return Response.json(
      {
        message: `Successfully imported ${results.length} records`,
        count: results.length,
        records: results,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Import error:", error)
    return Response.json({ error: "Failed to import tracker data" }, { status: 500 })
  }
}