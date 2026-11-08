import { useState } from "react";

export function useMerchantSelection(initialMerchantIds: number[]) {
  const [selectedMerchantIds, setSelectedMerchantIds] = useState(initialMerchantIds);

  function toggleMerchant(merchantId: number, isSelected: boolean) {
    setSelectedMerchantIds((current) => {
      if (isSelected) return [...current, merchantId];
      return current.filter((id) => id !== merchantId);
    });
  }

  return { selectedMerchantIds, toggleMerchant };
}
