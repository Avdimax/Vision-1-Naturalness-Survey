// ========================================
// FIREBASE-INTEGRATED SURVEY APPLICATION
// WITH AUTOMATIC DATA COLLECTION
// ========================================

// Firebase Configuration
// Replace with your actual Firebase config from Firebase Console
const firebaseConfig = {
  apiKey: "AIzaSyBz1mQ0Y0Y0Y0Y0Y0Y0Y0Y0Y0Y0Y0Y0Y0", // Get from Firebase Console > Project Settings
  authDomain: "survey-responses-65ef0.firebaseapp.com",
  databaseURL: "https://survey-responses-65ef0-default-rtdb.firebaseio.com",
  projectId: "survey-responses-65ef0",
  storageBucket: "survey-responses-65ef0.appspot.com",
  messagingSenderId: "000000000000",
  appId: "1:000000000000:web:0000000000000000000000"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// Survey Data Storage (in-memory)
const surveyData = {
  demographics: {},
  dialogues: [{}, {}, {}, {}, {}]
};

let currentDialogue = 0;

// ========================================
// TOUCH & INTERACTION OPTIMIZATION
// ========================================

document.addEventListener('DOMContentLoaded', function() {
  // Prevent long-press context menu on form inputs
  document.addEventListener('contextmenu', function(e) {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
      e.preventDefault();
      return false;
    }
  });

  // Handle orientation changes
  window.addEventListener('orientationchange', function() {
    setTimeout(function() {
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    }, 100);
  });

  // Improve mobile button responsiveness
  document.addEventListener('touchstart', function(e) {
    if (e.target.classList.contains('btn')) {
      e.target.style.opacity = '0.8';
    }
  }, false);

  document.addEventListener('touchend', function(e) {
    if (e.target.classList.contains('btn')) {
      e.target.style.opacity = '1';
    }
  }, false);

  // Audio error handling for mobile
  const audioPlayers = document.querySelectorAll('.audio-player');
  audioPlayers.forEach(player => {
    player.addEventListener('error', function(e) {
      console.warn('Audio file not found:', player.querySelector('source').src);
      const container = player.closest('.audio-container');
      if (container) {
        const warning = document.createElement('p');
        warning.style.color = 'var(--color-gray-300)';
        warning.style.fontSize = 'var(--font-size-sm)';
        warning.style.marginTop = 'var(--space-8)';
        warning.textContent = 'Note: Audio file not available. You can still complete the survey based on the dialogue transcript.';
        container.appendChild(warning);
      }
    });
  });

  // Smooth scrolling for focused inputs
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
// SECTION NAVIGATION
// ========================================

function startSurvey() {
  hideAllSections();
  showSection('demographicsSection');
  showProgressBar();
  updateProgress(0, 'Demographics');
}

function hideAllSections() {
  const sections = document.querySelectorAll('.section');
  sections.forEach(section => {
    section.classList.remove('active');
  });
}

function showSection(sectionId) {
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

// ========================================
// FORM VALIDATION
// ========================================

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
// DEMOGRAPHICS SECTION
// ========================================

function submitDemographics() {
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

  currentDialogue = 1;
  hideAllSections();
  showSection('dialogue1Section');
  updateProgress(1, 'Dialogue 1 of 5');
}

// ========================================
// DIALOGUE NAVIGATION
// ========================================

function nextDialogue(dialogueNum) {
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
}

// ========================================
// FIREBASE DATA SUBMISSION
// ========================================

async function submitSurvey() {
  if (!validateForm('dialogue5Form')) {
    return;
  }

  // Save final dialogue data
  saveDialogueData(5);

  // Show loading indicator
  const submitBtn = event.target;
  const originalText = submitBtn.textContent;
  submitBtn.textContent = 'Submitting...';
  submitBtn.disabled = true;

  try {
    // Generate unique identifiers
    const timestamp = new Date();
    const participantID = `${surveyData.demographics.firstName}_${Date.now()}`;
    const fileName = `${surveyData.demographics.firstName}_${Date.now()}.json`;
    
    // Prepare final data with metadata
    const finalData = {
      // Metadata
      participantID: participantID,
      fileName: fileName,
      submissionTimestamp: timestamp.toISOString(),
      submissionDateLocal: timestamp.toLocaleString(),
      
      // Demographics
      demographics: {
        firstName: surveyData.demographics.firstName,
        age: surveyData.demographics.age,
        nationality: surveyData.demographics.nationality,
        educationLevel: surveyData.demographics.educationLevel,
        nativeLanguageVariety: surveyData.demographics.nativeLanguageVariety
      },
      
      // All dialogues
      dialogues: surveyData.dialogues,
      
      // Submission metadata
      userAgent: navigator.userAgent,
      language: navigator.language,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    };

    // Save to Firebase Realtime Database
    const dbPath = `responses/${participantID}`;
    
    await database.ref(dbPath).set(finalData);
    
    console.log('✅ Data successfully saved to Firebase');
    console.log('Path:', dbPath);
    
    // Also download locally as backup
    downloadLocalBackup(finalData, fileName);
    
    // Show confirmation
    updateProgress(6, 'Complete');
    hideAllSections();
    showSection('confirmationSection');

    // Display confirmation details
    const confirmationDetails = document.getElementById('confirmationDetails');
    if (confirmationDetails) {
      confirmationDetails.innerHTML = `
        <div style="margin: 16px 0;">
          <p><strong>✅ Thank you for your submission!</strong></p>
          <p><strong>Participant ID:</strong><br/><code>${participantID}</code></p>
          <p><strong>Submission Time:</strong><br/>${timestamp.toLocaleString()}</p>
          <p><strong>File Name:</strong><br/><code>${fileName}</code></p>
          <p><strong>Status:</strong><br/>Securely stored in database</p>
        </div>
      `;
    }
    
  } catch (error) {
    console.error('❌ Error saving to Firebase:', error);
    alert('Error saving response to database. Please try again or contact support.\n\nError: ' + error.message);
    submitBtn.textContent = originalText;
    submitBtn.disabled = false;
  }
}

// ========================================
// LOCAL BACKUP DOWNLOAD
// ========================================

function downloadLocalBackup(data, filename) {
  try {
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setTimeout(() => {
      try {
        URL.revokeObjectURL(url);
      } catch (e) {
        console.warn('Could not revoke URL:', e);
      }
    }, 100);
  } catch (error) {
    console.error('Error downloading backup:', error);
  }
}

// ========================================
// PERFORMANCE & MOBILE OPTIMIZATION
// ========================================

// Prevent pinch zoom
document.addEventListener('touchmove', function(e) {
  if (e.touches.length > 1) {
    e.preventDefault();
  }
}, { passive: false });

// Smooth scrolling
html {
  scroll-behavior: smooth;
}

// Prevent accidental zoom on input
input, textarea, select {
  font-size: 16px;
  touch-action: manipulation;
}

// ========================================
// ERROR HANDLING
// ========================================

window.addEventListener('error', function(e) {
  console.error('Global error:', e.message);
});

window.addEventListener('unhandledrejection', function(e) {
  console.error('Unhandled promise rejection:', e.reason);
});

// ========================================
// INITIALIZATION
// ========================================

console.log('🚀 Survey Application Initialized');
console.log('📡 Firebase Database:', firebaseConfig.databaseURL);
console.log('Ready for responses...');
