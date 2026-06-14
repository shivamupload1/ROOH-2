import { Clapperboard } from "lucide-react";
import { AdminPlaceholderPage } from "@/components/admin/admin-placeholder-page";

export default function AdminContentPage() {
  return (
    <AdminPlaceholderPage
      title="Website Content"
      icon={Clapperboard}
      description="Public page copy is static in Phase 1. The WebsiteContent model is ready for a later editable content screen."
    />
  );
}
