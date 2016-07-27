# Little Man Computer

[Little Man Computer](https://en.wikipedia.org/wiki/Little_man_computer) emulator in Node.

## Specifications
### assemble
`assemble` is a function which takes in a string of newline-delimited Mnemonic, or Numeric, instructions, with or without labels, and outputs an array of numeric instructions.

### commands
`commands` is an enum mapping each mnemonic to it's command code. For example, `ADD` is mapped to `100`

### Computer
`Computer` is a constructor that is used to create a Little Man Computer. This constructor takes an options argument defined below.
#### options
* `inbox` An array with the inputs for the program. If this array doesn't exist or is too small when the computer requires an input, the program will thrown an error.
* `mailboxes` An array with the numeric codes that make up the program.
* `logOutbox` Boolean value specifying whether or not to log outputs as they happen to `console.log`. Defaults to `false`

The methods and attributes in the `Computer` object are defined below
#### `run()`
This method runs the computer until it reaches a halt statement.

### `step(steps=1)`
This method runs the computer the specified number of steps, and then pauses.

### `outbox`
This property is an Array consisting of the outputs of the program.

### `accumulator`
This is a number which represents the current state of the accumulator.

### `programCounter`
This is a number which identifies the next mailbox index to be evaluated for a command. When paused using `step`, this will point to the next instruction to be run.

### `inboxIndex`
This is the index of the next inbox instruction to be retrieved.

## Usage Example
```
const LMC = require('little-man-computer');
//This program takes a user input and counts down to zero
const countdown = `     INP
     OUT      // Initialize output
LOOP BRZ QUIT // If the accumulator value is 0, jump to the memory address labeled QUIT
     SUB ONE  // Label this memory address as LOOP, The instruction will then subtract the value stored at address ONE from the accumulator
     OUT
     BRA LOOP // Jump (unconditionally) to the memory address labeled LOOP
QUIT HLT      // Label this memory address as QUIT
ONE  DAT 1    // Store the value 1 in this memory address, and label it ONE (variable declaration)`;
const assembledCode = LMC.assemble(countdown);
const computer = new LMC.Computer({
  inbox: [5],
  mailboxes: assembledCode,
  logOutput: false
});
computer.run();
console.log(computer.output); //[5, 4, 3, 2, 1, 0]
```

## Caveats
### BRZ Negative Flag
Does not branch if accumulator's negative flag is set (accumulator is -1).

### Overflow on ADD
The result will be -1.

### Underflow on SUB
The result will be -1.
