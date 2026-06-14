import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { LoginForm } from "@/app/admin/login/login-form";
import { getAdminSession } from "@/lib/auth";
import { brand } from "@/lib/content";

export const metadata: Metadata = {
  title: "Admin Login"
};

export default async function AdminLoginPage() {
  const session = await getAdminSession();

  if (session) {
    redirect("/admin");
  }

  return (
    <main className="grid min-h-screen place-items-center bg-ivory px-4 py-10">
      <section className="w-full max-w-md rounded-lg border border-marigold/30 bg-white p-6 shadow-soft">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-rust">
          <ArrowLeft size={17} />
          Back to website
        </Link>
        <p className="mt-8 text-sm font-semibold uppercase tracking-[0.22em] text-marigold">Studio admin</p>
        <h1 className="mt-2 text-3xl font-semibold text-ink">{brand.name}</h1>
        <p className="mt-3 text-sm leading-6 text-ink/65">
          Sign in to manage clients, events, albums, gallery settings, and future Drive connections.
        </p>
        <LoginForm />
      </section>
    </main>
  );
}
