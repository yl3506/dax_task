function function1(args) {
  // Function1: repeats the output three times
  const input = args[0];
  const processedInput = processArgument(input);
  const result = [];
  for (let i = 0; i < 3; i++) {
    result.push(...processedInput);
  }
  return result;
}

function function2(args) {
  // Function2: alternates outputs of two inputs
  const input1 = args[0];
  const input2 = args[1];
  const output1 = processArgument(input1);
  const output2 = processArgument(input2);
  const result = [];

  for (let i = 0; i < 3; i++) {
    result.push(output1[i % output1.length]);
    result.push(output2[i % output2.length]);
    result.push(output1[i % output1.length]);
  }
  return result.slice(0, 3);
}

function function3(args) {
  // Function3: concatenates outputs in reverse order
  const output1 = processArgument(args[0]);
  const output2 = processArgument(args[1]);
  return output2.concat(output1);
}



function processArgument(arg) {
  if (Array.isArray(arg)) {
    // arg is already an array of colors
    return arg;
  } else if (typeof arg === 'string') {
    const color = EXPERIMENT_PARAMS.word_color_mapping[arg];
    if (color) {
      return [color];
    } else {
      console.error(`Color mapping not found for "${arg}"`);
      return [];
    }
  } else {
    console.error('processArgument: invalid arg:', arg);
    return [];
  }
}
