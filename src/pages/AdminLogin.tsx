import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/PasswordInput";
import { ShieldCheck, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const AdminLogin = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { adminLogin, isLoginLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (await adminLogin(username, password)) {
      toast({ title: "Admin access granted", description: "Welcome, Administrator." });
      navigate("/admin", { replace: true });
    } else {
      toast({ title: "Access denied", description: "Invalid admin credentials.", variant: "destructive" });
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
          <CardTitle className="text-2xl">Admin Login</CardTitle>
          <CardDescription>Authorized personnel only</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input id="username" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} required />
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
                  <ShieldCheck className="h-4 w-4 mr-2" /> Sign In as Admin
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLogin;
