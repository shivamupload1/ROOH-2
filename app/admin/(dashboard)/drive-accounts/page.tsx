import Link from "next/link";
import { Link as LinkIcon, Plus, Trash2 } from "lucide-react";
import { createDriveAccountAction, deleteDriveAccountAction } from "@/app/admin/(dashboard)/actions";
import { SelectField } from "@/components/admin/form-controls";
import { FormField } from "@/components/admin/form-field";
import { prisma } from "@/lib/db";

const accountTypeOptions = [
  { label: "Client Personal", value: "CLIENT_PERSONAL" },
  { label: "Studio Workspace", value: "STUDIO_WORKSPACE" },
  { label: "Shared Drive", value: "SHARED_DRIVE" }
];

export default async function AdminDriveAccountsPage() {
  const [driveAccounts, clients] = await Promise.all([
    prisma.driveAccount.findMany({
      include: {
        client: true,
        _count: {
          select: { events: true, mediaFiles: true }
        }
      },
      orderBy: { createdAt: "desc" }
    }),
    prisma.client.findMany({ orderBy: { name: "asc" } })
  ]);

  const clientOptions = [
    { label: "No specific client", value: "" },
    ...clients.map((client) => ({ label: client.name, value: client.id }))
  ];

  return (
    <div className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
      <section>
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-rust">Phase 3</p>
        <h1 className="mt-2 text-3xl font-semibold text-ink">Drive Accounts</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-ink/65">
          Add one Google Drive identity per client or event. Use OAuth connect; never store Google passwords.
        </p>

        <form action={createDriveAccountAction} className="mt-6 grid gap-4 rounded-lg border border-ink/10 bg-white p-6">
          <FormField label="Label" name="label" placeholder="Rahul & Priya Drive" required />
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Google email" name="googleEmail" type="email" placeholder="client@gmail.com" />
            <SelectField label="Account type" name="accountType" options={accountTypeOptions} defaultValue="CLIENT_PERSONAL" />
          </div>
          <SelectField label="Client" name="clientId" options={clientOptions} />
          <button type="submit" className="inline-flex w-fit items-center gap-2 rounded-md bg-ink px-5 py-3 text-sm font-semibold text-ivory transition hover:bg-rust">
            <Plus size={17} />
            Add Drive Account
          </button>
        </form>
      </section>

      <section className="overflow-hidden rounded-lg border border-ink/10 bg-white">
        <table className="w-full border-collapse text-left text-sm">
          <thead className="bg-ivory text-ink/70">
            <tr>
              <th className="px-4 py-3 font-semibold">Account</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold">Use</th>
              <th className="px-4 py-3 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {driveAccounts.map((account) => (
              <tr key={account.id} className="border-t border-ink/10">
                <td className="px-4 py-3">
                  <p className="font-semibold text-ink">{account.label}</p>
                  <p className="text-xs text-ink/55">{account.googleEmail || "Email will fill after OAuth"}</p>
                  <p className="text-xs text-ink/45">{account.client?.name || "Studio / unassigned"}</p>
                </td>
                <td className="px-4 py-3">
                  <span className="rounded-full bg-ivory px-3 py-1 text-xs font-semibold text-rust">{account.status}</span>
                </td>
                <td className="px-4 py-3 text-ink/70">
                  {account._count.events} events / {account._count.mediaFiles} files
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-2">
                    <Link
                      href={`/api/google/connect?driveAccountId=${account.id}`}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-ink/10 text-ink transition hover:border-rust hover:text-rust"
                      title="Connect Google Drive"
                    >
                      <LinkIcon size={16} />
                    </Link>
                    <form action={deleteDriveAccountAction.bind(null, account.id)}>
                      <button
                        type="submit"
                        className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-ink/10 text-ink transition hover:border-rust hover:text-rust"
                        title="Delete Drive account"
                      >
                        <Trash2 size={16} />
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
            {driveAccounts.length === 0 ? (
              <tr>
                <td className="px-4 py-8 text-center text-ink/55" colSpan={4}>
                  No Drive accounts yet.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </section>
    </div>
  );
}
