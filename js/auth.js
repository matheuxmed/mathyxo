// ===== Supabase Authentication System =====
// Browser-safe authentication using Supabase
// The anon key is safe to expose in the browser
// The service role key MUST NEVER be in frontend code

// Get credentials from environment variables
const SUPABASE_URL = window.MATHYXO_SUPABASE_URL || 'https://sjuzppnrsdfxlvvugslq.supabase.co';
const SUPABASE_ANON_KEY = window.MATHYXO_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNqdXpwcG5yc2RmeGx2dnVnc2xxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE3MzE3NjUsImV4cCI6MjEwNzMwNzc2NX0.Xkpv_t6LehqFj5xeq5ALUE10BJjOtVyr_ye_8K46RCI';

// Initialize Supabase client
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
    }
});

console.log('✅ Supabase initialized');

// Monitor auth state
supabase.auth.onAuthStateChange((event, session) => {
    if (session?.user) {
        console.log('User logged in:', session.user.email);
    } else {
        console.log('No user session');
    }
});

// ===== Registration Function =====
async function registerUser(email, password, displayName, level) {
    console.log('Starting registration...');
    try {
        // 1. Create user in Supabase Auth
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    display_name: displayName,
                    level
                }
            }
        });

        if (error) throw error;

        const user = data?.user;
        if (!user) throw new Error('Registration failed: no user returned');

        console.log('User created:', user.id);

        // 2. Create profile in profiles table
        const { error: profileError } = await supabase
            .from('profiles')
            .upsert({
                id: user.id,
                email: email,
                display_name: displayName,
                level: level,
                created_at: new Date().toISOString(),
                total_points: 0
            });

        if (profileError) throw profileError;

        console.log('Registration successful!');
        alert('✅ Inscription réussie! Bienvenue ' + displayName);

        setTimeout(() => {
            window.location.href = './student-dashboard/';
        }, 1500);

        return true;
    } catch (error) {
        console.error('Registration error:', error);
        alert('❌ Erreur: ' + (error?.message || 'Inscription impossible'));
        return false;
    }
}

// ===== Login Function =====
async function loginUser(email, password) {
    console.log('Starting login...');
    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error) throw error;

        const user = data?.user;
        console.log('Login successful:', user?.email);

        alert('✅ Connexion réussie! Bienvenue ' + (user?.user_metadata?.display_name || user?.email));

        setTimeout(() => {
            window.location.href = './student-dashboard/';
        }, 1500);

        return true;
    } catch (error) {
        console.error('Login error:', error);
        alert('❌ Erreur de connexion: ' + (error?.message || 'Identifiants invalides'));
        return false;
    }
}

// ===== Logout Function =====
async function logoutUser() {
    try {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;

        console.log('User logged out');
        alert('✅ Déconnexion réussie');

        setTimeout(() => {
            window.location.href = './';
        }, 1000);

        return true;
    } catch (error) {
        console.error('Logout error:', error);
        alert('❌ Erreur: ' + (error?.message || 'Déconnexion impossible'));
        return false;
    }
}

// ===== Get Current User Data =====
async function getCurrentUserData() {
    try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();

        if (userError || !user) {
            console.log('No user logged in or auth state not resolved yet');
            return null;
        }

        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

        if (error) {
            console.error('Error fetching user profile:', error);
            return null;
        }

        return data;
    } catch (error) {
        console.error('Error getting user data:', error);
        return null;
    }
}

// ===== Save Progress =====
async function saveProgress(lessonId, quizScore) {
    try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();

        if (userError || !user) {
            alert('Vous devez être connecté');
            return false;
        }

        // 1. Save progress record
        const { error: progressError } = await supabase
            .from('user_progress')
            .insert({
                user_id: user.id,
                lesson_id: lessonId,
                quiz_score: quizScore,
                completed_at: new Date().toISOString(),
                completed: quizScore >= 60
            });

        if (progressError) throw progressError;

        // 2. Update user's total points
        const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('total_points')
            .eq('id', user.id)
            .single();

        if (profileError) throw profileError;

        const nextTotal = (profileData?.total_points || 0) + Number(quizScore || 0);

        const { error: updateError } = await supabase
            .from('profiles')
            .update({ total_points: nextTotal })
            .eq('id', user.id);

        if (updateError) throw updateError;

        console.log('Progress saved');
        return true;
    } catch (error) {
        console.error('Error saving progress:', error);
        return false;
    }
}

// ===== Get User Progress =====
async function getUserProgress(userId) {
    try {
        const { data, error } = await supabase
            .from('user_progress')
            .select('*')
            .eq('user_id', userId);

        if (error) {
            console.error('Error getting user progress:', error);
            return [];
        }

        return data || [];
    } catch (error) {
        console.error('Error getting user progress:', error);
        return [];
    }
}
