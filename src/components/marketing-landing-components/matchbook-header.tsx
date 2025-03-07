'use client'
import React, { useState, useEffect } from "react";
import { UserIcon, MenuIcon } from "@/components/svgs/svg-components";
import Link from "next/link";
import { Button } from "../ui/button";
import { CountdownDialog } from "@/app/page";
import { Popover, PopoverTrigger, PopoverContent } from "../ui/popover";
import { UserButton } from "@clerk/nextjs";
import { useAuth, useUser } from "@clerk/nextjs";
import UserMenu from "../userMenu";


interface MatchbookHeaderProps {
  handleListProperty?: (() => void) | false;
  customMargin?: boolean;
  isSticky?: boolean;
}

export default function MatchbookHeader({
  handleListProperty = false,
  customMargin = true,
  isSticky = true
}: MatchbookHeaderProps) {
  const [defaultIsOpen, setDefaultIsOpen] = useState(false);
  const [hasAccess, setHasAccess] = useState(false);
  const { isSignedIn } = useAuth();
  const { user } = useUser();

  useEffect(() => {
    const checkAccess = async () => {
      if (isSignedIn && user) {
        const userRole = user.publicMetadata.role as string;
        setHasAccess(userRole === 'moderator' || userRole === 'admin' || userRole === 'beta_user');
      }
    };

    checkAccess();
  }, [isSignedIn, user]);

  const handleDefault = () => {
    setDefaultIsOpen(true);
  }

  //setTimeout(() => {
  //  if (window?.FreshworksWidget) {
  //    window?.FreshworksWidget('show', 'launcher');
  //  }
  //}, 300)

  return (
    <div className={`${isSticky ? 'sticky' : ''} mb-0 top-0 bg-background transition-all duration-100 ease-in z-30 pb-0 border-b`}>
      {!handleListProperty && (
        <CountdownDialog isOpen={defaultIsOpen} setIsOpen={setDefaultIsOpen} />
      )}
      <header className={`relative flex mb-0 w-full ${customMargin ? 'md:w-[90vw] lg:w-[80vw]' : 'md:w-full lg:w-full'} px-2 md:px-0 mx-auto justify-center pt-2 items-center border-b-0 pb-2`}>
        {/* Logo container with responsive visibility */}
        <div className="flex items-center absolute left-2 xs:static xs:mr-auto">
          <Link href={"/"}>
            <img
              src="/navbar-logo-full.png"
              alt="MatchBook Logo"
              className="hidden sm:block w-[full] h-14 md:h-14"
            />
            <img
              src="/House_Logo.png"
              alt="MatchBook Heart"
              className="sm:hidden h-10 w-10"
            />
          </Link>
        </div>

        {/* Center heart logo */}
        <img
          src="/svg/heart-header.svg"
          className="h-8 w-8 hidden md:flex"
          alt="MatchBook Heart"
        />

        {/* Right-side elements container */}
        <div className="flex space-x-2 md:space-x-4 items-center absolute right-2 xs:static xs:ml-auto">
          <Link className="hidden xs:flex" href={"?tab=list#list-your-property"} shallow>
            <Button
              className="w-[191px] h-[36px] text-[18px] rounded-[15px]
                         border-[1px] font-normal border-charcoal"
              onClick={handleListProperty || handleDefault}
              variant={"outline"}
            >
              List your property
            </Button>
          </Link>
          <UserMenu isSignedIn={isSignedIn} color="black" />
        </div>

        {/* Centered button container for mobile */}
        <div className="xs:hidden flex justify-center items-center flex-1">
          <Link href={"?tab=list#list-your-property"} shallow>
            <Button
              className="w-[191px] h-[36px] text-[18px] rounded-[15px]
                         border-[1px] font-normal border-charcoal"
              onClick={handleListProperty || handleDefault}
              variant={"outline"}
            >
              List your property
            </Button>
          </Link>
        </div>
      </header>
    </div>
  );
}
