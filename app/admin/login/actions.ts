"use server";

import { redirect } from "next/navigation";
import { createAdminSession, verifyAdminCredentials } from "@/lib/auth";
import { adminLoginSchema } from "@/lib/validators";

export type LoginState = {
  error?: string;
  fieldErrors?: {
    email?: string[];
    password?: string[];
  };
};

export async function loginAction(_previousState: LoginState, formData: FormData): Promise<LoginState> {
  const parsed = adminLoginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password")
  });

  if (!parsed.success) {
    return {
      fieldErrors: parsed.error.flatten().fieldErrors
    };
  }

  const admin = await verifyAdminCredentials(parsed.data.email, parsed.data.password);

  if (!admin) {
    return {
      error: "Invalid admin email or password."
    };
  }

  await createAdminSession(admin);
  redirect("/admin");
}
