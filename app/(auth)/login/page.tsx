import Link from 'next/link'
import { LoginForm } from '@/components/auth/LoginForm'

export default function LoginPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-text-primary tracking-tight">
          Welcome back
        </h1>
        <p className="mt-1 text-sm text-text-secondary">
          Sign in to your AfroCart account
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
