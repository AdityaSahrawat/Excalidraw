"use client"

import { useEffect, useState } from 'react';
import Hero from './hero';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { signOut } from 'next-auth/react';
import { toast } from 'sonner';
const Index = () => {
  const [isAuth, setIsAuth] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter()
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  const buildUrl = (base: string, path: string) => {
    const b = base.replace(/\/$/, '');
    const p = path.replace(/^\//, '');
    return `${b}/${p}`;
  };
  
  // Helpful debug once; keep quiet in normal runs
  if (process.env.NODE_ENV !== 'production') {
    console.log('Backend URL:', backendUrl);
  }

  useEffect(() => {
    let cancelled = false;

    async function checkIsLoggedIn() {
      if (!backendUrl) {
        // No backend configured – treat as signed out but don't spam toasts repeatedly
        if (!cancelled) {
          setIsAuth(false);
          setIsLoading(false);
          toast.error('Backend URL is not configured. Set NEXT_PUBLIC_BACKEND_URL.');
        }
        return;
      }

      try {
        const url = buildUrl(backendUrl, 'user/auth/status');
        const res = await axios.get(url, { withCredentials: true });

        if (!cancelled) {
          setIsAuth(Boolean(res.data?.isAuth));
        }
      } catch (error: unknown) {
        const err = error as { response?: { data?: { message?: string } } };
        console.error(err.response?.data?.message || 'Error checking auth');
        if (!cancelled) setIsAuth(false);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    checkIsLoggedIn();
    return () => {
      cancelled = true;
    };
  }, [backendUrl])


  async function logout(){
    try {
      if (backendUrl) {
  const url = buildUrl(backendUrl, 'user/logout');
  await axios.get(url, { withCredentials: true });
      }
    }catch(error : unknown){
      console.error("Logout error:", error);
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Failed to log out. Please try again.");
    }
    
    await signOut({ callbackUrl: "/" });
  }
  

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex flex-col">
      {/* Header */}
      <header className="w-full px-6 py-4">
        <nav className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg"></div>
            <span className="text-xl font-bold text-gray-800">Whiteboard</span>
          </div>

          {isAuth ? (
            <button onClick={()=>logout()} className='text-gray-600 border-black shadow-lg hover:cursor-pointer hover:text-gray-900'>
              Log out
            </button>
          ) : (
            <button onClick={()=>{router.push('/auth')}} className='text-gray-600 border-2 p-2 rounded-md shadow-sm hover:cursor-pointer hover:text-gray-900'>
              Sign in
            </button>
          )
        }
            
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-6 py-12">
        <div className="max-w-7xl mx-auto">
          <Hero />
          
          {isAuth && (
            <div className="mt-16 text-center">
              <div className="inline-flex items-center gap-2 px-6 py-3 bg-green-100 text-green-800 rounded-full border border-green-200">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="font-medium">Welcome back! You&apos;re authenticated and ready to create.</span>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-8">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-6 mb-4 md:mb-0">
              <a href="#" className="hover:text-white transition-colors">GitHub</a>
              <a href="#" className="hover:text-white transition-colors">Privacy</a>
              <a href="#" className="hover:text-white transition-colors">Terms</a>
              <a href="#" className="hover:text-white transition-colors">About</a>
            </div>
            <p className="text-sm">
              © 2025 WhiteBoard Clone
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;