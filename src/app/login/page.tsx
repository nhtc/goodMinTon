"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import styles from "./page.module.css"
import { useAuth } from "@/context/AuthContext"

const LoginPage = () => {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const { login, isAuthenticated, loading, user } = useAuth()
  const router = useRouter()

  // Redirect if already authenticated
  useEffect(() => {
    if (!loading && isAuthenticated) {
      console.log("User already authenticated, redirecting...")
      router.push("/members")
    }
  }, [isAuthenticated, loading, router])

  // Auto-fill demo credentials
  const fillDemoCredentials = () => {
    setUsername("admin")
    setPassword("password123")
    setError("")
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsSubmitting(true)

    try {
      console.log("Attempting login with:", { username, password })
      const success = await login(username, password)

      if (success) {
        console.log("Login successful, redirecting to members...")
        // Small delay to show success state
        setTimeout(() => {
          router.push("/members")
        }, 500)
      } else {
        setError("Invalid username or password. Please try again.")
      }
    } catch (error) {
      console.error("Login error:", error)
      setError("Network error. Please check your connection and try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Show loading screen while checking authentication
  if (loading) {
    return (
      <div className={styles.loadingScreen}>
        <div className={styles.loadingContainer}>
          <div className={styles.loadingIcon}>🏸</div>
          <div className={styles.loadingSpinner}></div>
          <p className={styles.loadingText}>Checking authentication...</p>
        </div>
      </div>
    )
  }

  // Don't render login form if already authenticated
  if (isAuthenticated) {
    return (
      <div className={styles.loadingScreen}>
        <div className={styles.loadingContainer}>
          <div className={styles.successIcon}>✅</div>
          <p className={styles.successText}>Welcome back, {user?.name}!</p>
          <p className={styles.successSubtext}>Redirecting to dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.loginPage}>
      {/* Background Pattern */}
      <div className={styles.backgroundPattern}>
        <div className={styles.bgCircle1}></div>
        <div className={styles.bgCircle2}></div>
      </div>

      <div className={styles.container}>
        {/* Back to Home */}
        <div className={styles.backToHome}>
          <Link href='/' className={styles.backLink}>
            <span className={styles.backArrow}>←</span>
            Back to Home
          </Link>
        </div>

        {/* Login Card */}
        <div className={styles.loginCard}>
          {/* Header */}
          <div className={styles.header}>
            <div className={styles.iconContainer}>
              <span className={styles.icon}>🏸</span>
            </div>
            <h1 className={styles.title}>Welcome Back!</h1>
            <p className={styles.subtitle}>
              Ready to manage your badminton club? <br />
              Sign in to access your admin dashboard
            </p>
          </div>

          <form onSubmit={handleLogin} className={styles.form}>
            {/* Error Message */}
            {error && (
              <div className={styles.errorMessage}>
                <div className={styles.errorContent}>
                  <span className={styles.errorIcon}>⚠️</span>
                  <p className={styles.errorText}>{error}</p>
                </div>
              </div>
            )}

            {/* Username Field */}
            <div className={styles.formGroup}>
              <label className={styles.label} htmlFor='username'>
                <span style={{ color: "#3b82f6" }}>👤</span>
                Username
              </label>
              <div className={styles.inputWrapper}>
                <input
                  type='text'
                  id='username'
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  className={`${styles.input} ${styles.inputWithIcon}`}
                  placeholder='Enter your username'
                  required
                  disabled={isSubmitting}
                />
                <div className={styles.inputIcon}>
                  <span>@</span>
                </div>
              </div>
            </div>

            {/* Password Field */}
            <div className={styles.formGroup}>
              <label className={styles.label} htmlFor='password'>
                <span style={{ color: "#10b981" }}>🔒</span>
                Password
              </label>
              <div className={styles.inputWrapper}>
                <input
                  type={showPassword ? "text" : "password"}
                  id='password'
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className={`${styles.input} ${styles.inputWithButton}`}
                  placeholder='Enter your password'
                  required
                  disabled={isSubmitting}
                />
                <button
                  type='button'
                  onClick={() => setShowPassword(!showPassword)}
                  className={styles.togglePassword}
                  disabled={isSubmitting}
                >
                  {showPassword ? "👁️" : "🙈"}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type='submit'
              disabled={isSubmitting || !username.trim() || !password.trim()}
              className={styles.submitButton}
            >
              <div className={styles.buttonContent}>
                {isSubmitting ? (
                  <>
                    <div className={styles.spinner}></div>
                    <span>Signing you in...</span>
                  </>
                ) : (
                  <>
                    <span>🚀</span>
                    <span>Let's Go!</span>
                  </>
                )}
              </div>
            </button>
          </form>

          {/* Demo Credentials */}
          <div className={styles.demoSection}>
            <div className={styles.demoHeader}>
              <span className={styles.demoIcon}>💡</span>
              <div>
                <h4 className={styles.demoTitle}>Quick Demo Access</h4>
                <p className={styles.demoDescription}>
                  Try the app with these demo credentials:
                </p>
                <div className={styles.demoCredentials}>
                  <div className={styles.demoRow}>
                    <span className={styles.demoLabel}>Username:</span>
                    <code className={styles.demoValue}>admin</code>
                  </div>
                  <div className={styles.demoRow}>
                    <span className={styles.demoLabel}>Password:</span>
                    <code className={styles.demoValue}>password123</code>
                  </div>
                  <button
                    type='button'
                    onClick={fillDemoCredentials}
                    className={styles.demoButton}
                    disabled={isSubmitting}
                  >
                    <span>✨</span>
                    Use Demo Credentials
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Security Notice */}
          <div className={styles.securityNotice}>
            <span>�</span>
            <span>Secure Login</span>
          </div>

          {/* Footer */}
          <div className={styles.footer}>
            <p className={styles.footerText}>
              Secure access to your badminton management system
            </p>
          </div>
        </div>

        {/* Additional Features Hint */}
        <div className={styles.features}>
          <div className={styles.featuresContainer}>
            <span className={styles.featureItem}>
              <span>👥</span>
              Manage Members
            </span>
            <span className={styles.featureSeparator}></span>
            <span className={styles.featureItem}>
              <span>🏆</span>
              Track Games
            </span>
            <span className={styles.featureSeparator}></span>
            <span className={styles.featureItem}>
              <span>📊</span>
              View Stats
            </span>
          </div>
        </div>

        {/* Help Section */}
        <div className={styles.helpSection}>
          <div className={styles.helpCard}>
            <div className={styles.helpHeader}>
              <span className={styles.helpIcon}>💡</span>
              <h3 className={styles.helpTitle}>Quick Help</h3>
            </div>
            <div className={styles.helpGrid}>
              <div className={styles.helpItem}>
                <span className={styles.itemIcon}>🔐</span>
                <div className={styles.itemContent}>
                  <strong>Demo Access</strong>
                  <p>Username: admin, Password: password123</p>
                </div>
              </div>
              <div className={styles.helpItem}>
                <span className={styles.itemIcon}>🔄</span>
                <div className={styles.itemContent}>
                  <strong>Forgot Password?</strong>
                  <p>Contact your administrator</p>
                </div>
              </div>
              <div className={styles.helpItem}>
                <span className={styles.itemIcon}>⚡</span>
                <div className={styles.itemContent}>
                  <strong>Features</strong>
                  <p>Manage members, track games & stats</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
