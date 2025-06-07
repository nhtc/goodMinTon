"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

const LoginPage = () => {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsSubmitting(true)

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      })

      if (res.ok) {
        router.push("/members")
      } else {
        const data = await res.json()
        setError(data.message || "Login failed")
      }
    } catch (error) {
      setError("Network error. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className='min-h-screen gradient-bg flex items-center justify-center'>
      <div className='container mx-auto px-6'>
        <div className='max-w-md mx-auto'>
          {/* Back to Home */}
          <div className='text-center mb-8'>
            <Link
              href='/'
              className='text-white/80 hover:text-white transition-colors'
            >
              ← Back to Home
            </Link>
          </div>

          {/* Login Card */}
          <div className='card fade-in-up'>
            <div className='text-center mb-8'>
              <div className='text-5xl mb-4'>🔐</div>
              <h2 className='text-3xl font-bold text-gray-900'>Admin Login</h2>
              <p className='text-gray-600 mt-2'>
                Enter your credentials to access the admin panel
              </p>
            </div>

            <form onSubmit={handleLogin} className='space-y-6'>
              {error && (
                <div className='bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg'>
                  {error}
                </div>
              )}

              <div className='form-group'>
                <label className='form-label' htmlFor='username'>
                  Username
                </label>
                <input
                  type='text'
                  id='username'
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  className='form-input'
                  placeholder='Enter your username'
                  required
                />
              </div>

              <div className='form-group'>
                <label className='form-label' htmlFor='password'>
                  Password
                </label>
                <input
                  type='password'
                  id='password'
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className='form-input'
                  placeholder='Enter your password'
                  required
                />
              </div>

              <button
                type='submit'
                disabled={isSubmitting}
                className='btn btn-primary w-full'
              >
                {isSubmitting && <div className='spinner'></div>}
                {isSubmitting ? "Signing in..." : "Sign In"}
              </button>
            </form>

            <div className='mt-6 text-center text-sm text-gray-500'>
              <p>Demo credentials: admin / password123</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
