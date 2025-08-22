import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { Role } from '../../../iam/enums/role.enum';
import { ROLES_KEY } from '../decorators/role.decorator';
import { ActiveUserData } from '../../types/active-user-data.interface';
import { REQUEST_USER_KEY } from '../../../iam/iam.constants';

export class RoleGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const ctxRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!ctxRoles) {
      return true;
    }

    const user: ActiveUserData = context.switchToHttp().getRequest()[
      REQUEST_USER_KEY
    ];

    return ctxRoles.some((role) => user.roles.includes(role));
  }
}
