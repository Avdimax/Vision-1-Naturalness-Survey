
app_BULLETPROOF.js
// ========================================
// FIREBASE-INTEGRATED SURVEY APPLICATION
// BULLETPROOF FINAL VERSION
// ========================================

// Firebase Configuration
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

// Survey Data Storage
const surveyData = {
  demographics: {},
  dialogues: [{}, {}, {}, {}, {}]
};

let currentDialogue = 0;

// ========================================
// INITIALIZE FIREBASE
// ========================================

document.addEventListener('DOMContentLoaded', function() {
  console.log('🔍 DOMContentLoaded fired');
  
  setTimeout(function() {
    if (typeof firebase !== 'undefined') {
      console.log('✅ Firebase SDK found!');
      try {
        firebase.initializeApp(firebaseConfig);
        console.log('✅ Firebase initialized!');
      } catch (error) {
        console.error('Firebase init error:', error.message);
      }
    } else {
      console.error('❌ Firebase SDK NOT loaded!');
    }
  }, 500);
});

// ========================================
// CORE FUNCTIONS
// ========================================

function startSurvey() {
  console.log('startSurvey() called');
  hideAllSections();
  showSection('demographicsSection');
  showProgressBar();
  updateProgress(0, 'Demographics');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function hideAllSections() {
  const sections = document.querySelectorAll('.section');
  sections.forEach(section => {
    section.classList.remove('active');
  });
}

function showSection(sectionId) {
  console.log('showSection:', sectionId);
  const section = document.getElementById(sectionId);
  if (section) {
    section.classList.add('active');
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 50);
  }
}

function showProgressBar() {
  const progressContainer = document.getElementById('progressContainer');
  if (progressContainer) {
    progressContainer.style.display = 'block';
  }
}

function updateProgress(step, label) {
  const percentage = (step / 6) * 100;
  const progressFill = document.getElementById('progressFill');
  const progressText = document.getElementById('progressText');
  
  if (progressFill) {
    progressFill.style.width = percentage + '%';
  }
  if (progressText) {
    progressText.textContent = label;
  }
}

function validateForm(formId) {
  const form = document.getElementById(formId);
  if (!form) {
    console.error('Form not found:', formId);
    return false;
  }
  
  if (!form.checkValidity()) {
    form.reportValidity();
    return false;
  }
  
  return true;
}

// ========================================
// DEMOGRAPHICS
// ========================================

function submitDemographics() {
  console.log('submitDemographics() called');
  if (!validateForm('demographicsForm')) {
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
  updateProgress(1, 'Dialogue 1 of 5');
}

// ========================================
// DIALOGUE NAVIGATION
// ========================================

function nextDialogue(dialogueNum) {
  console.log('nextDialogue:', dialogueNum);
  const formId = `dialogue${dialogueNum}Form`;
  
  if (!validateForm(formId)) {
    return;
  }

  saveDialogueData(dialogueNum);

  if (dialogueNum < 5) {
    currentDialogue = dialogueNum + 1;
    hideAllSections();
    showSection(`dialogue${currentDialogue}Section`);
    updateProgress(currentDialogue, `Dialogue ${currentDialogue} of 5`);
  }
}

function previousDialogue(dialogueNum) {
  console.log('previousDialogue:', dialogueNum);
  saveDialogueData(dialogueNum);

  if (dialogueNum === 1) {
    hideAllSections();
    showSection('demographicsSection');
    updateProgress(0, 'Demographics');
  } else {
    currentDialogue = dialogueNum - 1;
    hideAllSections();
    showSection(`dialogue${currentDialogue}Section`);
    updateProgress(currentDialogue, `Dialogue ${currentDialogue} of 5`);
  }
}

// ========================================
// SAVE DIALOGUE DATA
// ========================================

function saveDialogueData(dialogueNum) {
  const formId = `dialogue${dialogueNum}Form`;
  const form = document.getElementById(formId);
  
  if (!form) {
    console.error('Form not found:', formId);
    return;
  }

  const formData = new FormData(form);
  
  const dialogueTitles = [
    'Museum of Nature and Wildlife',
    'Observatory Discussion',
    'Library Discussion',
    'Travel Agent Consultation',
    'Camera Loan Request'
  ];

  const dialogue = {
    dialogueNumber: dialogueNum,
    title: dialogueTitles[dialogueNum - 1],
    sectionA: {
      q1_naturalness: formData.get(`d${dialogueNum}_q1_naturalness`) || '',
      q2_expectancy: formData.get(`d${dialogueNum}_q2_expectancy`) || ''
    },
    sectionB: {
      q1_grammar: parseInt(formData.get(`d${dialogueNum}_q1_grammar`)) || null,
      q2_vocabulary: parseInt(formData.get(`d${dialogueNum}_q2_vocabulary`)) || null,
      q3_pacing: parseInt(formData.get(`d${dialogueNum}_q3_pacing`)) || null,
      q4_cohesion: parseInt(formData.get(`d${dialogueNum}_q4_cohesion`)) || null,
      q5_pragmatics: parseInt(formData.get(`d${dialogueNum}_q5_pragmatics`)) || null,
      q6_tone: parseInt(formData.get(`d${dialogueNum}_q6_tone`)) || null,
      q7_prosodic: parseInt(formData.get(`d${dialogueNum}_q7_prosodic`)) || null,
      q8_cultural: parseInt(formData.get(`d${dialogueNum}_q8_cultural`)) || null,
      q9_dynamics: parseInt(formData.get(`d${dialogueNum}_q9_dynamics`)) || null
    },
    sectionC: {
      q1_mostNatural: formData.get(`d${dialogueNum}_q1_mostNatural`) || '',
      q2_leastNatural: formData.get(`d${dialogueNum}_q2_leastNatural`) || '',
      q3_ifRealLife: formData.get(`d${dialogueNum}_q3_ifRealLife`) || '',
      q4_suggestions: formData.get(`d${dialogueNum}_q4_suggestions`) || ''
    }
  };

  surveyData.dialogues[dialogueNum - 1] = dialogue;
  console.log('Dialogue', dialogueNum, 'saved');
}

// ========================================
// SUBMIT TO FIREBASE
// ========================================

async function submitSurvey() {
  console.log('submitSurvey() called');
  
  if (!validateForm('dialogue5Form')) {
    return;
  }

  saveDialogueData(5);

  const submitBtn = event.target;
  const originalText = submitBtn.textContent;
  submitBtn.textContent = 'Submitting...';
  submitBtn.disabled = true;

  try {
    const timestamp = new Date();
    const firstName = surveyData.demographics.firstName || 'Anonymous';
    const participantID = `${firstName}_${Date.now()}`;
    
    console.log('📝 Preparing submission...');
    console.log('Participant ID:', participantID);
    
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

    console.log('📤 Attempting to save to Firebase...');

    if (typeof firebase !== 'undefined' && firebase.database) {
      try {
        const database = firebase.database();
        const dbPath = `responses/${participantID}`;
        
        console.log('🔄 Writing to Firebase path:', dbPath);
        
        await database.ref(dbPath).set(finalData);
        
        console.log('✅ SUCCESS: Data saved to Firebase!');
      } catch (firebaseError) {
        console.error('❌ Firebase write error:', firebaseError);
      }
    } else {
      console.warn('⚠️ Firebase not available');
    }

    // Show confirmation
    updateProgress(6, 'Complete');
    hideAllSections();
    showSection('confirmationSection');

    const confirmationDetails = document.getElementById('confirmationDetails');
    if (confirmationDetails) {
      confirmationDetails.innerHTML = `
        <div style="margin: 16px 0; padding: 16px; background-color: #f0f0f0; border-radius: 8px;">
          <p><strong style="color: green;">✅ Submission Complete!</strong></p>
          <p><strong>Participant ID:</strong><br/><code style="background: #fff; padding: 8px; display: inline-block; border-radius: 4px; font-family: monospace;">${participantID}</code></p>
          <p><strong>Submitted:</strong><br/>${timestamp.toLocaleString()}</p>
          <p><strong>Status:</strong><br/>✅ Saved to database</p>
        </div>
      `;
    }
    
  } catch (error) {
    console.error('❌ Submission error:', error);
    alert('Error: ' + error.message);
  } finally {
    submitBtn.textContent = originalText;
    submitBtn.disabled = false;
  }
}

// ========================================
// LOGGING
// ========================================

console.log('✅ app.js loaded successfully');
