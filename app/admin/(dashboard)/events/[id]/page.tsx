import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, FolderPlus, Save } from "lucide-react";
import { createEventDriveFoldersAction, updateEventAction } from "@/app/admin/(dashboard)/actions";
import { EventFormFields } from "@/components/admin/event-form-fields";
import { prisma } from "@/lib/db";

export default async function EditEventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [event, clients, driveAccounts] = await Promise.all([
    prisma.event.findUnique({ where: { id } }),
    prisma.client.findMany({ orderBy: { name: "asc" } }),
    prisma.driveAccount.findMany({ orderBy: { createdAt: "desc" } })
  ]);

  if (!event) {
    notFound();
  }

  return (
    <div className="max-w-4xl">
      <Link href="/admin/events" className="inline-flex items-center gap-2 text-sm font-semibold text-ink/65 hover:text-rust">
        <ArrowLeft size={16} />
        Events
      </Link>
      <div className="mt-5">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-rust">Edit event</p>
        <h1 className="mt-2 text-3xl font-semibold text-ink">{event.name}</h1>
      </div>

      <form action={updateEventAction.bind(null, event.id)} className="mt-6 grid gap-4 rounded-lg border border-ink/10 bg-white p-6">
        <EventFormFields clients={clients} driveAccounts={driveAccounts} event={event} />
        <p className="rounded-md bg-ivory px-3 py-2 text-xs leading-5 text-ink/55">
          For security, enter the 4 digit gallery PIN again whenever you save event settings.
        </p>
        <button type="submit" className="inline-flex w-fit items-center gap-2 rounded-md bg-ink px-5 py-3 text-sm font-semibold text-ivory transition hover:bg-rust">
          <Save size={17} />
          Update Event
        </button>
      </form>

      <form action={createEventDriveFoldersAction.bind(null, event.id)} className="mt-4 rounded-lg border border-marigold/30 bg-white p-6">
        <h2 className="text-lg font-semibold text-ink">Google Drive folders</h2>
        <p className="mt-2 text-sm leading-6 text-ink/60">
          After connecting the selected Drive account, this creates the event folder and missing album folders in Google Drive.
        </p>
        <button type="submit" className="mt-4 inline-flex items-center gap-2 rounded-md bg-rust px-5 py-3 text-sm font-semibold text-white transition hover:bg-ink">
          <FolderPlus size={17} />
          Create Drive Folders
        </button>
      </form>
    </div>
  );
}
