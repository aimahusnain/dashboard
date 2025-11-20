export interface ProfitData {
  potentialProfit?: number | null | string
  prGP?: number | null | string
  rebate?: number | null | string
  prAss?: number | null | string
  miscellaneousExpenses?: number | null | string
  commission?: number | null | string
}

export interface CalculatedProfit {
  totalProfit: number
  netProfit: number
}

/**
 * Calculate Total Profit based on formula:
 * PROFIT TOTAL = PROFIT POTENTIEL + PR GP + RISTOURNE + PR ASS - FRAIS DIVERS
 */
export function calculateTotalProfit(data: ProfitData): number {
  const potentialProfit =
    typeof data.potentialProfit === "number" ? data.potentialProfit : Number(data.potentialProfit) || 0
  const prGP = typeof data.prGP === "number" ? data.prGP : Number(data.prGP) || 0
  const rebate = typeof data.rebate === "number" ? data.rebate : Number(data.rebate) || 0
  const prAss = typeof data.prAss === "number" ? data.prAss : Number(data.prAss) || 0
  const fraisDivers =
    typeof data.miscellaneousExpenses === "number"
      ? data.miscellaneousExpenses
      : Number(data.miscellaneousExpenses) || 0

  return potentialProfit + prGP + rebate + prAss - fraisDivers
}

/**
 * Calculate Commission based on formula:
 * COMMISSION = VLOOKUP(Vendeur, SalesmanTable, CommissionRate) * PROFIT TOTAL
 * For now, we'll use a passed commission rate or calculate from salesman data
 */
export function calculateCommission(totalProfit: number, commissionRate = 0): number {
  if (!totalProfit || !commissionRate) return 0
  return totalProfit * (commissionRate / 100)
}

/**
 * Calculate Net Profit based on formula:
 * PROFIT NET = PROFIT TOTAL - COMMISSION
 */
export function calculateNetProfit(totalProfit: number, commission: number): number {
  return totalProfit - commission
}

/**
 * Calculate all profit-related fields in one go
 */
export function calculateAllProfits(data: ProfitData, commissionRate = 0): CalculatedProfit {
  const totalProfit = calculateTotalProfit(data)
  const commission = calculateCommission(totalProfit, commissionRate)
  const netProfit = calculateNetProfit(totalProfit, commission)

  return {
    totalProfit,
    netProfit,
  }
}
