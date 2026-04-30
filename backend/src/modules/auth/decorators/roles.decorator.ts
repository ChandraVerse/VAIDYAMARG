import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';

/**
 * Use on any controller method to restrict access by role.
 * @example @Roles('ADMIN', 'PHARMACIST')
 */
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
