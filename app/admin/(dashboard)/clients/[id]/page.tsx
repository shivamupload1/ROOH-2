import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Save } from "lucide-react";
import { updateClientAction } from "@/app/admin/(dashboard)/actions";
import { TextareaField } from "@/components/admin/form-controls";
import { FormField } from "@/components/admin/form-field";
import { prisma } from "@/lib/db";

export default async function EditClientPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const client = await prisma.client.findUnique({ where: { id } });

  if (!client) {
    notFound();
  }

  return (
    <div className="max-w-3xl">
      <Link href="/admin/clients" className="inline-flex items-center gap-2 text-sm font-semibold text-ink/65 hover:text-rust">
        <ArrowLeft size={16} />
        Clients
      </Link>
      <div className="mt-5">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-rust">Edit client</p>
        <h1 className="mt-2 text-3xl font-semibold text-ink">{client.name}</h1>
      </div>

      <form action={updateClientAction.bind(null, client.id)} className="mt-6 grid gap-4 rounded-lg border border-ink/10 bg-white p-6">
        <FormField label="Client name" name="name" defaultValue={client.name} required />
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Email" name="email" type="email" defaultValue={client.email || ""} />
          <FormField label="Phone" name="phone" defaultValue={client.phone || ""} />
        </div>
        <FormField label="City" name="city" defaultValue={client.city || ""} />
        <TextareaField label="Notes" name="notes" rows={4} defaultValue={client.notes || ""} />
        <button type="submit" className="inline-flex w-fit items-center gap-2 rounded-md bg-ink px-5 py-3 text-sm font-semibold text-ivory transition hover:bg-rust">
          <Save size={17} />
          Update Client
        </button>
      </form>
    </div>
  );
}
