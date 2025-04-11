// app/api/statistics/value/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        // Récupérer tous les produits avec leur quantité et prix
        const products = await prisma.product.findMany({
            select: {
                quantity: true,
                costPrice: true,
                unitPrice: true
            }
        });

        // Calculer les statistiques de valeur
        let totalValue = 0;
        let potentialRevenue = 0;

        products.forEach(product => {
            totalValue += product.quantity * product.costPrice;
            potentialRevenue += product.quantity * product.unitPrice;
        });

        const averageCost = products.length > 0
            ? totalValue / products.reduce((sum, product) => sum + product.quantity, 0)
            : 0;

        const margin = potentialRevenue - totalValue;

        return NextResponse.json({
            totalValue,
            averageCost,
            potentialRevenue,
            margin
        });
    } catch (error) {
        console.error("Erreur lors de la récupération des valeurs:", error);
        return NextResponse.json(
            { error: "Erreur serveur lors de la récupération des données" },
            { status: 500 }
        );
    }
}