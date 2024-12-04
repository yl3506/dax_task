
function surveyProcedure() {
    const survey_trials = [];

    // Strategy and comment question
   survey_trials.push({
       type: jsPsychSurveyText,
       questions: [
           {
               prompt: 'Please briefly describe the strategies you used during the study.',
               name: 'strategy',
               rows: 5,
               columns: 80
           },
           {
               prompt: 'Do you have any comments (e.g. technical issues, confusions, etc.)?',
               name: 'comment',
               rows: 5,
               columns: 80
           }
       ]
   });


    // Prolific ID
    survey_trials.push({
        type: jsPsychSurveyText,
        questions: [
            {prompt: 'What is your participant ID?', 
             name: 'prolific_id'}
        ],
        on_finish: function(data) {
            const prolificId = data.response.prolific_id;
            if (prolificId && prolificId.trim() !== '') {
                EXPERIMENT_PARAMS.participant_id = prolificId.trim();
            }
        }
    });

    // Demographic questions
    survey_trials.push({
        type: jsPsychSurveyText,
        questions: [
            {
                prompt: 'What is your gender?',
                name: 'gender',
                required: false
            },
            {
                prompt: 'What is your age?',
                name: 'age',
                required: false
            }
        ]
    });

    // Completion message
    survey_trials.push({
        type: jsPsychHtmlButtonResponse,
        stimulus: `<p>
                    Thank you for participating!
                    </p>
                    <p>
                    Click the "Finish Study" button to redirect to the completion page.
                    </p>`,
        choices: ['Finish Study'],
        on_finish: function() {
            // Redirect to completion URL
            window.location.href = 'https://www.prolific.co/completion-url';
        }
    });

    return survey_trials;
}