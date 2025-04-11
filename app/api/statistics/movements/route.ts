// app/api/statistics/movements/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
    format, subDays, startOfDay, endOfDay, startOfWeek, endOfWeek,
    startOfMonth, endOfMonth, startOfYear, endOfYear, eachDayOfInterval,
    eachWeekOfInterval, eachMonthOfInterval
} from "date-fns";
import { fr } from "date-fns/locale";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const periodParam = searchParams.get("period") || "month";
        const dateParam = searchParams.get("date") || new Date().toISOString();
        const date = new Date(dateParam);

        // Déterminer la période de temps
        let startDate: Date;
        let endDate: Date = endOfDay(date);
        let intervalFunction;
        let formatString: string;

        switch (periodParam) {
            case "day":
                startDate = startOfDay(date);
                formatString = "HH'h'";
                // Générer 24 heures pour la journée
                intervalFunction = ({ start }: { start: Date, end: Date }) => {
                    const result = [];
                    for (let i = 0; i < 24; i++) {
                        const hour = new Date(start);
                        hour.setHours(i, 0, 0, 0);
                        result.push(hour);
                    }
                    return result;
                };
                break;
            case "week":
                startDate = startOfWeek(date, { locale: fr });
                endDate = endOfWeek(date, { locale: fr });
                formatString = "EEE";
                intervalFunction = eachDayOfInterval;
                break;
            case "month":
                startDate = startOfMonth(date);
                endDate = endOfMonth(date);
                formatString = "d";
                intervalFunction = eachDayOfInterval;
                break;
            case "year":
                startDate = startOfYear(date);
                endDate = endOfYear(date);
                formatString = "MMM";
                intervalFunction = eachMonthOfInterval;
                break;
            default:
                startDate = startOfMonth(date);
                endDate = endOfMonth(date);
                formatString = "d";
                intervalFunction = eachDayOfInterval;
        }

        // Récupérer les mouvements sur la période
        const movements = await prisma.stockMovement.findMany({
            where: {
                date: {
                    gte: startDate,
                    lte: endDate
                }
            }
        });

        // Créer les intervalles de temps pour le graphique
        const intervals = intervalFunction({ start: startDate, end: endDate });

        // Formater pour le résultat
        const movementStats = intervals.map(interval => {
            // Pour chaque intervalle, filtrer les mouvements correspondants
            let startInterval: Date;
            let endInterval: Date;

            if (periodParam === "day") {
                startInterval = new Date(interval);
                startInterval.setMinutes(0, 0, 0);
                endInterval = new Date(interval);
                endInterval.setMinutes(59, 59, 999);
            } else if (periodParam === "year") {
                startInterval = startOfMonth(interval);
                endInterval = endOfMonth(interval);
            } else {
                startInterval = startOfDay(interval);
                endInterval = endOfDay(interval);
            }

            const intervalMovements = movements.filter(movement => {
                const movementDate = new Date(movement.date);
                return movementDate >= startInterval && movementDate <= endInterval;
            });

            // Compter les différents types de mouvements
            const inCount = intervalMovements.filter(m => m.type === "IN")
                .reduce((sum, m) => sum + m.quantity, 0);

            const outCount = intervalMovements.filter(m => m.type === "OUT")
                .reduce((sum, m) => sum + m.quantity, 0);

            const adjustmentCount = intervalMovements.filter(m => m.type === "ADJUSTMENT")
                .reduce((sum, m) => sum + Math.abs(m.quantity), 0);

            return {
                date: format(interval, formatString, { locale: fr }),
                in: inCount,
                out: outCount,
                adjustment: adjustmentCount
            };
        });

        return NextResponse.json(movementStats);
    } catch (error) {
        console.error("Erreur lors de la récupération des mouvements:", error);
        return NextResponse.json(
            { error: "Erreur serveur lors de la récupération des données" },
            { status: 500 }
        );
    }
}