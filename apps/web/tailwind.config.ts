import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
  	container: {
  		center: true,
  		padding: '2rem',
  		screens: {
  			'2xl': '1400px'
  		}
  	},
  	extend: {
  		fontFamily: {
  			mono: ['var(--font-mono)', 'ui-monospace', 'SF Mono', 'Menlo', 'monospace'],
  		},
  		colors: {
  			brand: {
  				bg:          '#0A0A0F',
  				bg1:         '#0E0E14',
  				bg2:         '#14141C',
  				bg3:         '#1A1A24',
  				line:        '#222230',
  				'line-soft': '#1B1B26',
  				text:        '#ECECF1',
  				dim:         '#9A9AA8',
  				muted:       '#63636F',
  				green:       '#00E57A',
  				'green-dim': '#00B862',
  				red:         '#FF4444',
  				amber:       '#F5B400',
  				surface:     '#111118',
  				outline:     '#1E1E2A',
  				border2:     '#2A2A3A',
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			}
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
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
  			'pulse-green': {
  				'0%, 100%': { boxShadow: '0 0 0 0 rgba(0, 229, 122, 0.4)' },
  				'50%': { boxShadow: '0 0 0 6px rgba(0, 229, 122, 0)' },
  			},
  			breathe: {
  				'0%, 100%': { opacity: '1', transform: 'scale(1)' },
  				'50%': { opacity: '0.5', transform: 'scale(0.9)' },
  			},
  			blip: {
  				'0%, 100%': { opacity: '1' },
  				'50%': { opacity: '0.4' },
  			},
  			'logo-pulse': {
  				'0%': { transform: 'scale(0.6)', opacity: '0.8' },
  				'100%': { transform: 'scale(1.4)', opacity: '0' },
  			},
  		},
  		animation: {
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out',
  			'pulse-green': 'pulse-green 2s ease-in-out infinite',
  			breathe: 'breathe 2s ease-in-out infinite',
  			blip: 'blip 2s infinite',
  			'logo-pulse': 'logo-pulse 2s ease-out infinite',
  		}
  	}
  },
  plugins: [],
};

export default config;
