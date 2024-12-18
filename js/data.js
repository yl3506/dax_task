
// Function to save data locally (for testing)
function saveDataLocally() {
    const csv = jsPsych.data.get().csv();
    const blob = new Blob([csv], {type: 'text/csv'});
    const filename = `data_${EXPERIMENT_PARAMS.participant_id}.csv`;
    if (window.navigator.msSaveOrOpenBlob) {
        window.navigator.msSaveBlob(blob, filename);
    } else {
        const a = document.createElement('a');
        const url = URL.createObjectURL(blob);
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        setTimeout(function() {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        }, 0);
    }
}


function saveDataToServer() {
   const participantId = EXPERIMENT_PARAMS.participant_id;
   const startTime = EXPERIMENT_PARAMS.start_time.toISOString();
   const completionTime = new Date().toISOString();

   // Get the data as CSV
   const csvData = jsPsych.data.get().csv();

   // Prepare data object to send to server
   const dataToSave = {
       participant_id: participantId,
       start_time: startTime,
       completion_time: completionTime,
       csv_data: csvData
   };

   // Send data to server
   fetch('server/save_data.php', {
       method: 'POST',
       headers: {'Content-Type': 'application/json'},
       body: JSON.stringify(dataToSave)
   })
   .then(response => response.text())
   .then(result => {
       console.log('Data saved to server:', result);
   })
   .catch(error => {
       console.error('Error saving data to server:', error);
   });
}

// Function to process trial data
function processTrialData(trialData) {
    const data = [];

    // Iterate over trialData and extract necessary information
    for (const trial of trialData) {
        const trialInfo = {};

        // Collect common data
        trialInfo.trial_index = trial.trial_index;
        trialInfo.trial_type = trial.trial_type;
        trialInfo.time_elapsed = trial.time_elapsed;
        trialInfo.rt = trial.rt;

        // Practice attempts and max attempts
        if (trial.practiceAttempts !== undefined) {
            trialInfo.practice_attempts = trial.practiceAttempts;
            trialInfo.exceeded_max_attempts = trial.practiceAttempts >= 2;
        }

        // Input and output data
        trialInfo.input = trial.input || '';
        trialInfo.participant_response = trial.participant_response || [];
        trialInfo.correct_output = trial.correct_output || [];
        trialInfo.correct = trial.correct || false;
        trialInfo.catch_trial = trial.catch_trial || false;

        // Additional data (e.g., function names, arguments)
        if (trial.function_name) {
            trialInfo.function_name = trial.function_name;
        }
        if (trial.args) {
            trialInfo.args = trial.args;
        }
        if (trial.funcs) {
            trialInfo.funcs = trial.funcs;
        }
        if (trial.pattern) {
            trialInfo.pattern = trial.pattern;
        }

        // Push trialInfo to data array
        data.push(trialInfo);
    }

    return data;
}

// Utility function to generate unique participant IDs
function generateUniqueId() {
    return 'participant_' + Math.random().toString(36).substr(2, 9);
}