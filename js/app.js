// Initialize tests in localStorage if not exists
if (!localStorage.getItem('tests')) {
    const initialTests = [
        {
            id: 1,
            title: 'اختبار الشخصية',
            image: 'https://via.placeholder.com/300x200',
            isFree: true,
            questions: [
                {
                    id: 1,
                    text: 'كيف تتصرف في المواقف الصعبة؟',
                    options: [
                        { id: 1, text: 'أحاول إيجاد حل منطقي' },
                        { id: 2, text: 'أستشير الآخرين' },
                        { id: 3, text: 'أتجنب المواجهة' },
                        { id: 4, text: 'أتصرف بشكل عاطفي' }
                    ]
                }
            ]
        }
    ];
    localStorage.setItem('tests', JSON.stringify(initialTests));
}

// Utility functions
const getTests = () => JSON.parse(localStorage.getItem('tests')) || [];
const saveTests = (tests) => localStorage.setItem('tests', JSON.stringify(tests));
const getTestById = (id) => getTests().find(test => test.id === parseInt(id));

// Render test cards on home page
function renderTestCards() {
    const testsContainer = document.getElementById('testsContainer');
    if (!testsContainer) return;

    const tests = getTests();
    testsContainer.innerHTML = tests.map(test => `
        <div class="test-card">
            <img src="${test.image}" alt="${test.title}" class="test-image">
            <div class="test-content">
                <h3 class="test-title">${test.title}</h3>
                <span class="test-label ${test.isFree ? 'free' : 'paid'}">
                    ${test.isFree ? 'مجاني' : 'مدفوع'}
                </span>
                <a href="test.html?id=${test.id}" class="start-test-btn">ابدأ الاختبار</a>
            </div>
        </div>
    `).join('');
}

// Handle test submission
function handleTestSubmission(testId, answers) {
    const results = JSON.parse(localStorage.getItem('testResults') || '{}');
    results[testId] = {
        answers,
        timestamp: new Date().toISOString()
    };
    localStorage.setItem('testResults', JSON.stringify(results));
}

// Calculate test results
function calculateResults(testId, answers) {
    const test = getTestById(testId);
    if (!test) return null;

    let totalScore = 0;
    let maxPossibleScore = 0;

    // Calculate score for each question
    test.questions.forEach((question, index) => {
        const userAnswer = answers[index];
        maxPossibleScore += question.points || 1; // Default to 1 point if not specified

        if (question.type === 'truefalse' || question.type === 'single') {
            if (userAnswer === question.correct[0]) {
                totalScore += question.points || 1;
            }
        } else if (question.type === 'multi') {
            // For multiple choice, check if all correct answers are selected
            const userAnswers = Array.isArray(userAnswer) ? userAnswer : [userAnswer];
            const allCorrect = question.correct.every(correct => userAnswers.includes(correct));
            const noIncorrect = userAnswers.every(answer => question.correct.includes(answer));
            if (allCorrect && noIncorrect) {
                totalScore += question.points || 1;
            }
        } else if (question.type === 'text') {
            // For text answers, check if the answer matches (case-insensitive)
            const correctAnswer = question.correct[0].toLowerCase();
            const userTextAnswer = userAnswer.toLowerCase();
            if (userTextAnswer === correctAnswer) {
                totalScore += question.points || 1;
            }
        }
    });

    // Find the appropriate message based on score conditions
    let message = 'شكراً لإكمال الاختبار!';
    if (test.scoreConditions && test.scoreConditions.length > 0) {
        // Sort conditions by score in descending order
        const sortedConditions = [...test.scoreConditions].sort((a, b) => b.score - a.score);
        
        // Find the first condition that matches
        const matchingCondition = sortedConditions.find(condition => totalScore >= condition.score);
        if (matchingCondition) {
            message = matchingCondition.message;
        }
    }

    return {
        message: message,
        score: totalScore,
        maxScore: maxPossibleScore,
        completed: true
    };
}

// Admin functions
function validateAdminPassword(password) {
    return password === 'admin123';
}

function addTest(test) {
    const tests = getTests();
    const newId = Math.max(...tests.map(t => t.id), 0) + 1;
    const newTest = { ...test, id: newId };
    tests.push(newTest);
    saveTests(tests);
    return newId;
}

function updateTest(testId, updatedTest) {
    const tests = getTests();
    const index = tests.findIndex(t => t.id === testId);
    if (index !== -1) {
        tests[index] = { ...tests[index], ...updatedTest };
        saveTests(tests);
        return true;
    }
    return false;
}

function deleteTest(testId) {
    const tests = getTests().filter(t => t.id !== testId);
    saveTests(tests);
}

// Initialize page based on current URL
function initializePage() {
    const path = window.location.pathname;
    
    if (path.endsWith('index.html') || path === '/') {
        renderTestCards();
    }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', initializePage); 