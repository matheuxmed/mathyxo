// ===== Firebase Authentication System =====

// Initialize Firebase (Replace "YOUR_ACTUAL_API_KEY")
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
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

// Get Firebase instances
const auth = firebase.auth();
const db = firebase.firestore();

// Monitor auth state
auth.onAuthStateChanged((user) => {
    if (user) {
        console.log('User is logged in:', user.email);
    } else {
        console.log('No user is logged in.');
    }
});

// ===== Registration Function =====
async function registerUser(email, password, displayName, level) {
    console.log('Starting registration...');
    try {
        // 1. Create the user in Firebase Auth
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        const user = userCredential.user;
        console.log('User created:', user.uid);
        
        // 2. Update Auth Profile
        await user.updateProfile({ displayName: displayName });
        
        // 3. Save to Firestore
        await db.collection('users').doc(user.uid).set({
            uid: user.uid,
            email: email,
            displayName: displayName,
            level: level,
            enrolledDate: firebase.firestore.FieldValue.serverTimestamp(), // Better than new Date()
            totalPoints: 0
        });

        console.log('Registration successful!');
        alert('✅ Inscription réussie! Bienvenue ' + displayName);
        
        setTimeout(() => {
            window.location.href = '/mathyxo/student-dashboard/';
        }, 1500);

    } catch (error) {
        console.error('Registration error:', error);
        alert('❌ Erreur: ' + error.message);
    }
}

// ===== Login Function =====
async function loginUser(email, password) {
    console.log('Starting login...');
    try {
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        const user = userCredential.user;
        
        console.log('Login successful:', user.email);
        alert('✅ Connexion réussie! Bienvenue ' + (user.displayName || user.email));
        
        setTimeout(() => {
            window.location.href = '/mathyxo/student-dashboard/';
        }, 1500);

    } catch (error) {
        console.error('Login error:', error);
        alert('❌ Erreur de connexion: ' + error.message);
    }
}

// ===== Logout Function =====
async function logoutUser() {
    try {
        await auth.signOut();
        console.log('User logged out');
        alert('✅ Déconnexion réussie');
        setTimeout(() => {
            window.location.href = '/mathyxo/';
        }, 1000);
    } catch (error) {
        console.error('Logout error:', error);
        alert('❌ Erreur: ' + error.message);
    }
}

// ===== Get Current User Data =====
async function getCurrentUserData() {
    // Check auth.currentUser directly instead of a global variable
    const user = auth.currentUser; 
    
    if (!user) {
        console.log('No user logged in or auth state not resolved yet');
        return null;
    }
    
    try {
        const doc = await db.collection('users').doc(user.uid).get();
        if (doc.exists) {
            return doc.data();
        } else {
            console.log("No such user document!");
            return null;
        }
    } catch (error) {
        console.error('Error getting user data:', error);
        return null;
    }
}

// ===== Save Progress =====
async function saveProgress(lessonId, quizScore) {
    const user = auth.currentUser;
    
    if (!user) {
        alert('Vous devez être connecté');
        return false;
    }
    
    try {
        await db.collection('progress').add({
            userId: user.uid,
            lessonId: lessonId,
            quizScore: quizScore,
            completedDate: firebase.firestore.FieldValue.serverTimestamp(),
            completed: quizScore >= 60
        });
        
        const userData = await getCurrentUserData();
        const currentPoints = userData?.totalPoints || 0;
        
        await db.collection('users').doc(user.uid).update({
            totalPoints: currentPoints + quizScore
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
