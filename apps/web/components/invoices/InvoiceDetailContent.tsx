import { canInvoiceMerchants, type InvoiceDetail } from "@vola/shared";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { getCurrentUser } from "@/lib/current-user";
import { formatDateTime, formatMoney, formatOrderCount } from "@/lib/labels";
import { getInvoice } from "@/lib/organizations-data";
import { InvoiceOrdersTable } from "./InvoiceOrdersTable";
import { InvoiceStatusChip } from "./InvoiceStatusChip";
import { MarkInvoicePaidDialog } from "./MarkInvoicePaidDialog";

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
    { label: "Generada", value: `${formatDateTime(invoice.createdAt)} · ${invoice.createdByName}` },
    { label: "Órdenes", value: formatOrderCount(invoice.orderCount) },
    { label: "Total", value: formattedAmount },
    { label: "Pago", value: describePayment(invoice) },
  ];

  return (
    <>
      <PageHeader
        title={`Factura #${invoice.id}`}
        description="El envío de cada orden que entregó un motorista de Volá!."
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
      <InvoiceOrdersTable orders={invoice.orders} amount={invoice.amount} currency={invoice.currency} />
    </>
  );
}
