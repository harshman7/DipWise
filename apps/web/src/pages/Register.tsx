import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { registerRequest } from "@/lib/api";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

const schema = z.object({
  full_name: z.string().optional(),
  email: z.string().email(),
  password: z.string().min(8, "At least 8 characters"),
});

type FormValues = z.infer<typeof schema>;

export default function Register() {
  const navigate = useNavigate();
  const { token, setSession, refreshUser } = useAuth();
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (token) navigate("/", { replace: true });
  }, [token, navigate]);

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (values: FormValues) => {
    setFormError(null);
    try {
      const res = await registerRequest({
        email: values.email,
        password: values.password,
        full_name: values.full_name || null,
      });
      setSession(res.access_token, null);
      await refreshUser();
      navigate("/", { replace: true });
    } catch (e) {
      setFormError(e instanceof Error ? e.message : "Registration failed");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-sm">
        <h1 className="mb-1 text-xl font-bold text-gray-900">Create an account</h1>
        <p className="mb-6 text-sm text-gray-500">
          Start backtesting dip strategies for free.
        </p>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
          <Input
            label="Full Name"
            placeholder="Jane Doe"
            {...register("full_name")}
            error={errors.full_name?.message}
          />
          <Input
            label="Email"
            type="email"
            placeholder="you@example.com"
            {...register("email")}
            error={errors.email?.message}
          />
          <Input
            label="Password"
            type="password"
            {...register("password")}
            error={errors.password?.message}
          />
          {formError && (
            <p className="text-sm text-red-600">{formError}</p>
          )}
          <Button type="submit" className="mt-2">
            Create account
          </Button>
        </form>
        <p className="mt-4 text-center text-xs text-gray-500">
          Already have an account?{" "}
          <Link to="/login" className="text-brand-600 hover:underline">
            Sign in
          </Link>
        </p>
        <p className="mt-3 text-center text-[10px] text-gray-400">
          DipWise is for educational purposes only. Not financial advice.
        </p>
      </Card>
    </div>
  );
}
