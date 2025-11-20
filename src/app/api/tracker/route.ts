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
      // Map CSV column names to database field names
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
        esthetique: "esthetique", // new field
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

  // Remove currency symbols and extra spaces
  const cleaned = value.replace(/[$,\s]/g, "")

  // Handle boolean fields
  if (fieldName === "sellStatus" || fieldName === "paid") {
    return cleaned.toLowerCase() === "true" || cleaned.toLowerCase() === "yes"
  }

  // Handle numeric fields
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

export async function GET() {
  try {
    const trackers = await prisma.tracker.findMany()
    return Response.json(trackers)
  } catch (error) {
    console.error("Database error:", error)
    // Return empty array on error to avoid breaking the frontend
    return Response.json([])
  }
}

export async function DELETE() {
  try {
    await prisma.tracker.deleteMany({})
    return Response.json({ message: "All tracker entries deleted successfully" })
  } catch (error: any) {
    console.error("Database error:", error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get("content-type")

    let records: Record<string, any>[] = []

    if (contentType?.includes("multipart/form-data")) {
      const formData = await request.formData()
      const file = formData.get("file") as File

      if (!file) {
        return Response.json({ error: "No file provided" }, { status: 400 })
      }

      const text = await file.text()
      records = parseCSV(text)
    } else if (contentType?.includes("application/json")) {
      const body = await request.json()
      records = Array.isArray(body) ? body : [body]
    } else {
      return Response.json({ error: "Invalid content type" }, { status: 400 })
    }

    const salesmen = await prisma.salesman.findMany()
    const salesmanMap = new Map(salesmen.map((s) => [s.name.toLowerCase(), s.commissionRate]))

    const results = []
    for (const row of records) {
      try {
        const potentialProfit = cleanValue(row.potentialProfit, "potentialProfit")
        const prGP = cleanValue(row.prGP, "prGP")
        const rebate = cleanValue(row.rebate, "rebate")
        const prAss = cleanValue(row.prAss, "prAss")
        const miscellaneousExpenses = cleanValue(row.miscellaneousExpenses, "miscellaneousExpenses")
        const salesperson = row.salesperson

        let totalProfit = cleanValue(row.totalProfit, "totalProfit")
        if (!totalProfit && (potentialProfit || prGP || rebate || prAss || miscellaneousExpenses)) {
          totalProfit = calculateTotalProfit({
            potentialProfit: typeof potentialProfit === "number" ? potentialProfit : Number(potentialProfit) || 0,
            prGP: typeof prGP === "number" ? prGP : Number(prGP) || 0,
            rebate: typeof rebate === "number" ? rebate : Number(rebate) || 0,
            prAss: typeof prAss === "number" ? prAss : Number(prAss) || 0,
            miscellaneousExpenses:
              typeof miscellaneousExpenses === "number"
                ? miscellaneousExpenses
                : Number(miscellaneousExpenses) || 0,
          })
        }

        let commission = cleanValue(row.commission, "commission")
        if (!commission && totalProfit && salesperson) {
          const commissionRate = salesmanMap.get(salesperson.toLowerCase()) || 0
          // Ensure totalProfit is a number before calling calculateCommission
          const totalProfitNumber = typeof totalProfit === "number" ? totalProfit : Number(totalProfit)
          commission = calculateCommission(totalProfitNumber, commissionRate)
        }

        let netProfit = cleanValue(row.netProfit, "netProfit")
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
          year: cleanValue(row.year, "year"),
          make: row.make,
          model: row.model,
          mileage: cleanValue(row.mileage, "mileage"),
          color: row.color,
          purchasePrice: cleanValue(row.purchasePrice, "purchasePrice"),
          reconciliation: cleanValue(row.reconciliation, "reconciliation"),
          esthetique: cleanValue(row.esthetique, "esthetique"),
          transport: cleanValue(row.transport, "transport"),
          adjustment: cleanValue(row.adjustment, "adjustment"),
          costTotal: cleanValue(row.costTotal, "costTotal"),
          accessCredit: cleanValue(row.accessCredit, "accessCredit"),
          displayedPrice: cleanValue(row.displayedPrice, "displayedPrice"),
          potentialProfit: potentialProfit,
          sellStatus: cleanValue(row.sellStatus, "sellStatus") || false,
          customerName: row.customerName,
          saleDate: row.saleDate,
          paid: cleanValue(row.paid, "paid") || false,
          arbitration: row.arbitration,
          variableGrossProfit: cleanValue(row.variableGrossProfit, "variableGrossProfit"),
          costGP: cleanValue(row.costGP, "costGP"),
          prGP: prGP,
          rebate: rebate,
          vassCost: cleanValue(row.vassCost, "vassCost"),
          prAss: prAss,
          miscellaneousExpenses: miscellaneousExpenses,
          totalProfit: totalProfit,
          commission: commission,
          netProfit: netProfit,
          salesperson: salesperson,
          notes: row.notes,
        }

        // Remove undefined/null values to avoid overwriting existing data
        Object.keys(data).forEach((key) => data[key] === null && delete data[key])

        const result = await prisma.tracker.create({ data })
        results.push(result)
      } catch (error) {
        console.error("Error creating individual record:", error)
        continue
      }
    }

    return Response.json(
      {
        message: `Successfully imported ${results.length} records`,
        count: results.length,
        records: results,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Database error:", error)
    return Response.json({ error: "Failed to process tracker data" }, { status: 500 })
  }
}
