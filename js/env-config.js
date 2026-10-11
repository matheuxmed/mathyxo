/**
 * Environment Configuration Loader
 * 
 * Loads Supabase credentials from:
 * 1. .env file (local development)
 * 2. window.env (injected at build time)
 * 3. Falls back to empty strings (will fail gracefully with clear error)
 */

async function loadEnv() {
  // Try to load from .env file (development only)
  if (typeof fetch !== 'undefined' && process.env.NODE_ENV !== 'production') {
    try {
      const response = await fetch('./.env');
      if (response.ok) {
        const text = await response.text();
        const lines = text.split('\n');
        lines.forEach(line => {
          const [key, value] = line.split('=').map(s => s.trim());
          if (key && value && !key.startsWith('#')) {
            window[`MATHYXO_${key}`] = value;
          }
        });
      }
    } catch (e) {
      console.warn('Could not load .env file (this is normal in production)');
    }
  }

  // Fallback to window.env (set via script in HTML)
  if (window.env) {
    window.MATHYXO_SUPABASE_URL = window.env.SUPABASE_URL || window.MATHYXO_SUPABASE_URL;
    window.MATHYXO_SUPABASE_ANON_KEY = window.env.SUPABASE_ANON_KEY || window.MATHYXO_SUPABASE_ANON_KEY;
  }

  // Validate required environment variables
  const supabaseUrl = window.MATHYXO_SUPABASE_URL;
  const supabaseAnonKey = window.MATHYXO_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Missing Supabase configuration!');
    console.error('Set SUPABASE_URL and SUPABASE_ANON_KEY in your .env file or environment.');
    throw new Error('Supabase credentials not configured. Please check your environment variables.');
  }

  console.log('✅ Environment loaded successfully');
  return {
    supabaseUrl,
    supabaseAnonKey
  };
}

// Export for use in other modules
window.loadEnv = loadEnv;
