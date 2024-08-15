"use client";

import Link from "next/link";
import AltNavbar from "./AltNavbar";

const FeaturedComponent = () => {
  return (
    <div className="screen-container">
      <div className="w-full h-full flex flex-col items-center p-3 gap-3">
        <AltNavbar />
        <div className="w-full flex mt-20 justify-end text-xs gap-2">
          <Link href="/privacy-policy">Privacy Policy</Link>
          <span> | </span>
          <Link href="/terms-and-conditions">Terms and Conditions</Link>
        </div>
        <div className="h-full w-full flex flex-col items-center justify-center">
          <h1 className="text-2xl font-semibold">SOON</h1>
        </div>
      </div>
    </div>
  );
};

export default FeaturedComponent;
