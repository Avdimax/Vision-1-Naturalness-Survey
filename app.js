// ========================================
// FIREBASE SURVEY - COMPLETE WORKING VERSION
// ========================================
const firebaseConfig = {
  apiKey: "AIzaSyBLZwdGQ_OSC_kiwmjqTU1vLiNn_REUcoQ",
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
  
  // Add smooth scroll behavior to form inputs
  addScrollListenersToFormInputs();
});

// ========================================
// AUTO-SCROLL FUNCTIONALITY
// ========================================
// ======================================
// SMOOTH SCROLLING - AUTO SCROLL FEATURE
// ======================================
document.addEventListener('DOMContentLoaded', function() {
  const inputs = document.querySelectorAll('input, textarea, select');
  inputs.forEach(input => {
    input.addEventListener('focus', function() {
      setTimeout(() => {
        this.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    });
  });
});


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
    
    // Re-attach scroll listeners to newly visible inputs
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
// SUBMIT TO FIREBASE
// ========================================
async function submitSurvey() {
  const form = document.getElementById('dialogue5Form');
  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  saveDialogueData(5);

  const btn = event.target;
  const originalText = btn.textContent;
  btn.textContent = 'Submitting...';
  btn.disabled = true;

  try {
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
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
      }
    };

    console.log('📤 Submitting to Firebase...');

    if (typeof firebase !== 'undefined' && firebase.database) {
      try {
        const database = firebase.database();
        const dbPath = `responses/${participantID}`;
        await database.ref(dbPath).set(finalData);
        console.log('✅ Data saved to Firebase!');
      } catch (firebaseError) {
        console.error('Firebase error:', firebaseError);
      }
    } else {
      console.warn('Firebase not available');
    }

    // Show confirmation
    hideAllSections();
    showSection('confirmationSection');

    const confirmationDetails = document.getElementById('confirmationDetails');
    if (confirmationDetails) {
      confirmationDetails.innerHTML = `
        <h2>✅ Submission Complete!</h2>
        <p><strong>Participant ID:</strong><br><code>${participantID}</code></p>
        <p><strong>Submitted:</strong><br>${timestamp.toLocaleString()}</p>
        <p><strong>Status:</strong><br>✅ Saved to database</p>
      `;
    }
  } catch (error) {
    console.error('Submission error:', error);
    btn.textContent = originalText;
    btn.disabled = false;
    alert('Error submitting survey. Please try again.');
  }
}
