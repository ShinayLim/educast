// client/src/pages/auth-page.tsx
import { useForm } from "react-hook-form";
import {
  useAuth,
  loginSchema,
  registerSchema,
  loginResolver,
  registerResolver,
} from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { z } from "zod";
import { useEffect, useState } from "react";
import { Headphones, Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import PUPlogo from "../../../attached_assets/PUPLogo.png";

export default function AuthPage() {
  const { user, login, register } = useAuth();
  const [, navigate] = useLocation();

  // local loading flags
  const [loginPending, setLoginPending] = useState(false);
  const [registerPending, setRegisterPending] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (user) navigate("/");
  }, [user, navigate]);

  // — Login form —
  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: loginResolver,
    defaultValues: {
      email:    "",
      password: "",
    },
  });

  const onLoginSubmit = async (values: z.infer<typeof loginSchema>) => {
    setLoginPending(true);
    try {
      await login(values);
      // on success the context will redirect you via useEffect
    } finally {
      setLoginPending(false);
    }
  };

  // — Register form —
  const registerForm = useForm<z.infer<typeof registerSchema>>({
    resolver: registerResolver,
    defaultValues: {
      fullName: "",
      email:    "",
      username: "",
      password: "",
      role:     "student",
    },
  });

  const onRegisterSubmit = async (values: z.infer<typeof registerSchema>) => {
    setRegisterPending(true);
    try {
      await register(values);
      // on success the context will redirect you via useEffect
    } finally {
      setRegisterPending(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      <div className="flex flex-col md:flex-row w-full">
        {/* Left side: forms */}
        <div className="flex-1 p-6 md:p-10 flex items-center justify-center">
          <div className="max-w-md w-full space-y-8">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary mb-4">
                <Headphones className="h-6 w-6 text-white" />
              </div>
              <h2 className="text-3xl font-bold">EduCast</h2>
              <p className="text-muted-foreground mt-2">
                Educational podcasts for curious minds
              </p>
            </div>

            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="register">Register</TabsTrigger>
              </TabsList>

              {/* Login */}
              <TabsContent value="login">
                <div className="space-y-4 py-4">
                  <div className="space-y-2 text-center">
                    <h3 className="text-2xl font-medium">Welcome back</h3>
                    <p className="text-sm text-muted-foreground">
                      Enter your credentials to access your account
                    </p>
                  </div>

                  <Form {...loginForm}>
                    <form
                      onSubmit={loginForm.handleSubmit(onLoginSubmit)}
                      className="space-y-4"
                    >
                      <FormField
                        control={loginForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="you@example.com"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={loginForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <Input
                                type="password"
                                placeholder="********"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Button
                        type="submit"
                        className="w-full"
                        disabled={loginPending}
                      >
                        {loginPending && (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        Login
                      </Button>
                    </form>
                  </Form>
                </div>
              </TabsContent>

              {/* Register */}
              <TabsContent value="register">
                <div className="space-y-4 py-4">
                  <div className="space-y-2 text-center">
                    <h3 className="text-2xl font-medium">Create an account</h3>
                    <p className="text-sm text-muted-foreground">
                      Enter your information to create an account
                    </p>
                  </div>

                  <Form {...registerForm}>
                    <form
                      onSubmit={registerForm.handleSubmit(onRegisterSubmit)}
                      className="space-y-4"
                    >
                      <FormField
                        control={registerForm.control}
                        name="fullName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Name</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Juan Dela Cruz" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={registerForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input
                                type="email"
                                {...field}
                                placeholder="you@example.com"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={registerForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Username</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="username" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={registerForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <Input
                                type="password"
                                {...field}
                                placeholder="********"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={registerForm.control}
                        name="role"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>I am a...</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select role" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="student">Student</SelectItem>
                                <SelectItem value="professor">Professor</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Button
                        type="submit"
                        className="w-full"
                        disabled={registerPending}
                      >
                        {registerPending && (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        Register
                      </Button>
                    </form>
                  </Form>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Right side - Banner */}
        <div className="hidden md:flex md:w-1/2 bg-primary p-10 text-white flex-col justify-center">
          <div className="max-w-lg mx-auto space-y-8">
            <img
              src={PUPlogo}
              alt="PUP Logo"
              className="mx-auto w-32 h-auto"
            />
            <h1 className="text-4xl font-bold">
              Educational Podcasts Platform
            </h1>
            <p className="text-xl">
              Discover, learn, and engage with educational content from leading
              professors and institutions.
            </p>
            {/* … your feature list … */}
          </div>
        </div>
      </div>
    </div>
  );
}
