export function canAccessAuthenticatedPath(pathname: string, isAdmin: boolean) {
  if (isAdmin) return true;
  return pathname === "/area-studente" || pathname.startsWith("/capitoli/");
}
