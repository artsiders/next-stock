import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
    try {
        const data = await request.json();
        const category = await prisma.supplier.create({ data });
        return NextResponse.json(category);
    } catch (error) {
        return NextResponse.json(
            { error: (error as Error).message || 'Une erreur est survenue' },
            { status: 500 }
        );
    }
}