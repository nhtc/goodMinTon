/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // Legacy colors (keeping for backward compatibility)
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        
        // Custom colors using design tokens
        primary: {
          50: 'var(--color-primary-50)',
          100: 'var(--color-primary-100)',
          200: 'var(--color-primary-200)',
          300: 'var(--color-primary-300)',
          400: 'var(--color-primary-400)',
          500: 'var(--color-primary-500)',
          600: 'var(--color-primary-600)',
          700: 'var(--color-primary-700)',
          800: 'var(--color-primary-800)',
          900: 'var(--color-primary-900)',
          950: 'var(--color-primary-950)',
          DEFAULT: 'var(--color-primary-600)',
        },
        secondary: {
          50: 'var(--color-secondary-50)',
          100: 'var(--color-secondary-100)',
          200: 'var(--color-secondary-200)',
          300: 'var(--color-secondary-300)',
          400: 'var(--color-secondary-400)',
          500: 'var(--color-secondary-500)',
          600: 'var(--color-secondary-600)',
          700: 'var(--color-secondary-700)',
          800: 'var(--color-secondary-800)',
          900: 'var(--color-secondary-900)',
          950: 'var(--color-secondary-950)',
          DEFAULT: 'var(--color-secondary-800)',
        },
        accent: {
          50: 'var(--color-accent-50)',
          100: 'var(--color-accent-100)',
          200: 'var(--color-accent-200)',
          300: 'var(--color-accent-300)',
          400: 'var(--color-accent-400)',
          500: 'var(--color-accent-500)',
          600: 'var(--color-accent-600)',
          700: 'var(--color-accent-700)',
          800: 'var(--color-accent-800)',
          900: 'var(--color-accent-900)',
          950: 'var(--color-accent-950)',
          DEFAULT: 'var(--color-accent-500)',
        },
        success: {
          50: 'var(--color-success-50)',
          100: 'var(--color-success-100)',
          500: 'var(--color-success-500)',
          600: 'var(--color-success-600)',
          700: 'var(--color-success-700)',
          DEFAULT: 'var(--color-success-500)',
        },
        warning: {
          50: 'var(--color-warning-50)',
          100: 'var(--color-warning-100)',
          500: 'var(--color-warning-500)',
          600: 'var(--color-warning-600)',
          700: 'var(--color-warning-700)',
          DEFAULT: 'var(--color-warning-500)',
        },
        error: {
          50: 'var(--color-error-50)',
          100: 'var(--color-error-100)',
          500: 'var(--color-error-500)',
          600: 'var(--color-error-600)',
          700: 'var(--color-error-700)',
          DEFAULT: 'var(--color-error-500)',
        },
        info: {
          50: 'var(--color-info-50)',
          100: 'var(--color-info-100)',
          500: 'var(--color-info-500)',
          600: 'var(--color-info-600)',
          700: 'var(--color-info-700)',
          DEFAULT: 'var(--color-info-500)',
        },
      },
      
      // Custom spacing scale using design tokens
      spacing: {
        '1': 'var(--spacing-1)',
        '2': 'var(--spacing-2)',
        '3': 'var(--spacing-3)',
        '4': 'var(--spacing-4)',
        '5': 'var(--spacing-5)',
        '6': 'var(--spacing-6)',
        '8': 'var(--spacing-8)',
        '10': 'var(--spacing-10)',
        '12': 'var(--spacing-12)',
        '16': 'var(--spacing-16)',
        '20': 'var(--spacing-20)',
        '24': 'var(--spacing-24)',
      },
      
      // Typography configuration using design tokens
      fontFamily: {
        sans: 'var(--font-family-primary)',
        mono: 'var(--font-family-mono)',
      },
      fontSize: {
        'xs': 'var(--font-size-xs)',
        'sm': 'var(--font-size-sm)',
        'base': 'var(--font-size-base)',
        'lg': 'var(--font-size-lg)',
        'xl': 'var(--font-size-xl)',
        '2xl': 'var(--font-size-2xl)',
        '3xl': 'var(--font-size-3xl)',
        '4xl': 'var(--font-size-4xl)',
        '5xl': 'var(--font-size-5xl)',
      },
      fontWeight: {
        light: 'var(--font-weight-light)',
        normal: 'var(--font-weight-normal)',
        medium: 'var(--font-weight-medium)',
        semibold: 'var(--font-weight-semibold)',
        bold: 'var(--font-weight-bold)',
        extrabold: 'var(--font-weight-extrabold)',
      },
      lineHeight: {
        tight: 'var(--line-height-tight)',
        snug: 'var(--line-height-snug)',
        normal: 'var(--line-height-normal)',
        relaxed: 'var(--line-height-relaxed)',
        loose: 'var(--line-height-loose)',
      },
      letterSpacing: {
        tighter: 'var(--letter-spacing-tighter)',
        tight: 'var(--letter-spacing-tight)',
        normal: 'var(--letter-spacing-normal)',
        wide: 'var(--letter-spacing-wide)',
        wider: 'var(--letter-spacing-wider)',
      },
      
      // Border radius using design tokens
      borderRadius: {
        'none': 'var(--border-radius-none)',
        'sm': 'var(--border-radius-sm)',
        'DEFAULT': 'var(--border-radius-base)',
        'md': 'var(--border-radius-md)',
        'lg': 'var(--border-radius-lg)',
        'xl': 'var(--border-radius-xl)',
        '2xl': 'var(--border-radius-2xl)',
        'full': 'var(--border-radius-full)',
      },
      
      // Box shadows using design tokens
      boxShadow: {
        'sm': 'var(--shadow-sm)',
        'DEFAULT': 'var(--shadow-base)',
        'md': 'var(--shadow-md)',
        'lg': 'var(--shadow-lg)',
        'xl': 'var(--shadow-xl)',
        'inner': 'var(--shadow-inner)',
      },
      
      // Animation and transitions using design tokens
      transitionDuration: {
        'fast': 'var(--transition-duration-fast)',
        'DEFAULT': 'var(--transition-duration-base)',
        'slow': 'var(--transition-duration-slow)',
      },
      transitionTimingFunction: {
        'ease': 'var(--transition-timing-ease)',
        'ease-in': 'var(--transition-timing-ease-in)',
        'ease-out': 'var(--transition-timing-ease-out)',
        'ease-in-out': 'var(--transition-timing-ease-in-out)',
      },
      
      // Z-index scale using design tokens
      zIndex: {
        'dropdown': 'var(--z-index-dropdown)',
        'sticky': 'var(--z-index-sticky)',
        'fixed': 'var(--z-index-fixed)',
        'modal-backdrop': 'var(--z-index-modal-backdrop)',
        'modal': 'var(--z-index-modal)',
        'popover': 'var(--z-index-popover)',
        'tooltip': 'var(--z-index-tooltip)',
        'toast': 'var(--z-index-toast)',
      },
      
      // Component-specific utilities for Radix UI integration
      height: {
        'button-sm': 'var(--button-height-sm)',
        'button': 'var(--button-height-base)',
        'button-lg': 'var(--button-height-lg)',
        'input-sm': 'var(--input-height-sm)',
        'input': 'var(--input-height-base)',
        'input-lg': 'var(--input-height-lg)',
      },
      maxWidth: {
        'modal': 'var(--modal-max-width)',
      },
      
      // Background gradients
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      
      // Custom breakpoints using design tokens
      screens: {
        'sm': 'var(--breakpoint-sm)',
        'md': 'var(--breakpoint-md)',
        'lg': 'var(--breakpoint-lg)',
        'xl': 'var(--breakpoint-xl)',
        '2xl': 'var(--breakpoint-2xl)',
      },
    },
  },
  plugins: [
    // Plugin for adding focus ring utilities compatible with Radix UI
    function({ addUtilities }) {
      addUtilities({
        '.focus-ring': {
          '&:focus-visible': {
            outline: `var(--focus-ring-width) var(--focus-ring-style) var(--focus-ring-color)`,
            outlineOffset: 'var(--focus-ring-offset)',
          },
        },
        '.focus-ring-primary': {
          '&:focus-visible': {
            outline: `var(--focus-ring-width) var(--focus-ring-style) var(--color-primary-500)`,
            outlineOffset: 'var(--focus-ring-offset)',
          },
        },
        '.focus-ring-accent': {
          '&:focus-visible': {
            outline: `var(--focus-ring-width) var(--focus-ring-style) var(--color-accent-500)`,
            outlineOffset: 'var(--focus-ring-offset)',
          },
        },
        '.radix-state-open': {
          opacity: 'var(--state-hover-opacity)',
        },
        '.radix-state-closed': {
          opacity: '1',
        },
        '.radix-disabled': {
          opacity: 'var(--state-disabled-opacity)',
          pointerEvents: 'none',
        },
      });
    },
  ],
}