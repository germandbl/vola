import {
  calculateOrderSubtotal,
  calculateOrderTotal,
  orderFormSchema,
  type OrderForm,
  type OrderItemForm,
} from "@vola/shared";
import { useState, useTransition, type FormEvent } from "react";
import type { SelectedAddress } from "@/hooks/use-address-suggestions";
import type { Coordinates } from "@/lib/map-defaults";
import { toFieldErrors } from "@/lib/form-state";
import type { OrderSaveResult } from "@/lib/order-actions";

export interface OrderItemInput {
  key: string;
  name: string;
  quantity: string;
  unitPrice: string;
}

export type OrderItemField = "name" | "quantity" | "unitPrice";

export type CustomerField = "customerName" | "customerPhone";

function createItemInput(): OrderItemInput {
  return { key: crypto.randomUUID(), name: "", quantity: "1", unitPrice: "" };
}

// Un campo vacío pasa como NaN para que la validación diga "Escribí…" en vez de aceptar un 0.
function toNumber(value: string): number {
  if (value.trim() === "") return Number.NaN;
  return Number(value);
}

function toItemForm(item: OrderItemInput): OrderItemForm {
  return { name: item.name, quantity: toNumber(item.quantity), unitPrice: toNumber(item.unitPrice) };
}

// Para los totales en pantalla, un producto a medio llenar cuenta como 0 en vez de mostrar NaN.
function toAmountOrZero(value: number): number {
  return Number.isFinite(value) ? value : 0;
}

export function useOrderForm(save: (form: OrderForm) => Promise<OrderSaveResult>) {
  const [branchId, setBranchId] = useState("");
  const [customer, setCustomer] = useState<Record<CustomerField, string>>({
    customerName: "",
    customerPhone: "",
  });
  const [address, setAddress] = useState("");
  const [location, setLocation] = useState<Coordinates | null>(null);
  const [items, setItems] = useState(() => [createItemInput()]);
  const [customerDeliveryFee, setCustomerDeliveryFee] = useState("");
  const [result, setResult] = useState<OrderSaveResult>({ fieldErrors: {} });
  const [isPending, startTransition] = useTransition();

  const subtotal = calculateOrderSubtotal(
    items.map((item) => {
      const itemForm = toItemForm(item);
      return {
        ...itemForm,
        quantity: toAmountOrZero(itemForm.quantity),
        unitPrice: toAmountOrZero(itemForm.unitPrice),
      };
    }),
  );
  const customerDeliveryFeeAmount = toAmountOrZero(toNumber(customerDeliveryFee));
  const total = calculateOrderTotal(subtotal, customerDeliveryFeeAmount);

  function updateCustomer(field: CustomerField, value: string) {
    setCustomer((current) => ({ ...current, [field]: value }));
  }

  function selectSuggestedAddress(suggestedAddress: SelectedAddress) {
    setAddress(suggestedAddress.address);
    setLocation({ latitude: suggestedAddress.latitude, longitude: suggestedAddress.longitude });
  }

  function addItem() {
    setItems((current) => [...current, createItemInput()]);
  }

  function removeItem(key: string) {
    setItems((current) => current.filter((item) => item.key !== key));
  }

  function updateItem(key: string, field: OrderItemField, value: string) {
    setItems((current) =>
      current.map((item) => (item.key === key ? { ...item, [field]: value } : item)),
    );
  }

  function toForm(): OrderForm {
    return {
      branchId: toNumber(branchId),
      ...customer,
      deliveryAddress: address,
      deliveryLatitude: location?.latitude ?? Number.NaN,
      deliveryLongitude: location?.longitude ?? Number.NaN,
      items: items.map(toItemForm),
      customerDeliveryFee: toNumber(customerDeliveryFee),
    };
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const validation = orderFormSchema.safeParse(toForm());
    if (!validation.success) {
      setResult({ fieldErrors: toFieldErrors(validation.error.issues) });
      return;
    }
    startTransition(async () => {
      setResult(await save(validation.data));
    });
  }

  return {
    branchId,
    customer,
    address,
    location,
    items,
    customerDeliveryFee,
    subtotal,
    customerDeliveryFeeAmount,
    total,
    result,
    isPending,
    setBranchId,
    updateCustomer,
    setAddress,
    setLocation,
    selectSuggestedAddress,
    addItem,
    removeItem,
    updateItem,
    setCustomerDeliveryFee,
    submit,
  };
}
