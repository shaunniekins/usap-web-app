import Image from "next/image";

const SignIn = () => {
  return (
    <>
      <div className="w-screen h-[100dvh] flex flex-col items-center py-[80px] justify-around px-[20px] font-Roboto">
        <div className="flex flex-col items-center">
          <Image
            src="/usap-logo.png"
            alt="Usap Logo"
            width={200}
            height={200}
          />
          <h3 className="mt-[-30px] mb-[250px] font-normal">
            Tara <span className=" italic">usap!</span>
          </h3>
        </div>

        <div className="w-full flex flex-col space-y-3">
          <button className="w-full flex py-[10px] px-[25px] rounded-lg shadow-md space-x-[30px] bg-white">
            <Image src="/google.png" alt="Google Logo" width={25} height={25} />
            <p>Sign in with Google</p>
          </button>

          <button className="w-full flex py-[10px] px-[25px] rounded-lg shadow-md space-x-[30px] bg-[#1976D2] text-white">
            <Image
              src="/facebook2.png"
              alt="Facebook Logo"
              width={25}
              height={25}
            />
            <p>Sign in with Facebook</p>
          </button>

          <button className="w-full flex py-[10px] px-[25px] rounded-lg shadow-md space-x-[30px] bg-black text-white">
            <Image src="/apple.png" alt="Apple Logo" width={25} height={25} />
            <p>Sign in with Apple</p>
          </button>
        </div>
      </div>
    </>
  );
};

export default SignIn;
