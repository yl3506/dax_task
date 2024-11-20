
function introductionProcedure() {
    // Generate the concept words and colors for the participant
    generateConceptWordsAndColors();

    // Generate a random sequence of 3 different colors for practice
    const colors = EXPERIMENT_PARAMS.colors;
    const practiceSequence = jsPsych.randomization.sampleWithoutReplacement(colors, 3);

    // Present the mapping to the participant
    const introduction = {
        type: jsPsychHtmlButtonResponse,
        stimulus: function() {
            let html = '<h2>Overview I</h2>';
            html += '<p>In the main study, you will use these new words, each associated with a symbol.</p>';
            html += renderPrimitives(EXPERIMENT_PARAMS.concept_words, EXPERIMENT_PARAMS.wordColorMapping);
            return html;
        },
        choices: ['Continue']
    };

    // Introduce the functions
    const function_intro = {
        type: jsPsychHtmlButtonResponse,
        stimulus: function() {
            let html = '<h2>Overview II</h2>';
            html += '<p>You will learn some operations that can be applied to the words and the symbols they correspond to.</p>';
            html += '<p>Here is a very general summary of the goal of each operation.</p>';
            html += '<p>You will see examples with answers and practice on your own in the main study.</p>';
            html += '<div style="text-align: center;">';
            for (const func of EXPERIMENT_PARAMS.functions) {
                html += `<p>"${func.name}" : ${func.description}</p>`;
            }
            html += '</div>';
            html += '<p>You do not need to memorize any words or symbols,</p>';
            html += '<p>because a reference of word-symbol associations will be displayed throughout the study.</p>';
            return html;
        },
        choices: ['Continue']
    };


    const practiceTrial = {
        type: jsPsychHtmlKeyboardResponse,
        stimulus: function() {
            let html = '<div id="practice-container">';
            html += '<h2>Practice Drag-And-Drop</h2>';
            html += '<p>In the main study, you will use this drag-and-drop interface to produce your response.</p>';
            html += "<p>So, let's practice now.</p>";
            html += '<p>Drag the symbols to produce the following sequence:</p>';
            html += '<div style="display: flex; justify-content: center;">';
            for (const color of practiceSequence) {
                html += `<img src="images/${color}.png" alt="${color}" style="width:${color_width}px; height:${color_height}px; margin-left: ${color_margin}px;">`;
            }
            html += '</div><h5>---------- Drag and arrange the items below -----------</h5>';
            html += createDragAndDropInterface();
            html += '</div>'; // Close the practice-container div
            return html;
        },
        choices: "NO_KEYS",
        on_load: function() {
            setupDragAndDropPractice(practiceSequence); // Use the randomized sequence
        },
        data: {
            practice_sequence: practiceSequence // Store the sequence in trial data
        },
        on_finish: function(data) {
            // Data is already handled in setupDragAndDropPractice
            // Optionally, store the practice sequence for data analysis
            data.practice_sequence = practiceSequence;
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
    const available_colors = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n'];

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
          description: 'repeat a word 3 times.',
          func: function1,
          numArgs: 1,
          label: 'func1'
        },
        {
          name: function_names[1],
          description: 'alternate between 2 words.',
          func: function2,
          numArgs: 2,
          label: 'func2'
        },
        {
          name: function_names[2],
          description: 'reverse the order of 2 words.',
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