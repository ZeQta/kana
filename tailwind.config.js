/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'media',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        gray: {
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#111827',
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: 'none',
            color: '#374151',
            lineHeight: '1.7',
            p: {
              marginTop: '1em',
              marginBottom: '1em',
            },
            'h1, h2, h3, h4, h5, h6': {
              color: '#111827',
              fontWeight: '600',
            },
            h1: {
              fontSize: '2.25rem',
              marginTop: '0',
              marginBottom: '0.8888889em',
              lineHeight: '1.1111111',
            },
            h2: {
              fontSize: '1.875rem',
              marginTop: '1.5555556em',
              marginBottom: '0.8888889em',
              lineHeight: '1.3333333',
            },
            h3: {
              fontSize: '1.5rem',
              marginTop: '1.6em',
              marginBottom: '0.6em',
              lineHeight: '1.6',
            },
            code: {
              color: '#111827',
              backgroundColor: '#f3f4f6',
              paddingLeft: '0.5rem',
              paddingRight: '0.5rem',
              paddingTop: '0.25rem',
              paddingBottom: '0.25rem',
              borderRadius: '0.375rem',
              fontSize: '0.875em',
              fontWeight: '600',
            },
            'code::before': {
              content: '""',
            },
            'code::after': {
              content: '""',
            },
            pre: {
              backgroundColor: '#1f2937',
              borderRadius: '0.5rem',
              padding: '1rem',
              overflow: 'auto',
            },
            'pre code': {
              backgroundColor: 'transparent',
              color: '#e5e7eb',
              padding: '0',
              fontWeight: '400',
            },
            blockquote: {
              fontStyle: 'italic',
              color: '#374151',
              borderLeftWidth: '4px',
              borderLeftColor: '#3b82f6',
              paddingLeft: '1rem',
              backgroundColor: 'rgba(59, 130, 246, 0.1)',
              borderRadius: '0 0.5rem 0.5rem 0',
              marginTop: '1.6em',
              marginBottom: '1.6em',
            },
          },
        },
        invert: {
          css: {
            color: '#d1d5db',
            'h1, h2, h3, h4, h5, h6': {
              color: '#f9fafb',
            },
            code: {
              color: '#f9fafb',
              backgroundColor: '#374151',
            },
            blockquote: {
              color: '#d1d5db',
              backgroundColor: 'rgba(59, 130, 246, 0.2)',
            },
          },
        },
      },
    },
  },
  plugins: [],
};