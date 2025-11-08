/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Cores das Secretarias
        'cgm': '#EF4444',
        'sefaz': '#10B981',
        'semades': '#06B6D4',
        'sesau': '#3B82F6',
        'sas': '#8B5CF6',
        'secult': '#EC4899',
        'semadi': '#F59E0B',
        'sejuv': '#14B8A6',
        'semed': '#6366F1',
        'sesdes': '#DC2626',
        'sisep': '#F97316',
        'impcg': '#0891B2',
        'planurb': '#059669',
        'agetec': '#7C3AED',
        'agetran': '#EA580C',
        'emha': '#0284C7',
        'funesp': '#16A34A',
        'funsat': '#CA8A04',
        'fac': '#9333EA',
        'semu': '#DB2777',
        'sear': '#0D9488',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      boxShadow: {
        'inner-lg': 'inset 0 2px 4px 0 rgb(0 0 0 / 0.06)',
      },
    },
  },
  plugins: [],
}
