import { useEffect } from "react"

/**
 * Custom hook for managing body scroll lock
 * SRP: Single responsibility of handling body scroll management
 * KISS: Simple, focused functionality
 */
export function useBodyScrollLock(isLocked: boolean) {
  useEffect(() => {
    // YAGNI: Only add functionality we need now
    if (!document?.body) return

    if (isLocked) {
      // Save current scroll position and lock body
      const scrollY = window.scrollY
      document.body.style.position = "fixed"
      document.body.style.top = `-${scrollY}px`
      document.body.style.width = "100%"
    } else {
      // Restore scroll position and unlock body
      const scrollY = document.body.style.top
      document.body.style.position = ""
      document.body.style.top = ""
      document.body.style.width = ""
      if (scrollY) {
        const scrollValue = parseInt(scrollY.replace("px", ""), 10) * -1
        if (!isNaN(scrollValue)) {
          window.scrollTo(0, scrollValue)
        }
      }
    }

    // Cleanup function to ensure body is always unlocked
    return () => {
      if (document?.body) {
        document.body.style.position = ""
        document.body.style.top = ""
        document.body.style.width = ""
      }
    }
  }, [isLocked])
}