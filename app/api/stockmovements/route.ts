// app/api/stockmovements/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { MovementType } from "@prisma/client";

export async function GET() {
    try {
        const movements = await prisma.stockMovement.findMany({
            include: {
                product: true,
            },
            orderBy: {
                date: 'desc',
            },
        });

        return NextResponse.json(movements);
    } catch (error) {
        console.error("Erreur lors de la récupération des mouvements de stock:", error);
        return NextResponse.json(
            { error: "Erreur serveur lors de la récupération des mouvements de stock" },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const data = await request.json();

        // Validation des données
        if (!data.productId) {
            return NextResponse.json(
                { error: "L'ID du produit est requis" },
                { status: 400 }
            );
        }

        if (!data.type || !Object.values(MovementType).includes(data.type)) {
            return NextResponse.json(
                { error: "Type de mouvement invalide" },
                { status: 400 }
            );
        }

        if (typeof data.quantity !== 'number' || data.quantity <= 0) {
            return NextResponse.json(
                { error: "La quantité doit être un nombre positif" },
                { status: 400 }
            );
        }

        // Vérifier si le produit existe
        const product = await prisma.product.findUnique({
            where: { id: data.productId },
        });

        if (!product) {
            return NextResponse.json(
                { error: "Produit non trouvé" },
                { status: 404 }
            );
        }

        // Créer le mouvement de stock
        const movement = await prisma.stockMovement.create({
            data: {
                productId: data.productId,
                type: data.type,
                quantity: data.quantity,
                date: data.date ? new Date(data.date) : new Date(),
                note: data.note || null,
            },
        });

        // Mettre à jour le stock du produit
        let newQuantity = product.quantity;

        if (data.type === 'IN') {
            newQuantity += data.quantity;
        } else if (data.type === 'OUT') {
            newQuantity -= data.quantity;
            if (newQuantity < 0) {
                newQuantity = 0;
            }
        } else if (data.type === 'ADJUSTMENT') {
            newQuantity = data.quantity;
        }

        await prisma.product.update({
            where: { id: data.productId },
            data: { quantity: newQuantity },
        });

        return NextResponse.json(movement, { status: 201 });
    } catch (error) {
        console.error("Erreur lors de la création du mouvement de stock:", error);
        return NextResponse.json(
            { error: "Erreur serveur lors de la création du mouvement de stock" },
            { status: 500 }
        );
    }
}