import { HardHat } from "lucide-react";
import { loginAction } from "./actions";
import { Input, Label } from "@/components/ui/Field";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { Alert } from "@/components/ui/Alert";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>;
}) {
  const { error, next } = await searchParams;

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-2 text-center">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-brand text-brand-foreground">
            <HardHat className="h-6 w-6" />
          </div>
          <h1 className="text-lg font-semibold text-foreground">BuildRight</h1>
          <p className="text-sm text-muted">
            Construction business management
          </p>
        </div>

        <div className="rounded-xl border border-border bg-surface p-6 shadow-sm">
          {error && (
            <Alert tone="danger" className="mb-4">
              {error}
            </Alert>
          )}
          <form action={loginAction} className="space-y-4">
            <input type="hidden" name="next" value={next ?? "/dashboard"} />
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="you@company.com"
                required
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                required
              />
            </div>
            <SubmitButton pendingLabel="Signing in…" className="w-full">
              Sign in
            </SubmitButton>
          </form>
        </div>

        <div className="mt-5 rounded-lg border border-dashed border-border bg-surface/60 p-4 text-xs text-muted">
          <p className="mb-1.5 font-medium text-foreground">Demo accounts</p>
          <p>Password for all: <code className="text-foreground">password123</code></p>
          <ul className="mt-1.5 space-y-0.5">
            <li>admin@buildright.test — Admin</li>
            <li>manager@buildright.test — Manager</li>
            <li>accountant@buildright.test — Accountant</li>
            <li>worker1@buildright.test — Employee</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
