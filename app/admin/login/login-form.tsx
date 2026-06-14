"use client";

import { useActionState } from "react";
import { LockKeyhole } from "lucide-react";
import { FormField } from "@/components/admin/form-field";
import { loginAction, type LoginState } from "@/app/admin/login/actions";

const initialState: LoginState = {};

export function LoginForm() {
  const [state, formAction, pending] = useActionState(loginAction, initialState);

  return (
    <form action={formAction} className="mt-8 grid gap-4">
      <FormField
        label="Admin email"
        name="email"
        type="email"
        autoComplete="email"
        required
        error={state.fieldErrors?.email?.[0]}
      />
      <FormField
        label="Password"
        name="password"
        type="password"
        autoComplete="current-password"
        required
        error={state.fieldErrors?.password?.[0]}
      />
      {state.error ? (
        <div className="rounded-md border border-rust/30 bg-rust/10 px-4 py-3 text-sm font-medium text-rust">
          {state.error}
        </div>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="inline-flex items-center justify-center gap-2 rounded-md bg-ink px-5 py-3 text-sm font-semibold text-ivory transition hover:bg-rust disabled:cursor-not-allowed disabled:opacity-60"
      >
        <LockKeyhole size={18} />
        {pending ? "Signing in" : "Sign in"}
      </button>
    </form>
  );
}
