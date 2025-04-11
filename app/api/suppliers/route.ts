import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// export async function POST(request: Request) {
//     try {
//         const data = await request.json();
//         const category = await prisma.supplier.create({ data });
//         return NextResponse.json(category);
//     } catch (error) {
//         return NextResponse.json(
//             { error: (error as Error).message || 'Une erreur est survenue' },
//             { status: 500 }
//         );
//     }
// }

export async function GET() {
    try {
        const suppliers = await prisma.supplier.findMany({
            orderBy: {
                name: 'asc',
            },
        });

        return NextResponse.json(suppliers);
    } catch (error) {
        console.error("Erreur lors de la récupération des fournisseurs:", error);
        return NextResponse.json(
            { error: "Erreur serveur lors de la récupération des fournisseurs" },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const data = await request.json();

        // Validation des données
        if (!data.name) {
            return NextResponse.json(
                { error: "Le nom du fournisseur est requis" },
                { status: 400 }
            );
        }

        // Vérifier si le fournisseur existe déjà
        const existingSupplier = await prisma.supplier.findFirst({
            where: {
                name: {
                    equals: data.name.toLowerCase(),
                },
            },
        });

        if (existingSupplier) {
            return NextResponse.json(
                { error: "Un fournisseur avec ce nom existe déjà" },
                { status: 409 }
            );
        }

        // Créer le fournisseur
        const supplier = await prisma.supplier.create({
            data: {
                name: data.name,
                email: data.email,
                phone: data.phone,
            },
        });

        return NextResponse.json(supplier, { status: 201 });
    } catch (error) {
        console.error("Erreur lors de la création du fournisseur:", error);
        return NextResponse.json(
            { error: "Erreur serveur lors de la création du fournisseur" },
            { status: 500 }
        );
    }
}
