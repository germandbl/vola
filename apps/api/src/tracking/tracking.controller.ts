import {
  Controller,
  Get,
  NotFoundException,
  Param,
  ParseUUIDPipe,
} from '@nestjs/common';
import type { PublicOrderTracking } from '@vola/shared';
import { Public } from '../auth/public.decorator.js';
import { TrackingService } from './tracking.service.js';

// Un código mal formado responde igual que uno inexistente: el enlace no da pistas sobre otras órdenes.
const trackingCodePipe = new ParseUUIDPipe({
  exceptionFactory: () => new NotFoundException('Tracking code not found'),
});

@Controller('tracking')
export class TrackingController {
  constructor(private readonly trackingService: TrackingService) {}

  // Público: lo abre el cliente desde el enlace que le mandan, sin cuenta en Volá!.
  @Public()
  @Get(':trackingCode')
  findByTrackingCode(
    @Param('trackingCode', trackingCodePipe) trackingCode: string,
  ): Promise<PublicOrderTracking> {
    return this.trackingService.findByTrackingCode(trackingCode);
  }
}
