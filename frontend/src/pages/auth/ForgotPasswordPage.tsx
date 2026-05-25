import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { forgotPassword } from "@/apis";
import { useToast } from "@/hooks/use-toast";
import { usePageTitle } from "@/hooks/usePageTitle";

export const ForgotPasswordPage = () => {
  usePageTitle("Forgot Password");
  const { toast } = useToast();
  const [email, setEmail] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      await forgotPassword(email);
      toast({
        title: "Reset link sent",
        description: "Check your inbox for password reset instructions.",
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Request failed";
      toast({ title: "Request failed", description: message, variant: "destructive" });
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-lg flex-1 items-center">
      <Card className="w-full shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl">Reset password</CardTitle>
          <p className="text-sm text-muted-foreground">
            We will send a reset link to your email.
          </p>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <Input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(event: ChangeEvent<HTMLInputElement>) =>
                setEmail(event.target.value)
              }
            />
            <Button type="submit" className="w-full">
              Send reset link
            </Button>
            <div className="text-center text-sm">
              <Link to="/login" className="text-muted-foreground">
                Back to sign in
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
