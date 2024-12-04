
function introductionProcedure() {
    // Generate the concept words and colors for the participant
    generateConceptWordsAndColors();
    // Generate a random sequence of 3 different colors for practice
    const colors = EXPERIMENT_PARAMS.colors;
    const practiceSequence = jsPsych.randomization.sampleWithoutReplacement(colors, 3);

    // drag and drop interface
    const practiceTrial = {
        type: jsPsychHtmlKeyboardResponse,
        stimulus: function() {
            let html = '<div id="practice-container">';
            html += '<h2>Practice Drag-And-Drop</h2>';
            html += `<div class="content-container">`;
            html += `<p>
                    In the main study, 
                    you will use this drag-and-drop interface to produce your responses.
                    So, let's practice now. 
                    Drag the items below to produce this sequence:
                    </p>`;
            for (const color of practiceSequence) {
                html += `<img src="images/${color}.png" alt="${color}" style="width:${color_width}px; height:${color_height}px; margin-left: ${color_margin}px;">`;
            }
            html += '<h5><br>---------- Drag and arrange the items below -----------</h5>';
            html += createDragAndDropInterface();
            html += '</div></div>'; // Close the practice-container div
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
            data.practice_sequence = practiceSequence;
        }
    };

    // Present the mapping to the participant
    const introduction = {
        type: jsPsychHtmlButtonResponse,
        stimulus: function() {
            let html = '<h2>Instructions I</h2>';
            // html += `<div style="width: 100%; margin: auto;">`;
            html += `<div class="content-container">`;
            html += `<p>In this study, you will use these new words.
                    Each word is associated with an item/emoji.</p>`;
            html += renderPrimitives(EXPERIMENT_PARAMS.concept_words, EXPERIMENT_PARAMS.wordColorMapping);
            html += '</div>';
            return html;
        },
        choices: ['Continue']
    };

    // Introduce the functions
    const function_intro = {
        type: jsPsychHtmlButtonResponse,
        stimulus: function() {
            let html = '<h2>Instructions II</h2>';
            html += `<div class="content-container">
                        <p>You will learn operations that can be applied to the words and items they correspond to.</p>
                        <p>There will be <b>4 stages</b> in the study.</p>
                        <p>The first 3 stages will focus on single operations.</p>
                        <p>The final stage will focus on combining multiple operations together.</p>
                        <p><b>In each stage, there will be a training phase and a testing phase.</b></p>
                        <p>In each <b>training</b> phase, you will first see examples with correct answers, </p>
                        <p>and then practice on new examples (with feedback about the correctness of your response).</p>
                        <p>You will have a maximum of 3 attempts to answer each practice example.</p>
                        <p>In each <b>testing</b> phase, no feedback will be provided.</p>
                        <p>You will apply your understanding of the operations to new examples.</p>
                        <p>You will receive <b>bonus payment</b> for each testing example you answer correctly.</p>
                        <p>You do not need to memorize any word or item.</p>
                        <p>A reference of word-item associations will be displayed throughout the study.</p>
                    <div>`;
            return html;
        },
        choices: ['Continue']
    };


    // Comprehension check loop
    const interfacePractice = {
        timeline: [practiceTrial],
        loop_function: function(data) {
            const lastTrialData = data.values()[0];
            if (lastTrialData.correct) {
                return false;
            } else {
                // alert('Make sure to drag and arrange the items correctly.');
                return true;
            }
        }
    };

    return [interfacePractice, introduction, function_intro];
}



function generateConceptWordsAndColors() {
    // Total available words and colors
    let available_words = EXPERIMENT_PARAMS.available_words; 
    const available_colors = EXPERIMENT_PARAMS.available_colors;

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
          description: '',//'repeat a word 3 times.',
          func: function1,
          numArgs: 1,
          label: 'func1'
        },
        {
          name: function_names[1],
          description: '',//'alternate between 2 words.',
          func: function2,
          numArgs: 2,
          label: 'func2'
        },
        {
          name: function_names[2],
          description: '',//'reverse the order of 2 words.',
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