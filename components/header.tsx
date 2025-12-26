import Image from "next/image";
import Link from "next/link";
import { Avatar, AvatarImage } from "./ui/avatar";
import { MenuItem } from "./menu-item";
import { cn } from "@/lib/utils";

export const Header = () => {
  return (
    <nav className="lg:flex hidden px-6 h-[80px] items-center justify-between bg-white border-b-2 fixed top-0 w-full z-50">
      <div className="flex items-center space-x-2">
        {/* LOGO */}
        <Link href="/beranda">
          <div className=" flex items-center gap-x-3 mr-12">
            <Image src="/mascot.svg" height={40} width={40} alt="Mascot" />
            <h1 className="text-xl font-extrabold text-sky-600 tracking-wide leading-none uppercase w-28">
              Persiapan Kerja
            </h1>
          </div>
        </Link>
        <div className="flex flex-col gap-y-2 flex-1">
          <MenuItem label="Beranda" href="/beranda" iconSrc="/beranda.svg" />
        </div>
      </div>

      <div className="flex items-center gap-x-5">
        {/* MENU UTAMA */}
        <div className="flex flex-col gap-y-2 flex-1">
          <MenuItem label="" href="/notification" iconSrc="/notification.svg" />
        </div>

        <div className="flex flex-col gap-y-2 flex-1">
          <MenuItem label="" href="/shop" iconSrc="/shop.svg" />
        </div>

        <div className="flex items-center gap-x-3">
          <Avatar>
            <AvatarImage
              src="https://github.com/shadcn.png"
              alt="@shadcn"
            ></AvatarImage>
          </Avatar>
          {/* username */}
          <p className="font-bold text-sm uppercase ">John Doe</p>
        </div>
      </div>
    </nav>
  );
};
