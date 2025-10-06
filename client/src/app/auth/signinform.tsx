
import { useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner";

interface SignInFormProps {
  onSuccess: () => void;
}

const SignInForm = ({ onSuccess }: SignInFormProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL 
  console.log("Backend URL using : (process.env.NEXT_PUBLIC_BACKEND_URL ):", backendUrl);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await axios.post(`${backendUrl}/user/signin`, {
        email,
        password,
      },{
        withCredentials : true
      });
      
      console.log("Sign in successful:", res.data);

      // Ensure ws_token cookie exists (in case SameSite prevented set)
      if (res.data?.token) {
        const hasWs = typeof document !== 'undefined' && document.cookie.includes('ws_token=');
        if (!hasWs) {
          document.cookie = `ws_token=${res.data.token}; Path=/; SameSite=Lax`;
          console.log('Set ws_token manually from response');
        }
      }
      
      toast.success("Success! You have been signed in successfully.");
      
      onSuccess();
    } catch (error: unknown) {
      console.error("Sign in error:", error);
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Failed to sign in. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSignIn} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Signing in..." : "Sign In"}
      </Button>
    </form>
  );
};

export default SignInForm;
