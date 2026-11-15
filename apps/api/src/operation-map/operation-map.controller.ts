import { Controller, Get } from '@nestjs/common';
import type { AuthUser, OperationMap } from '@vola/shared';
import { CurrentUser } from '../auth/current-user.decorator.js';
import { OperationMapService } from './operation-map.service.js';

@Controller('operation-map')
export class OperationMapController {
  constructor(private readonly operationMapService: OperationMapService) {}

  // El panel la consulta cada 10 segundos mientras el mapa está abierto.
  @Get()
  find(@CurrentUser() user: AuthUser): Promise<OperationMap> {
    return this.operationMapService.find(user);
  }
}
