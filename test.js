const LMC = require('./index');
const expect = require('chai').expect;

describe('assembler', function(){
  let subtractAssembledNumeric = [901,308,901,309,508,209,902,0];
  let subtractAssembledMnemonic = [901,308,901,309,508,209,902,0,0,0];
  it('numeric', function(){
    let subtract = `901
    308
    901
    309
    508
    209
    902
    0`;
    expect(LMC.assemble(subtract)).to.deep.equal(subtractAssembledNumeric);
  });
  it('mnemonic', function(){
    let subtract = `INP
    STA 8
    INP
    STA 9
    LDA 8
    SUB 9
    OUT
    HLT
    DAT 0
    DAT 0`;
    expect(LMC.assemble(subtract)).to.deep.equal(subtractAssembledMnemonic);
  });
  it('labels mnemonic', function(){
    let subtract = `INP
    STA FIRST
    INP
    STA SECOND
    LDA FIRST
    SUB SECOND
    OUT
    HLT
    FIRST DAT
    SECOND DAT`;
    expect(LMC.assemble(subtract)).to.deep.equal(subtractAssembledMnemonic);
  });
});
describe('assemble and computer', function(){
  it('subtract', function(){
    let subtract = `INP
    STA FIRST
    INP
    STA SECOND
    LDA FIRST
    SUB SECOND
    OUT
    HLT
    FIRST DAT
    SECOND DAT`;
    let assembled = LMC.assemble(subtract);
    let computer = new LMC.Computer({
      mailboxes: assembled,
      inbox: [5,3],
      logOutbox: false
    });
    computer.run();
    expect(computer.outbox).to.deep.equal([2]);
  });
  it('square', function(){
    let square = `START   LDA ZERO     // Initialize for multiple program run
            STA RESULT
            STA COUNT
            INP          // User provided input
            BRZ END      // Branch to program END if input = 0
            STA VALUE    // Store input as VALUE
    LOOP    LDA RESULT   // Load the RESULT
            ADD VALUE    // Add VALUE, the user provided input, to RESULT
            STA RESULT   // Store the new RESULT
            LDA COUNT    // Load the COUNT
            ADD ONE      // Add ONE to the COUNT
            STA COUNT    // Store the new COUNT
            SUB VALUE    // Subtract the user provided input VALUE from COUNT
            BRZ ENDLOOP  // If zero (VALUE has been added to RESULT by VALUE times), branch to ENDLOOP
            BRA LOOP     // Branch to LOOP to continue adding VALUE to RESULT
    ENDLOOP LDA RESULT   // Load RESULT
            OUT          // Output RESULT
            BRA START    // Branch to the START to initialize and get another input VALUE
    END     HLT          // HALT - a zero was entered so done!
    RESULT  DAT          // Computed result (defaults to 0)
    COUNT   DAT          // Counter (defaults to 0)
    ONE     DAT 1        // Constant, value of 1
    VALUE   DAT          // User provided input, the value to be squared (defaults to 0)
    ZERO    DAT          // Constant, value of 0 (defaults to 0)`;
    let assembled = LMC.assemble(square);
    let computer = new LMC.Computer({
      mailboxes: assembled,
      inbox: [5,6,7,0],
      logOutbox: false
    });
    computer.run();
    expect(computer.outbox).to.deep.equal([25,36,49]);
  });
});
