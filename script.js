// Initialize jsPsych
const jsPsych = initJsPsych({
    use_webaudio: false,
    // on_finish: function() {
    //     // For testing, save data locally
    //     // saveDataLocally();
    //     // For deployment, save data to server
    //     saveDataToServer();

    //     // Redirection to completion page
    //     setTimeout(function() {
    //         window.location.href = 'https://connect-researcher-help.cloudresearch.com/hc/en-us/articles/5046202939796-Project-Completion';
    //         if (EXPERIMENT_PARAMS.K <= 4){
    //             window.location.href = 'https://connect.cloudresearch.com/participant/project/41B26CAA44/complete';
    //         } else {
    //             window.location.href = 'https://connect.cloudresearch.com/participant/project/495580D514/complete';
    //         }
    //     }, 2000); // wait 2 seconds for data to save
    // }

});


// Global experiment parameters
const EXPERIMENT_PARAMS = {
    K: 25,  // Number of novel concept words to teach
    F: 3,  // Number of novel functions to teach
    X: 2, // Number of test trials in single function stage
    available_words: ['dax', 'wif', 'lug', 'zem', 'fep', 'blicket', 'niz', 'kiki', 'rav', 'lunt', 'mib', 'vex', 'flim', 'nog', 'quip', 'blug', 'taz', 'snib', 'sorn', 'yim', 'blap', 'frip', 'glom', 'twib', 'zaf', 'mox', 'pif', 'clum', 'drab', 'torp', 'griv', 'klet', 'spiv', 'yub', 'zilp', 'worb', 'grack', 'flanx', 'truv', 'kelp'],
    available_colors: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', 'aa'],
    participant_id: generateUniqueId(),
    start_time: new Date(),
    practiceAttempts: 0,
    concept_words: [],
    colors: [],
    word_color_mapping: {},
    functions: [],
    labelToFunctionName: {},
    labelToFunctionDef: {},
    labelToFunctionArity: {},
    data: [],
};

// Build the experiment timeline
var timeline = [];

// Add the consent procedure
timeline.push(...consentProcedure());

// Add the introduction procedure
timeline.push(...introductionProcedure());

// Add the comprehension check
timeline.push(...comprehensionCheckProcedure());

// Create study and test phases for each function
const functionTimelines = [];
for (let i = 0; i < EXPERIMENT_PARAMS.functions.length; i++) {
 functionTimelines.push([
   ...createStudyPhase(i),
   ...createTestPhase(i)
 ]);
}

// Randomize the order of the first three stages
const randomizedFunctionTimelines = jsPsych.randomization.shuffle(functionTimelines);

// Add the randomized function stages to the timeline
for (const timelinePart of randomizedFunctionTimelines) {
 timeline.push(...timelinePart);
}

// Add the composition phase (Stage F+1)
timeline.push(...createCompositionPhase());

// Add the survey
timeline.push(...surveyProcedure());

// Start the experiment
jsPsych.run(timeline);


