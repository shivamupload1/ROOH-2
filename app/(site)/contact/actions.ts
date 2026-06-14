"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { contactInquirySchema } from "@/lib/validators";

function textOrNull(value?: string | null) {
  return value && value.length > 0 ? value : null;
}

export async function submitInquiryAction(formData: FormData) {
  const parsed = contactInquirySchema.parse(Object.fromEntries(formData));

  await prisma.inquiry.create({
    data: {
      name: parsed.name,
      phone: parsed.phone,
      email: textOrNull(parsed.email),
      eventType: textOrNull(parsed.eventType),
      eventDate: parsed.eventDate ? new Date(`${parsed.eventDate}T00:00:00.000Z`) : null,
      city: textOrNull(parsed.city),
      message: textOrNull(parsed.message)
    }
  });

  redirect("/contact?sent=1");
}
