import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET single payroll entry
export async function GET(
  _req: NextRequest,
  { params }: any
) {
  try {
    const { id } = params;
    const entry = await prisma.payrollEntry.findUnique({
      where: { id },
    });

    if (!entry) {
      return NextResponse.json(
        { error: 'Payroll entry not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(entry);
  } catch (error) {
    console.error('Error fetching payroll entry:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payroll entry' },
      { status: 500 }
    );
  }
}

// PUT update payroll entry
export async function PUT(
  _req: NextRequest,
  { params }: any
) {
  try {
    const { id } = params;
    const body = await req.json();

    const { name, date, numberOfPays, amountPerPay, commissionDue, paymentMade } = body;

    const totalPaid = numberOfPays * amountPerPay;
    const balance = (commissionDue || 0) - (paymentMade || 0);

    const entry = await prisma.payrollEntry.update({
      where: { id },
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

    return NextResponse.json(entry);
  } catch (error) {
    console.error('Error updating payroll entry:', error);
    return NextResponse.json(
      { error: 'Failed to update payroll entry' },
      { status: 500 }
    );
  }
}

// DELETE payroll entry
export async function DELETE(
  _req: NextRequest,
  { params }: any
) {
  try {
    const { id } = params;
    await prisma.payrollEntry.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Entry deleted successfully' });
  } catch (error) {
    console.error('Error deleting payroll entry:', error);
    return NextResponse.json(
      { error: 'Failed to delete payroll entry' },
      { status: 500 }
    );
  }
}
