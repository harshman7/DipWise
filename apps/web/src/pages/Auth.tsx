import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/context/AuthContext";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, "Required"),
});

const registerSchema = loginSchema.extend({
  full_name: z.string().optional(),
  password: z.string().min(8, "At least 8 characters"),
});

type Mode = "login" | "register";

export default function Auth() {
  const [mode, setMode] = useState<Mode>("login");
  const [error, setError] = useState<string | null>(null);
  const { login, register: registerUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from =
    (location.state as { from?: { pathname?: string } } | null)?.from
      ?.pathname ?? "/";

  const loginForm = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const registerForm = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: { email: "", password: "", full_name: "" },
  });

  const onLogin = loginForm.handleSubmit(async (values) => {
    setError(null);
    try {
      await login(values.email, values.password);
      navigate(from, { replace: true });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Login failed");
    }
  });

  const onRegister = registerForm.handleSubmit(async (values) => {
    setError(null);
    try {
      await registerUser(
        values.email,
        values.password,
        values.full_name || null,
      );
      navigate(from, { replace: true });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Registration failed");
    }
  });

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4">
      <Link
        to="/"
        className="mb-8 text-lg font-bold text-brand-700"
      >
        DipWise
      </Link>
      <Card className="w-full max-w-md">
        <div className="mb-6 flex gap-2 rounded-lg bg-slate-100 p-1">
          <button
            type="button"
            className={`flex-1 rounded-md py-2 text-sm font-medium ${
              mode === "login"
                ? "bg-white text-brand-700 shadow-sm"
                : "text-slate-600"
            }`}
            onClick={() => {
              setMode("login");
              setError(null);
            }}
          >
            Sign in
          </button>
          <button
            type="button"
            className={`flex-1 rounded-md py-2 text-sm font-medium ${
              mode === "register"
                ? "bg-white text-brand-700 shadow-sm"
                : "text-slate-600"
            }`}
            onClick={() => {
              setMode("register");
              setError(null);
            }}
          >
            Register
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        {mode === "login" ? (
          <form onSubmit={onLogin} className="space-y-4">
            <Input
              label="Email"
              type="email"
              autoComplete="email"
              {...loginForm.register("email")}
              error={loginForm.formState.errors.email?.message}
            />
            <Input
              label="Password"
              type="password"
              autoComplete="current-password"
              {...loginForm.register("password")}
              error={loginForm.formState.errors.password?.message}
            />
            <Button type="submit" className="w-full">
              Sign in
            </Button>
          </form>
        ) : (
          <form onSubmit={onRegister} className="space-y-4">
            <Input
              label="Full name"
              autoComplete="name"
              {...registerForm.register("full_name")}
            />
            <Input
              label="Email"
              type="email"
              autoComplete="email"
              {...registerForm.register("email")}
              error={registerForm.formState.errors.email?.message}
            />
            <Input
              label="Password"
              type="password"
              autoComplete="new-password"
              {...registerForm.register("password")}
              error={registerForm.formState.errors.password?.message}
            />
            <Button type="submit" className="w-full">
              Create account
            </Button>
          </form>
        )}
      </Card>
    </div>
  );
}
