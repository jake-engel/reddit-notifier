import { Router } from 'express';

export interface BaseRouter {
  fetchPublicRoutes: () => Router;

  fetchPrivateRoutes: () => Router;
}
