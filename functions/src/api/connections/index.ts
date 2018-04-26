import * as express from 'express';

import { addConnection } from './add-connection'
import { projectsRouter } from './projects';
import { tasksRouter } from './tasks';

export const connectionsRouter = express.Router({ mergeParams: true });

connectionsRouter.post('/', addConnection);

connectionsRouter.use('/:connectionId/projects', projectsRouter);

connectionsRouter.use('/:connectionId/tasks', tasksRouter);