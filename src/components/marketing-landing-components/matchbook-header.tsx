import React from "react";
import { UserIcon, MenuIcon } from "@/components/svgs/svg-components";

export default function MatchbookHeader() {
  return (
    <div className="sticky top-0 bg-white z-30 ">
      <header className="relative flex mb-6 justify-between px-4 pt-4 pb-8 items-start border-b-0">
        <div className="flex">
          <img src="logo-nav-new.png" alt="MatchBook Logo" className="w-full h-14" />
        </div>
        <div className="absolute inset-x-0 bottom-2 flex justify-center w-[100px] mx-auto bg-white">
          <img src="/svg/heart-header.svg" className="h-14 w-14  heart" alt="MatchBook Heart" />
        </div>
        <div className="flex space-x-4">
          <MenuIcon className="h-14 w-14" />
          <UserIcon className="h-14 w-14" />
        </div>
        <style jsx>{`
          header::before {
            content: '';
            position: absolute;
            bottom: 30%;
            left: 0;
            right: 0;
            height: 1px;
            background-color: lightgray;
          }
          .heart::before {
            content: '';
            position: absolute;
            bottom: 25%;
            left: -25px;
            right: -25px;
            height: 30px;
            background-color: red;
            z-index: 1;
          }
        `}</style>
      </header>
    </div>
  )
}