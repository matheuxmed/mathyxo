
// ===== Firebase Authentication System =====
// Initialize Firebase
const firebaseConfig = {
  apiKey: "AIzaSyD6q-mHObvKIsCYo8NW8O24_1fuCdSlgBY",
  authDomain: "mathyxo-e191e.firebaseapp.com",
  projectId: "mathyxo-e191e",
  storageBucket: "mathyxo-e191e.firebasestorage.app",
  messagingSenderId: "486174230938",
  appId: "1:486174230938:web:71ec38b77e381cb7c9d223",
  measurementId: "G-QV3VPJ5HP5"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Get Firebase Auth
const auth = firebase.auth();
const db = firebase.firestore();

// ===== User Session Management =====
let currentUser = null;

// Monitor auth state changes
auth.onAuthStateChanged((user) => {
    currentUser = user;
    if (user) {
        console.log('User logged in:', user.email);
        updateUILoggedIn(user);
    } else {
        console.log('No user logged in');
        updateUILoggedOut();
    }
});

// ===== Registration Function =====
function registerUser(email, password, displayName) {
    auth.createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            
            // Save user profile to Firestore
            db.collection('users').doc(user.uid).set({
                uid: user.uid,
                email: email,
                displayName: displayName,
                level: 'Seconde', // Default level
                enrolledDate: new Date(),
                totalPoints: 0,
                photoURL: ''
            });
            
            // Update user display name
            user.updateProfile({
                displayName: displayName
            });
            
            console.log('User registered successfully:', user.email);
            alert('Inscription réussie! Bienvenue ' + displayName);
            redirectToStudentDashboard();
        })
        .catch((error) => {
            console.error('Registration error:', error.message);
            alert('Erreur d\'inscription: ' + error.message);
        });
}

// ===== Login Function =====
function loginUser(email, password) {
    auth.signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            console.log('User logged in:', user.email);
            alert('Bienvenue ' + (user.displayName || user.email));
            redirectToStudentDashboard();
        })
        .catch((error) => {
            console.error('Login error:', error.message);
            alert('Erreur de connexion: ' + error.message);
        });
}

// ===== Logout Function =====
function logoutUser() {
    auth.signOut()
        .then(() => {
            console.log('User logged out');
            alert('Déconnexion réussie');
            redirectToHomepage();
        })
        .catch((error) => {
            console.error('Logout error:', error.message);
        });
}

// ===== Update UI for Logged-In User =====
function updateUILoggedIn(user) {
    // Hide login buttons, show user menu
    const loginBtn = document.getElementById('login-btn');
    const dashboardBtn = document.getElementById('dashboard-btn');
    const logoutBtn = document.getElementById('logout-btn');
    const userNameDisplay = document.getElementById('user-name-display');
    
    if (loginBtn) loginBtn.style.display = 'none';
    if (dashboardBtn) dashboardBtn.style.display = 'inline-block';
    if (logoutBtn) logoutBtn.style.display = 'inline-block';
    if (userNameDisplay) userNameDisplay.textContent = user.displayName || user.email;
    
    // Enable lesson access
    enableLessonAccess();
}

// ===== Update UI for Logged-Out User =====
function updateUILoggedOut() {
    // Show login buttons, hide user menu
    const loginBtn = document.getElementById('login-btn');
    const dashboardBtn = document.getElementById('dashboard-btn');
    const logoutBtn = document.getElementById('logout-btn');
    const userNameDisplay = document.getElementById('user-name-display');
    
    if (loginBtn) loginBtn.style.display = 'inline-block';
    if (dashboardBtn) dashboardBtn.style.display = 'none';
    if (logoutBtn) logoutBtn.style.display = 'none';
    if (userNameDisplay) userNameDisplay.textContent = '';
    
    // Disable lesson access
    disableLessonAccess();
}

// ===== Check if Lesson is Protected =====
function isLessonProtected() {
    return window.location.pathname.includes('/seconde/') || 
           window.location.pathname.includes('/premiere/') || 
           window.location.pathname.includes('/terminale/');
}

// ===== Enable Lesson Access =====
function enableLessonAccess() {
    const lessonContent = document.getElementById('lesson-content');
    const loginPrompt = document.getElementById('login-prompt');
    
    if (lessonContent) lessonContent.style.display = 'block';
    if (loginPrompt) loginPrompt.style.display = 'none';
}

// ===== Disable Lesson Access =====
function disableLessonAccess() {
    const lessonContent = document.getElementById('lesson-content');
    const loginPrompt = document.getElementById('login-prompt');
    
    if (lessonContent) lessonContent.style.display = 'none';
    if (loginPrompt) loginPrompt.style.display = 'block';
}

// ===== Redirect Functions =====
function redirectToStudentDashboard() {
    setTimeout(() => {
        window.location.href = '/mathyxo/student-dashboard/';
    }, 1500);
}

function redirectToHomepage() {
    setTimeout(() => {
        window.location.href = '/mathyxo/';
    }, 1500);
}

// ===== Get Current User Data =====
async function getCurrentUserData() {
    if (!currentUser) return null;
    
    try {
        const doc = await db.collection('users').doc(currentUser.uid).get();
        return doc.data();
    } catch (error) {
        console.error('Error getting user data:', error);
        return null;
    }
}

// ===== Save Progress =====
async function saveProgress(lessonId, quizScore) {
    if (!currentUser) {
        alert('Vous devez être connecté pour sauvegarder votre progrès');
        return;
    }
    
    try {
        await db.collection('progress').add({
            userId: currentUser.uid,
            lessonId: lessonId,
            quizScore: quizScore,
            completedDate: new Date(),
            completed: quizScore >= 60
        });
        
        // Update user total points
        const userData = await getCurrentUserData();
        await db.collection('users').doc(currentUser.uid).update({
            totalPoints: (userData.totalPoints || 0) + quizScore
        });
        
        console.log('Progress saved successfully');
        alert('Progrès sauvegardé!');
    } catch (error) {
        console.error('Error saving progress:', error);
        alert('Erreur lors de la sauvegarde du progrès');
    }
}

// ===== Get User Progress =====
async function getUserProgress(userId) {
    try {
        const querySnapshot = await db.collection('progress')
            .where('userId', '==', userId)
            .get();
        
        const progress = [];
        querySnapshot.forEach((doc) => {
            progress.push(doc.data());
        });
        
        return progress;
    } catch (error) {
        console.error('Error getting user progress:', error);
        return [];
    }
}

// ===== Update User Level =====
async function updateUserLevel(userId, newLevel) {
    try {
        await db.collection('users').doc(userId).update({
            level: newLevel
        });
        console.log('User level updated to:', newLevel);
    } catch (error) {
        console.error('Error updating user level:', error);
    }
}

// ===== Check Protected Pages =====
document.addEventListener('DOMContentLoaded', function() {
    // If on a protected lesson page and not logged in, show login prompt
    if (isLessonProtected() && !currentUser) {
        disableLessonAccess();
    }
});
