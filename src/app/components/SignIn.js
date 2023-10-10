const SignIn = () => {
  return (
    <>
      <div className="w-screen h-screen flex flex-col items-center py-[80px] justify-around px-[20px] font-Roboto">
        <div className="flex flex-col items-center">
          <img
            src="/usap-logo.png"
            alt="Usap Logo"
            className=" h-[200px] w-[200px]"
          />
          <h3 className="mt-[-30px] mb-[250px] font-normal">
            Tara <span className=" italic">usap!</span>
          </h3>
        </div>

        <div className="w-full flex flex-col space-y-3">
          <button className="w-full flex py-[10px] px-[25px] rounded-lg shadow-md space-x-[30px] bg-white">
            <img
              src="/google.png"
              alt="Google Logo"
              className="h-[25px] w-[25px] "
            />
            <p>Sign in with Google</p>
          </button>

          <button className="w-full flex py-[10px] px-[25px] rounded-lg shadow-md space-x-[30px] bg-[#1976D2] text-white">
            <img
              src="/facebook2.png"
              alt="Facebook Logo"
              className="h-[25px] w-[25px]"
            />
            <p>Sign in with Facebook</p>
          </button>

          <button className="w-full flex py-[10px] px-[25px] rounded-lg shadow-md space-x-[30px] bg-black text-white">
            <img
              src="/apple.png"
              alt="Apple Logo"
              className="h-[25px] w-[25px]"
            />
            <p>Sign in with Apple</p>
          </button>
        </div>
      </div>
    </>
  );
};

export default SignIn;
