import { clerkMiddleware, requireAuth } from '@clerk/express';

// Export Clerk middleware for use in routes
export const clerk = clerkMiddleware();

// Export auth requirement middleware
export const protect = requireAuth();
