import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { login, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    console.log('Login page - Auth state:', { isAuthenticated, isLoading });
    if (!isLoading && isAuthenticated) {
      console.log('Redirecting to /dashboard from /login');
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      await login(email, password);
      console.log('Login successful, redirecting to /dashboard');
      navigate('/dashboard', { replace: true });
    } catch (err: any) {
      console.error('Login error:', err.response?.data || err.message);
      setError(err.response?.data?.message || 'Invalid credentials. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    console.log('Login page - Showing loading spinner');
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark px-4 sm:px-6 lg:px-8 font-josefin">
      <div className="w-full max-w-md space-y-8 bg-dark.light p-6 sm:p-8 rounded-xl shadow-2xl border-gray-600 border">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white tracking-tight">Finance Tracker</h1>
          <h2 className="mt-2 text-lg font-medium text-gray-300">Sign in to your account</h2>
        </div>

        {error && (
          <div
            className="bg-red-500/20 text-red-100 p-4 rounded-md text-sm"
            role="alert"
            aria-live="assertive"
          >
            {error}
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-700 rounded-md bg-dark text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                placeholder="Email address"
              />
            </div>

            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-700 rounded-md bg-dark text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                placeholder="Password"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-2.5 px-4 rounded-md text-sm font-medium text-white bg-primary hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors ${
                isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {isSubmitting ? 'Signing in...' : 'Sign in'}
            </button>
          </div>

          <div className="text-center text-sm">
            <span className="text-gray-400">Don't have an account? </span>
            <Link to="/signup" className="font-medium text-primary hover:text-blue-400 transition-colors">
              Sign up
            </Link>
          </div>
        </form>

        <div className="mt-6 text-center text-sm text-gray-400">
          <p>For demo purposes, you can use any email and password.</p>
        </div>
      </div>
    </div>
  );
};

export default Login;