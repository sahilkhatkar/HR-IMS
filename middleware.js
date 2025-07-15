import { auth } from './auth'; // Adjust if your file is in lib/auth.js etc.
import { NextResponse } from 'next/server';

const PUBLIC_PATHS = ['/login', '/_next',
  '/api',
  '/favicon.ico'];

export default auth((req) => {
  const { nextUrl, auth } = req;

  const isPublic = PUBLIC_PATHS.some((path) =>
    nextUrl.pathname.startsWith(path)
  );

  if (!auth?.user && !isPublic) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  return NextResponse.next();
});

// export const config = {
//   matcher: ['/((?!_next|api|favicon.ico).*)'],
// };


// Match everything except _next and static assets
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};