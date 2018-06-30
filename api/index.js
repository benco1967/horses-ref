'use strict';

import config from 'config';
import logger from 'debug';
import tenantLoader from 'loader-mw';
import { NotFound } from 'http-errors';
/*
import horsesRouter from './routes/horses';
import infosRouter from './routes/infos';
import adminRouter from './routes/admin';
*/
const router = express.Router();

const debug = logger(`${config.get('name')}:error:server`);

debug(`API is initializing is starting`);

router.param('tenant', tenantLoader({
  accessorFn : id => tenantService.getTenant(id)
}));

/*// Process
router.use(`:tenant/horses`, horsesRouter);
// Setting
router.use(`:tenant/`, tenantSettingsRouter);
// Info
router.use(`infos`, infosRouter);
// Admin
router.use(`admin`, adminRouter);
*/
// Not Found
router.use( () => {
  error('Page Not Found');
  throw new NotFound('Page Not Found');
});

export default router;
