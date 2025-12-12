// app/(marketing)/header.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabaseClient";
import { useEffect, useState } from "react";

export const Header = () => {
  const supabase = createClient();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getUser().then((res) => setUser(res.data.user ?? null));
  }, []);

  const logout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  return (
    <header className="h-20 w-full border-b-2 border-slate-200 px-4">
      <div className="lg:max-w-screen-lg mx-auto flex items-center justify-between h-full">
        {/* Logo */}
        <div className="pt-8 pl-4 pb-7 flex items-center gap-x-3">
          <Image src="/mascot.svg" height={40} width={40} alt="Mascot" />
          <h1 className="text-2xl font-extrabold text-green-600 tracking-wide">
            Lingo
          </h1>
        </div>

        {/* If NOT logged in */}
        {!user ? (
          <Button size="lg" variant="ghost" asChild>
            <Link href="/auth/login">Login</Link>
          </Button>
        ) : (
          // If logged in
          <div className="flex items-center gap-x-3">
            <span className="text-sm font-semibold">{user.email}</span>
            <Button size="lg" variant="ghost" onClick={logout}>
              Logout
            </Button>
          </div>
        )}
      </div>
    </header>
  );
};
