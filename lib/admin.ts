// lib/admin.ts
import { createServerSupabaseClient } from "@/lib/supabaseServer";

// kamu dapat memilih: cek berdasarkan user_id atau email.
// email lebih mudah dikontrol.
const ADMIN_EMAILS = ["muhharuntahir@gmail.com"];

export async function isAdmin() {
  const supabase = createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return false;

  // Cek berdasarkan email
  const email = user.email;
  if (!email) return false;

  return ADMIN_EMAILS.includes(email);
}
