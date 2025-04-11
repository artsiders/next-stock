import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(request: Request, context: { params: { id: string } }) {
    try {
        const { id } = context.params;
        const data = await request.json();

        const updatedCategory = await prisma.category.update({
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

export async function DELETE(request: Request, context: { params: { id: string } }) {
    try {
        const { id } = context.params;

        const deletedProduct = await prisma.category.delete({
            where: { id: parseInt(id) },
        });

        return NextResponse.json(deletedProduct);
    } catch (error) {
        return NextResponse.json(
            { error: (error as Error).message || "Une erreur est survenue" },
            { status: 500 }
        );
    }
}
