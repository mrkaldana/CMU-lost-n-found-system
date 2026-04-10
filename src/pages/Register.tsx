import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/PasswordInput";
import { UserPlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const { register, requestRegistrationOtp } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const cmuEmailPattern = /^2022\d{5}@cityofmalabonuniversity\.edu\.ph$/i;

  const handleRequestOtp = async () => {
    const normalizedEmail = email.trim().toLowerCase();
    if (!cmuEmailPattern.test(normalizedEmail)) {
      toast({
        title: "Invalid CMU email",
        description: "Use format: 2022xxxxx@cityofmalabonuniversity.edu.ph",
        variant: "destructive"
      });
      return;
    }
    const ok = await requestRegistrationOtp(normalizedEmail);
    if (ok) {
      setOtpSent(true);
      toast({ title: "OTP sent", description: "Check your email for the 6-digit OTP." });
    } else {
      toast({ title: "Failed to send OTP", description: "Please try again in a moment.", variant: "destructive" });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const normalizedEmail = email.trim().toLowerCase();
    if (!cmuEmailPattern.test(normalizedEmail)) {
      toast({
        title: "Invalid CMU email",
        description: "Use format: 2022xxxxx@cityofmalabonuniversity.edu.ph",
        variant: "destructive"
      });
      return;
    }
    if (otp.length !== 6) {
      toast({ title: "Invalid OTP", description: "Enter the 6-digit OTP sent to your email.", variant: "destructive" });
      return;
    }
    if (password !== confirm) {
      toast({ title: "Error", description: "Passwords do not match.", variant: "destructive" });
      return;
    }
    if (password.length < 6) {
      toast({ title: "Error", description: "Password must be at least 6 characters.", variant: "destructive" });
      return;
    }
    if (await register(name, normalizedEmail, password, otp)) {
      toast({ title: "Account created!", description: "Welcome to FindIt." });
      navigate("/");
    } else {
      toast({ title: "Registration failed", description: "Invalid OTP, email already used, or request expired.", variant: "destructive" });
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
          <CardTitle className="text-2xl">Create Account</CardTitle>
          <CardDescription>Register to report and track lost items</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" placeholder="Juan Dela Cruz" value={name} onChange={e => setName(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="2022xxxxx@cityofmalabonuniversity.edu.ph"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
              <p className="text-xs text-muted-foreground">Email must use CMU domain.</p>
              <Button type="button" variant="outline" className="w-full" onClick={handleRequestOtp}>
                {otpSent ? "Resend OTP" : "Send OTP"}
              </Button>
            </div>
            <div className="space-y-2">
              <Label htmlFor="otp">OTP</Label>
              <Input
                id="otp"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                placeholder="Enter 6-digit OTP"
                value={otp}
                onChange={e => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <PasswordInput id="password" placeholder="Min. 6 characters" value={password} onChange={e => setPassword(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm">Confirm Password</Label>
              <PasswordInput id="confirm" placeholder="••••••••" value={confirm} onChange={e => setConfirm(e.target.value)} required />
            </div>
            <Button type="submit" className="w-full">
              <UserPlus className="h-4 w-4 mr-2" /> Register
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="text-primary hover:underline">Sign in</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Register;
