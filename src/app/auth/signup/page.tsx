import GoogleSignup from "@/app/auth/signup/google-signup";
import SignupForm from "./signup-form";

const Signup = () => {
  return (
    <div className="flex justify-center items-center size-full bg-green p-4">
      <div className="bg-background items-center flex flex-col gap-8 p-6 md:p-10 rounded-xl text-center">
        <p className="text-2xl font-medium">Sign up</p>

        <p className="font-thin">Create an account or continue with Google!</p>

        <SignupForm />

        <div className="flex items-center w-full -my-4">
          <div className="grow border-t border-gray" />
          <span className="mx-4 text-gray">or</span>
          <div className="grow border-t border-gray" />
        </div>

        <GoogleSignup />
      </div>
    </div>
  );
};

export default Signup;
