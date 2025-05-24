// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBbBGHRDene0SLHi_9-JghZSREZN_xftpc",
    authDomain: "phys-quizzes.firebaseapp.com",
    projectId: "phys-quizzes",
    storageBucket: "phys-quizzes.firebasestorage.app",
    messagingSenderId: "462871719829",
    appId: "1:462871719829:web:2833caf94cfc5fb0b1d09c",
    measurementId: "G-MCST1ZCND7",
    databaseURL: "https://phys-quizzes-default-rtdb.firebaseio.com"
};

// Initialize Firebase
let app;
let database;
let analytics;

// Global Firebase functions object
window.firebaseDB = {
    // Initialize Firebase and return a promise
    initialize: function() {
        return new Promise((resolve, reject) => {
            try {
                if (!firebase.apps.length) {
                    app = firebase.initializeApp(firebaseConfig);
                } else {
                    app = firebase.app();
                }
                
                database = firebase.database();
                analytics = firebase.analytics();
                
                // Test database connection
                database.ref('.info/connected').once('value')
                    .then(() => {
                        console.log('Firebase initialized successfully');
                        resolve();
                    })
                    .catch(error => {
                        console.error('Firebase database connection test failed:', error);
                        reject(error);
                    });
            } catch (error) {
                console.error("Error initializing Firebase:", error);
                reject(error);
            }
        });
    },

    // Generic function to save data to any path
    saveData: async function(path, data) {
        if (!database) throw new Error('Database not initialized');
        try {
            const ref = database.ref(path);
            const newRef = ref.push();
            await newRef.set({
                ...data,
                createdAt: firebase.database.ServerValue.TIMESTAMP
            });
            return newRef.key;
        } catch (error) {
            console.error(`Error saving data to ${path}:`, error);
            throw error;
        }
    },

    // Generic function to update data at any path
    updateData: async function(path, data) {
        if (!database) throw new Error('Database not initialized');
        try {
            await database.ref(path).update({
                ...data,
                updatedAt: firebase.database.ServerValue.TIMESTAMP
            });
            return true;
        } catch (error) {
            console.error(`Error updating data at ${path}:`, error);
            throw error;
        }
    },

    // Generic function to get data from any path
    getData: async function(path) {
        if (!database) throw new Error('Database not initialized');
        try {
            const snapshot = await database.ref(path).once('value');
            if (snapshot.exists()) {
                return {
                    id: snapshot.key,
                    ...snapshot.val()
                };
            }
            return null;
        } catch (error) {
            console.error(`Error getting data from ${path}:`, error);
            throw error;
        }
    },

    // Generic function to get all data from any path
    getAllData: async function(path) {
        if (!database) throw new Error('Database not initialized');
        try {
            const snapshot = await database.ref(path).once('value');
            const data = [];
            snapshot.forEach((childSnapshot) => {
                data.push({
                    id: childSnapshot.key,
                    ...childSnapshot.val()
                });
            });
            return data;
        } catch (error) {
            console.error(`Error getting all data from ${path}:`, error);
            throw error;
        }
    },

    // Generic function to delete data from any path
    deleteData: async function(path) {
        if (!database) throw new Error('Database not initialized');
        try {
            await database.ref(path).remove();
            return true;
        } catch (error) {
            console.error(`Error deleting data from ${path}:`, error);
            throw error;
        }
    },

    // Function to listen for real-time updates at any path
    listenToUpdates: function(path, callback) {
        if (!database) throw new Error('Database not initialized');
        try {
            return database.ref(path).on('value', (snapshot) => {
                const data = [];
                snapshot.forEach((childSnapshot) => {
                    data.push({
                        id: childSnapshot.key,
                        ...childSnapshot.val()
                    });
                });
                callback(data);
            });
        } catch (error) {
            console.error(`Error setting up listener for ${path}:`, error);
            throw error;
        }
    },

    // Function to stop listening to updates
    stopListening: function(path, listener) {
        if (!database) throw new Error('Database not initialized');
        try {
            database.ref(path).off('value', listener);
        } catch (error) {
            console.error(`Error stopping listener for ${path}:`, error);
            throw error;
        }
    }
};

// Initialize Firebase when the script loads
window.firebaseDB.initialize().catch(error => {
    console.error("Failed to initialize Firebase:", error);
});

// Function to save a new test
async function saveTest(testData) {
    if (!database) {
        throw new Error('Database not initialized');
    }
    try {
        const testsRef = database.ref('tests');
        const newTestRef = testsRef.push();
        
        await newTestRef.set({
            ...testData,
            createdAt: firebase.database.ServerValue.TIMESTAMP
        });
        return newTestRef.key;
    } catch (error) {
        console.error("Error saving test:", error);
        throw error;
    }
}

// Function to get all tests
async function getAllTests() {
    try {
        const snapshot = await database.ref('tests')
            .orderByChild('createdAt')
            .once('value');
        
        const tests = [];
        snapshot.forEach((childSnapshot) => {
            tests.push({
                id: childSnapshot.key,
                ...childSnapshot.val()
            });
        });
        return tests;
    } catch (error) {
        console.error("Error getting tests:", error);
        throw error;
    }
}

// Function to get a specific test by ID
async function getTestById(testId) {
    try {
        const snapshot = await database.ref(`tests/${testId}`)
            .once('value');
        
        if (snapshot.exists()) {
            return {
                id: snapshot.key,
                ...snapshot.val()
            };
        }
        return null;
    } catch (error) {
        console.error("Error getting test by ID:", error);
        throw error;
    }
}

// Function to update a test
async function updateTest(testId, updates) {
    try {
        await database.ref(`tests/${testId}`).update(updates);
        return true;
    } catch (error) {
        console.error("Error updating test:", error);
        throw error;
    }
}

// Function to delete a test
async function deleteTest(testId) {
    try {
        await database.ref(`tests/${testId}`).remove();
        return true;
    } catch (error) {
        console.error("Error deleting test:", error);
        throw error;
    }
}

// Function to save quiz results
async function saveQuizResult(userName, testId, score, answers) {
    try {
        const resultsRef = database.ref('quiz-results');
        const newResultRef = resultsRef.push();
        
        await newResultRef.set({
            userName: userName,
            testId: testId,
            score: score,
            answers: answers,
            timestamp: firebase.database.ServerValue.TIMESTAMP
        });
        return newResultRef.key;
    } catch (error) {
        console.error("Error saving quiz result:", error);
        throw error;
    }
}

// Function to get all results for a specific test
async function getTestResults(testId) {
    try {
        const snapshot = await database.ref('quiz-results')
            .orderByChild('testId')
            .equalTo(testId)
            .once('value');
        
        const results = [];
        snapshot.forEach((childSnapshot) => {
            results.push({
                id: childSnapshot.key,
                ...childSnapshot.val()
            });
        });
        return results;
    } catch (error) {
        console.error("Error getting test results:", error);
        throw error;
    }
}

// Function to get results for a specific user
async function getUserResults(userName) {
    try {
        const snapshot = await database.ref('quiz-results')
            .orderByChild('userName')
            .equalTo(userName)
            .once('value');
        
        const results = [];
        snapshot.forEach((childSnapshot) => {
            results.push({
                id: childSnapshot.key,
                ...childSnapshot.val()
            });
        });
        return results;
    } catch (error) {
        console.error("Error getting user results:", error);
        throw error;
    }
}

// Function to get a single result by ID
async function getResultById(resultId) {
    try {
        const snapshot = await database.ref(`quiz-results/${resultId}`)
            .once('value');
        
        if (snapshot.exists()) {
            return {
                id: snapshot.key,
                ...snapshot.val()
            };
        }
        return null;
    } catch (error) {
        console.error("Error getting result by ID:", error);
        throw error;
    }
}

// Function to delete a result
async function deleteResult(resultId) {
    try {
        await database.ref(`quiz-results/${resultId}`).remove();
        return true;
    } catch (error) {
        console.error("Error deleting result:", error);
        throw error;
    }
}

// Function to update a result
async function updateResult(resultId, updates) {
    try {
        await database.ref(`quiz-results/${resultId}`).update(updates);
        return true;
    } catch (error) {
        console.error("Error updating result:", error);
        throw error;
    }
} 