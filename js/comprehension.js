
function comprehensionCheckProcedure() {
    // Define the comprehension trial
    const comprehension_trial = {
        type: jsPsychSurveyMultiChoice,
        preamble: function() {
            const lastTrialData = jsPsych.data.get().last(1).values()[0];
            if (lastTrialData && lastTrialData.feedback_message) {
                return '<p style="color:red;">' + lastTrialData.feedback_message + '</p>';
            } else {
                return '';
            }
        },
        questions: [
            {
                prompt: 'How many word-color associations are there?',
                name: 'num_concepts',
                options: [2, 4, 6],
                required: true
            },
            {
                prompt: 'Will you be able to refer to the word-color associations during the study?',
                name: 'primitives_reference',
                options: ['Yes', 'No'],
                required: true
            },
            {
                prompt: '<h5>The main study will begin on the next page.</h5>',
                options: [],
                required: false

            }
            // ... add other comprehension questions if needed ...
        ],
    };

    // Create a timeline node with a loop_function
    const comprehension_node = {
        timeline: [comprehension_trial],
        loop_function: function(data) {
            // Get the responses from the last trial
            const responses = data.values()[0].response;
            let all_correct = true;
            // Check each answer
            if (responses.num_concepts !== String(EXPERIMENT_PARAMS.K)) {
                all_correct = false;
            }
            if (responses.primitives_reference !== 'Yes') {
                all_correct = false;
            }
            // ... check other answers as needed ...

            if (!all_correct) {
                // Provide feedback to the participant
                data.values()[0].feedback_message = 'Some of your answers were incorrect. Please try again.';
                return true; // Repeat the comprehension trial
            } else {
                return false; // End the loop when all answers are correct
            }
        },
    };

    // Return the comprehension node as an array
    return [comprehension_node];
}