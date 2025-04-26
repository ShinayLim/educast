import { useForm } from "react-hook-form";
import { useAuth, loginSchema, registerSchema, loginResolver, registerResolver } from "@/hooks/use-auth";
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
import { useEffect } from "react";
import { Headphones } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";

export default function AuthPage() {
  const { user, loginMutation, registerMutation } = useAuth();
  const [, navigate] = useLocation();

  // Login form
  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: loginResolver,
    defaultValues: {
      username: "",
      password: "",
    },
  });

  // Register form
  const registerForm = useForm<z.infer<typeof registerSchema>>({
    resolver: registerResolver,
    defaultValues: {
      username: "",
      password: "",
      email: "",
      fullName: "",
      role: "student",
    },
  });

  // Handle login form submission
  const onLoginSubmit = (values: z.infer<typeof loginSchema>) => {
    loginMutation.mutate(values);
  };

  // Handle register form submission
  const onRegisterSubmit = (values: z.infer<typeof registerSchema>) => {
    registerMutation.mutate(values);
  };

  // Redirect if user is already logged in
  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  return (
    <div className="flex min-h-screen bg-background">
      <div className="flex flex-col md:flex-row w-full">
        {/* Left side - Forms */}
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

              {/* Login Form */}
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
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Username</FormLabel>
                            <FormControl>
                              <Input placeholder="username" {...field} />
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
                        disabled={loginMutation.isPending}
                      >
                        {loginMutation.isPending ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : null}
                        Login
                      </Button>
                    </form>
                  </Form>
                </div>
              </TabsContent>

              {/* Register Form */}
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
                              <Input placeholder="John Doe" {...field} />
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
                                placeholder="example@email.com"
                                {...field}
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
                              <Input placeholder="username" {...field} />
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
                                placeholder="********"
                                {...field}
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
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a role" />
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
                        disabled={registerMutation.isPending}
                      >
                        {registerMutation.isPending ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : null}
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
            <h1 className="text-4xl font-bold">Educational Podcasts Platform</h1>
            <p className="text-xl">
              Discover, learn, and engage with educational content from leading professors and institutions.
            </p>
            <div className="space-y-4">
              <div className="flex items-start space-x-4">
                <div className="bg-white/10 p-2 rounded">
                  <Headphones className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold">Access Quality Content</h3>
                  <p className="text-primary-foreground/80">
                    Curated educational podcasts from experts in various fields.
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="bg-white/10 p-2 rounded">
                  <Headphones className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold">Learn Anytime, Anywhere</h3>
                  <p className="text-primary-foreground/80">
                    Download content for offline listening and learning on the go.
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="bg-white/10 p-2 rounded">
                  <Headphones className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold">Engage and Collaborate</h3>
                  <p className="text-primary-foreground/80">
                    Comment, like, and share content with fellow learners.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
