// ===== Firebase Authentication System =====

// Initialize Firebase
const firebaseConfig = {
  apiKey: "AIzaSyD...", // REPLACE WITH YOUR KEY
  authDomain: "mathyxo.firebaseapp.com",
  projectId: "mathyxo",
  storageBucket: "mathyxo.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abc..."
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Get Firebase Auth and Firestore
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
                level: 'Seconde',
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
    const loginBtn = document.getElementById('login-btn');
    const dashboardBtn = document.getElementById('dashboard-btn');
    const logoutBtn = document.getElementById('logout-btn');
    const userNameDisplay = document.getElementById('user-name-display');
    
    if (loginBtn) loginBtn.style.display = 'none';
    if (dashboardBtn) dashboardBtn.style.display = 'inline-block';
    if (logoutBtn) logoutBtn.style.display = 'inline-block';
    if (userNameDisplay) userNameDisplay.textContent = user.displayName || user.email;
}

// ===== Update UI for Logged-Out User =====
function updateUILoggedOut() {
    const loginBtn = document.getElementById('login-btn');
    const dashboardBtn = document.getElementById('dashboard-btn');
    const logoutBtn = document.getElementById('logout-btn');
    const userNameDisplay = document.getElementById('user-name-display');
    
    if (loginBtn) loginBtn.style.display = 'inline-block';
    if (dashboardBtn) dashboardBtn.style.display = 'none';
    if (logoutBtn) logoutBtn.style.display = 'none';
    if (userNameDisplay) userNameDisplay.textContent = '';
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
