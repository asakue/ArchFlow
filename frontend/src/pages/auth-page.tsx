
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useAuth } from "@/hooks/use-auth";
import { Redirect } from "wouter";
import { Loader2 } from "lucide-react";

const loginSchema = z.object({
  username: z.string().min(1, {
    message: "Имя пользователя обязательно",
  }),
  password: z.string().min(1, {
    message: "Пароль обязателен",
  }),
});

const registerSchema = z.object({
  username: z.string().min(3, {
    message: "Имя пользователя должно быть не менее 3 символов",
  }),
  password: z.string().min(4, {
    message: "Пароль должен быть не менее 4 символов",
  }),
  fullName: z.string().min(1, {
    message: "ФИО обязательно",
  }),
  avatar: z.string().optional(),
  role: z.string().default("user"),
  organizationId: z.number().optional().nullable(),
});

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const { user, isLoading, loginMutation, registerMutation } = useAuth();

  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      password: "",
      fullName: "",
      avatar: "",
      role: "user",
    },
  });

  function onLoginSubmit(data: LoginFormValues) {
    loginMutation.mutate(data);
  }

  function onRegisterSubmit(data: RegisterFormValues) {
    registerMutation.mutate({
      ...data,
      organizationId: 1, // Используем тестовую организацию
    });
  }

  // Если пользователь уже авторизован, перенаправляем на главную страницу
  if (user) {
    return <Redirect to="/" />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-4">
        <Card className="w-full shadow-lg border-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl text-center">
              <span className="bg-gradient-to-r from-cyan-500 to-blue-600 bg-clip-text text-transparent font-bold">
                ArchFlow
              </span>
            </CardTitle>
            <p className="text-center text-sm text-gray-500 mt-1">
              Система управления архитектурной документацией
            </p>
          </CardHeader>
          <CardContent className="pt-4">
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login">Вход</TabsTrigger>
                <TabsTrigger value="register">Регистрация</TabsTrigger>
              </TabsList>
              <TabsContent value="login">
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
                          <FormLabel>Имя пользователя</FormLabel>
                          <FormControl>
                            <Input placeholder="Введите имя пользователя" {...field} />
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
                          <FormLabel>Пароль</FormLabel>
                          <FormControl>
                            <Input
                              type="password"
                              placeholder="Введите пароль"
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
                      Войти
                    </Button>
                    
                    <div className="text-center text-sm text-gray-500 mt-4">
                      <p>Для тестового входа используйте:</p>
                      <p className="font-medium">Логин: test / Пароль: test</p>
                    </div>
                  </form>
                </Form>
              </TabsContent>
              <TabsContent value="register">
                <Form {...registerForm}>
                  <form
                    onSubmit={registerForm.handleSubmit(onRegisterSubmit)}
                    className="space-y-4"
                  >
                    <FormField
                      control={registerForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Имя пользователя</FormLabel>
                          <FormControl>
                            <Input placeholder="Например: ivanov" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={registerForm.control}
                      name="fullName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>ФИО</FormLabel>
                          <FormControl>
                            <Input placeholder="Например: Иванов Иван Иванович" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={registerForm.control}
                      name="avatar"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Инициалы (для аватара)</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Например: ИИ" 
                              maxLength={2}
                              {...field} 
                            />
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
                          <FormLabel>Пароль</FormLabel>
                          <FormControl>
                            <Input
                              type="password"
                              placeholder="Минимум 4 символа"
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
                      disabled={registerMutation.isPending}
                    >
                      {registerMutation.isPending ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : null}
                      Зарегистрироваться
                    </Button>
                  </form>
                </Form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
