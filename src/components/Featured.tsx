"use client";

import Link from "next/link";
import AltNavbar from "./AltNavbar";
import SoonIndicatorSoon from "./SoonIndicator";

const FeaturedComponent = () => {
  return (
    <div className="screen-container">
      <div className="w-full h-full flex flex-col items-center p-3 gap-3">
        <AltNavbar />
        <div className="h-full w-full flex flex-col items-center justify-center mt-16">
          <img src="logo-usap.gif" alt="Logo" className="mt-4" />
          {/* <h1 className="text-xl font-semibold font-mono">SOON</h1> */}
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
