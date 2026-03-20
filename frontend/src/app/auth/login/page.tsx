'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Shield, AlertTriangle } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { cn } from '@/lib/utils';

const schema = z.object({
  email:    z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});
type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const router          = useRouter();
  const { login }       = useAuthStore();
  const [showPw, setShowPw] = useState(false);
  const [error,  setError]  = useState('');

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setError('');
    try {
      await login(data.email, data.password);
      router.push('/dashboard');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })
        ?.response?.data?.message;
      setError(msg || 'Invalid email or password');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="w-full max-w-md"
    >
      {/* Logo mark */}
      <div className="flex flex-col items-center mb-8">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.3 }}
          className="w-16 h-16 rounded-2xl bg-crimson/10 border border-crimson/30
                     flex items-center justify-center mb-4 relative"
        >
          <div className="absolute inset-0 rounded-2xl bg-crimson/5 blur-xl" />
          <Shield className="w-8 h-8 text-crimson relative z-10" strokeWidth={1.5} />
        </motion.div>
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-2xl font-semibold text-primary tracking-tight"
        >
          ERDCP
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25 }}
          className="text-sm text-muted mt-1"
        >
          Emergency Response & Dispatch Platform
        </motion.p>
      </div>

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.35 }}
        className="glass-card p-8"
      >
        <h2 className="text-lg font-semibold text-primary mb-1">Sign in</h2>
        <p className="text-sm text-muted mb-6">
          Authorised personnel only
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Email */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-secondary uppercase tracking-wide">
              Email address
            </label>
            <input
              {...register('email')}
              type="email"
              autoComplete="email"
              placeholder="admin@emergency.gh"
              className={cn('input-base', errors.email && 'border-crimson/60 focus:ring-crimson/40')}
            />
            {errors.email && (
              <p className="text-xs text-crimson">{errors.email.message}</p>
            )}
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-secondary uppercase tracking-wide">
              Password
            </label>
            <div className="relative">
              <input
                {...register('password')}
                type={showPw ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="Enter your password"
                className={cn('input-base pr-10', errors.password && 'border-crimson/60')}
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-secondary
                           transition-colors"
              >
                {showPw
                  ? <EyeOff className="w-4 h-4" />
                  : <Eye     className="w-4 h-4" />
                }
              </button>
            </div>
            {errors.password && (
              <p className="text-xs text-crimson">{errors.password.message}</p>
            )}
          </div>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{   opacity: 0, height: 0 }}
                className="flex items-center gap-2 p-3 rounded-xl bg-crimson/10
                           border border-crimson/20 text-crimson text-sm"
              >
                <AlertTriangle className="w-4 h-4 shrink-0" />
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Submit */}
          <motion.button
            type="submit"
            disabled={isSubmitting}
            whileTap={{ scale: 0.98 }}
            className="btn-primary w-full py-3 mt-2"
          >
            {isSubmitting ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : 'Sign in'}
          </motion.button>
        </form>
      </motion.div>

      <p className="text-center text-xs text-muted mt-6">
        Ghana National Emergency Services &mdash; Restricted Access
      </p>
    </motion.div>
  );
}
