"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSession } from "next-auth/react";
import axios from "axios";

export default function PostAuthPage() {
  const router = useRouter();
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Completing login...");

  useEffect(() => {
    const handleOAuth = async () => {
      try {
        setStatus("loading");
        setMessage("Getting session...");
        
        const session = await getSession();
        console.log("🔐 Session:", session);
        console.log("🌐 Backend URL:", backendUrl);

        if (session?.user?.email) {
          setMessage("Creating user account...");
          
          const response = await axios.post(`${backendUrl}/user/oauth`, {
            email: session.user.email,
            username: session.user.name,
          }, {
            withCredentials: true,
          });
          
          console.log("✅ OAuth response:", response.data);
          
          // Verify token was set in cookies
          const cookies = document.cookie;
          console.log("🍪 Cookies after OAuth:", cookies);
          
          if (cookies.includes('token=')) {
            // Ensure ws_token exists for WS connection fallback
            if (!cookies.includes('ws_token=') && response.data?.token) {
              document.cookie = `ws_token=${response.data.token}; Path=/; SameSite=Lax`;
              console.log('Set ws_token manually from oauth response');
            }
            console.log("✅ JWT token successfully set in cookies");
            setStatus("success");
            setMessage("Login successful! Redirecting...");
            
            // Small delay to show success message
            setTimeout(() => {
              router.replace("/rooms");
            }, 1000);
          } else {
            console.warn("⚠️ Token not found in cookies, but OAuth succeeded");
            setStatus("success");
            router.replace("/rooms");
          }
        } else {
          console.log("❌ No session found, redirecting to auth");
          setStatus("error");
          setMessage("Authentication failed. Redirecting...");
          setTimeout(() => {
            router.replace("/auth");
          }, 2000);
        }
      } catch (error) {
        console.error("❌ OAuth error:", error);
        setStatus("error");
        setMessage("Login failed. Redirecting...");
        setTimeout(() => {
          router.replace("/auth");
        }, 2000);
      }
    };

    handleOAuth();
  }, [router, backendUrl]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
        <p className={`text-lg ${status === "error" ? "text-red-600" : status === "success" ? "text-green-600" : "text-gray-600"}`}>
          {message}
        </p>
      </div>
    </div>
  );
}
