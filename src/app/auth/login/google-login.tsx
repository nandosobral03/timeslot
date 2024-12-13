import Image from "next/image";
import Link from "next/link";
import GoogleLogo from "@/public/google-logo.png";

const GoogleSignup = () => (
  <Link className="bg-background border-gray outline outline-1 outline-primary rounded-2xl bg-green  w-full text-base py-2 hover:brightness-95" href={"/auth/google"}>
    <div className="flex gap-4 justify-center items-center size-full">
      <Image src={GoogleLogo} alt="Google logo" width={40} height={40} className="size-4" />

      <p className="text-foreground">Continue with Google</p>
    </div>
  </Link>
);

export default GoogleSignup;
