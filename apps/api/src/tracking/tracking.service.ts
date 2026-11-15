import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  canTrackOrderDriver,
  type OrderDriverLocation,
  type OrderStatus,
  type PublicOrderTracking,
} from '@vola/shared';
import { eq } from 'drizzle-orm';
import { branches } from '../branches/branches.schema.js';
import { DATABASE, type Database } from '../database/database.module.js';
import { drivers } from '../drivers/drivers.schema.js';
import { merchants } from '../merchants/merchants.schema.js';
import { orders } from '../orders/orders.schema.js';
import { users } from '../users/users.schema.js';

interface TrackingRow {
  merchantName: string;
  status: OrderStatus;
  branchLatitude: number;
  branchLongitude: number;
  deliveryLatitude: number;
  deliveryLongitude: number;
  driverName: string | null;
  driverLatitude: number | null;
  driverLongitude: number | null;
  driverLocationRecordedAt: Date | null;
}

// Solo el nombre de pila: basta para que el cliente sepa quién llega sin exponer el nombre completo.
function findFirstName(fullName: string): string {
  return fullName.trim().split(/\s+/)[0];
}

function toDriverLocation(row: TrackingRow): OrderDriverLocation | null {
  if (row.driverLatitude === null || row.driverLongitude === null) return null;
  if (row.driverLocationRecordedAt === null) return null;
  return {
    latitude: row.driverLatitude,
    longitude: row.driverLongitude,
    recordedAt: row.driverLocationRecordedAt.toISOString(),
  };
}

@Injectable()
export class TrackingService {
  constructor(@Inject(DATABASE) private readonly database: Database) {}

  async findByTrackingCode(trackingCode: string): Promise<PublicOrderTracking> {
    const [row] = await this.database
      .select({
        merchantName: merchants.name,
        status: orders.status,
        branchLatitude: branches.latitude,
        branchLongitude: branches.longitude,
        deliveryLatitude: orders.deliveryLatitude,
        deliveryLongitude: orders.deliveryLongitude,
        driverName: users.name,
        driverLatitude: drivers.latitude,
        driverLongitude: drivers.longitude,
        driverLocationRecordedAt: drivers.locationRecordedAt,
      })
      .from(orders)
      .innerJoin(branches, eq(orders.branchId, branches.id))
      .innerJoin(merchants, eq(branches.merchantId, merchants.id))
      .leftJoin(drivers, eq(orders.driverId, drivers.id))
      .leftJoin(users, eq(drivers.userId, users.id))
      .where(eq(orders.trackingCode, trackingCode));
    if (!row) {
      throw new NotFoundException(`No order has tracking code ${trackingCode}`);
    }

    // Fuera de la etapa en camino al cliente, el enlace no revela quién es ni dónde anda el motorista.
    const isDriverVisible = canTrackOrderDriver(
      row.status,
      row.driverName !== null,
    );
    return {
      merchantName: row.merchantName,
      status: row.status,
      branchLatitude: row.branchLatitude,
      branchLongitude: row.branchLongitude,
      deliveryLatitude: row.deliveryLatitude,
      deliveryLongitude: row.deliveryLongitude,
      driverFirstName:
        isDriverVisible && row.driverName
          ? findFirstName(row.driverName)
          : null,
      driverLocation: isDriverVisible ? toDriverLocation(row) : null,
    };
  }
}
