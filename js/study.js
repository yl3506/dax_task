function createStudyPhase(functionIndex) {
  const func = EXPERIMENT_PARAMS.functions[functionIndex];
  const primitives = EXPERIMENT_PARAMS.concept_words;
  const wordColorMapping = EXPERIMENT_PARAMS.word_color_mapping;
  const isCompositionStage = functionIndex === EXPERIMENT_PARAMS.functions.length;

  // Determine the number of study examples based on the stage
  const numExamples = isCompositionStage ? 4 : 2; // 4 for composition stage
  const numPracticeTrials = isCompositionStage ? 2 : 1; // 2 practice trials for composition stage

  // Generate study examples
  const examples = generateUsageExamples(func, primitives, numExamples);
  // Store the examples for access in test.js
  if (!EXPERIMENT_PARAMS.study_examples) {
    EXPERIMENT_PARAMS.study_examples = [];
  }
  EXPERIMENT_PARAMS.study_examples[functionIndex] = examples;

  // Store correct outputs for feedback
  const correctOutputs = examples.map(example => ({
    input: example.input,
    output: func.func(example.args)
  }));

  // Add the correct outputs to the examples for reference
  for (let i = 0; i < examples.length; i++) {
    examples[i].output = correctOutputs[i].output;
  }

  // Create trials
  const studyTrials = [];

  // Display the first study example directly with the answer
  studyTrials.push({
    type: jsPsychHtmlButtonResponse,
    stimulus: function() {
      let html = `<h2>Training: Learn Function "${func.name}"</h2>`;
      html += renderPrimitives(primitives, wordColorMapping);
      html += '<h4>Example(s):</h4>';
      html += renderExampleWithSolution(examples[0]);
      return html;
    },
    choices: ['Continue']
  });

  // Participant responds to the second study example (with feedback)
  studyTrials.push({
    timeline: [
      createPracticeTrial(func, examples[1], correctOutputs[1], examples.slice(0, 1)),
    ],
    loop_function: function(data) {
      const lastTrialData = data.values()[0];
      const practiceAttempts = lastTrialData.practice_attempts || 0;
      if (lastTrialData.correct || practiceAttempts >= 2) {
        EXPERIMENT_PARAMS.practiceAttempts = 0; // Reset attempt counter
        return false; // Exit the loop
      } else {
        EXPERIMENT_PARAMS.practiceAttempts++; // Increment attempt counter
        return true; // Repeat the practice trial
      }
    }
  });

  return studyTrials;
}


function createPracticeTrial(func, example, correctOutput, referenceExamples) {
 return {
   timeline: [{
     type: jsPsychHtmlKeyboardResponse,
     stimulus: function() {
     let html = `<div id="practice-container">`;
     html += `<h2>Training: Function "${func.name}"</h2>`;
     html += renderPrimitives(EXPERIMENT_PARAMS.concept_words, EXPERIMENT_PARAMS.word_color_mapping);
     html += '<h4>Example(s):</h4>';

     // Display reference examples (the first study example)
     for (const ex of referenceExamples) {
       html += renderExampleWithSolution(ex);
     }

     html += `<h4>Try to produce the output for this new example:</h4>`;
     html += `<p>${example.input} → </p>`;

     // Include drag-and-drop interface 
     html += createDragAndDropInterface();
     html += `</div>`; // Close the practice-container div
     return html;
    },
     choices: "NO_KEYS",
     on_load: function() {
     setupDragAndDropPractice(correctOutput.output);
    },
     on_finish: function(data) {
       data.participant_response = data.participant_response || [];
       data.correct = data.correct || false;
       data.feedback_message = data.feedback_message || '';
     },
     data: {
     correct_output: correctOutput.output,
    },
   }],
 };
}
