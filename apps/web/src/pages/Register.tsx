import { Link } from "react-router-dom";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

export default function Register() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-sm">
        <h1 className="mb-1 text-xl font-bold text-gray-900">Create an account</h1>
        <p className="mb-6 text-sm text-gray-500">
          Start backtesting dip strategies for free.
        </p>
        <form className="flex flex-col gap-4" onSubmit={(e) => e.preventDefault()}>
          <Input label="Full Name" placeholder="Jane Doe" />
          <Input label="Email" type="email" placeholder="you@example.com" />
          <Input label="Password" type="password" />
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
