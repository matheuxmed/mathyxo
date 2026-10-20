// ===== Supabase Authentication System =====
// Browser-safe authentication using Supabase.
// The anon key is safe to expose in the browser.
// The service role key MUST NEVER be in frontend code.
//
// NOTE: the Supabase CDN bundle declares a global `supabase` variable, so this
// file must NOT redeclare it. The client is exposed as `window.SUPABASE_CLIENT`
// and referenced through the local `SUPABASE` alias.

(function initSupabase() {
    const SUPABASE_URL = window.MATHYXO_SUPABASE_URL || 'https://sjuzppnrsdfxlvvugslq.supabase.co';
    const SUPABASE_ANON_KEY = window.MATHYXO_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNqdXpwcG5yc2RmeGx2dnVnc2xxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE3MzE3NjUsImV4cCI6MjEwNzMwNzc2NX0.Xkpv_t6LehqFj5xeq5ALUE10BJjOtVyr_ye_8K46RCI';

    if (!window.supabase || typeof window.supabase.createClient !== 'function') {
        console.error('Supabase CDN not loaded. Include https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2 before auth.js.');
        return;
    }

    if (window.SUPABASE_CLIENT) return;

    window.SUPABASE_CLIENT = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        auth: {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: true
        }
    });

    console.log('✅ Supabase initialized');

    window.SUPABASE_CLIENT.auth.onAuthStateChange((event, session) => {
        if (session && session.user) {
            console.log('User logged in:', session.user.email);
        } else {
            console.log('No user session');
        }
    });
})();

var SUPABASE = window.SUPABASE_CLIENT || null;

function siteBase() {
    return window.MATHYXO_BASE || '/';
}

function authUnavailable() {
    alert(t('auth.msg.unavailable'));
}

// Translate common Supabase auth errors into friendly messages.
function friendlyAuthError(error) {
    const code = (error && (error.code || error.error_code)) || '';
    const msg = (error && error.message ? error.message : '').toLowerCase();

    if (code === 'over_email_send_rate_limit' || msg.includes('rate limit')) {
        return t('auth.err.rateLimit');
    }
    if (code === 'user_already_exists' || msg.includes('already registered') || msg.includes('already been registered')) {
        return t('auth.err.exists');
    }
    if (msg.includes('invalid email') || code === 'email_address_invalid' || code === 'validation_failed') {
        return t('auth.err.invalidEmail');
    }
    if (code === 'signup_disabled') {
        return t('auth.err.signupDisabled');
    }
    if (msg.includes('email not confirmed')) {
        return t('auth.err.emailNotConfirmed');
    }
    if (msg.includes('invalid login credentials')) {
        return t('auth.err.badCredentials');
    }
    if (msg.includes('password') && (msg.includes('at least') || msg.includes('short') || msg.includes('weak'))) {
        return t('auth.err.weakPassword');
    }
    return error && error.message ? error.message : t('auth.err.registerFailed');
}

async function registerUser(email, password, displayName, level) {
    if (!SUPABASE) { authUnavailable(); return false; }
    try {
        email = (email || '').trim().toLowerCase();

        const { data, error } = await SUPABASE.auth.signUp({
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

        const user = data && data.user;
        if (!user) throw new Error('Registration failed: no user returned');

        // When email confirmation is enabled, signUp returns a user but no session.
        if (!data.session) {
            alert(t('auth.msg.registerConfirm', { email: email }));
            setTimeout(() => {
                window.location.href = siteBase() + 'auth/login.html';
            }, 2000);
            return true;
        }

        const { error: profileError } = await SUPABASE.from('profiles').upsert({
            id: user.id,
            email,
            display_name: displayName,
            level,
            created_at: new Date().toISOString(),
            total_points: 0
        });
        if (profileError) {
            console.warn('Profile could not be saved:', profileError.message);
        }

        alert(t('auth.msg.registerSuccess', { name: displayName }));
        setTimeout(() => {
            window.location.href = siteBase() + 'student-dashboard/';
        }, 1500);
        return true;
    } catch (error) {
        console.error('Registration error:', error);
        alert('❌ ' + friendlyAuthError(error));
        return false;
    }
}

async function loginUser(email, password) {
    if (!SUPABASE) { authUnavailable(); return false; }
    try {
        email = (email || '').trim().toLowerCase();
        const { data, error } = await SUPABASE.auth.signInWithPassword({ email, password });
        if (error) throw error;

        const user = data && data.user;
        const name = (user && user.user_metadata && user.user_metadata.display_name) || (user && user.email) || '';
        alert(t('auth.msg.loginSuccess', { name: name }));
        setTimeout(() => {
            window.location.href = siteBase() + 'student-dashboard/';
        }, 1500);
        return true;
    } catch (error) {
        console.error('Login error:', error);
        alert('❌ ' + friendlyAuthError(error));
        return false;
    }
}

async function logoutUser() {
    if (!SUPABASE) { authUnavailable(); return false; }
    try {
        const { error } = await SUPABASE.auth.signOut();
        if (error) throw error;
        alert(t('auth.msg.logoutSuccess'));
        setTimeout(() => {
            window.location.href = siteBase();
        }, 1000);
        return true;
    } catch (error) {
        console.error('Logout error:', error);
        alert('❌ ' + (error && error.message ? error.message : t('auth.err.logoutFailed')));
        return false;
    }
}

async function getCurrentUser() {
    if (!SUPABASE) return null;
    try {
        const { data, error } = await SUPABASE.auth.getUser();
        if (error || !data || !data.user) return null;
        return data.user;
    } catch (error) {
        console.error('Error getting current user:', error);
        return null;
    }
}

async function getCurrentUserData() {
    if (!SUPABASE) return null;
    try {
        const user = await getCurrentUser();
        if (!user) return null;

        const { data, error } = await SUPABASE
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
    if (!SUPABASE) { authUnavailable(); return false; }
    try {
        const user = await getCurrentUser();
        if (!user) {
            alert(t('auth.err.loginRequired'));
            return false;
        }

        const { error: progressError } = await SUPABASE.from('user_progress').insert({
            user_id: user.id,
            lesson_id: lessonId,
            quiz_score: quizScore,
            completed_at: new Date().toISOString(),
            completed: quizScore >= 60
        });

        if (progressError) throw progressError;

        const { data: profileData, error: profileError } = await SUPABASE
            .from('profiles')
            .select('total_points')
            .eq('id', user.id)
            .single();

        if (profileError) throw profileError;

        const nextTotal = ((profileData && profileData.total_points) || 0) + Number(quizScore || 0);

        const { error: updateError } = await SUPABASE
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
    if (!SUPABASE) return [];
    try {
        const { data, error } = await SUPABASE
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
