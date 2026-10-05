import prisma from '../config/database';

export const getAllProducts = async () => {
  return await prisma.product.findMany({
    include: {
      domain: {
        select: {
          id: true,
          name: true,
          code: true,
        },
      },
      _count: {
        select: {
          reviews: true,
        },
      },
    },
    orderBy: {
      name: 'asc',
    },
  });
};

export const getProductById = async (id: string) => {
  return await prisma.product.findUnique({
    where: { id },
    include: {
      domain: {
        select: {
          id: true,
          name: true,
          code: true,
          description: true,
        },
      },
      _count: {
        select: {
          reviews: true,
        },
      },
    },
  });
};

export const getProductsByDomain = async (domainId: string) => {
  // First verify domain exists
  const domainExists = await prisma.domain.findUnique({
    where: { id: domainId },
  });

  if (!domainExists) {
    return null;
  }

  const products = await prisma.product.findMany({
    where: { domainId },
    include: {
      domain: {
        select: {
          id: true,
          name: true,
          code: true,
        },
      },
      _count: {
        select: {
          reviews: true,
        },
      },
    },
    orderBy: {
      name: 'asc',
    },
  });

  return {
    domain: domainExists,
    products,
  };
};

export const createProduct = async (data: {
  domainId: string;
  name: string;
  category?: string;
  description?: string;
}) => {
  const domainExists = await prisma.domain.findUnique({
    where: { id: data.domainId },
  });

  if (!domainExists) {
    return { error: 'DOMAIN_NOT_FOUND' };
  }

  const product = await prisma.product.create({
    data: {
      name: data.name,
      domainId: data.domainId,
      category: data.category,
      description: data.description,
    },
    include: {
      domain: {
        select: {
          id: true,
          name: true,
          code: true,
        },
      },
    },
  });

  return { product };
};

export const updateProduct = async (
  id: string,
  data: {
    name?: string;
    category?: string;
    description?: string;
    domainId?: string;
  }
) => {
  const existingProduct = await prisma.product.findUnique({
    where: { id },
  });

  if (!existingProduct) {
    return { error: 'PRODUCT_NOT_FOUND' };
  }

  if (data.domainId) {
    const domainExists = await prisma.domain.findUnique({
      where: { id: data.domainId },
    });

    if (!domainExists) {
      return { error: 'DOMAIN_NOT_FOUND' };
    }
  }

  const updateData: {
    name?: string;
    category?: string;
    description?: string;
    domainId?: string;
  } = {};

  if (data.name !== undefined) updateData.name = data.name;
  if (data.category !== undefined) updateData.category = data.category;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.domainId !== undefined) updateData.domainId = data.domainId;

  const product = await prisma.product.update({
    where: { id },
    data: updateData,
    include: {
      domain: {
        select: {
          id: true,
          name: true,
          code: true,
        },
      },
    },
  });

  return { product };
};

export const deleteProduct = async (id: string) => {
  const existingProduct = await prisma.product.findUnique({
    where: { id },
  });

  if (!existingProduct) {
    return false;
  }

  await prisma.product.delete({
    where: { id },
  });

  return true;
};
