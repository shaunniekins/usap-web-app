import { AiOutlineUser, AiOutlineFilter } from "react-icons/ai";

const Navbar = () => {
  return (
    <div className="w-screen flex justify-around items-center">
      <button>
        <AiOutlineUser size={30} />
      </button>
      <img
        src="/usap-with-name-logo.png"
        alt=""
        className="h-[80px] w-[110px]"
      />
      <button>
        <AiOutlineFilter size={30} />
      </button>
    </div>
  );
};

export default Navbar;
