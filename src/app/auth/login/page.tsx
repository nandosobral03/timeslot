import GoogleLogin from "@/app/auth/login/google-login";
import LoginForm from "@/app/auth/login/login-form";

const Login = () => {
  return (
    <div className="flex justify-center items-center size-full bg-green p-4">
      <div className="bg-background items-center flex flex-col gap-8 p-6 md:p-10 rounded-xl text-center">
        <p className="text-2xl font-medium">Sign in</p>

        <p className="font-thin">Sign in to your account or continue with Google!</p>

        <LoginForm />

        <div className="flex items-center w-full -my-4">
          <div className="grow border-t border-gray" />
          <span className="mx-4 text-gray">or</span>
          <div className="grow border-t border-gray" />
        </div>

        <GoogleLogin />
      </div>
    </div>
  );
};

export default Login;
