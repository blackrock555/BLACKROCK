import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const pathname = req.nextUrl.pathname;

    // Admin routes - redirect to dashboard (admin controls are now in dashboard)
    if (pathname.startsWith('/admin')) {
      // Redirect all /admin routes to /dashboard where admin controls are integrated
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }

    // Withdrawal route - require KYC approval
    if (pathname.startsWith('/withdraw')) {
      if (token?.kycStatus !== 'APPROVED') {
        return NextResponse.redirect(new URL('/settings?tab=kyc&required=true', req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const pathname = req.nextUrl.pathname;

        // Public routes - no authentication required
        const publicRoutes = [
          '/',
          '/login',
          '/signup',
          '/forgot-password',
          '/reset-password',
          '/verify-email',
          '/verify',
          '/contact',
          '/terms',
          '/privacy',
          '/risk-disclosure',
          '/faq',
          '/help-center',
          '/download',
        ];

        // Check if current path matches any public route
        if (publicRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`))) {
          return true;
        }

        // API routes that don't require auth
        if (
          pathname.startsWith('/api/auth') ||
          pathname.startsWith('/api/cron') ||
          pathname.startsWith('/api/certificates/public') ||
          pathname.startsWith('/api/certificates/verify') ||
          pathname.startsWith('/api/settings/public')
        ) {
          return true;
        }

        // All other routes require authentication
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     * - public API routes
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\..*|api/auth|api/cron|api/certificates/public|api/certificates/verify|api/settings/public).*)',
  ],
};
