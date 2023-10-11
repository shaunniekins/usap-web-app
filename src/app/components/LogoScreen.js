"use client";

import { ThreeDots } from "react-loader-spinner";
import Image from "next/image";

const LogoScreen = () => {
  return (
    <div className="h-[100dvh] w-screen flex flex-col justify-center items-center">
      <Image src="/usap-logo.png" alt="Usap Logo" width={200} height={200} />
      <div className="bottom-10 absolute">
        <ThreeDots
          height="50"
          width="50"
          radius="9"
          color="#8C52FF"
          ariaLabel="three-dots-loading"
          wrapperStyle={{}}
          wrapperClassName=""
          visible={true}
        />
      </div>
    </div>
  );
};

export default LogoScreen;
