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
  				bg:          'var(--brand-bg)',
  				bg1:         'var(--brand-bg1)',
  				bg2:         'var(--brand-bg2)',
  				bg3:         'var(--brand-bg3)',
  				line:        'var(--brand-line)',
  				'line-soft': 'var(--brand-line-soft)',
  				text:        'var(--brand-text)',
  				dim:         'var(--brand-dim)',
  				muted:       'var(--brand-muted)',
  				green:       'var(--brand-green)',
  				'green-dim': 'var(--brand-green-dim)',
  				'green-fg':  'var(--brand-green-fg)',
  				red:         'var(--brand-red)',
  				amber:       'var(--brand-amber)',
  				surface:     'var(--brand-surface)',
  				outline:     'var(--brand-outline)',
  				border2:     'var(--brand-border2)',
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
