import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import SignupForm from '../components/auth/SignupForm';
import { supabase } from '../lib/supabaseClient';

const SignupPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSignup = async (data: { name: string; email: string; password: string }) => {
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            name: data.name,
          }
        }
      });

      if (signUpError) throw signUpError;

      if (signUpData.user && signUpData.user.identities?.length === 0) {
        setMessage('Signup successful! Please check your email to confirm your account. You cannot log in until confirmed.');
      } else if (signUpData.user) {
        setMessage('Signup successful! You can now log in.');
      } else {
        setMessage('Signup attempt submitted. Check email if confirmation is needed.');
      }

    } catch (err: any) {
      console.error('Signup error:', err);
      setError(err.error_description || err.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
              Sign in
            </Link>
          </p>
        </div>
        <SignupForm onSubmit={handleSignup} loading={loading} error={error} />
        {message && <p className="mt-4 text-center text-sm text-green-600">{message}</p>}
      </div>
    </div>
  );
};

export default SignupPage; 