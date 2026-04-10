import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/PasswordInput";
import { LogIn, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login, isLoginLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (await login(email, password)) {
      toast({ title: "Welcome back!", description: "You have been logged in." });
      navigate("/", { replace: true });
    } else {
      toast({ title: "Login failed", description: "Invalid email or password.", variant: "destructive" });
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-[url('/cover.jpg')] bg-cover bg-center" />
      <div className="absolute inset-0 bg-background/55" />
      <Card className="relative z-10 w-full max-w-md bg-card/95 shadow-xl">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-2">
            <img src="/findit.png" alt="FindIt logo" className="h-24 w-auto object-contain" />
          </div>
          <CardTitle className="text-2xl">Sign In</CardTitle>
          <CardDescription>Sign in to your FindIt account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="you@school.edu" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <PasswordInput id="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
            </div>
            <Button type="submit" className="w-full" disabled={isLoginLoading}>
              {isLoginLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Signing In...
                </>
              ) : (
                <>
                  <LogIn className="h-4 w-4 mr-2" /> Sign In
                </>
              )}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm space-y-1">
            <Link to="/forgot-password" className="text-primary hover:underline block">Forgot password?</Link>
            <p className="text-muted-foreground">
              Don't have an account?{" "}
              <Link to="/register" className="text-primary hover:underline">Register</Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
