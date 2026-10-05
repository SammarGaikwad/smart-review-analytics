import { Router } from 'express';
import {
  getDomains,
  getDomain,
  createNewDomain,
  updateExistingDomain,
  deleteExistingDomain,
} from '../controllers/domain.controller';
import { getProductsByDomain } from '../controllers/product.controller';

const router = Router();

router.get('/', getDomains);
router.get('/:domainId/products', getProductsByDomain);
router.get('/:id', getDomain);
router.post('/', createNewDomain);
router.put('/:id', updateExistingDomain);
router.delete('/:id', deleteExistingDomain);

export default router;
