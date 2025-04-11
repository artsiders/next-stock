// app/api/statistics/categories/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        // Récupérer toutes les catégories avec leurs produits
        const categories = await prisma.category.findMany({
            include: {
                products: {
                    select: {
                        quantity: true,
                        costPrice: true
                    }
                }
            }
        });

        // Calculer les statistiques par catégorie
        const categoryStats = categories.map(category => {
            const count = category.products.length;
            const value = category.products.reduce(
                (sum, product) => sum + (product.quantity * product.costPrice),
                0
            );

            return {
                name: category.name,
                count,
                value
            };
        });

        return NextResponse.json(categoryStats);
    } catch (error) {
        console.error("Erreur lors de la récupération des catégories:", error);
        return NextResponse.json(
            { error: "Erreur serveur lors de la récupération des données" },
            { status: 500 }
        );
    }
}