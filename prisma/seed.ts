import { PrismaClient } from '@prisma/client'
import { faker } from '@faker-js/faker'

const prisma = new PrismaClient()

async function main() {
    // Seed des catégories
    const categories = await Promise.all(
        Array.from({ length: 5 }).map(() =>
            prisma.category.create({
                data: {
                    name: faker.commerce.department(),
                },
            })
        )
    )

    // Seed des fournisseurs
    const suppliers = await Promise.all(
        Array.from({ length: 5 }).map(() =>
            prisma.supplier.create({
                data: {
                    name: faker.company.name(),
                    email: faker.internet.email(),
                    phone: faker.phone.number(),
                },
            })
        )
    )

    // Seed des utilisateurs
    await prisma.user.createMany({
        data: Array.from({ length: 3 }).map(() => ({
            name: faker.person.fullName(),
            email: faker.internet.email(),
            password: faker.internet.password(),
            role: 'USER',
        })),
    })

    // Seed des produits
    const products = await Promise.all(
        Array.from({ length: 20 }).map(() =>
            prisma.product.create({
                data: {
                    name: faker.commerce.productName(),
                    description: faker.commerce.productDescription(),
                    quantity: faker.number.int({ min: 0, max: 100 }),
                    minQuantity: faker.number.int({ min: 1, max: 10 }),
                    unitPrice: parseFloat(faker.commerce.price()),
                    costPrice: parseFloat(faker.commerce.price()),
                    categoryId: faker.helpers.arrayElement(categories).id,
                    supplierId: faker.helpers.arrayElement(suppliers).id,
                },
            })
        )
    )

    // Seed des mouvements de stock
    await Promise.all(
        products.flatMap((product) =>
            Array.from({ length: 3 }).map(() =>
                prisma.stockMovement.create({
                    data: {
                        productId: product.id,
                        type: faker.helpers.arrayElement(['IN', 'OUT', 'ADJUSTMENT']),
                        quantity: faker.number.int({ min: 1, max: 20 }),
                        note: faker.lorem.sentence(),
                    },
                })
            )
        )
    )
}

main()
    .then(() => {
        console.log('✅ Seeding terminé')
        return prisma.$disconnect()
    })
    .catch((e) => {
        console.error(e)
        return prisma.$disconnect()
    })
