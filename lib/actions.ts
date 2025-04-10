import {
  PrismaClient,
  Category,
  Supplier,
  Product,
  StockMovement,
  MovementType
} from '@prisma/client';

const prisma = new PrismaClient();

// Types for create and update
export type CategoryCreate = Omit<Category, 'id'>;
export type SupplierCreate = Omit<Supplier, 'id'>;
export type ProductCreate = Omit<Product, 'id' | 'createdAt' | 'updatedAt'>;
export type StockMovementCreate = Omit<StockMovement, 'id' | 'date'>;

// Category actions
export async function createCategory(data: CategoryCreate): Promise<Category> {
  return await prisma.category.create({ data });
}

export async function updateCategory(id: number, data: Partial<CategoryCreate>): Promise<Category> {
  return await prisma.category.update({
    where: { id },
    data
  });
}

export async function deleteCategory(id: number): Promise<Category> {
  const productCount = await prisma.product.count({
    where: { categoryId: id }
  });

  if (productCount > 0) {
    throw new Error(`Cannot delete this category because it is linked to ${productCount} product(s).`);
  }

  return await prisma.category.delete({
    where: { id }
  });
}

// Supplier actions
export async function createSupplier(data: SupplierCreate): Promise<Supplier> {
  return await prisma.supplier.create({ data });
}

export async function updateSupplier(id: number, data: Partial<SupplierCreate>): Promise<Supplier> {
  return await prisma.supplier.update({
    where: { id },
    data
  });
}

export async function deleteSupplier(id: number): Promise<Supplier> {
  const productCount = await prisma.product.count({
    where: { supplierId: id }
  });

  if (productCount > 0) {
    throw new Error(`Cannot delete this supplier because it is linked to ${productCount} product(s).`);
  }

  return await prisma.supplier.delete({
    where: { id }
  });
}

// Product actions
export async function createProduct(data: ProductCreate): Promise<Product> {
  return await prisma.product.create({ data });
}

export async function updateProduct(id: number, data: Partial<ProductCreate>): Promise<Product> {
  return await prisma.product.update({
    where: { id },
    data
  });
}

export async function deleteProduct(id: number): Promise<Product> {
  const movementCount = await prisma.stockMovement.count({
    where: { productId: id }
  });

  if (movementCount > 0) {
    throw new Error(`Cannot delete this product because it is linked to ${movementCount} stock movement(s).`);
  }

  return await prisma.product.delete({
    where: { id }
  });
}

// Stock Movement actions
export async function createStockMovement(data: StockMovementCreate): Promise<StockMovement> {
  const product = await prisma.product.findUnique({
    where: { id: data.productId }
  });

  if (!product) {
    throw new Error(`Product with ID ${data.productId} does not exist.`);
  }

  let newQuantity = product.quantity;

  switch (data.type) {
    case MovementType.IN:
      newQuantity += data.quantity;
      break;
    case MovementType.OUT:
      newQuantity -= data.quantity;
      if (newQuantity < 0) {
        throw new Error(`Insufficient stock quantity. Currently: ${product.quantity}`);
      }
      break;
    case MovementType.ADJUSTMENT:
      newQuantity = product.quantity + data.quantity;
      break;
  }

  return await prisma.$transaction(async (tx) => {
    const movement = await tx.stockMovement.create({ data });

    await tx.product.update({
      where: { id: data.productId },
      data: { quantity: newQuantity }
    });

    return movement;
  });
}

export async function deleteStockMovement(id: number): Promise<StockMovement> {
  const movement = await prisma.stockMovement.findUnique({
    where: { id },
    include: { product: true }
  });

  if (!movement) {
    throw new Error(`Movement with ID ${id} does not exist.`);
  }

  let newQuantity = movement.product.quantity;

  switch (movement.type) {
    case MovementType.IN:
      newQuantity -= movement.quantity;
      if (newQuantity < 0) {
        throw new Error(`Cannot undo this movement, it would result in negative stock.`);
      }
      break;
    case MovementType.OUT:
      newQuantity += movement.quantity;
      break;
    case MovementType.ADJUSTMENT:
      newQuantity -= movement.quantity;
      break;
  }

  return await prisma.$transaction(async (tx) => {
    const deletedMovement = await tx.stockMovement.delete({
      where: { id }
    });

    await tx.product.update({
      where: { id: movement.productId },
      data: { quantity: newQuantity }
    });

    return deletedMovement;
  });
}

// Utility functions
export async function recomputeStockFromMovements(productId: number): Promise<Product> {
  const movements = await prisma.stockMovement.findMany({
    where: { productId }
  });

  let newQuantity = 0;

  for (const movement of movements) {
    switch (movement.type) {
      case MovementType.IN:
        newQuantity += movement.quantity;
        break;
      case MovementType.OUT:
        newQuantity -= movement.quantity;
        break;
      case MovementType.ADJUSTMENT:
        newQuantity += movement.quantity;
        break;
    }
  }

  return await prisma.product.update({
    where: { id: productId },
    data: { quantity: Math.max(0, newQuantity) }
  });
}

export async function generateInventoryReport(): Promise<{
  totalProducts: number;
  totalValue: number;
  productsByCategory: { category: string; count: number; value: number }[];
  outOfStockProducts: number;
  lowStockProducts: number;
}> {
  const products = await prisma.product.findMany({
    include: {
      category: true
    }
  });

  const totalValue = products.reduce((total, product) => {
    return total + product.quantity * product.unitPrice;
  }, 0);

  const categoryMap = new Map<string, { count: number; value: number }>();

  products.forEach(product => {
    const category = product.category.name;
    const value = product.quantity * product.unitPrice;

    if (!categoryMap.has(category)) {
      categoryMap.set(category, { count: 0, value: 0 });
    }

    const stats = categoryMap.get(category)!;
    stats.count += 1;
    stats.value += value;
  });

  const productsByCategory = Array.from(categoryMap.entries()).map(([category, stats]) => ({
    category,
    count: stats.count,
    value: stats.value
  }));

  const outOfStockProducts = products.filter(p => p.quantity <= 0).length;
  const lowStockProducts = products.filter(p => p.quantity > 0 && p.quantity <= 10).length;

  return {
    totalProducts: products.length,
    totalValue,
    productsByCategory,
    outOfStockProducts,
    lowStockProducts
  };
}
