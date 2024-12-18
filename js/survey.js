
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
               columns: 80,
               required: true,
           },
           {
               prompt: 'Do you have any comments (e.g. technical issues, confusions, etc.)?',
               name: 'comment',
               rows: 5,
               columns: 80,
               required: false,
           }
       ]
   });


    // Prolific ID
    survey_trials.push({
        type: jsPsychSurveyText,
        questions: [
            {
                prompt: 'What is your participant ID?', 
                name: 'prolific_id', 
                required: true
            }
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
                required: true
            },
            {
                prompt: 'What is your age?',
                name: 'age',
                required: true
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
            // For testing, save data locally
            // saveDataLocally();
            // For deployment, save data to server
            saveDataToServer();
            // Redirect to completion URL
            setTimeout(function() {
                window.location.href = 'https://connect-researcher-help.cloudresearch.com/hc/en-us/articles/5046202939796-Project-Completion';
                if (EXPERIMENT_PARAMS.K <= 4){
                    window.location.href = 'https://connect.cloudresearch.com/participant/project/41B26CAA44/complete';
                } else {
                    window.location.href = 'https://connect.cloudresearch.com/participant/project/495580D514/complete';
                }
            }, 3000); // wait 3 seconds for data to save
        }
    });

    return survey_trials;
}