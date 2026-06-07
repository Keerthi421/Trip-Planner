import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { register as apiRegister } from '../services/api';
import { useAuthStore } from '../store/authStore';

const schema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters'),
  username: z.string().min(3, 'Username must be at least 3 characters').regex(/^[a-zA-Z0-9_]+$/, 'Letters, numbers, underscores only'),
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirm_password: z.string(),
}).refine((data) => data.password === data.confirm_password, {
  message: "Passwords don't match",
  path: ['confirm_password'],
});

type FormData = z.infer<typeof schema>;

export default function Register() {
  const navigate = useNavigate();
  const { login: storeLogin } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: 'onChange',
  });

  const password = watch('password', '');
  const passwordStrength = password.length >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password) ? 'strong' : password.length >= 8 ? 'medium' : 'weak';

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    setError('');
    try {
      const token = await apiRegister({
        email: data.email,
        username: data.username,
        password: data.password,
        full_name: data.full_name,
      });
      if (token.user) {
        storeLogin(token.access_token, token.user);
      } else {
        const { getMe } = await import('../services/api');
        localStorage.setItem('auth_token', token.access_token);
        const user = await getMe();
        storeLogin(token.access_token, user);
      }
      navigate('/plan', { replace: true });
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 pt-16 pb-8"
      style={{ background: '#111111' }}
    >
      <div className="fixed top-1/3 right-1/4 w-64 h-64 rounded-full opacity-10 pointer-events-none"
        style={{ background: 'radial-gradient(circle, #7daea8, transparent)' }} />

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="glass-card p-8">
          <div className="text-center mb-8">
            <div className="text-4xl mb-3">✈️</div>
            <h1 className="text-2xl font-bold text-white mb-1">Create your account</h1>
            <p className="text-slate-400 text-sm">Start planning AI-powered trips for free</p>
          </div>

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

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Full Name</label>
              <input
                {...register('full_name')}
                className="input-dark"
                placeholder="Jane Doe"
                autoComplete="name"
              />
              {errors.full_name && <p className="text-red-400 text-xs mt-1">{errors.full_name.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Username</label>
              <input
                {...register('username')}
                className="input-dark"
                placeholder="janedoe"
                autoComplete="username"
              />
              {errors.username && <p className="text-red-400 text-xs mt-1">{errors.username.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
              <input
                {...register('email')}
                type="email"
                className="input-dark"
                placeholder="jane@example.com"
                autoComplete="email"
              />
              {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Password</label>
              <div className="relative">
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  className="input-dark pr-12"
                  placeholder="Min. 8 characters"
                  autoComplete="new-password"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {password && (
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex-1 h-1 rounded-full overflow-hidden bg-slate-700">
                    <div className={`h-full rounded-full transition-all ${
                      passwordStrength === 'strong' ? 'w-full bg-green-400' :
                      passwordStrength === 'medium' ? 'w-2/3 bg-yellow-400' : 'w-1/3 bg-red-400'
                    }`} />
                  </div>
                  <span className={`text-xs ${
                    passwordStrength === 'strong' ? 'text-green-400' :
                    passwordStrength === 'medium' ? 'text-yellow-400' : 'text-red-400'
                  }`}>{passwordStrength}</span>
                </div>
              )}
              {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Confirm Password</label>
              <div className="relative">
                <input
                  {...register('confirm_password')}
                  type={showConfirm ? 'text' : 'password'}
                  className="input-dark pr-12"
                  placeholder="Repeat your password"
                  autoComplete="new-password"
                />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors">
                  {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.confirm_password && <p className="text-red-400 text-xs mt-1">{errors.confirm_password.message}</p>}
            </div>

            <motion.button
              type="submit"
              disabled={isLoading}
              whileHover={{ scale: isLoading ? 1 : 1.02 }}
              whileTap={{ scale: isLoading ? 1 : 0.98 }}
              className="btn-primary w-full flex items-center justify-center gap-2 mt-2"
            >
              {isLoading ? (
                <><Loader2 size={18} className="animate-spin" />Creating account...</>
              ) : (
                <><CheckCircle2 size={18} />Create Account</>
              )}
            </motion.button>
          </form>

          <p className="text-center text-slate-400 text-sm mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-brand-blue hover:text-brand-orange font-medium transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
