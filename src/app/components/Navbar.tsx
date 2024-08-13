import Image from "next/image";

const Navbar = () => {
  return (
    <div className="top-0 absolute bg-white w-full flex justify-center items-center shadow-lg">
      <Image
        src="/usap-with-name-logo.png"
        priority
        alt="Usap Logo"
        width={100}
        height={80}
      />
    </div>
  );
};

export default Navbar;
