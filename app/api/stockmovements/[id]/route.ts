// app/api/stockmovements/[id]/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const resolvedParams = await params;
        const id = parseInt(resolvedParams.id)

        if (isNaN(id)) {
            return NextResponse.json(
                { error: "ID mouvement invalide" },
                { status: 400 }
            );
        }

        const movement = await prisma.stockMovement.findUnique({
            where: { id },
            include: {
                product: true,
            },
        });

        if (!movement) {
            return NextResponse.json(
                { error: "Mouvement de stock non trouvé" },
                { status: 404 }
            );
        }

        return NextResponse.json(movement);
    } catch (error) {
        console.error("Erreur lors de la récupération du mouvement de stock:", error);
        return NextResponse.json(
            { error: "Erreur serveur lors de la récupération du mouvement de stock" },
            { status: 500 }
        );
    }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const resolvedParams = await params;
        const id = parseInt(resolvedParams.id)

        if (isNaN(id)) {
            return NextResponse.json(
                { error: "ID mouvement invalide" },
                { status: 400 }
            );
        }

        // Vérifier si le mouvement existe
        const movement = await prisma.stockMovement.findUnique({
            where: { id },
            include: {
                product: true,
            },
        });

        if (!movement) {
            return NextResponse.json(
                { error: "Mouvement de stock non trouvé" },
                { status: 404 }
            );
        }

        // Annuler l'effet du mouvement sur le stock du produit
        let newQuantity = movement.product.quantity;

        if (movement.type === 'IN') {
            newQuantity -= movement.quantity;
            if (newQuantity < 0) {
                newQuantity = 0;
            }
        } else if (movement.type === 'OUT') {
            newQuantity += movement.quantity;
        }
        // Pour ADJUSTMENT, on ne fait rien car il est difficile de revenir à l'état précédent

        // Supprimer le mouvement et mettre à jour le stock du produit
        await prisma.$transaction([
            prisma.stockMovement.delete({
                where: { id },
            }),
            prisma.product.update({
                where: { id: movement.productId },
                data: { quantity: newQuantity },
            }),
        ]);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Erreur lors de la suppression du mouvement de stock:", error);
        return NextResponse.json(
            { error: "Erreur serveur lors de la suppression du mouvement de stock" },
            { status: 500 }
        );
    }
}