
/*
Composition examples (predefined):

Study:
arg1 func1 func3 arg2 -> ((arg1 func1) func3 arg2) -> arg2 arg1 arg1 arg1
arg1 func3 arg2 func1 -> (arg1 func3 (arg2 func1)) -> arg2 arg2 arg2 arg1
arg1 func3 arg2 func2 arg3 -> (arg1 func3 (arg2 func2 arg3)) -> arg2 arg3 arg2 arg1
arg1 func2 arg2 func3 arg3 -> ((arg1 func2 arg2) func3 arg3) -> arg3 arg2 arg1 arg2

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
  // allStudyExamples.push(...examples.slice(0, 2)); // First 2 examples from composition stage

  // Create trials for the composition phase
  const compositionTrials = [];

  // Display the first 2 study examples directly with the answer
  compositionTrials.push({
    type: jsPsychHtmlButtonResponse,
    stimulus: function() {
      let html = `<h2>Training: Learn Function Compositions</h2>`;
      html += renderPrimitives();
      html += '<h4>Example(s):</h4>';
      // Display first 2 study examples with solutions
      html += renderAllExamplesWithSolutions(allStudyExamples);
      html += renderAllExamplesWithSolutions(examples.slice(0, 2));
      return html;
    },
    choices: ['Continue']
  });

  // Participant responds to the last 2 study examples (with feedback)
  for (let i = 2; i < 4; i++) {
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
          // lastTrialData.practice_attempts = practiceAttempts + 1;
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
      html += `<h2>Training: Function Compositions</h2>`;
      html += renderPrimitives();
      html += '<h4>Example(s):</h4>';

      // Display reference examples
      html += renderAllExamplesWithSolutions(referenceExamples);

      html += `<h4>Try to produce the output for this new example:</h4>`;
      html += `<p>${example.input} → </p>`;

      // Include drag-and-drop interface
      html += createDragAndDropInterface();

      html += `</div>`; // Close the practice-container div
      return html;
    },
     choices: "NO_KEYS",
     on_load: function() {
      setupDragAndDropPractice(example.output);
    },
     on_finish: function(data) {
       data.participant_response = data.participant_response || [];
       data.correct = data.correct || false;
       data.feedback_message = data.feedback_message || '';
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
     data: {
      correct_output: example.output,
    }
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
   stimulus: `<h2>Testing: Apply Function Compositions</h2>`,
   choices: ['Continue']
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
         html += `<h2>Testing: Function Compositions</h2>`;
         html += renderPrimitives();
         html += '<h4>Example(s):</h4>';
         // Display all study examples with solutions
         html += renderAllExamplesWithSolutions(referenceExamples);
         html += `<h4>Please produce the output for this new example:</h4>`;
          html += `<p>${item.input} → </p>`;
          if (item.catch_trial) {
            html += '<p>(Catch Trial)</p>';
          }
          // Include drag-and-drop interface
          html += createDragAndDropInterface();
          html += `</div>`; // Close the container div
          return html;
       },
    choices: "NO_KEYS",
    data: {
      correct_output: item.output,
      catch_trial: item.catch_trial || false,
      input: item.input
    },
    on_load: function() {
      setupDragAndDropTest(item.output);
    },
    on_finish: function(data) {
      data.participant_response = data.participant_response || [];
      data.correct = data.correct || false;
      data.correct_output = data.correct_output || [];
      EXPERIMENT_PARAMS.data.push(data);
    }
  };
}

function generateCompositionExamples(functions, primitives) {
  const examples = [];

  const compositions = [
    { funcs: ['func1', 'func3'], pattern: '((arg1 func1) func3 arg2)' },
    { funcs: ['func3', 'func1'], pattern: '(arg1 func3 (arg2 func1))' },
    { funcs: ['func3', 'func2'], pattern: '(arg1 func3 (arg2 func2 arg3))' },
    { funcs: ['func2', 'func3'], pattern: '((arg1 func2 arg2) func3 arg3)' },
  ];

  for (const comp of compositions) {
    const numArgsNeeded = comp.pattern.match(/arg\d+/g).length;

    if (primitives.length >= numArgsNeeded) {
      const args = selectPrimitives(primitives, numArgsNeeded);
      const input = buildCompositionInput(comp.funcs, args);
      const output = computeCompositionOutput(comp.pattern, args);

      examples.push({
        input,
        funcs: comp.funcs,
        args: args,
        output: output,
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

    // Generate args that differ from study examples by at least one primitive
    let args = [];
    let maxAttempts = 10;
    let attempts = 0;
    do {
      args = selectPrimitives(primitives, numArgsNeeded);
      attempts++;
    } while (!argsDifferEnough(args, studyExamples) && attempts < maxAttempts);

    if (attempts >= maxAttempts) {
      console.warn('Could not find suitable args that differ from study examples.');
    }

    const input = buildCompositionInput(comp.funcs, args);
    console.log('comp.pattern:', comp.pattern);
    const output = computeCompositionOutput(comp.pattern, args);
    console.log('Computed output:', output);

    items.push({
      input,
      funcs: comp.funcs,
      args: args,
      output: output,
      pattern: comp.pattern,
    });
  }
  return items;
}


function argsDifferEnough(args, studyExamples) {
  for (const studyEx of studyExamples) {
    if (countPrimitiveDifferences(args, studyEx.args) <= 1) {
      return false;
    }
  }
  return true;
}


function buildCompositionInput(funcLabels, args) {
  // Reconstruct the input string based on funcLabels and args
  // Since the pattern is now used for evaluation, we can reconstruct inputs directly
  let input = '';
  let argIndex = 0;

  for (let i = 0; i < funcLabels.length + args.length; i++) {
    if (i % 2 === 0) {
      // Even index: argument
      input += args[argIndex++];
    } else {
      // Odd index: function name
      const funcLabel = funcLabels[(i - 1) / 2];
      const funcName = EXPERIMENT_PARAMS.labelToFunctionName[funcLabel];
      input += ` ${funcName} `;
    }
  }

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