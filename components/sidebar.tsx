"use client";

import Link from "next/link";
import Image from "next/image";
import { Loader, LogOut } from "lucide-react";
import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";
import { SidebarItem } from "./sidebar-item";
import { createClient } from "@/lib/supabaseClient";
import { Button } from "./ui/button";

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
  }, [supabase]);

  const logout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  return (
    <div
      className={cn(
        "flex h-full lg:w-[256px] lg:fixed left-0 top-0 lg:pt-[100px] pt-4 px-4 border-r-2 flex-col bg-white",
        className
      )}
    >
      {/* LOGO */}
      <Link href="/learn">
        <div className="lg:hidden pt-8 pl-4 pb-7 flex items-center gap-x-3">
          <Image src="/mascot.svg" height={40} width={40} alt="Mascot" />
          <h1 className="text-xl font-extrabold text-sky-600 tracking-wide leading-none">
            Persiapan Kerja
          </h1>
        </div>
      </Link>

      {/* MENU UTAMA */}
      <div className="flex flex-col gap-y-2 flex-1">
        <SidebarItem label="Persiapan" href="/learn" iconSrc="/learn.svg" />
        <SidebarItem
          label="Simulasi"
          href="/simulate"
          iconSrc="/simulate.svg"
        />
        <SidebarItem label="Mini Game" href="/games" iconSrc="/games.svg" />
        <SidebarItem
          label="Peringkat"
          href="/leaderboard"
          iconSrc="/leaderboard.svg"
        />
        <SidebarItem label="Misi" href="/quests" iconSrc="/quests.svg" />
        <SidebarItem
          label="Liveclass"
          href="/liveclass"
          iconSrc="/liveclass.svg"
        />
        {/* <SidebarItem label="Toko" href="/shop" iconSrc="/shop.svg" /> */}
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
            Masuk
          </Link>
        ) : (
          // Jika sudah login → tampilkan email + logout
          <div className="flex flex-col gap-y-2">
            {/* <p className="text-xs font-semibold text-neutral-600">
              {user.email}
            </p> */}

            <Button
              onClick={logout}
              // className="text-sm text-red-600 hover:underline font-semibold bg-red-50 px-4 py-2 rounded-md"
              variant="danger"
              className="flex items-center"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Keluar
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
