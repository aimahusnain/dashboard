import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import * as csv from "csv-parse/sync";
import { parse } from "date-fns";

const prisma = new PrismaClient();

const cleanNumber = (value: string | null) => {
  if (!value) return null;
  return parseFloat(
    value.replace(/\$/g, "").replace(/,/g, "").replace(/\s+/g, "")
  );
};

const cleanMileage = (value: string | null) => {
  if (!value) return null;
  return parseFloat(
    value.replace("KM", "").replace(/,/g, "").trim()
  );
};

const cleanDate = (value: string | null) => {
  if (!value) return null;
  try {
    const parsed = parse(value, "d-MMM-yy", new Date());
    return parsed.toISOString();
  } catch {
    return value; // keep original if not parseable
  }
};

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const file = form.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "CSV file missing" }, { status: 400 });
    }

    const text = await file.text();
    const records = csv.parse(text, {
      columns: true,
      skip_empty_lines: true,
    });

    const mapped = records.map((row: any) => ({
      datePurchase: row.datePurchase || null,
      action: row.action || null,
      stockNo: row.stockNo || null,
      category: row.category || null,
      year: row.year ? parseInt(row.year) : null,
      make: row.make || null,
      model: row.model || null,
      mileage: cleanMileage(row.mileage),
      color: row.color || null,
      purchasePrice: cleanNumber(row.purchasePrice),
      reconciliation: cleanNumber(row.reconciliation),
      esthetique: cleanNumber(row["ESTHÉTIQUE"]),
      transport: cleanNumber(row.transport),
      adjustment: cleanNumber(row.adjustment),
      costTotal: cleanNumber(row.costTotal),
      accessCredit: cleanNumber(row.accessCredit),
      displayedPrice: cleanNumber(row.displayedPrice),
      potentialProfit: cleanNumber(row.potentialProfit),
      sellStatus: row.sellStatus?.trim().toLowerCase() == "true" ? true : false,
      customerName: row.customerName || null,
      saleDate: cleanDate(row.saleDate),
      paid: row.paid || null,
      arbitration: row.arbitration || null,
      variableGrossProfit: cleanNumber(row.variableGrossProfit),
      costGP: cleanNumber(row.costGP),
      prGP: cleanNumber(row.prGP),
      rebate: cleanNumber(row.RISTOURNE),
      vassCost: cleanNumber(row.VASS),
      prAss: cleanNumber(row.PRASS),
      miscellaneousExpenses: cleanNumber(row.FRAISDIVERS),
      totalProfit: cleanNumber(row.PROFITTOTAL),
      commission: cleanNumber(row.Commission),
      netProfit: cleanNumber(row.PROFITNET),
      salesperson: row.Vendeur || null,
      notes: row.Notes || null,
    }));

    await prisma.tracker.createMany({
      data: mapped
    });

    return NextResponse.json({
      message: "CSV imported successfully!",
      count: mapped.length,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
