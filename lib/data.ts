import { prisma } from "@/lib/prisma"

export async function getProjects() {
  return await prisma.project.findMany({
    orderBy: { id: "asc" },
  })
}

export async function getProjectById(id: number) {
  return await prisma.project.findUnique({
    where: { id },
  })
}

export async function getStockItems() {
  return await prisma.stockItem.findMany({
    include: {
      project: {
        select: {
          name: true,
        },
      },
    },
    orderBy: { id: "asc" },
  })
}

export async function getStockItemById(id: number) {
  return await prisma.stockItem.findUnique({
    where: { id },
    include: {
      project: {
        select: {
          name: true,
        },
      },
    },
  })
}
