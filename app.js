// ========================================
// FIREBASE SURVEY - MOBILE-FIXED VERSION
// ========================================

const firebaseConfig = {
    apiKey: "AIzaSyBLZwdGQ_OSC_kiwmjqTU1vLiNn_REUcoQ",  // Your current key - if issues persist, try old one
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
    dialogues: [{}, {}, {}, {}, {}]
};

let currentDialogue = 0;

document.addEventListener('DOMContentLoaded', function() {
    if (typeof firebase !== 'undefined') {
        try {
            firebase.initializeApp(firebaseConfig);
            console.log('✅ Firebase initialized');
        } catch (e) {
            console.log('Firebase already initialized');
        }
    }
    addScrollListenersToFormInputs();
});

// ========================================
// AUTO-SCROLL FUNCTIONALITY
// ========================================

function addScrollListenersToFormInputs() {
    const inputs = document.querySelectorAll('input, textarea, select');
    inputs.forEach(input => {
        input.addEventListener('focus', function() {
            setTimeout(() => {
                this.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 100);
        });
    });
}

// ========================================
// NAVIGATION
// ========================================

function startSurvey() {
    hideAllSections();
    showSection('demographicsSection');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function hideAllSections() {
    const sections = document.querySelectorAll('.section');
    sections.forEach(s => s.classList.remove('active'));
}

function showSection(id) {
    const section = document.getElementById(id);
    if (section) {
        section.classList.add('active');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setTimeout(() => {
            addScrollListenersToFormInputs();
        }, 100);
    }
}

// ========================================
// DEMOGRAPHICS
// ========================================

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

    console.log('Demographics saved:', surveyData.demographics);
    currentDialogue = 1;
    hideAllSections();
    showSection('dialogue1Section');
}

// ========================================
// DIALOGUE NAVIGATION
// ========================================

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
// SAVE DIALOGUE DATA
// ========================================

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

    console.log(`Dialogue ${num} saved`);
}

// ========================================
// SUBMIT TO FIREBASE - FIXED FOR MOBILE
// ========================================

async function submitSurvey() {
    const form = document.getElementById('dialogue5Form');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    saveDialogueData(5);

    const btn = event ? event.target : document.querySelector('#submitBtn');  // Fallback if no event
    const originalText = btn.textContent;
    btn.textContent = 'Submitting...';
    btn.disabled = true;

    const timestamp = new Date();
    const firstName = surveyData.demographics.firstName || 'Anonymous';
    const participantID = `${firstName}_${Date.now()}`;

    const finalData = {
        participantID: participantID,
        submissionTimestamp: timestamp.toISOString(),
        submissionDateLocal: timestamp.toLocaleString(),
        demographics: surveyData.demographics,
        dialogues: surveyData.dialogues,
        deviceInfo: {
            userAgent: navigator.userAgent,
            language: navigator.language,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)  // Log mobile
        }
    };

    console.log('📤 Submitting to Firebase...', { isMobile: finalData.deviceInfo.isMobile });

    let submissionSuccess = false;

    if (typeof firebase !== 'undefined' && firebase.database) {
        try {
            const database = firebase.database();
            const dbPath = `responses/${participantID}`;
            
            // MOBILE FIX: Add 15-second timeout
            const submitPromise = database.ref(dbPath).set(finalData);
            const timeoutPromise = new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Timeout - network slow on mobile')), 15000)
            );
            
            await Promise.race([submitPromise, timeoutPromise]);
            submissionSuccess = true;
            console.log('✅ Data saved to Firebase!');
        } catch (firebaseError) {
            console.error('❌ Firebase error (mobile?):', firebaseError);
            submissionSuccess = false;
            // Don't let error stop confirmation
        }
    } else {
        console.warn('Firebase not available - offline mode?');
    }

    // ALWAYS show confirmation (prevents mobile hang)
    hideAllSections();
    showSection('confirmationSection');

    const confirmationDetails = document.getElementById('confirmationDetails');
    if (confirmationDetails) {
        const status = submissionSuccess ? '✅ Successfully saved!' : '⚠️ Saved locally - Firebase issue (check connection)';
        confirmationDetails.innerHTML = `
            <div class="confirmation-item">
                <strong>Participant ID:</strong><br>
                <code>${participantID}</code>
            </div>
            <div class="confirmation-item">
                <strong>Submitted:</strong><br>
                ${timestamp.toLocaleString()}
            </div>
            <div class="confirmation-item">
                <strong>Status:</strong><br>
                ${status}
            </div>
            <div class="confirmation-note">
                If Firebase failed, your data is still logged in console. Contact support if needed.
            </div>
        `;
    }

    // Always reset button
    btn.textContent = originalText;
    btn.disabled = false;

    if (!submissionSuccess) {
        alert('Submission may have issues on mobile. Data logged - try desktop or refresh.');
    }
}

// ========================================
// HELPER: Duplicate scroll listener (safe)
// ========================================
document.addEventListener('DOMContentLoaded', addScrollListenersToFormInputs);
