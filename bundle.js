(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
class Computer {
  constructor(options){
    this.outbox = [];
    this.inbox = options.inbox || [];
    this.inboxIndex = 0;
    this.mailboxes = options.mailboxes || [];
    this.accumulator = 0;
    this.programCounter = 0;
    this.logOutbox = options.logOutbox || false;
  }

  run(){
    this.step(-1);
  }

  step(steps){
    if (steps === undefined){
      steps = 1;
    }
    while(steps !== 0){
      let executedIndex = this.programCounter;
      let contents = this.mailboxes[executedIndex];
      if (contents === undefined){
        throw new Error('Undefined contents found at index: ' + executedIndex);
      }
      else if (contents < 0 || contents >= 1000){
        throw new Error('Contents not in command range: ' + contents);
      }
      let command = Math.floor(contents/100)*100;
      let address = contents%100;
      this.programCounter++;
      switch(command){
        case commands.HLT:
          return;
        case commands.ADD:
          this.accumulator += this.mailboxes[address];
          break;
        case commands.SUB:
          this.accumulator -= this.mailboxes[address];
          break;
        case commands.STA:
          this.mailboxes[address] = this.accumulator;
          break;
        case commands.LDA:
          this.accumulator = this.mailboxes[address];
          break;
        case commands.BRA:
          this.programCounter = address;
          break;
        case commands.BRZ:
          if (this.accumulator === 0){
            this.programCounter = address;
          }
          break;
        case commands.BRP:
          if (this.accumulator >= 0){
            this.programCounter = address;
          }
          break;
        case 900:
          if (contents == commands.INP){
            let input = this.inbox[this.inboxIndex];
            if (input !== undefined){
              this.inboxIndex++;
              this.accumulator = input;
            }
            else{
              throw new Error('No input at inbox index: ' + this.inboxIndex);
            }
          }
          else if (contents == commands.OUT){
            this.outbox.push(this.accumulator);
            if (this.logOutbox){
              console.log(this.accumulator);
            }
          }
          break;
        default:
          throw new Error('Command code is not registered: ' + command);
      }

      //Set accumulator to -1 if out of bounds
      if (this.accumulator < 0 || this.accumulator >= 1000){
        this.accumulator = -1;
      }

      //Error checks
      if (isNaN(this.accumulator)){
        throw new Error('Accumulator was made NaN at ' + executedIndex);
      }
      steps--;
    }
  }
}

const commands = {
  'ADD': 100,
  'SUB': 200,
  'STA': 300,
  'LDA': 500,
  'BRA': 600,
  'BRZ': 700,
  'BRP': 800,
  'INP': 901,
  'OUT': 902,
  'HLT': 0,
  'COB': 0,
  'DAT': 0
};

function assemble(str){
  if (str === undefined){
    throw new Error('Cannot assemble undefined string');
  }
  str = str.toUpperCase();
  let lines = str.split('\n');
  let result = [];
  let labels = {};
  //Grab all labels
  for (let l = 0; l < lines.length; l++){
    let line = lines[l].trim();
    let parts = line.split(/\s+/);
    let first = parts[0];
    //check to be sure it's not numeric or a command
    if (isNaN(parseInt(first)) && commands[first] === undefined){
      //is a label
      let label = parts.shift();
      labels[label] = l;
    }
    lines[l] = parts;
  }
  //assemble into code
  for (let l = 0; l < lines.length; l++){
    let parts = lines[l];
    let command = parts[0];
    let value = 0;
    if (!isNaN(parseInt(command))){
      //is numeric instruction
      value = parseInt(command);
    }
    else{
      value = commands[command];
      if (value === undefined){
        throw new Error('Command not found: ' + command);
      }
      let address = parts[1];
      if (address !== undefined && !address.startsWith('//')){
        //there is a location
        let parsed = parseInt(address);
        let convertedLabel = labels[address];
        if (isNaN(parsed) && convertedLabel === undefined){
          throw new Error('Address or label not found: ' + address);
        }
        if (convertedLabel !== undefined){
          value += convertedLabel;
        }
        else{
          value += parsed;
        }
      }
    }
    result.push(value);
  }
  return result;
}

exports.Computer = Computer;
exports.assemble = assemble;
exports.commands = commands;

},{}],2:[function(require,module,exports){
function refresh(){
  var computer = window.computer;
  if (computer){
    var accumulator = document.getElementById('accumulator');
    accumulator.innerHTML = computer.accumulator;
    for (var i = 0; i < 100; i++){
      var id = "cell"+i;
      var cell = document.getElementById(id);
      cell.innerHTML =
      computer.mailboxes[i] === undefined ? 0 : computer.mailboxes[i];
      cell.className = '';
    }
    document.getElementById('cell'+computer.programCounter).className = 'selected';
    document.getElementById('outbox').innerHTML = computer.outbox.toString();
  }
}

function assembleSourceCode(){
  var assembledSource = LMC.assemble(source.value);
  var inbox = document.getElementById('inbox').value.split(' ');
  for (var i = 0; i < inbox.length; i++){
    inbox[i] = parseInt(inbox[i]);
  }
  window.computer = new LMC.Computer({
    mailboxes: assembledSource,
    inbox: inbox
  });
  refresh();
}

function run(){
  var computer = window.computer;
  if (computer){
    computer.run();
    refresh();
  }
}

function step(){
  var computer = window.computer;
  if (computer){
    computer.step();
    refresh();
  }
}

var LMC = require('./index');

window.onload = function(){
  var table = document.getElementById("cells");
  var head = table.createTHead().insertRow(0);//actually <tr>
  for (var i = 0; i < 10; i ++){
    head.insertCell(i).innerHTML = i;
  }
  for (var y = 0; y < 10; y++){
    var row = table.insertRow();
    for (var x = 0; x < 10; x++){
      row.insertCell().id = "cell"+(10*y+x);
    }
  }
  var defaultMail = [];
  defaultMail.fill(0, 0, 99);
  window.computer = new LMC.Computer({
    mailboxes: defaultMail
  });
  refresh();
  var assemble = document.getElementById('assemble');
  assemble.onclick = assembleSourceCode;
  document.getElementById('run').onclick = run;
  document.getElementById('step').onclick = step;
};

},{"./index":1}]},{},[2]);
