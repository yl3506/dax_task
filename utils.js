const color_height = 25;
const color_width = 25;
const color_margin = 10;


function createDragAndDropInterface() {
    return `
        <div id="stimuli-list">
            ${getUniqueColorCirclesHTML()}
        </div>
        <div id="drop-area">
            <p>Drop items here</p>
        </div>
        <div id="buttons">
            <button id="reset-button" type="button">Reset</button>
            <button id="confirm-button" type="button">Confirm</button>
        </div>
    `;
}

function setupDragAndDropPractice(correctOutput) {
    const stimuliList = document.getElementById('stimuli-list');
    const dropArea = document.getElementById('drop-area');

    // Add dragstart event listener to images in stimuli list
    const images = stimuliList.querySelectorAll('img');
    images.forEach(img => {
        img.addEventListener('dragstart', function(e) {
            e.dataTransfer.setData('text/plain', e.target.dataset.color);
            e.dataTransfer.setData('drag-source', 'stimuli-list');
        });
    });

    // Handle dragover on dropArea for rearrangement
    dropArea.addEventListener('dragover', function(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';

        const draggingItem = document.querySelector('.dragging');
        if (!draggingItem) return;

        const afterElement = getDragAfterElement(dropArea, e.clientX);

        if (afterElement == null) {
            dropArea.appendChild(draggingItem);
        } else {
            dropArea.insertBefore(draggingItem, afterElement);
        }
    });

    // Handle drop on dropArea for adding new items from stimuliList
    dropArea.addEventListener('drop', function(e) {
        e.preventDefault();
        const source = e.dataTransfer.getData('drag-source');
        const color = e.dataTransfer.getData('text/plain');

        if (source === 'stimuli-list') {
            // Remove placeholder text if present
            if (dropArea.querySelector('p')) {
                dropArea.querySelector('p').remove();
            }

            const newImg = document.createElement('img');
            newImg.src = `images/${color}.png`;
            newImg.alt = color;
            newImg.dataset.color = color;
            newImg.style.width = `${color_width}px`;
            newImg.style.height = `${color_width}px`;
            newImg.style.margin = `${color_margin / 2}px`;
            newImg.style.cursor = 'grab';
            newImg.draggable = true;

            // Add drag and drop functionality to the newImg
            newImg.addEventListener('dragstart', function(e) {
                e.dataTransfer.setData('text/plain', e.target.dataset.color);
                e.dataTransfer.setData('drag-source', 'drop-area');
                e.target.classList.add('dragging');
            });
            newImg.addEventListener('dragend', function(e) {
                e.target.classList.remove('dragging');
            });

            // Determine where to insert the new item
            const afterElement = getDragAfterElement(dropArea, e.clientX);

            if (afterElement == null) {
                dropArea.appendChild(newImg);
            } else {
                dropArea.insertBefore(newImg, afterElement);
            }
        }
        // No additional handling needed for rearrangement; it's managed during dragover
    });

    // Reset button functionality
    document.getElementById('reset-button').addEventListener('click', function() {
        // Clear drop area
        dropArea.innerHTML = '<p>Drop items here</p>';
    });

    // Confirm button functionality
    document.getElementById('confirm-button').addEventListener('click', function() {
        const sortedItems = dropArea.querySelectorAll('img');
        if (sortedItems.length > 0) {
            participantResponse = [];
            sortedItems.forEach(img => {
                participantResponse.push(img.dataset.color);
            });

            isCorrect = checkResponse(correctOutput, participantResponse);
            passExample = EXPERIMENT_PARAMS.practiceAttempts >= 2 && !isCorrect;
            console.log("EXPERIMENT_PARAMS.practiceAttempts", EXPERIMENT_PARAMS.practiceAttempts)

            // Disable drag-and-drop functionality
            disableDragAndDrop();

            // Provide feedback
            let feedback_html = '';
            if (passExample){
                feedback_html = `<p style="color:red;">Maximum attempt reached. Skip. </p>`;
            } else if (isCorrect) {
                feedback_html = '<p style="color:green;">Correct!</p>';
            } else {
                const correctDisplay = correctOutput.map(color => `<img src="images/${color}.png" alt="${color}" style="width:${color_width}px; height:${color_height}px; margin-left:${color_margin}px">`).join(' ');
                feedback_html = `<p style="color:red;">Incorrect. The answer is: ${correctDisplay}</p>`;
            }

            // Display feedback
            const feedbackDiv = document.createElement('div');
            feedbackDiv.id = 'feedback-message';
            feedbackDiv.innerHTML = feedback_html;
            document.querySelector('#practice-container').appendChild(feedbackDiv);

            // Hide Confirm button, show Next button
            document.getElementById('confirm-button').style.display = 'none';
            const nextButton = document.createElement('button');
            nextButton.id = 'next-button';
            nextButton.textContent = 'Next';
            nextButton.type = 'button';
            document.getElementById('buttons').appendChild(nextButton);

            nextButton.addEventListener('click', function() {
                 // Finish trial and pass data
                 jsPsych.finishTrial({
                   participant_response: participantResponse,
                   correct: isCorrect || passExample,
                   isCorrect: isCorrect,
                   passExample: passExample,
                   feedback_message: feedback_html,
                   practiceAttempts: EXPERIMENT_PARAMS.practiceAttempts, // Pass the attempt count
                 });
               });
            // When max attempts reached
           if (passExample) {
             nextButton.textContent = 'Skip';
           } else{
                // Set the label based on correctness
                nextButton.textContent = isCorrect ? 'Continue' : 'Retry';
            }
            nextButton.style.fontSize = '18px';
            nextButton.style.padding = '10px 20px';
        
        } else {
            alert('Please put items into the drag-and-drop area.');
        }
    });
}


function getDragAfterElement(container, x) {
    const draggableElements = [...container.querySelectorAll('img:not(.dragging)')];

    return draggableElements.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = x - box.left - box.width / 2;
        if (offset < 0 && offset > closest.offset) {
            return { offset: offset, element: child };
        } else {
            return closest;
        }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
}


function setupDragAndDropTest(correctOutput) {
    console.log('correctOutput in setupDragAndDropTest:', correctOutput);
    if (!correctOutput) {
        console.error('correctOutput is undefined in setupDragAndDropTest');
    }
    const stimuliList = document.getElementById('stimuli-list');
    const dropArea = document.getElementById('drop-area');

    // Add dragstart event listener to images in stimuli list
    const images = stimuliList.querySelectorAll('img');
    images.forEach(img => {
        img.addEventListener('dragstart', function(e) {
            e.dataTransfer.setData('text/plain', e.target.dataset.color);
            e.dataTransfer.setData('drag-source', 'stimuli-list');
        });
    });

    // Handle dragover on dropArea
    dropArea.addEventListener('dragover', function(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';

        const draggingItem = document.querySelector('.dragging');
        if (!draggingItem) return;

        const afterElement = getDragAfterElement(dropArea, e.clientX);

        if (afterElement == null) {
            dropArea.appendChild(draggingItem);
        } else {
            dropArea.insertBefore(draggingItem, afterElement);
        }
    });

    // // Handle drop on dropArea
    // dropArea.addEventListener('drop', function(e) {
    //     e.preventDefault();
    //     const source = e.dataTransfer.getData('drag-source');
    //     const color = e.dataTransfer.getData('text/plain');
    //     const draggingItem = document.querySelector('.dragging');
    //     if (source === 'stimuli-list') {
    //         addCircleToDropArea(color);
    //     }
    // });

    // Handle drop on dropArea for adding new items from stimuliList
    dropArea.addEventListener('drop', function(e) {
        e.preventDefault();
        const source = e.dataTransfer.getData('drag-source');
        const color = e.dataTransfer.getData('text/plain');

        if (source === 'stimuli-list') {
            // Remove placeholder text if present
            if (dropArea.querySelector('p')) {
                dropArea.querySelector('p').remove();
            }

            const newImg = document.createElement('img');
            newImg.src = `images/${color}.png`;
            newImg.alt = color;
            newImg.dataset.color = color;
            newImg.style.width = `${color_width}px`;
            newImg.style.height = `${color_width}px`;
            newImg.style.margin = `${color_margin / 2}px`;
            newImg.style.cursor = 'grab';
            newImg.draggable = true;

            // Add drag and drop functionality to the newImg
            newImg.addEventListener('dragstart', function(e) {
                e.dataTransfer.setData('text/plain', e.target.dataset.color);
                e.dataTransfer.setData('drag-source', 'drop-area');
                e.target.classList.add('dragging');
            });
            newImg.addEventListener('dragend', function(e) {
                e.target.classList.remove('dragging');
            });

            // Determine where to insert the new item
            const afterElement = getDragAfterElement(dropArea, e.clientX);

            if (afterElement == null) {
                dropArea.appendChild(newImg);
            } else {
                dropArea.insertBefore(newImg, afterElement);
            }
        }
        // No additional handling needed for rearrangement; it's managed during dragover
    });

    // Reset button functionality
    document.getElementById('reset-button').addEventListener('click', function() {
        // Clear drop area
        dropArea.innerHTML = '<p>Drop items here</p>';
    });

   // Confirm button functionality
   document.getElementById('confirm-button').addEventListener('click', function() {
       const sortedItems = dropArea.querySelectorAll('img');
       if (sortedItems.length > 0) {
           const participantResponse = [];
           sortedItems.forEach(img => {
               participantResponse.push(img.dataset.color);
           });
           const isCorrect = checkResponse(correctOutput, participantResponse);

           // Disable drag-and-drop functionality
           disableDragAndDrop();

           // Display "Response recorded" message
           const feedbackDiv = document.createElement('div');
           feedbackDiv.id = 'feedback-message';
           feedbackDiv.innerHTML = '<p>Response recorded.</p>';

           // Determine the parent container
           const container = document.querySelector('#test-container') || document.querySelector('#composition-test-container') || document.querySelector('#practice-container');

           container.appendChild(feedbackDiv);

           // Hide Confirm button
           document.getElementById('confirm-button').style.display = 'none';

           // Show Next button
           const nextButton = document.createElement('button');
           nextButton.id = 'next-button';
           nextButton.textContent = 'Next';
           nextButton.type = 'button';
           document.getElementById('buttons').appendChild(nextButton);

           nextButton.addEventListener('click', function() {
               // Finish trial and pass data
               jsPsych.finishTrial({
                   participant_response: participantResponse,
                   correct: isCorrect,
                   correct_output: correctOutput
               });
           });
           nextButton.style.fontSize = '18px';
           nextButton.style.padding = '10px 20px';
       } else {
           alert('Please put items into the drag-and-drop area.');
       }
   });
}


function addCircleToDropArea(color) {
    const dropArea = document.getElementById('drop-area');
    // Remove placeholder text
    if (dropArea.querySelector('p')) {
        dropArea.querySelector('p').remove();
    }
    const newImg = document.createElement('img');
    newImg.src = `images/${color}.png`;
    newImg.alt = color;
    newImg.dataset.color = color;
    newImg.style.width = `${color_width}px`;
    newImg.style.height = `${color_width}px`;
    newImg.style.margin = `${color_margin/2}px`;
    newImg.style.cursor = 'grab';
    newImg.draggable = true;

    // Add drag and drop functionality
    newImg.addEventListener('dragstart', function(e) {
        e.dataTransfer.setData('text/plain', e.target.dataset.color);
        e.dataTransfer.setData('drag-source', 'drop-area');
        e.dataTransfer.effectAllowed = 'move';
        e.target.classList.add('dragging');
    });
    newImg.addEventListener('dragend', function(e) {
        e.target.classList.remove('dragging');
    });
    dropArea.appendChild(newImg);
}


function disableDragAndDrop() {
    // Disable dragging from stimuli list
    const stimuliList = document.getElementById('stimuli-list');
    const stimuliImages = stimuliList.querySelectorAll('img');
    stimuliImages.forEach(img => {
        img.draggable = false;
        img.style.opacity = '0.5';
    });
    // Disable dragging within drop area
    const dropArea = document.getElementById('drop-area');
    const dropImages = dropArea.querySelectorAll('img');
    dropImages.forEach(img => {
        img.draggable = false;
        img.style.cursor = 'default';
    });
    // Disable Reset button
    document.getElementById('reset-button').disabled = true;
}

function getUniqueColorCirclesHTML() {
    const colors = jsPsych.randomization.shuffle(EXPERIMENT_PARAMS.colors);
    let html = '';
    for (const color of colors) {
        html += `
            <div class="stimuli-item">
                <img src="images/${color}.png" alt="${color}" data-color="${color}" draggable="true">
            </div>
        `;
    }
    return html;
}







function getAllPrimitivePairs(primitives) {
    // Exclude pairs with identical primitives unless allowed
    const pairs = [];
    for (let i = 0; i < primitives.length; i++) {
        for (let j = 0; j < primitives.length; j++) {
            if (i !== j) { 
                pairs.push([primitives[i], primitives[j]]);
            }
        }
    }
    return pairs;
}


function countPrimitiveDifferences(args1, args2) {
    if (args1.length !== args2.length) {
        return 10;  // Math.max(args1.length, args2.length); // Or return a high value to ensure exclusion
    }
    let differences = 0;
    for (let i = 0; i < args1.length; i++) {
        if (args1[i] !== args2[i]) {
            differences++;
        }
    }
    return differences;
}


function argsDifferEnough(args, studyExamples, minDifferences) {
    const numArgs = args.length;
    for (const studyEx of studyExamples) {
        if (studyEx.args.length !== numArgs) {
            continue; // Skip if the number of arguments is different
        }
        const differences = countPrimitiveDifferences(args, studyEx.args);
        if (differences < minDifferences) {
            return false; // Not enough differences with this study example
        }
    }
    return true; // Differs enough from all study examples
}

// function argsDifferEnough(args, studyExamples) {
//   for (const studyEx of studyExamples) {
//     if (countPrimitiveDifferences(args, studyEx.args) <= 1) {
//       return false;
//     }
//   }
//   return true;
// }

function renderPrimitives() {
    const primitives = EXPERIMENT_PARAMS.concept_words;
    const wordColorMapping = EXPERIMENT_PARAMS.word_color_mapping;
    let html = '<div class="primitives-container">';
    for (const word of primitives) {
        const color = wordColorMapping[word];
        html += `
            <div class="primitive-item">
                <p>${word}</p>
                <img src="images/${color}.png" alt="${color}">
            </div>
        `;
    }
    html += '</div>';
    return html;
}


function renderExampleWithSolution(example) {
    const outputColors = example.output;
    let html = `${example.input} → `;
    for (const color of outputColors) {
        html += `<img src="images/${color}.png" alt="${color}" style="width:${color_width}px; height:${color_height}px; margin-left:${color_margin}px"> `;
    }
    return html;
}

function renderAllExamplesWithSolutions(examples) {
    let html = '';
    for (let i=0; i<examples.length; i++) {
        example = examples[i];
        if (i%2 == 0){ // 2 examples per row
            html += `<p>`;
        }
        html += renderExampleWithSolution(example);
        if (i%2 == 0){
            html += `&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp`; // space between examples
        } else {
            html += `</p>`;
        }
    }
    if (examples.length%2==1){
        html += `</p>`;
    }
    return html;
}

function selectPrimitives(primitives, num) {
    if (!Array.isArray(primitives)) {
        console.error('selectPrimitives: primitives is not an array', primitives);
        return [];
    }
    return jsPsych.randomization.sampleWithoutReplacement(primitives, num);
}


function checkResponse(correctOutput, participantOutput) {
 if (!Array.isArray(correctOutput) || !Array.isArray(participantOutput)) {
   console.error('correctOutput or participantOutput is not an array:', correctOutput, participantOutput);
   return false;
 }
 if (correctOutput.length !== participantOutput.length) {
   return false;
 }
 for (let i = 0; i < correctOutput.length; i++) {
   if (correctOutput[i].toLowerCase() !== participantOutput[i].toLowerCase()) {
     return false;
   }
 }
 return true;
}


function generateUsageExamples(func, primitives, numExamples) {
  const examples = [];
  let argsList = [];

  if (func.func === function1) {
    argsList = [
      [primitives[0]],
      [primitives[1]],
    ];
  } else if (func.func === function2 || func.func === function3) {
    argsList = [
      [primitives[0], primitives[1]],
      [primitives[1], primitives[2]],
    ];
  }
  // Adjust the number of examples if necessary
  argsList = argsList.slice(0, numExamples);

  for (const args of argsList) {
    let input;
    if (args.length === 1) {
      // For single-argument functions, include the function name at the start
      input = `${args[0]} ${func.name}`;
    } else {
      // For functions with two or more arguments
      input = args.join(` ${func.name} `);
    }
    examples.push({ input: input, args: args });
  }
  return examples;
}









function tokenizePattern(pattern) {
    return pattern.replace(/\(/g, ' ( ').replace(/\)/g, ' ) ').trim().split(/\s+/);
}


function parseTokens(tokens) {
    const token = tokens.shift();
    if (token === '(') {
      const list = [];
      while (tokens[0] !== ')') {
        list.push(parseTokens(tokens));
      }
      tokens.shift(); // remove ')'
      return list;
    } else if (token === ')') {
      throw new Error('Unexpected )');
    } else {
      // token is a symbol
      return token;
    }
}


function parsePattern(pattern) {
    const tokens = tokenizePattern(pattern);
    const parsed = parseTokens(tokens);
    if (tokens.length > 0) {
      throw new Error('Unexpected tokens after parsing pattern');
    }
    return parsed;
}


function evaluateAST(node, args, labelToFunctionDef, labelToFunctionArity) {
    if (Array.isArray(node)) {
        if (node.length === 3 && typeof node[1] === 'string' && node[1].startsWith('func')) {
            // Infix notation: [left, funcSymbol, right]
            const left = evaluateAST(node[0], args, labelToFunctionDef, labelToFunctionArity);
            const right = evaluateAST(node[2], args, labelToFunctionDef, labelToFunctionArity);
            const funcSymbol = node[1];
            const func = labelToFunctionDef[funcSymbol];

            if (!func) {
                throw new Error('Function not found for symbol: ' + funcSymbol);
            }

            const numArgs = labelToFunctionArity[funcSymbol];
            let funcArgs;

            if (numArgs === 1) {
                funcArgs = [left];
            } else if (numArgs === 2) {
                funcArgs = [left, right];
            } else {
                throw new Error(`Unsupported number of arguments for function ${funcSymbol}: ${numArgs}`);
            }

            return func(funcArgs);
        } else if (node.length === 2 && typeof node[1] === 'string' && node[1].startsWith('func')) {
            // Postfix notation: [operand, funcSymbol]
            const operand = evaluateAST(node[0], args, labelToFunctionDef, labelToFunctionArity);
            const funcSymbol = node[1];
            const func = labelToFunctionDef[funcSymbol];

            if (!func) {
                throw new Error('Function not found for symbol: ' + funcSymbol);
            }

            return func([operand]);
        } else if (node.length === 2 && typeof node[0] === 'string' && node[0].startsWith('func')) {
            // Prefix notation: [funcSymbol, operand]
            const funcSymbol = node[0];
            const operand = evaluateAST(node[1], args, labelToFunctionDef, labelToFunctionArity);
            const func = labelToFunctionDef[funcSymbol];

            if (!func) {
                throw new Error('Function not found for symbol: ' + funcSymbol);
            }

            return func([operand]);
        } else {
            throw new Error('Invalid AST node: ' + JSON.stringify(node));
        }
    } else if (typeof node === 'string') {
        if (node.startsWith('arg')) {
            const argIndex = parseInt(node.slice(3)) - 1; // arg1 → index 0
            return args[argIndex];
        } else {
            // It's a primitive value (shouldn't happen in this context)
            return node;
        }
    } else {
        throw new Error('Unknown AST node: ' + node);
    }
}