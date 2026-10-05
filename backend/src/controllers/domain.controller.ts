import { Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import * as domainService from '../services/domain.service';

export const getDomains = async (_req: Request, res: Response): Promise<void> => {
  try {
    const domains = await domainService.getAllDomains();
    res.json({
      success: true,
      count: domains.length,
      data: domains,
    });
  } catch (error) {
    console.error('[Get Domains Error]:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve domains',
    });
  }
};

export const getDomain = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const domain = await domainService.getDomainById(id);

    if (!domain) {
      res.status(404).json({
        success: false,
        error: `Domain with ID '${id}' not found`,
      });
      return;
    }

    res.json({
      success: true,
      data: domain,
    });
  } catch (error) {
    console.error('[Get Domain Error]:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve domain',
    });
  }
};

export const createNewDomain = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, code, description } = req.body;

    if (!name || !code) {
      res.status(400).json({
        success: false,
        error: 'Name and code are required fields',
      });
      return;
    }

    const domain = await domainService.createDomain({ name, code, description });
    res.status(201).json({
      success: true,
      data: domain,
    });
  } catch (error: any) {
    console.error('[Create Domain Error]:', error);
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      res.status(409).json({
        success: false,
        error: 'A domain with this name or code already exists',
      });
      return;
    }
    res.status(500).json({
      success: false,
      error: 'Failed to create domain',
    });
  }
};

export const updateExistingDomain = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, code, description } = req.body;

    const existing = await domainService.getDomainById(id);
    if (!existing) {
      res.status(404).json({
        success: false,
        error: `Domain with ID '${id}' not found`,
      });
      return;
    }

    const updatedDomain = await domainService.updateDomain(id, { name, code, description });
    res.json({
      success: true,
      data: updatedDomain,
    });
  } catch (error: any) {
    console.error('[Update Domain Error]:', error);
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      res.status(409).json({
        success: false,
        error: 'A domain with this name or code already exists',
      });
      return;
    }
    res.status(500).json({
      success: false,
      error: 'Failed to update domain',
    });
  }
};

export const deleteExistingDomain = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const existing = await domainService.getDomainById(id);
    if (!existing) {
      res.status(404).json({
        success: false,
        error: `Domain with ID '${id}' not found`,
      });
      return;
    }

    await domainService.deleteDomain(id);
    res.json({
      success: true,
      message: `Domain with ID '${id}' deleted successfully`,
    });
  } catch (error) {
    console.error('[Delete Domain Error]:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete domain',
    });
  }
};
