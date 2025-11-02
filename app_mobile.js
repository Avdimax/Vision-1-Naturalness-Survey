// ========================================
// MOBILE-OPTIMIZED SURVEY APPLICATION
// ========================================
// Survey Data Storage (in-memory, no localStorage for sandbox compatibility)
const surveyData = {
  demographics: {},
  dialogues: [{}, {}, {}, {}, {}]
};

let currentDialogue = 0;

// ========================================
// TOUCH & INTERACTION OPTIMIZATION
// ========================================

// Prevent default mobile behaviors where needed
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
        warning.textContent = 'Note: Audio file not available on mobile. You can still complete the survey based on the dialogue transcript.';
        container.appendChild(warning);
      }
    });
  });

  // Prevent zoom on input focus (optional - improves UX but may affect accessibility)
  const inputs = document.querySelectorAll('input, textarea, select');
  inputs.forEach(input => {
    input.addEventListener('focus', function() {
      // For better mobile UX, you can handle focus here
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
  window.scrollTo({ top: 0, behavior: 'smooth' });
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
    // Smooth scroll to top
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
  // step: 0 = Demographics, 1-5 = Dialogues 1-5, 6 = Complete
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
// FORM VALIDATION & SUBMISSION
// ========================================

function validateForm(formId) {
  const form = document.getElementById(formId);
  if (!form) {
    console.error('Form not found:', formId);
    return false;
  }
  
  // Check HTML5 validation
  if (!form.checkValidity()) {
    // Show validation message
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

  // Collect demographic data
  surveyData.demographics = {
    firstName: document.getElementById('firstName').value.trim(),
    age: document.getElementById('age').value.trim(),
    nationality: document.getElementById('nationality').value.trim(),
    educationLevel: document.getElementById('educationLevel').value,
    nativeLanguageVariety: document.getElementById('nativeLanguageVariety').value
  };

  // Move to first dialogue
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

  // Save current dialogue data
  saveDialogueData(dialogueNum);

  // Move to next dialogue or finish
  if (dialogueNum < 5) {
    currentDialogue = dialogueNum + 1;
    hideAllSections();
    showSection(`dialogue${currentDialogue}Section`);
    updateProgress(currentDialogue, `Dialogue ${currentDialogue} of 5`);
  }
}

function previousDialogue(dialogueNum) {
  // Save current dialogue data (even if incomplete)
  saveDialogueData(dialogueNum);

  // Move to previous section
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
// SURVEY SUBMISSION
// ========================================

function submitSurvey() {
  if (!validateForm('dialogue5Form')) {
    return;
  }

  // Save final dialogue data
  saveDialogueData(5);

  // Prepare final data for export
  const timestamp = new Date().toISOString();
  const participantID = `${surveyData.demographics.firstName}_${Date.now()}`;
  
  const finalData = {
    submissionTimestamp: timestamp,
    participantID: participantID,
    demographics: surveyData.demographics,
    dialogues: surveyData.dialogues
  };

  // Export to JSON file
  exportToJSON(finalData, `${surveyData.demographics.firstName}_${Date.now()}.json`);

  // Show confirmation
  updateProgress(6, 'Complete');
  hideAllSections();
  showSection('confirmationSection');

  // Display confirmation details
  const confirmationDetails = document.getElementById('confirmationDetails');
  if (confirmationDetails) {
    confirmationDetails.innerHTML = `
      <strong>Participant ID:</strong> ${participantID}<br>
      <strong>Submission Time:</strong> ${new Date(timestamp).toLocaleString()}<br>
      <strong>File Name:</strong> ${surveyData.demographics.firstName}_${Date.now()}.json
    `;
  }
}

// ========================================
// EXPORT TO JSON
// ========================================

function exportToJSON(data, filename) {
  try {
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    
    // Check if browser supports Blob
    if (window.navigator && window.navigator.msSaveOrOpenBlob) {
      // IE 10+
      window.navigator.msSaveOrOpenBlob(blob, filename);
    } else {
      // Modern browsers
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      
      // Append to body to ensure it works on mobile
      document.body.appendChild(link);
      
      // Trigger download
      link.click();
      
      // Remove link and clean up
      document.body.removeChild(link);
      
      // Clean up the URL object
      setTimeout(() => {
        try {
          URL.revokeObjectURL(url);
        } catch (e) {
          console.warn('Could not revoke URL:', e);
        }
      }, 100);
    }
  } catch (error) {
    console.error('Error exporting JSON:', error);
    alert('Error saving file. Please ensure your browser supports file downloads.');
  }
}

// ========================================
// PERFORMANCE OPTIMIZATION
// ========================================

// Lazy load images if any (future enhancement)
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // Handle lazy loading here
        observer.unobserve(entry.target);
      }
    });
  });
}

// ========================================
// MOBILE-SPECIFIC OPTIMIZATIONS
// ========================================

// Disable pinch zoom on specific elements
document.addEventListener('touchmove', function(e) {
  if (e.touches.length > 1) {
    e.preventDefault();
  }
}, { passive: false });

// Improve keyboard handling on mobile
document.addEventListener('keyup', function(e) {
  if (e.key === 'Enter' && e.target.tagName === 'TEXTAREA') {
    // Allow line breaks in textarea
    return;
  }
});

// Handle viewport meta tag for better mobile support
function ensureViewportMetaTag() {
  let viewport = document.querySelector('meta[name="viewport"]');
  if (!viewport) {
    viewport = document.createElement('meta');
    viewport.name = 'viewport';
    viewport.content = 'width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes';
    document.head.appendChild(viewport);
  }
}

ensureViewportMetaTag();

// ========================================
// ERROR HANDLING
// ========================================

window.addEventListener('error', function(e) {
  console.error('Global error:', e.message);
  // You can send this to error tracking service if needed
});

window.addEventListener('unhandledrejection', function(e) {
  console.error('Unhandled promise rejection:', e.reason);
});

// ========================================
// INITIALIZATION
// ========================================

// Initialize on page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', function() {
    console.log('Survey application initialized for mobile');
  });
} else {
  console.log('Survey application initialized for mobile');
}
