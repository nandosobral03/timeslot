"use client";

import { Form, FormControl, FormField, FormLabel, FormMessage, FormItem } from "@/components/ui/form";
import { api } from "@/trpc/react";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";
import Link from "next/link";
import { Loader2, Check } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";

const signupSchema = z.object({
  email: z.string({ required_error: "Email is required" }).email("Invalid email"),
  displayName: z.string({ required_error: "Display name is required" }).min(8, "Minimum 8 characters"),
  password: z.string({ required_error: "Password is required" }).min(8, "Minimum 8 characters"),
});

type signup = z.infer<typeof signupSchema>;

const SignupForm = () => {
  const router = useRouter();
  const signupMutation = api.users.signup.useMutation();
  const [success, setSuccess] = useState(false);

  const onSubmit = async (data: signup) => {
    try {
      await signupMutation.mutateAsync({ ...data });
      setSuccess(true);
      setTimeout(() => {
        router.push("/auth/login");
      }, 350);
    } catch {
      toast.error("Error during signup");
    }
  };

  const form = useForm<signup>({
    defaultValues: {
      password: "",
      email: "",
      displayName: "",
    },
    resolver: zodResolver(signupSchema),
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-8 w-full text-start">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="text" placeholder="email@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="displayName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Display name</FormLabel>
              <FormControl>
                <Input type="text" placeholder="Display name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="********" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={signupMutation.isPending || success} className="relative">
          {signupMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {success && <Check className="mr-2 h-4 w-4 text-white" />}
          Sign up
        </Button>

        <Link href="/auth/login" className="text-sm text-center text-primary hover:underline">
          Already have an account? Sign in
        </Link>
      </form>
    </Form>
  );
};

export default SignupForm;
