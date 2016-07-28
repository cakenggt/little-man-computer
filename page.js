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
