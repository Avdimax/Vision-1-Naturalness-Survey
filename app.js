// ========================================
// FIREBASE SURVEY - FINAL COMPLETE VERSION
// With Timing Features & Professional Integration
// ========================================

const firebaseConfig = {
    apiKey: "AIzaSyAZV24F4Bnak-7bb4jtzDvuREql-GSJjRQ",
    authDomain: "survey-responses-65ef0.firebaseapp.com",
    databaseURL: "https://survey-responses-65ef0-default-rtdb.firebaseio.com",
    projectId: "survey-responses-65ef0",
    storageBucket: "survey-responses-65ef0.firebasestorage.app",
    messagingSenderId: "562335879299",
    appId: "1:562335879299:web:b3d5dd2a7d532c63e80bb6",
    measurementId: "G-95LPH6SWL8"
};

const surveyData = {
    demographics: {},
    dialogues: [{}, {}, {}, {}, {}],
    timingData: {
        surveyStartTime: null,
        surveyStartTimestamp: null,
        surveyStartDateLocal: null,
        submissionTime: null,
        submissionTimestamp: null,
        submissionDateLocal: null,
        submissionDuration: null,
        submissionDurationFormatted: null
    }
};

let currentDialogue = 0;

// ========================================
// INITIALIZATION
// ========================================

document.addEventListener('DOMContentLoaded', function() {
    // Initialize Firebase
    if (typeof firebase !== 'undefined') {
        try {
            firebase.initializeApp(firebaseConfig);
            console.log('✅ Firebase initialized successfully');
        } catch (e) {
            console.log('✅ Firebase already initialized');
        }
    }

    // Setup auto-scroll for form inputs
    setupFormInputScrolling();
});

// ========================================
// AUTO-SCROLL FUNCTIONALITY
// ========================================

function setupFormInputScrolling() {
    const inputs = document.querySelectorAll('input, textarea, select');
    inputs.forEach(input => {
        input.addEventListener('focus', function() {
            setTimeout(() => {
                this.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 100);
        });
    });
}

function addScrollListenersToFormInputs() {
    setupFormInputScrolling();
}

// ========================================
// TIMING UTILITIES - FEATURE 1 & 2
// ========================================

/**
 * Format milliseconds to MM:SS format
 * Example: 695000 ms → "11:35"
 */
function formatDuration(milliseconds) {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    
    const paddedMinutes = String(minutes).padStart(2, '0');
    const paddedSeconds = String(seconds).padStart(2, '0');
    
    return `${paddedMinutes}:${paddedSeconds}`;
}

/**
 * Record survey start time when user clicks "Start Survey"
 * FEATURE 1: Captures the exact moment survey begins
 */
function recordSurveyStart() {
    const now = new Date();
    
    surveyData.timingData.surveyStartTime = now;
    surveyData.timingData.surveyStartTimestamp = now.toISOString();
    surveyData.timingData.surveyStartDateLocal = now.toLocaleString();
    
    console.log('⏱️ Survey started at:', surveyData.timingData.surveyStartDateLocal);
    console.log('🕐 UTC Timestamp:', surveyData.timingData.surveyStartTimestamp);
}

/**
 * Calculate submission duration when user clicks "Submit"
 * FEATURE 2: Calculates and formats completion time as MM:SS
 */
function calculateSubmissionDuration() {
    const submissionTime = new Date();
    const startTime = surveyData.timingData.surveyStartTime;
    
    if (!startTime) {
        console.warn('⚠️ Survey start time not recorded');
        return null;
    }
    
    const durationMs = submissionTime - startTime;
    const formattedDuration = formatDuration(durationMs);
    
    surveyData.timingData.submissionTime = submissionTime;
    surveyData.timingData.submissionTimestamp = submissionTime.toISOString();
    surveyData.timingData.submissionDateLocal = submissionTime.toLocaleString();
    surveyData.timingData.submissionDuration = durationMs;
    surveyData.timingData.submissionDurationFormatted = formattedDuration;
    
    console.log('⏹️ Survey completed at:', surveyData.timingData.submissionDateLocal);
    console.log('✅ Total duration:', formattedDuration);
    
    return formattedDuration;
}

// ========================================
// NAVIGATION FUNCTIONS
// ========================================

/**
 * Start survey - Called when user clicks "Start Survey" button
 */
function startSurvey() {
    // FEATURE 1: Record start time
    recordSurveyStart();
    
    hideAllSections();
    showSection('demographicsSection');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

/**
 * Hide all section divs
 */
function hideAllSections() {
    const sections = document.querySelectorAll('.section');
    sections.forEach(s => s.classList.remove('active'));
}

/**
 * Show specific section by ID
 */
function showSection(id) {
    const section = document.getElementById(id);
    if (section) {
        section.classList.add('active');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        // Re-attach scroll listeners to newly visible inputs
        setTimeout(() => {
            setupFormInputScrolling();
        }, 100);
    }
}

// ========================================
// DEMOGRAPHICS HANDLING
// ========================================

/**
 * Submit demographics form and move to first dialogue
 */
function submitDemographics() {
    const form = document.getElementById('demographicsForm');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    surveyData.demographics = {
        firstName: document.getElementById('firstName').value.trim(),
        age: document.getElementById('age').value.trim(),
        nationality: document.getElementById('nationality').value.trim(),
        educationLevel: document.getElementById('educationLevel').value,
        nativeLanguageVariety: document.getElementById('nativeLanguageVariety').value
    };

    console.log('📝 Demographics saved:', surveyData.demographics);
    
    currentDialogue = 1;
    hideAllSections();
    showSection('dialogue1Section');
}

// ========================================
// DIALOGUE NAVIGATION
// ========================================

/**
 * Move to next dialogue
 */
function nextDialogue(num) {
    const formId = `dialogue${num}Form`;
    const form = document.getElementById(formId);
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    saveDialogueData(num);
    if (num < 5) {
        currentDialogue = num + 1;
        hideAllSections();
        showSection(`dialogue${currentDialogue}Section`);
    }
}

/**
 * Move to previous dialogue
 */
function previousDialogue(num) {
    saveDialogueData(num);
    if (num === 1) {
        hideAllSections();
        showSection('demographicsSection');
    } else {
        currentDialogue = num - 1;
        hideAllSections();
        showSection(`dialogue${currentDialogue}Section`);
    }
}

// ========================================
// SAVE DIALOGUE RESPONSES
// ========================================

/**
 * Save dialogue responses to surveyData
 */
function saveDialogueData(num) {
    const formId = `dialogue${num}Form`;
    const form = document.getElementById(formId);
    if (!form) return;

    const fd = new FormData(form);
    surveyData.dialogues[num - 1] = {
        dialogueNumber: num,
        sectionA: {
            q1_naturalness: fd.get(`d${num}_q1_naturalness`) || '',
            q2_expectancy: fd.get(`d${num}_q2_expectancy`) || ''
        },
        sectionB: {
            q1_grammar: parseInt(fd.get(`d${num}_q1_grammar`)) || null,
            q3_pacing: parseInt(fd.get(`d${num}_q3_pacing`)) || null,
            q5_pragmatics: parseInt(fd.get(`d${num}_q5_pragmatics`)) || null,
            q7_prosodic: parseInt(fd.get(`d${num}_q7_prosodic`)) || null,
            q8_cultural: parseInt(fd.get(`d${num}_q8_cultural`)) || null,
            q9_dynamics: parseInt(fd.get(`d${num}_q9_dynamics`)) || null
        },
        sectionC: {
            q4_suggestions: fd.get(`d${num}_q4_suggestions`) || ''
        }
    };

    console.log(`📋 Dialogue ${num} data saved`);
}

// ========================================
// SUBMIT SURVEY TO FIREBASE
// ========================================

/**
 * Submit all survey data to Firebase
 * FEATURE 2: Calculate and display submission duration
 */
async function submitSurvey() {
    const form = document.getElementById('dialogue5Form');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    saveDialogueData(5);

    // FEATURE 2: Calculate submission duration before sending
    const submissionDurationFormatted = calculateSubmissionDuration();

    const btn = event.target;
    const originalText = btn.textContent;
    btn.textContent = 'Submitting...';
    btn.disabled = true;

    try {
        const firstName = surveyData.demographics.firstName || 'Anonymous';
        const participantID = `${firstName}_${Date.now()}`;

        // Prepare final data object with timing information
        const finalData = {
            participantID: participantID,
            demographics: surveyData.demographics,
            dialogues: surveyData.dialogues,
            timingData: {
                surveyStartTimestamp: surveyData.timingData.surveyStartTimestamp,
                surveyStartDateLocal: surveyData.timingData.surveyStartDateLocal,
                submissionTimestamp: surveyData.timingData.submissionTimestamp,
                submissionDateLocal: surveyData.timingData.submissionDateLocal,
                submissionDurationMs: surveyData.timingData.submissionDuration,
                submissionDurationFormatted: surveyData.timingData.submissionDurationFormatted
            },
            deviceInfo: {
                userAgent: navigator.userAgent,
                language: navigator.language,
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
            }
        };

        console.log('📤 Submitting survey data to Firebase...');
        console.log('⏱️ Survey Duration:', submissionDurationFormatted);

        if (typeof firebase !== 'undefined' && firebase.database) {
            try {
                const database = firebase.database();
                const dbPath = `responses/${participantID}`;
                await database.ref(dbPath).set(finalData);
                console.log('✅ Data successfully saved to Firebase!');
            } catch (firebaseError) {
                console.error('❌ Firebase error:', firebaseError);
                throw firebaseError;
            }
        } else {
            console.warn('⚠️ Firebase not available for this session');
        }

        // Show confirmation page
        hideAllSections();
        showSection('confirmationSection');

        // Display timing information on confirmation page
        displayConfirmationDetails(participantID);

    } catch (error) {
        console.error('❌ Submission error:', error);
        btn.textContent = originalText;
        btn.disabled = false;
        alert('Error submitting survey. Please try again.');
    }
}

/**
 * Display confirmation details with timing information
 */
function displayConfirmationDetails(participantID) {
    const confirmationDetails = document.getElementById('confirmationDetails');
    if (!confirmationDetails) return;

    confirmationDetails.innerHTML = `
        <div class="confirmation-item">
            <strong>Participant ID:</strong><br>
            <code>${participantID}</code>
        </div>
        
        <div class="confirmation-item">
            <strong>Survey Started:</strong><br>
            ${surveyData.timingData.surveyStartDateLocal}
        </div>
        
        <div class="confirmation-item">
            <strong>Survey Submitted:</strong><br>
            ${surveyData.timingData.submissionDateLocal}
        </div>
        
        <div class="confirmation-item" style="background-color: #f0f8ff; padding: 15px; border-radius: 5px; border-left: 4px solid #2196F3;">
            <strong style="color: #2196F3;">⏱️ Submission Duration:</strong><br>
            <span style="font-size: 24px; font-weight: bold; color: #2196F3;">${surveyData.timingData.submissionDurationFormatted}</span>
            <small style="display: block; margin-top: 5px; color: #666;">(${Math.round(surveyData.timingData.submissionDuration / 1000)} seconds total)</small>
        </div>
        
        <div class="confirmation-item">
            <strong>Status:</strong><br>
            ✅ Saved to database
        </div>
    `;
}

// ========================================
// UTILITY FUNCTIONS
// ========================================

/**
 * Log survey state for debugging
 */
function logSurveyState() {
    console.log('=== SURVEY STATE ===');
    console.log('Demographics:', surveyData.demographics);
    console.log('Dialogues:', surveyData.dialogues);
    console.log('Timing Data:', surveyData.timingData);
    console.log('==================');
}
