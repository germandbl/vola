import { DeliveryFeeBasis } from "@vola/shared";
import { DeliveryFeeBasisCard } from "@/components/delivery-fees/DeliveryFeeBasisCard";
import { DeliveryFeeRateCard } from "@/components/delivery-fees/DeliveryFeeRateCard";
import { OrderCountFeeRateCard } from "@/components/delivery-fees/OrderCountFeeRateCard";
import {
  getDeliveryFeeBasis,
  getDeliveryFeeRate,
  getOrderCountFeeRate,
} from "@/lib/organizations-data";

interface MerchantFeesSectionProps {
  merchantPath: string;
  merchantId: number;
  currency: string | null;
}

export async function MerchantFeesSection({
  merchantPath,
  merchantId,
  currency,
}: MerchantFeesSectionProps) {
  const [{ basis }, distanceRate, orderCountRate] = await Promise.all([
    getDeliveryFeeBasis(merchantId),
    getDeliveryFeeRate(merchantId),
    getOrderCountFeeRate(merchantId),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <DeliveryFeeBasisCard
        merchantId={merchantId}
        initialBasis={basis}
        hasDistanceRate={distanceRate.ranges.length > 0}
        hasOrderCountRate={orderCountRate.ranges.length > 0}
      />
      <DeliveryFeeRateCard
        editHref={`${merchantPath}/tarifa-envio`}
        currency={currency}
        rate={distanceRate}
        isActive={basis === DeliveryFeeBasis.Distance}
      />
      <OrderCountFeeRateCard
        editHref={`${merchantPath}/tarifa-pedidos`}
        currency={currency}
        rate={orderCountRate}
        isActive={basis === DeliveryFeeBasis.CompletedOrders}
      />
    </div>
  );
}
