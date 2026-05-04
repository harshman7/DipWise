import { Link } from "react-router-dom";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

export default function Login() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-sm">
        <h1 className="mb-1 text-xl font-bold text-gray-900">Sign in to DipWise</h1>
        <p className="mb-6 text-sm text-gray-500">
          Enter your credentials to continue.
        </p>
        <form className="flex flex-col gap-4" onSubmit={(e) => e.preventDefault()}>
          <Input label="Email" type="email" placeholder="you@example.com" />
          <Input label="Password" type="password" />
          <Button type="submit" className="mt-2">
            Sign in
          </Button>
        </form>
        <p className="mt-4 text-center text-xs text-gray-500">
          Don't have an account?{" "}
          <Link to="/register" className="text-brand-600 hover:underline">
            Register
          </Link>
        </p>
      </Card>
    </div>
  );
}
