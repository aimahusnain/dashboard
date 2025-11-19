import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET all payroll entries
export async function GET(req: NextRequest) {
  try {
    const entries = await prisma.payrollEntry.findMany({
      orderBy: { date: 'desc' },
    });
    return NextResponse.json(entries);
  } catch (error) {
    console.error('Error fetching payroll entries:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payroll entries' },
      { status: 500 }
    );
  }
}

// POST create new payroll entry
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    const { name, date, numberOfPays, amountPerPay, commissionDue, paymentMade } = body;
    
    const totalPaid = numberOfPays * amountPerPay;
    const balance = (commissionDue || 0) - (paymentMade || 0);

    const entry = await prisma.payrollEntry.create({
      data: {
        name,
        date: new Date(date),
        numberOfPays: parseInt(numberOfPays),
        amountPerPay: parseFloat(amountPerPay),
        totalPaid,
        commissionDue: parseFloat(commissionDue || 0),
        paymentMade: parseFloat(paymentMade || 0),
        balance,
      },
    });

    return NextResponse.json(entry, { status: 201 });
  } catch (error) {
    console.error('Error creating payroll entry:', error);
    return NextResponse.json(
      { error: 'Failed to create payroll entry' },
      { status: 500 }
    );
  }
}
