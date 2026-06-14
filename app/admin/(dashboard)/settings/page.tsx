import { Settings } from "lucide-react";
import { AdminPlaceholderPage } from "@/components/admin/admin-placeholder-page";

export default function AdminSettingsPage() {
  return (
    <AdminPlaceholderPage
      title="Settings"
      icon={Settings}
      description="Studio settings, contact details, gallery defaults, and security preferences will be editable from this area later."
    />
  );
}
