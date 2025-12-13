// // lib/supabaseServer.ts
// import { cookies } from "next/headers";
// import { createServerClient } from "@supabase/ssr";

// export function createServerSupabaseClient() {
//   const cookieStore = cookies();

//   // Shim adapter agar sesuai dengan signature yang diharapkan
//   const cookieMethods = {
//     // Supabase expects `get(name)` to return the cookie value (string) or null
//     get(name: string) {
//       return cookieStore.get(name)?.value ?? null;
//     },
//     // Supabase expects getAll() to return string[] (all cookie values)
//     getAll() {
//       return cookieStore.getAll().map((c) => ({
//         name: c.name,
//         value: c.value,
//       }));
//     },
//     // set / delete biasanya tidak digunakan langsung di Server Component,
//     // jadi kita lempar error / noop supaya developer sadar
//     set(_name: string, _value: string, _options?: any) {
//       throw new Error(
//         "Setting cookies from a Server Component is not supported here. Use a Route Handler or server action."
//       );
//     },
//     delete(_name: string, _options?: any) {
//       throw new Error(
//         "Deleting cookies from a Server Component is not supported here. Use a Route Handler or server action."
//       );
//     },
//   };

//   return createServerClient(
//     process.env.NEXT_PUBLIC_SUPABASE_URL!,
//     process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
//     {
//       cookies: cookieMethods,
//     }
//   );
// }

import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export function createServerSupabaseClient() {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          try {
            cookieStore.set(name, value, options);
          } catch (e) {
            console.error("Could not set cookie:", e);
          }
        },
        remove(name: string, options: any) {
          try {
            cookieStore.set(name, "", { ...options, maxAge: 0 });
          } catch (e) {
            console.error("Could not remove cookie:", e);
          }
        },
      },
    }
  );
}
