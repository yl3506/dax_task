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
      let html = `<h3>Training: Operation "${func.name}"</h3>
                <h5>Learn how to apply the operation "${func.name}" to words.</h5>
                <h5>The "${func.name}" operation will ${func.description}</h5>
                <h5>Let's go through some examples and their answers.</h5>
                `;
      html += renderPrimitives(primitives, wordColorMapping);
      html += `<p>`;
      html += renderExampleWithSolution(examples[0]);
      html += '</p>';
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
     html += `<h3>Training: Operation "${func.name}"</h3>`;
     html += renderPrimitives(EXPERIMENT_PARAMS.concept_words, EXPERIMENT_PARAMS.word_color_mapping);
     // Display reference examples (the first study example)
     html += renderAllExamplesWithSolutions(referenceExamples);
     html += `<h5>Try to produce the output for this new example:</h5>`;
     html += `<p>${example.input} → </p>`;
     // Include drag-and-drop interface 
     html += createDragAndDropInterface();
     html += `</div>`; 
     return html;
    },
     choices: "NO_KEYS",
     on_load: function() {
     setupDragAndDropPractice(correctOutput.output);
    },
    data: {
        correct_output: correctOutput.output,
        input: example.input,
        practiceAttempts: EXPERIMENT_PARAMS.practiceAttempts,
        trial_type_custom: 'practice',
        function_name: func.name,
        args: example.args,
        funcs: example.funcs || null,
        pattern: example.pattern || null
    },
     on_finish: function(data) {
       data.participant_response = data.participant_response || [];
       data.correct = data.correct || false;
       data.rt = jsPsych.getTotalTime() - data.time_elapsed; // Time spent on this trial
     },
     
   }],
 };
}
