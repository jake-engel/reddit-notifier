import { Router } from 'express';
import { Service, Inject } from 'typedi';
import { UserRouter } from '../routes/user.router';

@Service() // Allows typedi to initialize this class
export class RedditNotifierRoutes {
  private readonly router: Router = Router(); // Initilaize base router
  // Inject external routers
  @Inject()
  private readonly userRouter: UserRouter;

  // Start health check in constructor
  constructor() {
    this.startHealthCheck();
  }

  // Fetch all routes that dont need to be authenticated
  public fetchPublicRoutes(): Router {
    this.router.use('/users', this.userRouter.fetchPublicRoutes());

    return this.router;
  }

  private startHealthCheck() {
    this.router.all('/healthCheck', (req, res) =>
      res.send('Health check successful!'),
    );
  }

  // TODO: These will include additional middleware to authenticate user
  // public fetchPrivateRoutes(): Router {}
}
