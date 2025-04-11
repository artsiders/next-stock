import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
    try {
        const data = await request.json();
        const category = await prisma.category.create({ data });
        return NextResponse.json(category);
    } catch (error) {
        return NextResponse.json(
            { error: (error as Error).message || 'Une erreur est survenue' },
            { status: 500 }
        );
    }
}

export async function GET() {
    try {
        const categories = await prisma.category.findMany();
        return NextResponse.json(categories);
    } catch (error) {
        console.error("Erreur lors de la récupération des categories:", error);
        return NextResponse.json(
            { error: "Erreur serveur lors de la récupération des categories" },
            { status: 500 }
        );
    }
}