import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/PasswordInput";
import { Package } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [sent, setSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const { requestPasswordResetOtp, verifyPasswordResetOtp, resetPasswordWithOtp } = useAuth();
  const { toast } = useToast();

  const handleOtpChange = (value: string) => {
    const digitsOnly = value.replace(/\D/g, "").slice(0, 6);
    setOtp(digitsOnly);
  };

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await requestPasswordResetOtp(email);
    if (ok) {
      setSent(true);
      toast({ title: "OTP sent", description: "Check your email for the one-time password." });
    } else {
      toast({ title: "Request failed", description: "Unable to send OTP right now.", variant: "destructive" });
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await verifyPasswordResetOtp(email, otp);
    if (ok) {
      setOtpVerified(true);
      toast({ title: "OTP verified", description: "You can now set your new password." });
      return;
    }
    toast({ title: "Invalid OTP", description: "Please check the OTP or request a new one.", variant: "destructive" });
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      toast({ title: "Weak password", description: "Password must be at least 6 characters.", variant: "destructive" });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({ title: "Passwords do not match", description: "Please re-enter your new password.", variant: "destructive" });
      return;
    }

    const ok = await resetPasswordWithOtp(email, otp, newPassword);
    if (ok) {
      toast({ title: "Password updated", description: "You can now sign in with your new password." });
      setEmail("");
      setOtp("");
      setNewPassword("");
      setConfirmPassword("");
      setSent(false);
      setOtpVerified(false);
      return;
    }

    toast({ title: "Reset failed", description: "Invalid OTP, expired OTP, or email.", variant: "destructive" });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-2">
            <Package className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Forgot Password</CardTitle>
          <CardDescription>Send OTP to your registered email to reset your password</CardDescription>
        </CardHeader>
        <CardContent>
          {sent && (
            <div className="mb-4 flex items-center justify-center gap-3 text-xs font-medium text-muted-foreground">
              <div className="flex items-center gap-2">
                <span className={`h-2 w-2 rounded-full ${!otpVerified ? "bg-primary" : "bg-muted-foreground/40"}`} />
                <span className={`${!otpVerified ? "text-foreground" : ""}`}>Verify OTP</span>
              </div>
              <span className="text-muted-foreground/60">-</span>
              <div className="flex items-center gap-2">
                <span className={`h-2 w-2 rounded-full ${otpVerified ? "bg-primary" : "bg-muted-foreground/40"}`} />
                <span className={`${otpVerified ? "text-foreground" : ""}`}>Set New Password</span>
              </div>
            </div>
          )}
          {sent ? (
            <div className="space-y-4">
              <div className="rounded-md border bg-muted/70 p-3 text-sm text-muted-foreground">
                OTP has been sent to <strong>{email}</strong>. It expires in 10 minutes.
              </div>
              {!otpVerified ? (
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="otp">OTP</Label>
                    <Input
                      id="otp"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      maxLength={6}
                      placeholder="Enter 6-digit OTP"
                      value={otp}
                      onChange={e => handleOtpChange(e.target.value)}
                      className="text-center text-lg tracking-[0.35em] font-semibold"
                      required
                    />
                    <p className="text-xs text-muted-foreground">Tip: paste the code from your email.</p>
                  </div>
                  <Button type="submit" className="w-full" disabled={otp.length !== 6}>Verify OTP</Button>
                </form>
              ) : (
                <form onSubmit={handleResetPassword} className="space-y-4">
                  <div className="rounded-md border border-green-500/30 bg-green-500/10 p-3 text-sm">
                    OTP verified. Please enter your new password.
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-password">New Password</Label>
                    <PasswordInput id="new-password" placeholder="At least 6 characters" value={newPassword} onChange={e => setNewPassword(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm Password</Label>
                    <PasswordInput id="confirm-password" placeholder="Re-enter new password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required />
                  </div>
                  <Button type="submit" className="w-full">Reset Password</Button>
                </form>
              )}
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => {
                  setSent(false);
                  setOtpVerified(false);
                  setOtp("");
                  setNewPassword("");
                  setConfirmPassword("");
                }}
              >
                Change Email
              </Button>
            </div>
          ) : (
            <form onSubmit={handleRequestOtp} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="you@school.edu" value={email} onChange={e => setEmail(e.target.value)} required />
              </div>
              <Button type="submit" className="w-full">Send OTP</Button>
            </form>
          )}
          {!sent && (
            <p className="mt-4 text-center text-sm text-muted-foreground">
              Remember your password?{" "}
              <Link to="/login" className="text-primary hover:underline">Sign in</Link>
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ForgotPassword;
