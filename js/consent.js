function consentProcedure() {
    const consent = {
        type: jsPsychHtmlButtonResponse,
        stimulus: `
            <h1>Consent Form</h1>
            <p>Please read the following information carefully...</p>
            <p>[Consent information goes here]</p>
        `,
        choices: ['Agree', 'Decline'],
        on_finish: function(data) {
            if (data.response === 1) { // 'Decline' is the second button, index 1
                jsPsych.abortExperiment(); // Updated method to end the experiment
            }
        }
    };

    return [consent];
}