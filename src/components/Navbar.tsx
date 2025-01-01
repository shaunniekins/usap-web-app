import Image from "next/image";
import { useRouter } from "next/navigation";

interface NavbarProps {
  onLeave?: () => void;
  partnerConnected?: boolean;
  callFeature?: boolean;
}

const Navbar = ({ onLeave, partnerConnected, callFeature }: NavbarProps) => {
  const router = useRouter();

  return (
    <div className="w-screen top-0 absolute bg-theme flex justify-center items-center shadow-md">
      <button
        onClick={() => {
          if (onLeave) {
            if (
              !partnerConnected ||
              window.confirm("Are you sure you want to leave?")
            ) {
              onLeave();
            } else {
              onLeave();
            }
            return;
          }

          if (callFeature) {
            router.push("/featured");
          }
        }}
      >
        <Image
          src="/usap-with-name-logo.png"
          priority
          alt="Usap Logo"
          width={100}
          height={80}
        />
      </button>
    </div>
  );
};

export default Navbar;
