import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react';
import { login } from '../services/api';
import { useAuthStore } from '../store/authStore';

const schema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

type FormData = z.infer<typeof schema>;

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login: storeLogin } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const from = (location.state as any)?.from?.pathname || '/trips';

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    setError('');
    try {
      const token = await login(data.email, data.password);
      if (token.user) {
        storeLogin(token.access_token, token.user);
      } else {
        // Fetch user if not in response
        const { getMe } = await import('../services/api');
        const tempToken = token.access_token;
        localStorage.setItem('auth_token', tempToken);
        const user = await getMe();
        storeLogin(tempToken, user);
      }
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Login failed. Check your credentials.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 pt-16"
      style={{ background: '#111111' }}
    >
      {/* Background orbs */}
      <div className="fixed top-1/3 left-1/4 w-64 h-64 rounded-full opacity-10 pointer-events-none"
        style={{ background: 'radial-gradient(circle, #c8956c, transparent)' }} />
      <div className="fixed bottom-1/3 right-1/4 w-64 h-64 rounded-full opacity-5 pointer-events-none"
        style={{ background: 'radial-gradient(circle, #7daea8, transparent)' }} />

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="glass-card p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="text-4xl mb-3">🧭</div>
            <h1 className="text-2xl font-bold text-white mb-1">Welcome back</h1>
            <p className="text-slate-400 text-sm">Sign in to continue planning your adventures</p>
          </div>

          {/* Error message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 p-3 rounded-xl mb-6 text-sm"
              style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5' }}
            >
              <AlertCircle size={16} />
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
              <input
                {...register('email')}
                type="email"
                className="input-dark"
                placeholder="you@example.com"
                autoComplete="email"
              />
              {errors.email && (
                <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Password</label>
              <div className="relative">
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  className="input-dark pr-12"
                  placeholder="Enter your password"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>
              )}
            </div>

            {/* Submit */}
            <motion.button
              type="submit"
              disabled={isLoading}
              whileHover={{ scale: isLoading ? 1 : 1.02 }}
              whileTap={{ scale: isLoading ? 1 : 0.98 }}
              className="btn-primary w-full flex items-center justify-center gap-2 mt-2"
            >
              {isLoading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </motion.button>
          </form>

          {/* Register link */}
          <p className="text-center text-slate-400 text-sm mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-brand-blue hover:text-brand-orange font-medium transition-colors">
              Create one free
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
