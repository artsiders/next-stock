// app/api/statistics/summary/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

import {
    startOfDay, startOfWeek,
    startOfMonth, startOfYear
} from "date-fns";
import { fr } from "date-fns/locale";

// Fonction utilitaire pour calculer la date de début selon la période
function getStartDate(date: Date, period: 'day' | 'week' | 'month' | 'year'): Date {
    switch (period) {
        case 'day':
            return startOfDay(date);
        case 'week':
            return startOfWeek(date, { locale: fr });
        case 'month':
            return startOfMonth(date);
        case 'year':
            return startOfYear(date);
        default:
            return startOfMonth(date);
    }
}

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const periodParam = searchParams.get("period") || "month";
        const dateParam = searchParams.get("date") || new Date().toISOString();

        const startDate = getStartDate(new Date(dateParam), periodParam as any);

        // Compter tous les produits
        const totalProducts = await prisma.product.count();

        // Compter les produits avec stock faible (mais pas à zéro)
        const lowStockProducts = await prisma.product.count({
            where: {
                quantity: {
                    gt: 0,
                    lt: prisma.product.fields.minQuantity
                }
            }
        });

        // Compter les produits avec stock à zéro
        const outOfStockProducts = await prisma.product.count({
            where: {
                quantity: 0
            }
        });

        // Compter les mouvements sur la période
        const totalMovements = await prisma.stockMovement.count({
            where: {
                date: {
                    gte: startDate
                }
            }
        });

        return NextResponse.json({
            totalProducts,
            lowStockProducts,
            outOfStockProducts,
            totalMovements
        });
    } catch (error) {
        console.error("Erreur lors de la récupération du résumé:", error);
        return NextResponse.json(
            { error: "Erreur serveur lors de la récupération des données" },
            { status: 500 }
        );
    }
}
