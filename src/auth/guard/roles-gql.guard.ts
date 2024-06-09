import { CanActivate, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext, GraphQLExecutionContext } from '@nestjs/graphql';
import { UserRole } from '@prisma/client';
import { Observable } from 'rxjs';
import { ROLES_KEY } from '../decorator';

@Injectable()
export class RolesGqlGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(
    context: GraphQLExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    // Get the roles from the decorator
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    // If no roles are required -> Pass
    if (!requiredRoles) {
      return true;
    }

    const { user } = GqlExecutionContext.create(context).getContext().req;

    return requiredRoles.some((role) => user.role?.includes(role));
  }
}
