import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { usePageTitle } from "@/hooks/usePageTitle";

export const RegisterPage = () => {
  usePageTitle("Register");
  const [loading, setLoading] = useState(false);

  const handleGoogleSignup = () => {
    setLoading(true);
    const rawApiUrl = import.meta.env.VITE_API_BASE_URL;
    const backendUrl = rawApiUrl || "http://localhost:8080";
    window.location.href = `${backendUrl}/oauth2/authorization/google`;
  };

  return (
    <div className="mx-auto flex w-full max-w-lg flex-1 items-center">
      <Card className="w-full shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Create your account</CardTitle>
          <p className="text-sm text-muted-foreground text-center">
            Join using your Google account to unlock curated menus and priority deliveries.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            type="button"
            className="w-full h-12 flex items-center justify-center gap-2 btn-brand-gradient text-white font-semibold text-base shadow-lg shadow-brand-500/20 rounded-xl border-0 transition-all hover:scale-[1.02]"
            onClick={handleGoogleSignup}
            disabled={loading}
          >
            <svg className="h-5 w-5 bg-white p-0.5 rounded-full" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            {loading ? "Redirecting..." : "Sign up with Google"}
          </Button>
          <div className="text-center text-sm mt-4">
            <Link to="/login" className="text-brand-600 font-semibold hover:underline">
              Already have an account? Sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
