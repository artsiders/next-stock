import { PrismaClient, Category, Supplier, Product, StockMovement, MovementType } from '@prisma/client';

const prisma = new PrismaClient();

// --------------------
// Types personnalisés
// --------------------

// Une catégorie avec ses products associés
export type CategorieWithProducts = Category & {
  products: Product[];
};

// Un Supplier avec ses products associés
export type SupplierWithProducts = Supplier & {
  products: Product[];
};

// Un Product avec sa catégorie, son supplier, et éventuellement ses mouvements de stock
export type ProductWithRelations = Product & {
  category: Category;
  supplier: Supplier;
  mouvements?: StockMovement[];
};

// Un mouvement de stock avec les infos du Product concerné
export type StockMovementWithProduct = StockMovement & {
  product: Product;
};

// --------------------
// Fonctions - Catégories
// --------------------

// Récupérer toutes les catégories (triées par nom)
export async function getCategories(): Promise<Category[]> {
  return await prisma.category.findMany({
    orderBy: { name: 'asc' }
  });
}

// Récupérer une catégorie avec ses products
export async function getCategorieById(id: number): Promise<CategorieWithProducts | null> {
  return await prisma.category.findUnique({
    where: { id },
    include: { products: true }
  });
}

// --------------------
// Fonctions - Fournisseurs
// --------------------

// Récupérer tous les fournisseurs (triés par nom)
export async function getSuppliers(): Promise<Supplier[]> {
  return await prisma.supplier.findMany({
    orderBy: { name: 'asc' }
  });
}

// Récupérer un fournisseur avec ses products
export async function getSupplierById(id: number): Promise<SupplierWithProducts | null> {
  return await prisma.supplier.findUnique({
    where: { id },
    include: { products: true }
  });
}

// --------------------
// Fonctions - Products
// --------------------

// Récupérer tous les products avec leurs relations (catégorie et fournisseur)
export async function getProducts(): Promise<ProductWithRelations[]> {
  return await prisma.product.findMany({
    include: {
      category: true,
      supplier: true
    },
    orderBy: { name: 'asc' }
  });
}

// Récupérer un product par ID avec ses relations et ses mouvements de stock
export async function getProductById(id: number): Promise<ProductWithRelations | null> {
  return await prisma.product.findUnique({
    where: { id },
    include: {
      category: true,
      supplier: true,
      movements: {
        orderBy: { date: 'desc' }
      }
    }
  });
}

// Récupérer les products d'une catégorie donnée
export async function getProductsByCategorie(categoryId: number): Promise<ProductWithRelations[]> {
  return await prisma.product.findMany({
    where: { categoryId },
    include: {
      category: true,
      supplier: true
    },
    orderBy: { name: 'asc' }
  });
}

// Récupérer les products d’un fournisseur donné
export async function getProductsByFournisseur(supplierId: number): Promise<ProductWithRelations[]> {
  return await prisma.product.findMany({
    where: { supplierId },
    include: {
      category: true,
      supplier: true
    },
    orderBy: { name: 'asc' }
  });
}

// Récupérer les products qui sont en rupture de stock (quantité ≤ 0)
export async function getProductsEnRupture(): Promise<ProductWithRelations[]> {
  return await prisma.product.findMany({
    where: { quantity: { lte: 0 } },
    include: {
      category: true,
      supplier: true
    },
    orderBy: { name: 'asc' }
  });
}

// Récupérer les products ayant un stock faible (par défaut ≤ 10)
export async function getProductsEnFaibleStock(seuil: number = 10): Promise<ProductWithRelations[]> {
  return await prisma.product.findMany({
    where: {
      quantity: {
        gt: 0,
        lte: seuil
      }
    },
    include: {
      category: true,
      supplier: true
    },
    orderBy: { name: 'asc' }
  });
}

// --------------------
// Fonctions - Mouvements de stock
// --------------------

// Récupérer tous les mouvements de stock avec les infos product
export async function getMouvementsStock(): Promise<StockMovementWithProduct[]> {
  return await prisma.stockMovement.findMany({
    include: {
      product: true
    },
    orderBy: { date: 'desc' }
  });
}

// Récupérer les mouvements d’un product donné
export async function getMouvementsByProduct(productId: number): Promise<StockMovementWithProduct[]> {
  return await prisma.stockMovement.findMany({
    where: { productId },
    include: {
      product: true
    },
    orderBy: { date: 'desc' }
  });
}

// Récupérer les mouvements par type (ENTREE ou SORTIE)
export async function getMouvementsByType(type: MovementType): Promise<StockMovementWithProduct[]> {
  return await prisma.stockMovement.findMany({
    where: { type },
    include: {
      product: true
    },
    orderBy: { date: 'desc' }
  });
}

// Récupérer les mouvements sur une période donnée
export async function getMouvementsByDateRange(startDate: Date, endDate: Date): Promise<StockMovementWithProduct[]> {
  return await prisma.stockMovement.findMany({
    where: {
      date: {
        gte: startDate,
        lte: endDate
      }
    },
    include: {
      product: true
    },
    orderBy: { date: 'desc' }
  });
}
