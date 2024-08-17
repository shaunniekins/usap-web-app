import Image from "next/image";

export const LoadingScreen = () => {
  return (
    <div className="z-10 flex w-screen h-[100svh] justify-center items-center p-5">
      <Image src="/logo-usap.gif" alt="Logo" width={150} height={150} />
    </div>
  );
};
