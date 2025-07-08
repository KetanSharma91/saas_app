// import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { clerkMiddleware } from '@clerk/nextjs/server'

// const isProtectedRoute = createRouteMatcher(['/'])

// export default clerkMiddleware(async (auth, req) => {
//   if (isProtectedRoute(req)) await auth.protect()
// })

export default clerkMiddleware(async (auth, req) => {
  // Allow public access to your webhook
  if (req.nextUrl.pathname === "/api/webhooks/clerk") {
    return;
  }

  // Protect everything else
  await auth.protect();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}