
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

// Function to save data to server
function saveDataToServer() {
    const data = jsPsych.data.get().csv();
    fetch('server/save_data.php', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
            filename: `data_${EXPERIMENT_PARAMS.participant_id}.csv`,
            filedata: data
        })
    })
    .then(response => response.text())
    .then(result => {
        console.log('Data saved to server:', result);
    })
    .catch(error => {
        console.error('Error saving data to server:', error);
    });
}

// Utility function to generate unique participant IDs
function generateUniqueId() {
    return 'participant_' + Math.random().toString(36).substr(2, 9);
}