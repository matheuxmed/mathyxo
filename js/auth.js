// ===== Supabase Authentication System =====
// Browser-safe authentication using Supabase
// The anon key is safe to expose in the browser
// The service role key MUST NEVER be in frontend code

const SUPABASE_URL = window.MATHYXO_SUPABASE_URL || 'https://sjuzppnrsdfxlvvugslq.supabase.co';
const SUPABASE_ANON_KEY = window.MATHYXO_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNqdXpwcG5yc2RmeGx2dnVnc2xxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE3MzE3NjUsImV4cCI6MjEwNzMwNzc2NX0.Xkpv_t6LehqFj5xeq5ALUE10BJjOtVyr_ye_8K46RCI';

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
    }
});

console.log('✅ Supabase initialized');

supabase.auth.onAuthStateChange((event, session) => {
    if (session?.user) {
        console.log('User logged in:', session.user.email);
    } else {
        console.log('No user session');
    }
});

async function registerUser(email, password, displayName, level) {
    try {
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

        const { error: profileError } = await supabase.from('profiles').upsert({
            id: user.id,
            email,
            display_name: displayName,
            level,
            created_at: new Date().toISOString(),
            total_points: 0
        });

        if (profileError) throw profileError;

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

async function loginUser(email, password) {
    try {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;

        const user = data?.user;
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

async function logoutUser() {
    try {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
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

async function getCurrentUserData() {
    try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) return null;

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

async function saveProgress(lessonId, quizScore) {
    try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
            alert('Vous devez être connecté');
            return false;
        }

        const { error: progressError } = await supabase.from('user_progress').insert({
            user_id: user.id,
            lesson_id: lessonId,
            quiz_score: quizScore,
            completed_at: new Date().toISOString(),
            completed: quizScore >= 60
        });

        if (progressError) throw progressError;

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
