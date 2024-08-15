import Image from "next/image";
import { useRouter } from "next/navigation";

interface AltNavbarProps {
  onLeave?: () => void;
  partnerConnected?: boolean;
  callFeature?: boolean;
}

const AltNavbar = ({
  onLeave,
  partnerConnected,
  callFeature,
}: AltNavbarProps) => {
  const router = useRouter();
  return (
    <div className="w-screen top-0 absolute bg-theme flex justify-center items-center shadow-md">
      <button onClick={() => router.push("/")}>
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

export default AltNavbar;
