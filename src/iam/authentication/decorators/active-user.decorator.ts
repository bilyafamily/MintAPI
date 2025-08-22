import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { ActiveUserData } from '../../types/active-user-data.interface';
import { Request } from 'express';
import { REQUEST_USER_KEY } from '../../../iam/iam.constants';

export const ActiveUser = createParamDecorator(
  (field: keyof ActiveUserData | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<Request>();
    const user: Partial<ActiveUserData> = request[REQUEST_USER_KEY];

    return field ? user?.[field] : user; //field is used if a value is passed @ActiveUser("email") to the decorator to access the property of the user
  },
);
