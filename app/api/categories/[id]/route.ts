import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const resolvedParams = await params;
        const data = await request.json();

        const updatedCategory = await prisma.category.update({
            where: { id: parseInt(resolvedParams.id) },
            data,
        });

        return NextResponse.json(updatedCategory);
    } catch (error) {
        return NextResponse.json(
            { error: (error as Error).message || "Une erreur est survenue" },
            { status: 500 }
        );
    }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const resolvedParams = await params;

        const deletedProduct = await prisma.category.delete({
            where: { id: parseInt(resolvedParams.id) },
        });

        return NextResponse.json(deletedProduct); // Retourne les données du produit supprimé
    } catch (error) {
        return NextResponse.json(
            { error: (error as Error).message || "Une erreur est survenue" },
            { status: 500 }
        );
    }
}