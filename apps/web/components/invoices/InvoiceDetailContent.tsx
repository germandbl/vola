import { INVOICE_TYPE_LABEL, InvoiceType, canInvoiceMerchants, type InvoiceDetail } from "@vola/shared";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { getCurrentUser } from "@/lib/current-user";
import { formatDateRange, formatDateTime, formatMoney, formatOrderCount } from "@/lib/labels";
import { getInvoice } from "@/lib/organizations-data";
import { InvoiceOrdersTable } from "./InvoiceOrdersTable";
import { InvoiceStatusChip } from "./InvoiceStatusChip";
import { MarkInvoicePaidDialog } from "./MarkInvoicePaidDialog";
import { SoftwareInvoiceBreakdownCard } from "./SoftwareInvoiceBreakdownCard";

const INVOICE_DESCRIPTION: Record<InvoiceType, string> = {
  [InvoiceType.Delivery]: "El envío de cada orden que entregó un motorista de Volá!.",
  [InvoiceType.Software]: "El uso del software en el periodo, según el contrato del cliente.",
};

function describePayment(invoice: InvoiceDetail): string {
  if (!invoice.paidAt) return "Todavía no se ha pagado";
  return `${formatDateTime(invoice.paidAt)} · registró ${invoice.paidByName ?? "Volá!"}`;
}

interface InvoiceDetailContentProps {
  invoiceId: number;
}

export async function InvoiceDetailContent({ invoiceId }: InvoiceDetailContentProps) {
  const [invoice, currentUser] = await Promise.all([getInvoice(invoiceId), getCurrentUser()]);
  const formattedAmount = formatMoney(invoice.amount, invoice.currency);
  const canMarkPaid = canInvoiceMerchants(currentUser) && !invoice.paidAt;
  const details = [
    { label: "Comercio", value: invoice.organizationName },
    { label: "Concepto", value: INVOICE_TYPE_LABEL[invoice.type] },
    { label: "Periodo", value: formatDateRange(invoice.periodStart, invoice.periodEnd) },
    { label: "Generada", value: `${formatDateTime(invoice.createdAt)} · ${invoice.createdByName}` },
    { label: "Órdenes", value: formatOrderCount(invoice.orderCount) },
    { label: "Total", value: formattedAmount },
    { label: "Pago", value: describePayment(invoice) },
  ];

  return (
    <>
      <PageHeader
        title={`Factura #${invoice.id}`}
        description={INVOICE_DESCRIPTION[invoice.type]}
        action={
          canMarkPaid && (
            <MarkInvoicePaidDialog
              invoiceId={invoice.id}
              organizationName={invoice.organizationName}
              formattedAmount={formattedAmount}
            />
          )
        }
      />
      <Card>
        <CardContent className="flex flex-col gap-6">
          <InvoiceStatusChip paidAt={invoice.paidAt} />
          <dl className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {details.map((detail) => (
              <div key={detail.label} className="flex flex-col gap-1">
                <dt className="text-sm text-muted-foreground">{detail.label}</dt>
                <dd className="font-semibold break-words">{detail.value}</dd>
              </div>
            ))}
          </dl>
        </CardContent>
      </Card>
      {invoice.software ? (
        <SoftwareInvoiceBreakdownCard breakdown={invoice.software} amount={invoice.amount} currency={invoice.currency} />
      ) : (
        <InvoiceOrdersTable orders={invoice.orders} amount={invoice.amount} currency={invoice.currency} />
      )}
    </>
  );
}
