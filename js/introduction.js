
function introductionProcedure() {
    // Generate the concept words and colors for the participant
    generateConceptWordsAndColors();

    // Present the mapping to the participant
    const introduction = {
        type: jsPsychHtmlButtonResponse,
        stimulus: function() {
            let html = '<h2>Overview I</h2>';
            html += '<p>In the main study, these new words each has an associated color.</p>';
             html += '<div style="text-align: center; display: flex; flex-wrap: wrap; justify-content: center;">';
            for (const word of EXPERIMENT_PARAMS.concept_words) {
                const color = EXPERIMENT_PARAMS.word_color_mapping[word];
                html += `<div style="width: 20%; text-align: center; margin-bottom: 10px;">
                         <p>${word}</p>
                         <img src="images/${color}.png" alt="${color}" style="width:48px; height:27px;">
                       </div>`;
            }
            html += '</div>';
            return html;
        },
        choices: ['Continue']
    };

    // Introduce the functions
    const function_intro = {
        type: jsPsychHtmlButtonResponse,
        stimulus: function() {
            let html = '<h2>Overview II</h2>';
            html += '<p>You will learn new functions that can be applied on the words.</p>';
            html += '<div style="text-align: center;">';
            for (const func of EXPERIMENT_PARAMS.functions) {
                html += `<p>"${func.name}" : ${func.description}</p>`;
            }
            html += '</div>';
            return html;
        },
        choices: ['Continue']
    };

    // Practice drag-and-drop interface
    const practiceTrial = {
        type: jsPsychHtmlKeyboardResponse,
        stimulus: function() {
            let html = '<div id="practice-container">';
            html += '<h2>Practice Drag-And-Drop</h2>';
            html += '<p>In the main study, you will use this drag-and-drop interface.</p>'
            html += "<p>So, let's practice now."
            html += '<p>Drag the colored circles to produce a sequence of "red, yellow, purple".</p>';
            html += createDragAndDropInterface();
            html += '</div>'; // Close the practice-container div
            return html;
        },
        choices: "NO_KEYS",
        on_load: function() {
            setupDragAndDropPractice(['red', 'yellow', 'purple']); // Example correct output
        },
        on_finish: function(data) {
            // Check if participant arranged 'red' and 'green' in any order
            const response = data.participant_response;
            if (response.includes('red') && response.includes('yellow') && response.includes('purple')) {
                data.correct = true;
            } else {
                data.correct = false;
            }
        }
    };

    // Comprehension check loop
    const interfacePractice = {
        timeline: [practiceTrial],
        loop_function: function(data) {
            const lastTrialData = data.values()[0];
            if (lastTrialData.correct) {
                return false;
            } else {
                alert('Make sure to drag and arrange the circles correctly.');
                return true;
            }
        }
    };

    return [interfacePractice, introduction, function_intro];
}



function generateConceptWordsAndColors() {
    // Total available words and colors
    let available_words = ['dax', 'wif', 'lug', 'kav', 'zem', 'fep', 'blicket', 'niz', 'kiki'];
    const available_colors = ['red', 'green', 'blue', 'yellow', 'orange', 'purple'];

    // Shuffle the available words
    available_words = jsPsych.randomization.shuffle(available_words);

    // Select K words for primitives (concept words)
    EXPERIMENT_PARAMS.concept_words = available_words.slice(0, EXPERIMENT_PARAMS.K);

    // Select K+2 colors (2 distractors)
    EXPERIMENT_PARAMS.colors = jsPsych.randomization.sampleWithoutReplacement(available_colors, EXPERIMENT_PARAMS.K + 2);

    // Map K words to colors
    for (let i = 0; i < EXPERIMENT_PARAMS.K; i++) {
        EXPERIMENT_PARAMS.word_color_mapping[EXPERIMENT_PARAMS.concept_words[i]] = EXPERIMENT_PARAMS.colors[i];
    }

    // Get remaining words for function names
    const remaining_words = available_words.slice(EXPERIMENT_PARAMS.K);

    // Ensure there are enough words for function names
    if (remaining_words.length < EXPERIMENT_PARAMS.F) {
        console.error('Not enough words to assign to functions.');
        return;
    }

    // Select function names
    const function_names = remaining_words.slice(0, EXPERIMENT_PARAMS.F);

    // Define the available functions with labels and numArgs
    const available_functions = [
        {
          name: function_names[0],
          description: 'Repeat the word.',
          func: function1,
          numArgs: 1,
          label: 'func1'
        },
        {
          name: function_names[1],
          description: 'Alternate the words.',
          func: function2,
          numArgs: 2,
          label: 'func2'
        },
        {
          name: function_names[2],
          description: 'Reverse the words.',
          func: function3,
          numArgs: 2,
          label: 'func3'
        },
    ];

    // Assign functions to EXPERIMENT_PARAMS
    EXPERIMENT_PARAMS.functions = available_functions.slice(0, EXPERIMENT_PARAMS.F);

    // Save function definitions and assign labels
    for (let i = 0; i < EXPERIMENT_PARAMS.functions.length; i++) {
        const func = EXPERIMENT_PARAMS.functions[i];
        EXPERIMENT_PARAMS.labelToFunctionName[func.label] = func.name;
        EXPERIMENT_PARAMS.labelToFunctionDef[func.label] = func.func;
        EXPERIMENT_PARAMS.labelToFunctionArity[func.label] = func.numArgs;
    }

    console.log('Word-color mapping:', EXPERIMENT_PARAMS.word_color_mapping);
    console.log('Word-function mapping:', EXPERIMENT_PARAMS.labelToFunctionName);
}