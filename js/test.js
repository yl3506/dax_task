
function createTestPhase(functionIndex) {
  const func = EXPERIMENT_PARAMS.functions[functionIndex];
  const primitives = EXPERIMENT_PARAMS.concept_words;
  const wordColorMapping = EXPERIMENT_PARAMS.word_color_mapping;

  // Retrieve the study examples from EXPERIMENT_PARAMS
  const examples = EXPERIMENT_PARAMS.study_examples[functionIndex];

  // Generate test items
  const testItems = generateTestItems(func, primitives, EXPERIMENT_PARAMS.X, examples);

  // Insert the catch trial at a random position
  const catchTrial = {
    input: examples[1].input, // Use the second study example
    args: examples[1].args,
    output: examples[1].output,
    catch_trial: true
  };
  const randomIndex = Math.floor(Math.random() * testItems.length);
  testItems.splice(randomIndex, 0, catchTrial);

  // Create trials
  const testTrials = [];
  // Instructions
  testTrials.push({
    type: jsPsychHtmlButtonResponse,
    stimulus: `<h3>Testing: Operation "${func.name}"</h3>
              <h5>Let's apply operation "${func.name}" to some new words.</h5>
              <h5>No feedback will be provided.</h5>`,
    choices: ['Continue']
  });

  // Test trials
  for (const item of testItems) {
    testTrials.push(createTestTrial(func, item, examples.slice(0, 2)));
  }

  return testTrials;
}


function createTestTrial(func, item, referenceExamples) {
  const correctOutput = item.output; // Define correctOutput in outer scope
  
  return {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: function() {
      let html = `<div id="test-container">`;
      html += `<h3>Testing: Operation "${func.name}"</h3>`;
      html += renderPrimitives(EXPERIMENT_PARAMS.concept_words, EXPERIMENT_PARAMS.word_color_mapping);
      // Display the 2 study examples with solutions
      html += renderAllExamplesWithSolutions(referenceExamples);
      html += `<h5>Please produce the output for this new example:`;
      if (item.catch_trial) {
        html += ` *</h5>`;
      }
      else{
        html += `</h5>`;
      }
      html += `<p>${item.input} → </p>`;
      // Include drag-and-drop interface
      html += createDragAndDropInterface();
      html += `</div>`; // Close the test-container div
      return html;
    },
    choices: "NO_KEYS",
    data: {
            input: item.input,
            correct_output: item.output,
            catch_trial: item.catch_trial || false,
            trial_type_custom: 'test',
            function_name: func.name,
            args: item.args,
            funcs: item.funcs || null,
            pattern: item.pattern || null
        },
    on_load: function() {
        setupDragAndDropTest(item.output);
    },
    on_finish: function(data) {
        data.participant_response = data.participant_response || [];
        data.correct = data.correct || false;
        data.rt = jsPsych.getTotalTime() - data.time_elapsed; // Time spent on this trial
    }
  };
}




function generateTestItems(func, primitives, numItems, studyExamples) {
 const items = [];
 const usedInputs = new Set(studyExamples.map(ex => ex.input));

 // Determine the number of arguments the function takes
 const numArgs = func.func === function1 ? 1 : 2;

 // Generate all possible combinations of primitives for the function
 let possibleArgs = [];

 if (numArgs === 1) {
   // For single-argument functions
   possibleArgs = primitives.map(p => [p]); // Wrap each primitive in an array
 } else {
   // For two-argument functions
   possibleArgs = getAllPrimitivePairs(primitives);
 }

 // Filter out combinations that were used in study examples
 const testArgsList = possibleArgs.filter(args => {
   const input = args.length === 1 ? `${args[0]} ${func.name}` : args.join(` ${func.name} `);
   return !usedInputs.has(input);
 });

 // Shuffle and select required number of test items
 const shuffledArgsList = jsPsych.randomization.shuffle(testArgsList);

 // Ensure we have enough test items
 const itemsToGenerate = Math.min(numItems, shuffledArgsList.length);

 for (let i = 0; i < itemsToGenerate; i++) {
   const args = shuffledArgsList[i];
   const input = args.length === 1 ? `${args[0]} ${func.name}` : args.join(` ${func.name} `);
   const output = func.func(args);
   items.push({
     input: input,
     args: args,
     output: output,
   });
 }

 return items;
}

