import { prisma } from "@/lib/db";

export default async function AdminFavoritesPage() {
  const favorites = await prisma.favorite.findMany({
    include: {
      event: true,
      mediaFile: true
    },
    orderBy: { createdAt: "desc" },
    take: 200
  });

  return (
    <div>
      <div className="mb-6">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-rust">Phase 2</p>
        <h1 className="mt-2 text-3xl font-semibold text-ink">Favorites / Album Selection</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-ink/65">
          Visitor favorite selections are stored here for album proofing and follow-up.
        </p>
      </div>

      <div className="overflow-hidden rounded-lg border border-ink/10 bg-white">
        <table className="w-full border-collapse text-left text-sm">
          <thead className="bg-ivory text-ink/70">
            <tr>
              <th className="px-4 py-3 font-semibold">File</th>
              <th className="px-4 py-3 font-semibold">Event</th>
              <th className="px-4 py-3 font-semibold">Visitor</th>
              <th className="px-4 py-3 font-semibold">Saved</th>
            </tr>
          </thead>
          <tbody>
            {favorites.map((favorite) => (
              <tr key={favorite.id} className="border-t border-ink/10">
                <td className="px-4 py-3 font-semibold text-ink">{favorite.mediaFile.fileName}</td>
                <td className="px-4 py-3 text-ink/70">{favorite.event.name}</td>
                <td className="px-4 py-3 text-ink/70">{favorite.visitorId?.slice(0, 8) || "User"}</td>
                <td className="px-4 py-3 text-ink/70">{favorite.createdAt.toLocaleString("en-IN")}</td>
              </tr>
            ))}
            {favorites.length === 0 ? (
              <tr>
                <td className="px-4 py-8 text-center text-ink/55" colSpan={4}>
                  No favorites saved yet.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
