import Link from 'next/link'
import { RegisterForm } from '@/components/auth/RegisterForm'

export default function RegisterPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-text-primary tracking-tight">
          Create your account
        </h1>
        <p className="mt-1 text-sm text-text-secondary">
          One login. Every Swidex tool.
        </p>
      </div>

      <RegisterForm />

      <p className="mt-6 text-center text-sm text-text-secondary">
        Already have an account?{' '}
        <Link href="/login" className="text-gold font-medium hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  )
}
