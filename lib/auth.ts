import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";

const ADMIN_SESSION_COOKIE = "rr_admin_session";
const GALLERY_SESSION_COOKIE = "rr_gallery_session";
const SESSION_TTL_SECONDS = 60 * 60 * 8;
const GALLERY_SESSION_TTL_SECONDS = 60 * 60 * 24 * 30;

export type AdminSession = {
  email: string;
  name?: string | null;
  exp: number;
};

export type GallerySession = {
  eventId: string;
  visitorId: string;
  exp: number;
};

function getSessionSecret() {
  const secret = process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET;

  if (secret) {
    return secret;
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error("JWT_SECRET or NEXTAUTH_SECRET must be set in production.");
  }

  return "phase-one-development-session-secret-change-me";
}

function toBase64Url(value: string) {
  return Buffer.from(value).toString("base64url");
}

function fromBase64Url(value: string) {
  return Buffer.from(value, "base64url").toString("utf8");
}

function sign(payload: string) {
  return createHmac("sha256", getSessionSecret()).update(payload).digest("base64url");
}

function createSignedToken(session: AdminSession | GallerySession) {
  const payload = toBase64Url(JSON.stringify(session));
  return `${payload}.${sign(payload)}`;
}

function readSignedToken<T extends { exp: number }>(token: string): T | null {
  const [payload, signature] = token.split(".");

  if (!payload || !signature) {
    return null;
  }

  const expected = sign(payload);
  const expectedBuffer = Buffer.from(expected);
  const signatureBuffer = Buffer.from(signature);

  if (expectedBuffer.length !== signatureBuffer.length || !timingSafeEqual(expectedBuffer, signatureBuffer)) {
    return null;
  }

  const session = JSON.parse(fromBase64Url(payload)) as T;

  if (!session.exp || session.exp < Math.floor(Date.now() / 1000)) {
    return null;
  }

  return session;
}

function readAdminToken(token: string): AdminSession | null {
  const session = readSignedToken<AdminSession>(token);

  if (!session?.email) {
    return null;
  }

  return session;
}

function readGalleryToken(token: string): GallerySession | null {
  const session = readSignedToken<GallerySession>(token);

  if (!session?.eventId || !session.visitorId) {
    return null;
  }

  return session;
}

export async function createAdminSession(input: { email: string; name?: string | null }) {
  const expiresAt = Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS;
  const token = createSignedToken({ ...input, exp: expiresAt });
  const cookieStore = await cookies();

  cookieStore.set(ADMIN_SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: SESSION_TTL_SECONDS,
    path: "/"
  });
}

export async function clearAdminSession() {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_SESSION_COOKIE);
}

export async function getAdminSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;

  if (!token) {
    return null;
  }

  try {
    return readAdminToken(token);
  } catch {
    return null;
  }
}

export async function requireAdminSession() {
  const session = await getAdminSession();

  if (!session) {
    redirect("/admin/login");
  }

  return session;
}

export async function verifyAdminCredentials(email: string, password: string) {
  const normalizedEmail = email.toLowerCase();

  if (process.env.DATABASE_URL) {
    try {
      const admin = await prisma.user.findUnique({
        where: { email: normalizedEmail }
      });

      if (admin?.role === "ADMIN" && admin.passwordHash) {
        const passwordMatches = await bcrypt.compare(password, admin.passwordHash);

        if (passwordMatches) {
          return { email: admin.email, name: admin.name };
        }
      }
    } catch {
      // If the database is not migrated yet, allow the beginner-friendly env fallback below.
    }
  }

  const envEmail = (process.env.ADMIN_EMAIL || "admin@roohandrangstories.in").toLowerCase();
  const envPassword =
    process.env.ADMIN_PASSWORD || (process.env.NODE_ENV === "production" ? "" : "ChangeMeSoon!");

  if (!envPassword || normalizedEmail !== envEmail) {
    return null;
  }

  const passwordMatches = envPassword.startsWith("$2")
    ? await bcrypt.compare(password, envPassword)
    : password === envPassword;

  return passwordMatches ? { email: envEmail, name: "ROOH & RANG Admin" } : null;
}

export async function hashSecret(value: string) {
  return bcrypt.hash(value, 12);
}

export async function verifySecret(value: string, hash: string) {
  return bcrypt.compare(value, hash);
}

export async function createGallerySession(eventId: string) {
  const expiresAt = Math.floor(Date.now() / 1000) + GALLERY_SESSION_TTL_SECONDS;
  const token = createSignedToken({ eventId, visitorId: randomUUID(), exp: expiresAt });
  const cookieStore = await cookies();

  cookieStore.set(GALLERY_SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: GALLERY_SESSION_TTL_SECONDS,
    path: "/"
  });
}

export async function getGallerySession(eventId: string) {
  const cookieStore = await cookies();
  const token = cookieStore.get(GALLERY_SESSION_COOKIE)?.value;

  if (!token) {
    return null;
  }

  try {
    const session = readGalleryToken(token);
    return session?.eventId === eventId ? session : null;
  } catch {
    return null;
  }
}
