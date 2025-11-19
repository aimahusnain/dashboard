import { prisma } from '@/lib/prisma'

function parseCSV(text: string) {
  const lines = text.trim().split('\n')
  const headers = lines[0]
    .split(',')
    .map(h => h.trim().toLowerCase().replace(/"/g, ''))
  
  const records = []
  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue
    
    const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''))
    const record: Record<string, any> = {}
    
    headers.forEach((header, index) => {
      const value = values[index] || ''
      // Map CSV column names to database field names
      const fieldMap: Record<string, string> = {
        'dateachat': 'datePurchase',
        'action': 'action',
        'stockno': 'stockNo',
        'categories': 'category',
        'annee': 'year',
        'marque': 'make',
        'modele': 'model',
        'kilometrage': 'mileage',
        'couleur': 'color',
        'prixachat': 'purchasePrice',
        'recon': 'reconciliation',
        'esthetique': 'esthetique', // new field
        'transport': 'transport',
        'ajustement': 'adjustment',
        'coutanttotal': 'costTotal',
        'accescredit': 'accessCredit',
        'prixaffiche': 'displayedPrice',
        'profitpotentiel': 'potentialProfit',
        'sellstatus': 'sellStatus',
        'nomclient': 'customerName',
        'datevente': 'saleDate',
        'paye': 'paid',
        'arbit': 'arbitration',
        'beneficebrutvariable': 'variableGrossProfit',
        'costgp': 'costGP',
        'prgp': 'prGP',
        'ristourne': 'rebate',
        'vasscost': 'vassCost',
        'prass': 'prAss',
        'fraisdivers': 'miscellaneousExpenses',
        'profittotal': 'totalProfit',
        'commission': 'commission',
        'profitnet': 'netProfit',
        'vendeur': 'salesperson',
        'notes': 'notes'
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
  const cleaned = value.replace(/[$,\s]/g, '')
  
  // Handle boolean fields
  if (fieldName === 'sellStatus' || fieldName === 'paid') {
    return cleaned.toLowerCase() === 'true' || cleaned.toLowerCase() === 'yes'
  }
  
  // Handle numeric fields
  if (['year', 'mileage', 'purchasePrice', 'reconciliation', 'transport', 
       'adjustment', 'costTotal', 'accessCredit', 'displayedPrice', 
       'potentialProfit', 'variableGrossProfit', 'costGP', 'prGP', 'rebate',
       'vassCost', 'prAss', 'miscellaneousExpenses', 'totalProfit', 
       'commission', 'netProfit', 'esthetique'].includes(fieldName)) {
    const num = parseFloat(cleaned)
    return isNaN(num) ? null : num
  }
  
  return cleaned
}

export async function GET() {
  try {
    const trackers = await prisma.tracker.findMany()
    return Response.json(trackers)
  } catch (error) {
    console.error('Database error:', error)
    // Return empty array on error to avoid breaking the frontend
    return Response.json([])
  }
}


export async function POST(request: Request) {
  try {
    const contentType = request.headers.get('content-type')
    
    let records: Record<string, any>[] = []
    
    if (contentType?.includes('multipart/form-data')) {
      const formData = await request.formData()
      const file = formData.get('file') as File
      
      if (!file) {
        return Response.json({ error: 'No file provided' }, { status: 400 })
      }
      
      const text = await file.text()
      records = parseCSV(text)
    } else if (contentType?.includes('application/json')) {
      const body = await request.json()
      records = Array.isArray(body) ? body : [body]
    } else {
      return Response.json({ error: 'Invalid content type' }, { status: 400 })
    }
    
    const results = []
    for (const row of records) {
      try {
        const data: any = {
          datePurchase: row.datePurchase,
          action: row.action,
          stockNo: row.stockNo,
          category: row.category,
          year: cleanValue(row.year, 'year'),
          make: row.make,
          model: row.model,
          mileage: cleanValue(row.mileage, 'mileage'),
          color: row.color,
          purchasePrice: cleanValue(row.purchasePrice, 'purchasePrice'),
          reconciliation: cleanValue(row.reconciliation, 'reconciliation'),
          esthetique: cleanValue(row.esthetique, 'esthetique'),
          transport: cleanValue(row.transport, 'transport'),
          adjustment: cleanValue(row.adjustment, 'adjustment'),
          costTotal: cleanValue(row.costTotal, 'costTotal'),
          accessCredit: cleanValue(row.accessCredit, 'accessCredit'),
          displayedPrice: cleanValue(row.displayedPrice, 'displayedPrice'),
          potentialProfit: cleanValue(row.potentialProfit, 'potentialProfit'),
          sellStatus: cleanValue(row.sellStatus, 'sellStatus') || false,
          customerName: row.customerName,
          saleDate: row.saleDate,
          paid: cleanValue(row.paid, 'paid') || false,
          arbitration: row.arbitration,
          variableGrossProfit: cleanValue(row.variableGrossProfit, 'variableGrossProfit'),
          costGP: cleanValue(row.costGP, 'costGP'),
          prGP: cleanValue(row.prGP, 'prGP'),
          rebate: cleanValue(row.rebate, 'rebate'),
          vassCost: cleanValue(row.vassCost, 'vassCost'),
          prAss: cleanValue(row.prAss, 'prAss'),
          miscellaneousExpenses: cleanValue(row.miscellaneousExpenses, 'miscellaneousExpenses'),
          totalProfit: cleanValue(row.totalProfit, 'totalProfit'),
          commission: cleanValue(row.commission, 'commission'),
          netProfit: cleanValue(row.netProfit, 'netProfit'),
          salesperson: row.salesperson,
          notes: row.notes,
        }
        
        // Remove undefined/null values to avoid overwriting existing data
        Object.keys(data).forEach(key => data[key] === null && delete data[key])
        
        const result = await prisma.tracker.create({ data })
        results.push(result)
      } catch (error) {
        console.error('Error creating individual record:', error)
        continue
      }
    }
    
    return Response.json({ 
      message: `Successfully imported ${results.length} records`,
      count: results.length,
      records: results
    }, { status: 201 })
  } catch (error) {
    console.error('Database error:', error)
    return Response.json({ error: 'Failed to process tracker data' }, { status: 500 })
  }
}
