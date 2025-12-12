"use client";

import Link from "next/link";
import Image from "next/image";
import { Loader } from "lucide-react";
import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";
import { SidebarItem } from "./sidebar-item";
import { createClient } from "@/lib/supabaseClient";

type Props = {
  className?: string;
};

export const Sidebar = ({ className }: Props) => {
  const supabase = createClient();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Ambil user saat komponen dimuat
  useEffect(() => {
    supabase.auth.getUser().then((res) => {
      setUser(res.data.user ?? null);
      setLoading(false);
    });
  }, []);

  const logout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  return (
    <div
      className={cn(
        "flex h-full lg:w-[256px] lg:fixed left-0 top-0 px-4 border-r-2 flex-col",
        className
      )}
    >
      {/* LOGO */}
      <Link href="/learn">
        <div className="pt-8 pl-4 pb-7 flex items-center gap-x-3">
          <Image src="/mascot.svg" height={40} width={40} alt="Mascot" />
          <h1 className="text-2xl font-extrabold text-green-600 tracking-wide">
            Lingo
          </h1>
        </div>
      </Link>

      {/* MENU UTAMA */}
      <div className="flex flex-col gap-y-2 flex-1">
        <SidebarItem label="Learn" href="/learn" iconSrc="/learn.svg" />
        <SidebarItem
          label="Leaderboard"
          href="/leaderboard"
          iconSrc="/leaderboard.svg"
        />
        <SidebarItem label="Quests" href="/quests" iconSrc="/quests.svg" />
        <SidebarItem label="Shop" href="/shop" iconSrc="/shop.svg" />
      </div>

      {/* AUTH SECTION */}
      <div className="p-4">
        {loading ? (
          <Loader className="h-5 w-5 text-muted-foreground animate-spin" />
        ) : !user ? (
          // Jika belum login → tampilkan tombol login
          <Link
            href="/auth/login"
            className="text-sm text-blue-600 hover:underline font-semibold"
          >
            Login
          </Link>
        ) : (
          // Jika sudah login → tampilkan email + logout
          <div className="flex flex-col gap-y-2">
            <p className="text-xs font-semibold text-neutral-600">
              {user.email}
            </p>

            <button
              onClick={logout}
              className="text-sm text-red-600 hover:underline font-semibold"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
