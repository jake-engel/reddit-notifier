import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { BaseRouter } from '../interfaces/base-router.interface';
import { Service, Inject } from 'typedi';

@Service()
export class UserRouter implements BaseRouter {
  private readonly userRouter: Router = Router();
  @Inject()
  private readonly userController: UserController;

  public fetchPublicRoutes() {
    // Must bind to keep controller in context while allowing the
    //  express' request and response args
    this.userRouter.post(
      '/',
      this.userController.create.bind(this.userController),
    );
    this.userRouter.get(
      '/',
      this.userController.list.bind(this.userController),
    );
    this.userRouter.get(
      '/:id',
      this.userController.retrieve.bind(this.userController),
    );
    this.userRouter.delete(
      '/:id',
      this.userController.delete.bind(this.userController),
    );
    this.userRouter.put(
      '/:id',
      this.userController.update.bind(this.userController),
    );
    this.userRouter.post(
      '/:id/email',
      this.userController.sendEmail.bind(this.userController),
    );

    return this.userRouter;
  }

  public fetchPrivateRoutes() {
    return this.userRouter;
  }
}
