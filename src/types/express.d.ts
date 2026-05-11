export {};

declare global {
  namespace Express {
    interface Request {
      orm?: string;
      user?: any;
    }
  }
}
