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

const loginSchema = z.object({
  email: z.string({ required_error: "Email is required" }).email("Invalid email"),
  password: z.string({ required_error: "Password is required" }).min(8, "Minimum 8 characters"),
});

type login = z.infer<typeof loginSchema>;

const LoginForm = () => {
  const router = useRouter();
  const loginMutation = api.users.login.useMutation();
  const [success, setSuccess] = useState(false);

  const onSubmit = async (data: login) => {
    try {
      await loginMutation.mutateAsync({ ...data });
      setSuccess(true);
      setTimeout(() => {
        router.push("/auth/registration");
      }, 350);
    } catch {
      toast.error("Invalid email or password");
    }
  };

  const form = useForm<login>({
    defaultValues: {
      password: "",
      email: "",
    },
    resolver: zodResolver(loginSchema),
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

        <Button type="submit" disabled={loginMutation.isPending || success} className="relative">
          {loginMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {success && <Check className="mr-2 h-4 w-4 text-white" />}
          Sign in
        </Button>

        <Link href="/auth/signup" className="text-sm text-center text-primary hover:underline">
          Don't have an account? Sign up
        </Link>
      </form>
    </Form>
  );
};

export default LoginForm;
