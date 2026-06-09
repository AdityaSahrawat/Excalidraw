"use client"
import {SessionProvider, useSession} from "next-auth/react"
import { useEffect, useRef } from 'react'
import axios from 'axios'

function OAuthEnsure() {
  const { data: session, status } = useSession();
  const attemptedRef = useRef(false);
  useEffect(() => {
    if (attemptedRef.current) return;
    if (status !== 'authenticated') return;

    if (typeof document !== 'undefined') {
      const hasWsToken = document.cookie.split(';').some(c => c.trim().startsWith('ws_token='));
      if (hasWsToken) return;
    }

    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    if (!backendUrl) return;

    const email = typeof session?.user?.email === 'string' ? session.user.email : undefined;
    if (!email) return;

    attemptedRef.current = true;
    const usernameGuess = email.split('@')[0] || 'user';
    axios.post(`${backendUrl}/user/oauth`, { email, username: usernameGuess }, { withCredentials: true })
      .then(res => {
        console.log('[OAuthEnsure] Initialized backend OAuth user + cookies');
       
        const respToken: string | undefined = res.data?.token;
        if (respToken && typeof document !== 'undefined') {
          const hasWsToken = document.cookie.split(';').some(c => c.trim().startsWith('ws_token='));
          if (!hasWsToken) {
            document.cookie = `ws_token=${respToken}; Path=/; SameSite=${process.env.NODE_ENV === 'production' ? 'None' : 'Lax'}; ${process.env.NODE_ENV === 'production' ? 'Secure;' : ''}`;
          }
        }
      })
      .catch(err => {
        console.warn('[OAuthEnsure] Failed to initialize backend OAuth user', err?.response?.data || err?.message);
        attemptedRef.current = false;
      });
  }, [status, session]);
  return null;
}

export function Providers({children} : {children : React.ReactNode}){
    return <SessionProvider>
      <OAuthEnsure />
      {children}
    </SessionProvider>
}