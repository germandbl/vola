import { useState } from "react";

export function useMerchantSelection(initialMerchantIds: number[]) {
  const [selectedMerchantIds, setSelectedMerchantIds] = useState(initialMerchantIds);

  function toggleMerchants(merchantIds: number[], isSelected: boolean) {
    setSelectedMerchantIds((current) => {
      const withoutToggled = current.filter((id) => !merchantIds.includes(id));
      if (!isSelected) return withoutToggled;
      return [...withoutToggled, ...merchantIds];
    });
  }

  return { selectedMerchantIds, setSelectedMerchantIds, toggleMerchants };
}
