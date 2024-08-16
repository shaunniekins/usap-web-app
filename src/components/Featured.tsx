"use client";

import Link from "next/link";
import AltNavbar from "./AltNavbar";
import SoonIndicatorSoon from "./SoonIndicator";
import { useSessionCheck } from "@/hooks/useSessionCheck";
import Image from "next/image";

const FeaturedComponent = () => {
  useSessionCheck();

  return (
    <div className="screen-container">
      <div className="w-full h-full flex flex-col items-center p-3 gap-3">
        <AltNavbar />
        <div className="h-full w-full flex flex-col items-center justify-center mt-16">
          <Image src="/logo-usap.gif" alt="Logo" width={300} height={300} />
          <SoonIndicatorSoon />
        </div>
        <div className="w-full flex justify-center text-[0.60rem] gap-2">
          <Link href="/privacy-policy">Privacy Policy</Link>
          <span> | </span>
          <Link href="/terms-and-conditions">Terms and Conditions</Link>
        </div>
      </div>
    </div>
  );
};

export default FeaturedComponent;
