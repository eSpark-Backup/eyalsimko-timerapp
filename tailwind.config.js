const { hairlineWidth } = require('nativewind/theme');

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        brand: 'hsl(var(--brand))',
        cardBorder: 'hsl(var(--card-border-color))',
        screenBackground: 'hsl(var(--background-brand))',
        backgroundEllipsis1: 'hsl(var(--background-ellipsis-1))',
        backgroundEllipsis2: 'hsl(var(--background-ellipsis-2))',
        backgroundEllipsis3: 'hsl(var(--background-ellipsis-3))',
        backgroundEllipsis4: 'hsl(var(--background-ellipsis-4))',
        buttonDefaultBackground: 'hsl(var(--button-default-background))',
        buttonDefaultBorderColor: 'hsl(var(--button-default-border-color))',
        "item-highlight": 'hsl(var(--item-highlight))',
        "item": 'hsl(var(--item))',
        "input-background": 'hsl(var(--input-background))',
        "main-light": 'hsl(var(--main-light))',
        "timer-out-of-time": 'hsl(var(--timer-out-of-time))',
        "countdown-out-of-time": 'hsl(var(--countdown-out-of-time))',
        "highlight": 'hsl(var(--highlight))',
        "green-highlight": 'hsl(var(--green-highlight))'
      },
      lineHeight: {
        'normal': 1.4285,
      },
      borderWidth: {
        hairline: hairlineWidth(),
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
      fontSize: {
        sm: 12,
        md: 14,
        lg: 16,
        // timer: 80
        '8xl': 80
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};
