import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
    try {
        const data = await request.json();
        const category = await prisma.product.create({ data });
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
        const products = await prisma.product.findMany({
            include: {
                category: true,
                supplier: true,
            },
            orderBy: {
                name: 'asc',
            },
        });

        return NextResponse.json(products);
    } catch (error) {
        console.error("Erreur lors de la récupération des produits:", error);
        return NextResponse.json(
            { error: "Erreur serveur lors de la récupération des produits" },
            { status: 500 }
        );
    }
}