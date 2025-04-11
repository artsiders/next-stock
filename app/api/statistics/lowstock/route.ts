// app/api/statistics/lowstock/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        // Récupérer les produits avec stock faible
        const lowStockProducts = await prisma.product.findMany({
            where: {
                quantity: {
                    gt: 0,
                    lt: prisma.product.fields.minQuantity
                }
            },
            select: {
                id: true,
                name: true,
                quantity: true,
                minQuantity: true
            },
            orderBy: {
                quantity: 'asc'
            },
            take: 10 // Limiter à 10 produits pour l'affichage
        });

        // Calculer le pourcentage pour chaque produit
        const formattedProducts = lowStockProducts.map(product => ({
            ...product,
            percentage: Math.round((product.quantity / product.minQuantity) * 100)
        }));

        return NextResponse.json(formattedProducts);
    } catch (error) {
        console.error("Erreur lors de la récupération des produits à faible stock:", error);
        return NextResponse.json(
            { error: "Erreur serveur lors de la récupération des données" },
            { status: 500 }
        );
    }
}