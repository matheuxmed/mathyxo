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

// Get Firebase instances
const auth = firebase.auth();
const db = firebase.firestore();

// Global user variable
let currentUser = null;

// Monitor auth state
auth.onAuthStateChanged((user) => {
    currentUser = user;
    console.log('Auth state changed:', user ? user.email : 'No user');
});

// ===== Registration Function =====
function registerUser(email, password, displayName, level) {
    console.log('Starting registration...');
    
    auth.createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            console.log('User created:', user.uid);
            
            // Update user profile
            return user.updateProfile({
                displayName: displayName
            }).then(() => {
                // Save to Firestore
                return db.collection('users').doc(user.uid).set({
                    uid: user.uid,
                    email: email,
                    displayName: displayName,
                    level: level,
                    enrolledDate: new Date(),
                    totalPoints: 0
                });
            });
        })
        .then(() => {
            console.log('Registration successful!');
            alert('✅ Inscription réussie! Bienvenue ' + displayName);
            setTimeout(() => {
                window.location.href = '/mathyxo/student-dashboard/';
            }, 1500);
        })
        .catch((error) => {
            console.error('Registration error:', error);
            alert('❌ Erreur: ' + error.message);
        });
}

// ===== Login Function =====
function loginUser(email, password) {
    console.log('Starting login...');
    
    auth.signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            console.log('Login successful:', user.email);
            alert('✅ Connexion réussie! Bienvenue ' + (user.displayName || user.email));
            setTimeout(() => {
                window.location.href = '/mathyxo/student-dashboard/';
            }, 1500);
        })
        .catch((error) => {
            console.error('Login error:', error);
            alert('❌ Erreur de connexion: ' + error.message);
        });
}

// ===== Logout Function =====
function logoutUser() {
    auth.signOut()
        .then(() => {
            console.log('User logged out');
            alert('✅ Déconnexion réussie');
            setTimeout(() => {
                window.location.href = '/mathyxo/';
            }, 1000);
        })
        .catch((error) => {
            console.error('Logout error:', error);
            alert('❌ Erreur: ' + error.message);
        });
}

// ===== Get Current User Data =====
async function getCurrentUserData() {
    if (!currentUser) {
        console.log('No user logged in');
        return null;
    }
    
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
        alert('Vous devez être connecté');
        return false;
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
        const querySnapshot = await db.collection('progress')
            .where('userId', '==', userId)
            .get();
        
        const progress = [];
        querySnapshot.forEach((doc) => {
            progress.push(doc.data());
        });
        
        return progress;
    } catch (error) {
        console.error('Error getting progress:', error);
        return [];
    }
}
