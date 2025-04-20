
/**
 * Utility to check for required environment variables
 * This will run when the application first loads
 */

// List of required environment variables
const requiredEnvVars = [
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY',
  // 'VITE_GEMINI_API_KEY' // Gemini key is backend-only; do not require in frontend
];

export function checkEnvironmentVariables() {
  const missing = requiredEnvVars.filter(
    varName => !import.meta.env[varName]
  );
  
  if (missing.length > 0) {
    console.warn(`
      ⚠️ Missing environment variables:
      ${missing.join(', ')}
      
      The app will use development fallbacks which may not work correctly.
      Please add these variables to your .env file:
      
      VITE_SUPABASE_URL=your_supabase_url
      VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
    `);
    return false;
  }
  
  return true;
}
