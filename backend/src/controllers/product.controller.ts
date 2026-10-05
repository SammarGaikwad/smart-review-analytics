import { Request, Response } from 'express';
import * as productService from '../services/product.service';
import { createAuditLog } from '../services/audit.service';

export const getProducts = async (_req: Request, res: Response): Promise<void> => {
  try {
    const products = await productService.getAllProducts();
    res.json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (error) {
    console.error('[Get Products Error]:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve products',
    });
  }
};

export const getProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const product = await productService.getProductById(id);

    if (!product) {
      res.status(404).json({
        success: false,
        error: 'Product not found',
      });
      return;
    }

    res.json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.error('[Get Product Error]:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve product',
    });
  }
};

export const getProductsByDomain = async (req: Request, res: Response): Promise<void> => {
  try {
    const { domainId } = req.params;
    const result = await productService.getProductsByDomain(domainId);

    if (!result) {
      res.status(404).json({
        success: false,
        error: 'Domain not found',
      });
      return;
    }

    res.json({
      success: true,
      count: result.products.length,
      data: result.products,
    });
  } catch (error) {
    console.error('[Get Products By Domain Error]:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve products for domain',
    });
  }
};

export const createNewProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, domainId, category, description } = req.body;

    if (!name || !domainId) {
      res.status(400).json({
        success: false,
        error: 'Name and domainId are required',
      });
      return;
    }

    const result = await productService.createProduct({ name, domainId, category, description });

    if ('error' in result && result.error === 'DOMAIN_NOT_FOUND') {
      res.status(404).json({
        success: false,
        error: 'Domain not found',
      });
      return;
    }

    if ('product' in result && result.product) {
      await createAuditLog({
        userId: req.user?.id || null,
        userEmail: req.user?.email || null,
        action: 'CREATE',
        resource: 'Product',
        ipAddress: req.ip || null,
        status: 'SUCCESS',
      });
    }

    res.status(201).json({
      success: true,
      data: result.product,
    });
  } catch (error) {
    console.error('[Create Product Error]:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create product',
    });
  }
};

export const updateExistingProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, domainId, category, description } = req.body;

    const result = await productService.updateProduct(id, { name, domainId, category, description });

    if ('error' in result) {
      if (result.error === 'PRODUCT_NOT_FOUND') {
        res.status(404).json({
          success: false,
          error: 'Product not found',
        });
        return;
      }
      if (result.error === 'DOMAIN_NOT_FOUND') {
        res.status(404).json({
          success: false,
          error: 'Domain not found',
        });
        return;
      }
    }

    if ('product' in result && result.product) {
      await createAuditLog({
        userId: req.user?.id || null,
        userEmail: req.user?.email || null,
        action: 'UPDATE',
        resource: 'Product',
        ipAddress: req.ip || null,
        status: 'SUCCESS',
      });
    }

    res.json({
      success: true,
      data: result.product,
    });
  } catch (error) {
    console.error('[Update Product Error]:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update product',
    });
  }
};

export const deleteExistingProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const deleted = await productService.deleteProduct(id);

    if (!deleted) {
      res.status(404).json({
        success: false,
        error: 'Product not found',
      });
      return;
    }

    await createAuditLog({
      userId: req.user?.id || null,
      userEmail: req.user?.email || null,
      action: 'DELETE',
      resource: 'Product',
      ipAddress: req.ip || null,
      status: 'SUCCESS',
    });

    res.json({
      success: true,
      message: 'Product deleted successfully',
    });
  } catch (error) {
    console.error('[Delete Product Error]:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete product',
    });
  }
};
