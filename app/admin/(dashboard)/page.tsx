import { CalendarDays, Images, LockKeyhole, Users } from "lucide-react";
import { DataTable } from "@/components/admin/data-table";
import { StatCard } from "@/components/admin/stat-card";
import { prisma } from "@/lib/db";

export default async function AdminDashboardPage() {
  const [clients, events, albums, mediaFiles, favorites, downloads, connectedDriveAccounts] = await Promise.all([
    prisma.client.count(),
    prisma.event.count(),
    prisma.album.count(),
    prisma.mediaFile.count(),
    prisma.favorite.count(),
    prisma.download.count(),
    prisma.driveAccount.count({ where: { status: "CONNECTED" } })
  ]);

  return (
    <div>
      <div className="mb-6">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-rust">Live dashboard</p>
        <h1 className="mt-2 text-3xl font-semibold text-ink">Dashboard Overview</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-ink/65">
          Track clients, events, private galleries, Drive connection status, and client activity.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Clients" value={String(clients)} helper="Client profiles" icon={Users} />
        <StatCard label="Events" value={String(events)} helper={`${albums} albums`} icon={CalendarDays} />
        <StatCard label="Media" value={String(mediaFiles)} helper="Drive metadata records" icon={Images} />
        <StatCard label="Security" value="PIN" helper={`${connectedDriveAccounts} Drive connected`} icon={LockKeyhole} />
      </div>

      <div className="mt-8">
        <h2 className="mb-4 text-xl font-semibold text-ink">MVP status</h2>
        <DataTable
          columns={["Area", "Phase", "Status"]}
          rows={[
            ["Public website", "Phase 1", "Built"],
            ["Prisma schema", "Phase 1", "Built"],
            ["Admin login", "Phase 1", "Built"],
            ["Clients/events/albums/media", "Phase 2", "Built"],
            ["Private gallery PIN/favorites/download logs", "Phase 2", `${favorites} favorites / ${downloads} downloads`],
            ["Google Drive OAuth/list/import", "Phase 3", "Built"]
          ]}
        />
      </div>
    </div>
  );
}
