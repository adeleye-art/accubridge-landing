'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, Mail, Lock, User } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useDispatch } from 'react-redux'
import toast from 'react-hot-toast'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { setCredentials } from '@/store/swidexAuthSlice'
import type { AppDispatch } from '@/store'
import type { SwidexAuthResponse } from '@/types/swidex'

const schema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Enter a valid email'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  })

type FormData = z.infer<typeof schema>

export function RegisterForm() {
  const router = useRouter()
  const dispatch = useDispatch<AppDispatch>()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  async function onSubmit(data: FormData) {
    setApiError(null)
    setIsLoading(true)
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: data.name, email: data.email, password: data.password }),
      })
      const result: SwidexAuthResponse & { message?: string } = await res.json()

      if (!res.ok) {
        setApiError(result.message ?? 'Registration failed. Please try again.')
        return
      }

      dispatch(setCredentials({ user: result.user, token: result.token }))
      toast.success(`Welcome to Swidex, ${result.user.name.split(' ')[0]}!`)
      router.push('/portal')
    } catch {
      setApiError('Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input
        label="Full Name"
        placeholder="Amara Okafor"
        leftIcon={<User size={16} />}
        error={errors.name?.message}
        {...register('name')}
      />
      <Input
        label="Email"
        type="email"
        placeholder="you@example.com"
        leftIcon={<Mail size={16} />}
        error={errors.email?.message}
        {...register('email')}
      />
      <Input
        label="Password"
        type={showPassword ? 'text' : 'password'}
        placeholder="••••••••"
        leftIcon={<Lock size={16} />}
        error={errors.password?.message}
        rightIcon={
          <button type="button" onClick={() => setShowPassword(!showPassword)}
            className="hover:text-text-primary transition-colors">
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        }
        {...register('password')}
      />
      <Input
        label="Confirm Password"
        type={showConfirm ? 'text' : 'password'}
        placeholder="••••••••"
        leftIcon={<Lock size={16} />}
        error={errors.confirmPassword?.message}
        rightIcon={
          <button type="button" onClick={() => setShowConfirm(!showConfirm)}
            className="hover:text-text-primary transition-colors">
            {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        }
        {...register('confirmPassword')}
      />

      {apiError && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-danger">
          {apiError}
        </div>
      )}

      <Button type="submit" variant="primary" size="lg" loading={isLoading} className="w-full">
        Create account
      </Button>
    </form>
  )
}
