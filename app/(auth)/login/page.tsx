import Link from 'next/link'
import { LoginForm } from '@/components/auth/LoginForm'

export const metadata = {
  title: 'Sign In — Swidex',
}

export default function LoginPage() {
  return (
    <div>
      <div className="mb-7">
        <h1 className="text-2xl font-semibold text-text-primary tracking-tight">
          Sign in to Swidex
        </h1>
        <p className="mt-1.5 text-sm text-text-secondary">
          Enter your credentials to access your applications.
        </p>
      </div>

      <LoginForm />

      <p className="mt-6 text-center text-sm text-text-secondary">
        Don&apos;t have an account?{' '}
        <Link href="/register" className="text-gold font-medium hover:underline">
          Create one
        </Link>
      </p>
    </div>
  )
}
