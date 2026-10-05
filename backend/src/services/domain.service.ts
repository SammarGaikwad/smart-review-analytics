import prisma from '../config/database';

export const getAllDomains = async () => {
  return await prisma.domain.findMany({
    include: {
      _count: {
        select: {
          products: true,
          reviews: true,
        },
      },
    },
    orderBy: {
      name: 'asc',
    },
  });
};

export const getDomainById = async (id: string) => {
  return await prisma.domain.findUnique({
    where: { id },
    include: {
      products: true,
      _count: {
        select: {
          reviews: true,
        },
      },
    },
  });
};

export const createDomain = async (data: { name: string; code: string; description?: string }) => {
  return await prisma.domain.create({
    data: {
      name: data.name,
      code: data.code.toLowerCase().trim(),
      description: data.description,
    },
  });
};

export const updateDomain = async (
  id: string,
  data: { name?: string; code?: string; description?: string }
) => {
  const updateData: { name?: string; code?: string; description?: string } = {};
  if (data.name !== undefined) updateData.name = data.name;
  if (data.code !== undefined) updateData.code = data.code.toLowerCase().trim();
  if (data.description !== undefined) updateData.description = data.description;

  return await prisma.domain.update({
    where: { id },
    data: updateData,
  });
};

export const deleteDomain = async (id: string) => {
  return await prisma.domain.delete({
    where: { id },
  });
};
