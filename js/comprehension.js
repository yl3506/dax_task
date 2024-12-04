
function comprehensionCheckProcedure() {
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
                prompt: '<p>Before we begin the study, we have some questions for you.</p>',
                options: [],
                required: false
            },
            {
                prompt: 'Will there be feedback in the <b>training</b> phase?',
                name: 'train_feedback',
                options: ['Yes', 'No'],
                required: true
            },
            {
                prompt: 'Will there be feedback in the <b>testing</b> phase?',
                name: 'test_feedback',
                options: ['Yes', 'No'],
                required: true
            },
            {
                prompt: 'Will you be able to see a reference of the word-item associations during the study?',
                name: 'primitives_reference',
                options: ['Yes', 'No'],
                required: true
            },
            {
                prompt: '<p>The study will begin on the next page.</p>',
                options: [],
                required: false
            }
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
            if (responses.train_feedback !== 'Yes') {
                all_correct = false;
            }
            if (responses.test_feedback !== 'No') {
                all_correct = false;
            }
            if (responses.primitives_reference !== 'Yes') {
                all_correct = false;
            }
            if (!all_correct) {
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