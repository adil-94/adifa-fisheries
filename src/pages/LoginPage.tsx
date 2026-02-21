import { useState } from 'react';
import { signInWithEmail } from '../lib/supabase';
import toast from 'react-hot-toast';
import { PARTNERS } from '../types';

export function LoginPage() {
  const [loadingUser, setLoadingUser] = useState<string | null>(null);
  const [emailSent, setEmailSent] = useState<string | null>(null);

  const handleMagicLink = async (email: string, name: string) => {
    setLoadingUser(name);
    try {
      // Use our custom sign-in function that handles GitHub Pages redirects
      const { error } = await signInWithEmail(email);

      if (error) throw error;

      setEmailSent(email);
      toast.success(`Magic link sent to ${email}! Check your inbox.`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to send magic link';
      toast.error(message);
    } finally {
      setLoadingUser(null);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 overflow-hidden relative">
      {/* Light gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50">
        {/* Floating orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-200/40 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-200/40 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-200/30 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Main card */}
      <div className="relative z-10 w-full max-w-lg">
        <div className="bg-white border border-slate-200 rounded-3xl shadow-xl p-8 md:p-10">
          {/* Logo and title */}
          <div className="text-center mb-10">
            <div className="relative inline-block mb-6">
              <div className="text-6xl md:text-7xl animate-bounce">🐟</div>
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-16 h-4 bg-cyan-400/30 blur-xl rounded-full"></div>
            </div>
            <h1 className="text-3xl md:text-5xl font-black bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 bg-clip-text text-transparent mb-3">
              Adifa Fisheries
            </h1>
            <p className="text-slate-500 text-lg font-light tracking-wide">
              Expense Tracking System
            </p>
          </div>

          {emailSent ? (
            /* Email sent confirmation */
            <div className="text-center py-8">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-lg shadow-green-500/30">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-slate-800 mb-3">Check Your Email</h2>
              <p className="text-slate-500 mb-6">
                We sent a magic link to<br />
                <span className="text-cyan-600 font-semibold">{emailSent}</span>
              </p>
              <button
                onClick={() => setEmailSent(null)}
                className="text-slate-400 hover:text-slate-600 transition-colors underline underline-offset-4"
              >
                Use a different account
              </button>
            </div>
          ) : (
            /* User selection cards */
            <>
              <p className="text-center text-slate-500 mb-6 text-sm uppercase tracking-widest font-medium">
                Select your account
              </p>
              
              <div className="space-y-4">
                {/* Adil Card */}
                <button
                  onClick={() => handleMagicLink(PARTNERS.ADIL.email, PARTNERS.ADIL.name)}
                  disabled={loadingUser !== null}
                  className="group w-full p-4 md:p-5 rounded-2xl bg-gradient-to-r from-cyan-50 to-blue-50 border border-cyan-200 hover:border-cyan-400 hover:from-cyan-100 hover:to-blue-100 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-cyan-500/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center text-xl md:text-2xl font-bold text-white shadow-lg shadow-cyan-500/30 group-hover:shadow-cyan-500/40 transition-shadow">
                      A
                    </div>
                    <div className="flex-1 text-left">
                      <h3 className="text-lg md:text-xl font-bold text-slate-800 group-hover:text-cyan-600 transition-colors">
                        Adil
                      </h3>
                      <p className="text-slate-500 text-sm">{PARTNERS.ADIL.email}</p>
                    </div>
                    {loadingUser === 'Adil' ? (
                      <span className="loading loading-spinner loading-md text-cyan-500"></span>
                    ) : (
                      <svg className="w-6 h-6 text-slate-300 group-hover:text-cyan-500 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    )}
                  </div>
                </button>

                {/* Aejaz Card */}
                <button
                  onClick={() => handleMagicLink(PARTNERS.AEJAZ.email, PARTNERS.AEJAZ.name)}
                  disabled={loadingUser !== null}
                  className="group w-full p-4 md:p-5 rounded-2xl bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 hover:border-purple-400 hover:from-purple-100 hover:to-pink-100 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-purple-500/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-xl md:text-2xl font-bold text-white shadow-lg shadow-purple-500/30 group-hover:shadow-pink-500/40 transition-shadow">
                      A
                    </div>
                    <div className="flex-1 text-left">
                      <h3 className="text-lg md:text-xl font-bold text-slate-800 group-hover:text-purple-600 transition-colors">
                        Aejaz
                      </h3>
                      <p className="text-slate-500 text-sm">{PARTNERS.AEJAZ.email}</p>
                    </div>
                    {loadingUser === 'Aejaz' ? (
                      <span className="loading loading-spinner loading-md text-purple-500"></span>
                    ) : (
                      <svg className="w-6 h-6 text-slate-300 group-hover:text-purple-500 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    )}
                  </div>
                </button>
              </div>

              <p className="text-center text-slate-400 text-xs mt-8">
                Click your name to receive a secure login link via email
              </p>
            </>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-slate-400 text-xs mt-6">
          Secured by Supabase Authentication
        </p>
      </div>
    </div>
  );
}
