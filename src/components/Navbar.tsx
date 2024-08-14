import Image from "next/image";

const Navbar = () => {
  return (
    <div className="w-screen top-0 absolute bg-theme flex justify-center items-center shadow-md">
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
