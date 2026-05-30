/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: ["class"],
    content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
        extend: {
                fontFamily: {
                    display: ['"Space Grotesk"', 'ui-sans-serif', 'system-ui'],
                    sans: ['Inter', 'ui-sans-serif', 'system-ui'],
                    mono: ['"IBM Plex Mono"', 'ui-monospace', 'SFMono-Regular']
                },
                borderRadius: {
                        lg: 'var(--radius)',
                        md: 'calc(var(--radius) - 2px)',
                        sm: 'calc(var(--radius) - 4px)'
                },
                colors: {
                        background: 'hsl(var(--background))',
                        foreground: 'hsl(var(--foreground))',
                        card: {
                                DEFAULT: 'hsl(var(--card))',
                                foreground: 'hsl(var(--card-foreground))'
                        },
                        popover: {
                                DEFAULT: 'hsl(var(--popover))',
                                foreground: 'hsl(var(--popover-foreground))'
                        },
                        primary: {
                                DEFAULT: 'hsl(var(--primary))',
                                foreground: 'hsl(var(--primary-foreground))'
                        },
                        secondary: {
                                DEFAULT: 'hsl(var(--secondary))',
                                foreground: 'hsl(var(--secondary-foreground))'
                        },
                        muted: {
                                DEFAULT: 'hsl(var(--muted))',
                                foreground: 'hsl(var(--muted-foreground))'
                        },
                        accent: {
                                DEFAULT: 'hsl(var(--accent))',
                                foreground: 'hsl(var(--accent-foreground))'
                        },
                        destructive: {
                                DEFAULT: 'hsl(var(--destructive))',
                                foreground: 'hsl(var(--destructive-foreground))'
                        },
                        border: 'hsl(var(--border))',
                        input: 'hsl(var(--input))',
                        ring: 'hsl(var(--ring))',
                        ty: {
                            red: '#E10600',
                            redHover: '#FF1A12',
                            redDim: '#B90500',
                            yellow: '#F2C94C',
                            silver: '#B9C2CF',
                            black0: '#050608',
                            black1: '#0A0B0E',
                            graphite: '#0F1115',
                            surface0: '#10131A',
                            surface1: '#151A23',
                            surface2: '#1B2230',
                            textHigh: '#F2F4F7',
                            textMid: '#C7CDD6',
                            textLow: '#8E97A6',
                            borderSoft: '#232B3A',
                            borderHard: '#2E394D'
                        },
                        chart: {
                                '1': 'hsl(var(--chart-1))',
                                '2': 'hsl(var(--chart-2))',
                                '3': 'hsl(var(--chart-3))',
                                '4': 'hsl(var(--chart-4))',
                                '5': 'hsl(var(--chart-5))'
                        }
                },
                keyframes: {
                        'accordion-down': {
                                from: { height: '0' },
                                to: { height: 'var(--radix-accordion-content-height)' }
                        },
                        'accordion-up': {
                                from: { height: 'var(--radix-accordion-content-height)' },
                                to: { height: '0' }
                        },
                        'red-sweep': {
                            '0%': { transform: 'translateX(-110%)' },
                            '100%': { transform: 'translateX(110%)' }
                        },
                        'pulse-ring': {
                            '0%, 100%': { transform: 'scale(1)', opacity: '0.7' },
                            '50%': { transform: 'scale(1.15)', opacity: '0.2' }
                        },
                        'logo-reveal': {
                            '0%': { opacity: '0', letterSpacing: '0.5em' },
                            '100%': { opacity: '1', letterSpacing: '0.18em' }
                        }
                },
                animation: {
                        'accordion-down': 'accordion-down 0.2s ease-out',
                        'accordion-up': 'accordion-up 0.2s ease-out',
                        'red-sweep': 'red-sweep 1.4s ease-out',
                        'pulse-ring': 'pulse-ring 2.4s ease-in-out infinite',
                        'logo-reveal': 'logo-reveal 1s ease-out forwards'
                }
        }
  },
  plugins: [require("tailwindcss-animate")],
};
