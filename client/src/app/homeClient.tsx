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
  const BackendURL  = process.env.NEXT_PUBLIC_BackendURL

  useEffect(()=>{
    async function checkIsLoggedIn(){
      try{
        const res = await axios.get(`${BackendURL}/user/auth/status` , {
            withCredentials : true
          }
        )
        console.log("red data : " ,res.data)

        if(res.data.isAuth){
          setIsAuth(true)
          setIsLoading(false)
        }else{
          setIsAuth(false)
          setIsLoading(false)
        }
      } catch (error : unknown) {
        const err = error as { response?: { data?: { message?: string } } };
        console.error(err.response?.data?.message || "error is checking auth")
        setIsAuth(false);
      } finally {
        setIsLoading(false);
      }
    }
    checkIsLoggedIn()
  },[])


  async function logout(){
    try {
      await axios.get(`${BackendURL}/user/logout` ,{
        withCredentials : true
      })
    }catch(error : unknown){
      console.error("Sign in error:", error);
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Failed to sign in. Please try again.");
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
            <button onClick={()=>logout()} className='text-gray-600 border-black shadown-lg hover:cursor-pointer hover:text-gray-900'>
              logout
              </button>
          ) : (
            <button onClick={()=>{router.push('/auth')}} className='text-gray-600 border-2 p-2 rounded-md shadown-sm hover:cursor-pointer hover:text-gray-900'>
              signin
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