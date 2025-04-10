import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(request: Request, { params }: { params: { id: string } }) {
    try {
        const { id } = await params;
        const data = await request.json();

        const updatedCategory = await prisma.product.update({
            where: { id: parseInt(id) },
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

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
    try {
        const { id } = params; // Pas besoin d'attendre avec await pour params

        // Suppression du produit dans la base de données
        const deletedProduct = await prisma.product.delete({
            where: { id: parseInt(id) },
        });

        return NextResponse.json(deletedProduct); // Retourne les données du produit supprimé
    } catch (error) {
        return NextResponse.json(
            { error: (error as Error).message || "Une erreur est survenue" },
            { status: 500 }
        );
    }
}
