import { router } from "./trpc";
import { ordersRouter } from "./routers/orders";
import { cartRouter } from "./routers/cart";
import { productsRouter } from "./routers/products";
import { userRouter } from "./routers/user";
import { notificationsRouter } from "./routers/notifications";

/**
 * Main application router
 * All sub-routers are merged here
 */
export const appRouter = router({
  orders: ordersRouter,
  cart: cartRouter,
  products: productsRouter,
  user: userRouter,
  notifications: notificationsRouter,
});

// Export type for client usage
export type AppRouter = typeof appRouter;

