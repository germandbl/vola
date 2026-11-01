import { CircleAlert } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface FormErrorAlertProps {
  message: string;
}

export function FormErrorAlert({ message }: FormErrorAlertProps) {
  return (
    <Alert className="border-border bg-muted">
      <CircleAlert />
      <AlertDescription className="text-foreground">{message}</AlertDescription>
    </Alert>
  );
}
