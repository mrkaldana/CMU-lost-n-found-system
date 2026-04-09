import { useState } from "react";
import { Link } from "react-router-dom";
import { Loader2, Save, UserRound } from "lucide-react";

import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/PasswordInput";

const Profile = () => {
  const { user, isProfileUpdating, updateProfile } = useAuth();
  const { toast } = useToast();

  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !email.trim()) {
      toast({ title: "Missing fields", description: "Name and email are required.", variant: "destructive" });
      return;
    }

    const wantsPasswordChange = Boolean(newPassword);
    if (wantsPasswordChange) {
      if (newPassword.length < 6) {
        toast({ title: "Weak password", description: "New password must be at least 6 characters.", variant: "destructive" });
        return;
      }
      if (newPassword !== confirmPassword) {
        toast({ title: "Passwords do not match", description: "Please confirm your new password.", variant: "destructive" });
        return;
      }
      if (!currentPassword) {
        toast({ title: "Current password required", description: "Enter your current password to continue.", variant: "destructive" });
        return;
      }
    }

    const result = await updateProfile({
      name: name.trim(),
      email: email.trim(),
      currentPassword: wantsPasswordChange ? currentPassword : undefined,
      newPassword: wantsPasswordChange ? newPassword : undefined,
    });

    if (!result.ok) {
      toast({ title: "Update failed", description: result.message || "Unable to save your changes.", variant: "destructive" });
      return;
    }

    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    toast({ title: "Profile updated", description: "Your information has been saved." });
  };

  return (
    <div className="container max-w-2xl py-8">
      <Card>
        <CardHeader>
          <div className="mb-2 flex items-center gap-2">
            <UserRound className="h-5 w-5 text-primary" />
            <CardTitle>Account Settings</CardTitle>
          </div>
          <CardDescription>Update your name, email, and password.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="profile-name">Full Name</Label>
              <Input id="profile-name" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="profile-email">Email</Label>
              <Input id="profile-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="rounded-md border bg-muted/40 p-3 text-sm text-muted-foreground">
              Leave password fields empty if you only want to update name or email.
            </div>
            <div className="space-y-2">
              <Label htmlFor="current-password">Current Password</Label>
              <PasswordInput id="current-password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="Required to change password" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <PasswordInput id="new-password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="At least 6 characters" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-new-password">Confirm New Password</Label>
              <PasswordInput id="confirm-new-password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Re-enter new password" />
            </div>
            <div className="flex flex-wrap gap-2">
              <Button type="submit" disabled={isProfileUpdating}>
                {isProfileUpdating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" /> Save Changes
                  </>
                )}
              </Button>
              <Button type="button" variant="outline" asChild>
                <Link to="/">Back to Home</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile;
