import { AiOutlineUser, AiOutlineFilter } from "react-icons/ai";
import Image from "next/image";

const Navbar = () => {
  return (
    <div className="w-screen flex justify-around items-center">
      <button>
        <AiOutlineUser size={30} />
      </button>
      <Image src="/usap-with-name-logo.png" alt="" width={110} height={80} />
      <button>
        <AiOutlineFilter size={30} />
      </button>
    </div>
  );
};

export default Navbar;
