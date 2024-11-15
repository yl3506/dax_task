// Initialize jsPsych
const jsPsych = initJsPsych({
    use_webaudio: false,
    on_finish: function() {
        // For testing, save data locally
        saveDataLocally();

        // For deployment, save data to server
        // saveDataToServer();
    }
});

// Global experiment parameters
const EXPERIMENT_PARAMS = {
    K: 4,  // Number of novel concept words to teach
    // N: 9, // Total pool of concept words
    // M: 6,  // Total pool of colors
    F: 3,  // Number of novel functions to teach
    // T: 3,  // Total pool of functions
    X: 2, // Number of test trials in single function stage
    // Y: 5, // Number of test trals in composition stage
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


