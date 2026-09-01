import { EyeIcon } from "lucide-react";
import { useState } from "react";
import type { Office } from "../types/office.types";
import { Button } from "@/components/ui/button";
import OfficeDetails from "./OfficeDetails";

export default function OfficeActions({ office }: { office: Office }) {
  const [detailsOpen, setDetailsOpen] = useState(false);

  return (
    <>
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label={`Ver detalle de ${office.name}`}
        onClick={() => setDetailsOpen(true)}
      >
        <EyeIcon aria-hidden="true" />
      </Button>
      <OfficeDetails
        office={office}
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
      />
    </>
  );
}
