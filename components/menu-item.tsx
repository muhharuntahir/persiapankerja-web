"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

import { Button } from "@/components/ui/button";

type Props = {
  label: string;
  iconSrc: string;
  href: string;
};

export const MenuItem = ({ label = "", iconSrc, href }: Props) => {
  const pathname = usePathname();
  const active = pathname === href;

  return (
    <Button
      variant={active ? "sidebarOutline" : "sidebar"}
      className="justify-start h-[52px] flex items-center"
      asChild
    >
      <Link href={href}>
        {label ? (
          <Image
            src={iconSrc}
            alt={label}
            className="mr-3"
            height={32}
            width={32}
          />
        ) : (
          <Image src={iconSrc} alt={label} height={32} width={32} />
        )}
        {label}
      </Link>
    </Button>
  );
};
