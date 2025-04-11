import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// export async function PUT(request: Request, { params }: { params: { id: string } }) {
//     try {
//         const { id } = params;
//         const data = await request.json();

//         const updatedCategory = await prisma.supplier.update({
//             where: { id: parseInt(id) },
//             data,
//         });

//         return NextResponse.json(updatedCategory);
//     } catch (error) {
//         return NextResponse.json(
//             { error: (error as Error).message || "Une erreur est survenue" },
//             { status: 500 }
//         );
//     }
// }

// export async function DELETE(request: Request, { params }: { params: { id: string } }) {
//     try {
//         const { id } = params; // Pas besoin d'attendre avec await pour params

//         // Suppression du produit dans la base de données
//         const deletedProduct = await prisma.supplier.delete({
//             where: { id: parseInt(id) },
//         });

//         return NextResponse.json(deletedProduct); // Retourne les données du produit supprimé
//     } catch (error) {
//         return NextResponse.json(
//             { error: (error as Error).message || "Une erreur est survenue" },
//             { status: 500 }
//         );
//     }
// }

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const id = parseInt(params.id);

        if (isNaN(id)) {
            return NextResponse.json(
                { error: "ID fournisseur invalide" },
                { status: 400 }
            );
        }

        const supplier = await prisma.supplier.findUnique({
            where: { id },
        });

        if (!supplier) {
            return NextResponse.json(
                { error: "Fournisseur non trouvé" },
                { status: 404 }
            );
        }

        return NextResponse.json(supplier);
    } catch (error) {
        console.error("Erreur lors de la récupération du fournisseur:", error);
        return NextResponse.json(
            { error: "Erreur serveur lors de la récupération du fournisseur" },
            { status: 500 }
        );
    }
}

export async function PUT(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const id = parseInt(params.id);
        const data = await request.json();

        if (isNaN(id)) {
            return NextResponse.json(
                { error: "ID fournisseur invalide" },
                { status: 400 }
            );
        }

        // Validation des données
        if (!data.name) {
            return NextResponse.json(
                { error: "Le nom du fournisseur est requis" },
                { status: 400 }
            );
        }

        // Vérifier si le fournisseur existe
        const existingSupplier = await prisma.supplier.findUnique({
            where: { id },
        });

        if (!existingSupplier) {
            return NextResponse.json(
                { error: "Fournisseur non trouvé" },
                { status: 404 }
            );
        }

        // Mettre à jour le fournisseur
        const updatedSupplier = await prisma.supplier.update({
            where: { id },
            data: {
                name: data.name,
                email: data.email,
                phone: data.phone,
            },
        });

        return NextResponse.json(updatedSupplier);
    } catch (error) {
        console.error("Erreur lors de la mise à jour du fournisseur:", error);
        return NextResponse.json(
            { error: "Erreur serveur lors de la mise à jour du fournisseur" },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const id = parseInt(params.id);

        if (isNaN(id)) {
            return NextResponse.json(
                { error: "ID fournisseur invalide" },
                { status: 400 }
            );
        }

        // Vérifier si le fournisseur existe
        const supplier = await prisma.supplier.findUnique({
            where: { id },
            include: {
                products: true,
            },
        });

        if (!supplier) {
            return NextResponse.json(
                { error: "Fournisseur non trouvé" },
                { status: 404 }
            );
        }

        // Vérifier si le fournisseur est utilisé dans des produits
        if (supplier.products.length > 0) {
            return NextResponse.json(
                {
                    error: "Ce fournisseur ne peut pas être supprimé car il est lié à des produits",
                    count: supplier.products.length
                },
                { status: 400 }
            );
        }

        // Supprimer le fournisseur
        await prisma.supplier.delete({
            where: { id },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Erreur lors de la suppression du fournisseur:", error);
        return NextResponse.json(
            { error: "Erreur serveur lors de la suppression du fournisseur" },
            { status: 500 }
        );
    }
}