"use client";

import { PERMISSION_DESCRIPTION, PERMISSION_LABEL, type Permission } from "@vola/shared";
import { ShieldCheck } from "lucide-react";
import { FormErrorAlert } from "@/components/FormErrorAlert";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldContent, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useAgentPermissionsForm } from "@/hooks/use-agent-permissions-form";

interface AgentPermissionsDialogProps {
  organizationId: number;
  userId: number;
  userName: string;
  currentPermissions: Permission[];
  assignablePermissions: Permission[];
}

export function AgentPermissionsDialog({
  organizationId,
  userId,
  userName,
  currentPermissions,
  assignablePermissions,
}: AgentPermissionsDialogProps) {
  const form = useAgentPermissionsForm({ organizationId, userId, currentPermissions });

  return (
    <Dialog open={form.isOpen} onOpenChange={form.changeOpen}>
      {/* Solo ícono, como las demás acciones al final de una fila: la tabla ya tiene muchas columnas. */}
      <Tooltip>
        <TooltipTrigger asChild>
          <DialogTrigger asChild>
            <Button size="icon-sm" aria-label={`Editar permisos de ${userName}`}>
              <ShieldCheck />
            </Button>
          </DialogTrigger>
        </TooltipTrigger>
        <TooltipContent>Editar permisos</TooltipContent>
      </Tooltip>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Permisos de {userName}</DialogTitle>
          <DialogDescription>
            Marcá lo que puede hacer. Los cambios aplican en su próxima acción, sin cerrar sesión.
          </DialogDescription>
        </DialogHeader>
        <FieldGroup className="max-h-96 gap-4 overflow-y-auto">
          {assignablePermissions.map((permission) => (
            <Field key={permission} orientation="horizontal">
              <Checkbox
                id={`permission-${userId}-${permission}`}
                checked={form.selectedPermissions.includes(permission)}
                onCheckedChange={(checked) => form.togglePermission(permission, checked === true)}
              />
              <FieldContent>
                <FieldLabel htmlFor={`permission-${userId}-${permission}`}>
                  {PERMISSION_LABEL[permission]}
                </FieldLabel>
                <FieldDescription>{PERMISSION_DESCRIPTION[permission]}</FieldDescription>
              </FieldContent>
            </Field>
          ))}
        </FieldGroup>
        {form.error && <FormErrorAlert message={form.error} />}
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Volver</Button>
          </DialogClose>
          <Button disabled={form.isPending} onClick={form.save}>
            {form.isPending && <Spinner data-icon="inline-start" />}
            {form.isPending ? "Guardando…" : "Guardar permisos"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
