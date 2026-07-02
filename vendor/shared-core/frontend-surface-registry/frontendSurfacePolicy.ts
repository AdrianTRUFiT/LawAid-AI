import { FRONTEND_SURFACE_REGISTRY, FrontendSurfaceId, UserRole } from './frontendSurfaceRegistry';

export function findFrontendSurface(id: FrontendSurfaceId) {
  return FRONTEND_SURFACE_REGISTRY.find(s => s.id === id);
}

export function canRoleAccessSurface(surfaceId: FrontendSurfaceId, role: UserRole) {
  const surface = findFrontendSurface(surfaceId);

  if (!surface) {
    return {
      allowed: false,
      reason: "SURFACE_NOT_FOUND"
    };
  }

  if (surface.visibilityState === "hidden" || surface.visibilityState === "blocked") {
    return {
      allowed: false,
      reason: "SURFACE_NOT_VISIBLE"
    };
  }

  if (!surface.userRoles.includes(role)) {
    return {
      allowed: false,
      reason: "ROLE_NOT_ALLOWED"
    };
  }

  return {
    allowed: true,
    reason: "ACCESS_ALLOWED",
    visibilityState: surface.visibilityState
  };
}

export function canSurfacePerformAction(surfaceId: FrontendSurfaceId, role: UserRole, action: string) {
  const access = canRoleAccessSurface(surfaceId, role);

  if (!access.allowed) {
    return access;
  }

  const surface = findFrontendSurface(surfaceId);

  if (!surface) {
    return {
      allowed: false,
      reason: "SURFACE_NOT_FOUND"
    };
  }

  if (!surface.allowedActions.includes(action)) {
    return {
      allowed: false,
      reason: "ACTION_NOT_ALLOWED"
    };
  }

  if (surface.visibilityState === "read_only" && action.indexOf("view") !== 0 && action.indexOf("receive") !== 0) {
    return {
      allowed: false,
      reason: "READ_ONLY_SURFACE_ACTION_REFUSED"
    };
  }

  return {
    allowed: true,
    reason: "ACTION_ALLOWED"
  };
}

export function frontendSurfaceLaunchStatus() {
  const blockers = FRONTEND_SURFACE_REGISTRY
    .filter(s => s.launchEligible)
    .filter(s => s.backendDependencies.length === 0 || s.readSource.length === 0)
    .map(s => s.id + "_MISSING_BACKEND_DEPENDENCY_OR_READ_SOURCE");

  return {
    registryPresent: true,
    totalSurfaces: FRONTEND_SURFACE_REGISTRY.length,
    launchEligibleSurfaces: FRONTEND_SURFACE_REGISTRY.filter(s => s.launchEligible).map(s => s.id),
    blockers,
    ready: blockers.length === 0
  };
}
