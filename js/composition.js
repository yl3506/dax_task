
/*
Composition examples (predefined):

Study:
arg1 func1 func3 arg2 -> ((arg1 func1) func3 arg2) -> arg2 arg1 arg1 arg1
arg1 func3 arg2 func1 -> (arg1 func3 (arg2 func1)) -> arg2 arg2 arg2 arg1
arg1 func3 arg2 func2 arg3 -> (arg1 func3 (arg2 func2 arg3)) -> arg2 arg3 arg2 arg1
arg1 func2 arg2 func3 arg3 -> ((arg1 func2 arg2) func3 arg3) -> arg3 arg1 arg2 arg1

Test:
arg1 func1 func3 arg2 -> ((arg1 func1) func3 arg2) -> arg2 arg1 arg1 arg1
arg1 func3 arg2 func1 -> (arg1 func3 (arg2 func1)) -> arg2 arg2 arg2 arg1
arg1 func3 arg2 func2 arg3 -> (arg1 func3 (arg2 func2 arg3)) -> arg2 arg3 arg2 arg1
arg1 func2 arg2 func3 arg3 func1 -> ((arg1 func2 arg2) func3 (arg3 func1)) -> arg3 arg3 arg3 arg1 arg2 arg1
arg1 func2 arg1 func3 arg1 func1 -> ((arg1 func2 arg1) func3 (arg1 func1)) -> arg1 arg1 arg1 arg1 arg1 arg1

Randomly assign arguments for the examples.
Argument
Note that the test examples need to differ from the study examples for at least 1 primitive.
There are 2 catch trials in the composition test phase.
*/

function createCompositionPhase() {
  const primitives = EXPERIMENT_PARAMS.concept_words;
  const functions = EXPERIMENT_PARAMS.functions;

  // Generate composition study examples (predefined compositions)
  const examples = generateCompositionExamples(functions, primitives);

  // Store the examples for access in test phase
  EXPERIMENT_PARAMS.composition_study_examples = examples;

  // Combine previous study examples
  const allStudyExamples = [];
  for (const stageExamples of EXPERIMENT_PARAMS.study_examples) {
    allStudyExamples.push(...stageExamples.slice(0, 2)); // First 2 examples from each stage
  }

  // Create trials for the composition phase
  const compositionTrials = [];

  // Display the first 2 study examples directly with the answer
  compositionTrials.push({
    type: jsPsychHtmlButtonResponse,
    stimulus: function() {
      let html = `<h3>Training: Combining Operations</h3>
                  <div class="content-container">
                    <p>
                    Learn how to apply multiple operations together.
                    </p>
                    <p>
                    The <b> right order</b> of applying the operations is: 
                    first apply "${EXPERIMENT_PARAMS.functions[0].name}" if it exists, 
                    then "${EXPERIMENT_PARAMS.functions[1].name}", 
                    finally "${EXPERIMENT_PARAMS.functions[2].name}". 
                    </p>
                    <p>
                    Let's go through 3 examples and 1 practice (with feedback).
                    </p>
                    <p>
                    At the bottom are 3 examples of applying multiple operations and their correct answers.
                    </p>
              `;
      html += renderPrimitives();
      // Display first 2 study examples with solutions
      html += `<br>`;
      html += renderAllExamplesWithSolutions(allStudyExamples);
      html += `<br>`;
      html += `<b>${renderAllExamplesWithSolutions(examples.slice(0, 3))}</b>`;
      html += `<br>`;
      html += `</div>`;
      return html;
    },
    choices: ['Continue'],
  });

  // Participant responds to the last 1 study example (with feedback)
  for (let i = 3; i < 4; i++) {
    const referenceExamples = [];
    referenceExamples.push(...allStudyExamples);
    referenceExamples.push(...examples.slice(0, i));
    compositionTrials.push({
      timeline: [
        createPracticeTrialForComposition(examples[i], referenceExamples)
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
  }

  // Add test phase
  const testTrials = createCompositionTestPhase(examples);
  compositionTrials.push(...testTrials);
  return compositionTrials;
}



function createPracticeTrialForComposition(example, referenceExamples) {
 let practiceAttempts = 0;

 return {
   timeline: [{
     type: jsPsychHtmlKeyboardResponse,
     stimulus: function() {
      let html = `<div id="practice-container">`;
      html += `<h3>Training: Combining Operations</h3>`;
      html += `<div class="content-container">`;
      html += renderPrimitives();
      // Display reference examples
      html += `<br>`;
      html += renderAllExamplesWithSolutions(referenceExamples);
      html += `<br>`;
      html += `<p>
              Let's practice. 
              Keep in mind the right order to apply the operations: 
              "${EXPERIMENT_PARAMS.functions[0].name}", then "${EXPERIMENT_PARAMS.functions[1].name}", then "${EXPERIMENT_PARAMS.functions[2].name}"
              </p> 
              <p>
              Try to produce the output for this new example below. 
              You will receive feedback.
              </p>`;
      html += `<p><b>${example.input} → </b></p>`;
      html += createDragAndDropInterface();
      html += `</div></div>`; // Close the container div
      return html;
    },
     choices: "NO_KEYS",
     on_load: function() {
      setupDragAndDropPractice(example.output);
    },
    data: {
        input: example.input,
        correct_output: example.output,
        practiceAttempts: EXPERIMENT_PARAMS.practiceAttempts,
        trial_type_custom: 'practice',
        function_name: example.funcs,
        args: example.args,
        funcs: example.funcs || null,
        pattern: example.pattern || null
    },
     on_finish: function(data) {
       data.participant_response = data.participant_response || [];
       data.correct = data.correct || false;
       data.is_correct = data.isCorrect || false;
       data.skip_example = data.skipExample || false;
       data.feedback_message = data.feedback_message || '';
       data.rt = jsPsych.getTotalTime() - data.time_elapsed; // Time spent on this trial
       practiceAttempts++;
       if (data.correct) {
         // Add the completed example to referenceExamples
         referenceExamples.push({
           input: example.input,
           output: example.output,
           funcs: example.funcs,
           args: example.args,
         });
       }
     },
   }],
 };
}


function createCompositionTestPhase(studyExamples) {
 const primitives = EXPERIMENT_PARAMS.concept_words;
 const functions = EXPERIMENT_PARAMS.functions;

 // Collect all previous study examples
 const allStudyExamples = [];
 for (const stageExamples of EXPERIMENT_PARAMS.study_examples) {
   allStudyExamples.push(...stageExamples.slice(0, 2)); // First 2 examples from each stage
 }
 allStudyExamples.push(...studyExamples); // Include the composition study examples

 // Generate test items
 let testItems = generateCompositionTestItems(functions, primitives, studyExamples);

  // Insert 2 catch trials randomly
  const catchTrials = studyExamples.slice(2, 4).map(example => ({
    input: example.input,
    args: example.args,
    funcs: example.funcs,
    output: example.output,
    catch_trial: true
  }));
  for (const catchTrial of catchTrials) {
    const randomIndex = Math.floor(Math.random() * testItems.length);
    testItems.splice(randomIndex, 0, catchTrial);
  }

 // Create test trials
 const testTrials = [];
 // Instructions
 testTrials.push({
   type: jsPsychHtmlButtonResponse,
   stimulus: `<h3 style="color: red">Testing: Combining Operations</h3>
              <div class="content-container">
                <p>Now you have an understanding of how combination of operations works.</p>
                <p>Let's apply combination of operations to new items.</p>
                <p>A reference of the word-item associations and all training examples you saw previously will be displayed.</p>
                <p>You may see example(s) identical to the ones you saw from training.</p>
                <p>In this phase, <b>no feedback</b> will be provided about your response's correctness.</p> 
                <p>You will receive <b>bonus</b> payment for every example you answer correctly in this testing phase.</p>
              </div>
              `,
   choices: ['Start'],
 });
 // Test trials
 for (const item of testItems) {
   testTrials.push(createCompositionTestTrial(item, allStudyExamples)); // Pass allStudyExamples
 }

 return testTrials;
}


function createCompositionTestTrial(item, referenceExamples) {
     return {
       type: jsPsychHtmlKeyboardResponse,
       stimulus: function() {
         let html = `<div id="composition-test-container">`;
         html += `<div class="content-container">`;
         html += `<h3 style="color: red">Testing: Combining Operations</h3>`;
         html += renderPrimitives();
         html += `<br>`;
         // Display all study examples with solutions
         html += renderAllExamplesWithSolutions(referenceExamples);
         html += `<br>`;
         html += `<p>
                  Note the right order to apply the operations: 
                  "${EXPERIMENT_PARAMS.functions[0].name}", then "${EXPERIMENT_PARAMS.functions[1].name}", then "${EXPERIMENT_PARAMS.functions[2].name}". 
                  Please produce the output for this example:
                  </p>
                  `;
          html += `<p style="color: red"><b>${item.input} → </b></p>`;
          html += createDragAndDropInterface();
          html += `</div></div>`; // Close the container div
          return html;
       },
    choices: "NO_KEYS",
    data: {
            input: item.input,
            correct_output: item.output,
            catch_trial: item.catch_trial || false,
            trial_type_custom: 'test',
            function_name: item.funcs,
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
      data.correct_output = data.correct_output || [];
      data.rt = jsPsych.getTotalTime() - data.time_elapsed; // Time spent on trial
    }
  };
}


function generateCompositionExamples(functions, primitives) {
  const examples = [];

  const compositions = [
    { funcs: ['func1', 'func3'], pattern: '((arg1 func1) func3 arg2)', arguments: [1, 2]},
    { funcs: ['func3', 'func1'], pattern: '(arg1 func3 (arg2 func1))', arguments: [1, 2]},
    { funcs: ['func3', 'func2'], pattern: '(arg1 func3 (arg2 func2 arg3))', arguments: [2, 0, 1]},
    { funcs: ['func2', 'func3'], pattern: '((arg1 func2 arg2) func3 arg3)', arguments: [2, 0, 1] },
  ];

  for (const comp of compositions) {
    const numArgsNeeded = comp.pattern.match(/arg\d+/g).length;

    if (primitives.length >= numArgsNeeded) {
      const args = [];
      for (const idx of comp.arguments){
        args.push(primitives[idx]);
      }
      const input = buildCompositionInputFromPattern(comp.pattern, args, comp.funcs);
      const output = computeCompositionOutput(comp.pattern, args);
      examples.push({
        input: input,
        output: output,
        funcs: comp.funcs,
        args: args,
        pattern: comp.pattern
      });
    } else {
      console.error(`Not enough primitives to generate example for composition ${comp.pattern}. Need ${numArgsNeeded}, but have ${primitives.length}`);
    }
  }
  return examples;
}


function generateCompositionTestItems(functions, primitives, studyExamples) {
  const items = [];

  // Predefined compositions for test examples
   const compositions = [
    { funcs: ['func1', 'func3'], pattern: '((arg1 func1) func3 arg2)' },
    { funcs: ['func3', 'func1'], pattern: '(arg1 func3 (arg2 func1))' },
    { funcs: ['func3', 'func2'], pattern: '(arg1 func3 (arg2 func2 arg3))' },
    { funcs: ['func2', 'func3', 'func1'], pattern: '((arg1 func2 arg2) func3 (arg3 func1))' },
    { funcs: ['func2', 'func3', 'func1'], pattern: '((arg1 func2 arg1) func3 (arg1 func1))' },
  ];

  for (const comp of compositions) {
    const numArgsNeeded = comp.pattern.match(/arg\d+/g).length;

    // Generate args that differ from study examples by at least 2 arguments
    let args = [];
    let maxAttempts = 100;
    let attempts = 0;
    do {
      args = selectPrimitives(primitives, numArgsNeeded);
      attempts++;
    } while (!argsDifferEnough(args, studyExamples, 2) && attempts < maxAttempts);
    if (attempts >= maxAttempts) {
      console.warn('Could not find suitable args that differ from study examples.');
    }

    const input = buildCompositionInputFromPattern(comp.pattern, args, comp.funcs);
    const output = computeCompositionOutput(comp.pattern, args);

    items.push({
      input: input,
      output: output,
      funcs: comp.funcs,
      args: args,
      pattern: comp.pattern,
    });
  }
  return items;
}



function buildCompositionInputFromPattern(pattern, args, funcLabels) {
  let input = pattern;
  // Replace 'arg1', 'arg2', etc., with actual arguments
  for (let i = 0; i < args.length; i++) {
    const argPlaceholder = `arg${i + 1}`;
    const argValue = args[i];
    input = input.replace(new RegExp(`\\b${argPlaceholder}\\b`, 'g'), argValue);
  }
  // Replace 'func1', 'func2', etc., with actual function names
  for (const funcLabel of funcLabels) {
    const funcName = EXPERIMENT_PARAMS.labelToFunctionName[funcLabel];
    input = input.replace(new RegExp(`\\b${funcLabel}\\b`, 'g'), funcName);
  }
  input = input.replaceAll('(', '');
  input = input.replaceAll(')', '');
  return input.trim();
}


function computeCompositionOutput(pattern, args) {
    if (typeof pattern !== 'string') {
        console.error('pattern is not a string:', pattern);
        return [];
    }
    const ast = parsePattern(pattern);
    const output = evaluateAST(ast, args, EXPERIMENT_PARAMS.labelToFunctionDef, EXPERIMENT_PARAMS.labelToFunctionArity);
    return output;
}


function composeFunctions(funcLabels, args) {
  let currentOutput = args[0];
  let argIndex = 1; // Start from the second argument
  for (let i = 0; i < funcLabels.length; i++) {
    const funcLabel = funcLabels[i];
    const func = EXPERIMENT_PARAMS.labelToFunctionDef[funcLabel];
    const numArgs = EXPERIMENT_PARAMS.labelToFunctionArity[funcLabel];
    let funcArgs;
    if (numArgs === 1) {
      funcArgs = [currentOutput];
    } else if (numArgs === 2) {
      const arg2 = args[argIndex];
      argIndex += 1;
      funcArgs = [currentOutput, arg2];
    } else {
      console.error(`Unsupported number of arguments for function ${funcLabel}: ${numArgs}`);
      return currentOutput;
    }
    currentOutput = func(funcArgs);
  }

  return currentOutput;
}