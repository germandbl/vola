"use client";

import type { OrderBranchOption, OrderForm as OrderFormValues } from "@vola/shared";
import { Plus } from "lucide-react";
import { FormErrorAlert } from "@/components/FormErrorAlert";
import { MoneyInput } from "@/components/MoneyInput";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { useOrderForm } from "@/hooks/use-order-form";
import type { OrderSaveResult } from "@/lib/order-actions";
import { DeliveryAddressPicker } from "./DeliveryAddressPicker";
import { BranchSelect } from "./BranchSelect";
import { OrderItemFields } from "./OrderItemFields";
import { OrderTotals } from "./OrderTotals";

interface OrderFormProps {
  save: (form: OrderFormValues) => Promise<OrderSaveResult>;
  branchOptions: OrderBranchOption[];
}

export function OrderForm({ save, branchOptions }: OrderFormProps) {
  const form = useOrderForm(save);
  // La moneda y el país para buscar direcciones salen del cliente dueño de la sucursal elegida.
  const selectedBranch = branchOptions.find((option) => option.branchId.toString() === form.branchId);
  const currency = selectedBranch?.currency ?? branchOptions[0].currency;
  const countryCode = selectedBranch?.countryCode ?? branchOptions[0].countryCode;
  const { fieldErrors, formError } = form.result;
  const addressError =
    fieldErrors.deliveryAddress ?? fieldErrors.deliveryLatitude ?? fieldErrors.deliveryLongitude;

  return (
    <form onSubmit={form.submit} noValidate>
      <FieldGroup>
        {formError && <FormErrorAlert message={formError} />}
        <div className="grid gap-6 lg:grid-cols-2">
          <FieldGroup>
            <Field data-invalid={Boolean(fieldErrors.branchId)}>
              <FieldLabel htmlFor="branchId">Sucursal</FieldLabel>
              <BranchSelect
                id="branchId"
                options={branchOptions}
                value={form.branchId}
                isInvalid={Boolean(fieldErrors.branchId)}
                onChange={form.setBranchId}
              />
              <FieldError>{fieldErrors.branchId}</FieldError>
            </Field>
            <Field data-invalid={Boolean(fieldErrors.customerName)}>
              <FieldLabel htmlFor="customerName">Cliente</FieldLabel>
              <Input
                id="customerName"
                autoComplete="off"
                placeholder="Ej. Karla Mejía"
                value={form.customer.customerName}
                onChange={(event) => form.updateCustomer("customerName", event.target.value)}
                aria-invalid={Boolean(fieldErrors.customerName)}
              />
              <FieldError>{fieldErrors.customerName}</FieldError>
            </Field>
            <Field data-invalid={Boolean(fieldErrors.customerPhone)}>
              <FieldLabel htmlFor="customerPhone">Teléfono</FieldLabel>
              <Input
                id="customerPhone"
                type="tel"
                autoComplete="off"
                placeholder="Ej. +504 9999 8888"
                value={form.customer.customerPhone}
                onChange={(event) => form.updateCustomer("customerPhone", event.target.value)}
                aria-invalid={Boolean(fieldErrors.customerPhone)}
              />
              <FieldError>{fieldErrors.customerPhone}</FieldError>
            </Field>
            <Field data-invalid={Boolean(addressError)}>
              <FieldLabel htmlFor="deliveryAddress">Dirección de entrega</FieldLabel>
              <DeliveryAddressPicker
                id="deliveryAddress"
                countryCode={countryCode}
                address={form.address}
                location={form.location}
                isInvalid={Boolean(addressError)}
                onSelectSuggestion={form.selectSuggestedAddress}
                onWriteAddress={form.setAddress}
                onMoveLocation={form.setLocation}
              />
              <FieldError>{addressError}</FieldError>
            </Field>
          </FieldGroup>
          <FieldGroup>
            <FieldSet>
              <FieldLegend>Productos</FieldLegend>
              <ol className="flex flex-col gap-2">
                {form.items.map((item, index) => (
                  <OrderItemFields
                    key={item.key}
                    item={item}
                    currency={currency}
                    canRemove={form.items.length > 1}
                    errors={{
                      name: fieldErrors[`items.${index}.name`],
                      quantity: fieldErrors[`items.${index}.quantity`],
                      unitPrice: fieldErrors[`items.${index}.unitPrice`],
                    }}
                    onChange={(field, value) => form.updateItem(item.key, field, value)}
                    onRemove={() => form.removeItem(item.key)}
                  />
                ))}
              </ol>
              {fieldErrors.items && <FieldError>{fieldErrors.items}</FieldError>}
              <Button type="button" variant="outline" className="self-start" onClick={form.addItem}>
                <Plus data-icon="inline-start" />
                Agregar producto
              </Button>
            </FieldSet>
            <Field data-invalid={Boolean(fieldErrors.customerDeliveryFee)}>
              <FieldLabel htmlFor="customerDeliveryFee">Envío que paga el cliente</FieldLabel>
              <MoneyInput
                id="customerDeliveryFee"
                currency={currency}
                placeholder="Ej. 40"
                value={form.customerDeliveryFee}
                onChange={(event) => form.setCustomerDeliveryFee(event.target.value)}
                aria-invalid={Boolean(fieldErrors.customerDeliveryFee)}
              />
              <FieldError>{fieldErrors.customerDeliveryFee}</FieldError>
            </Field>
            <OrderTotals
              subtotal={form.subtotal}
              customerDeliveryFee={form.customerDeliveryFeeAmount}
              total={form.total}
              currency={currency}
            />
          </FieldGroup>
        </div>
        <Button type="submit" disabled={form.isPending} className="self-start">
          {form.isPending && <Spinner data-icon="inline-start" />}
          {form.isPending ? "Creando orden…" : "Crear orden"}
        </Button>
      </FieldGroup>
    </form>
  );
}
