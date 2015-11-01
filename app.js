var Config = {
  boshUrl: '',
  xmppDomain:  '',
  userName: '',
  password: ''
}
function  jid() { return Config.userName + "@" + Config.xmppDomain; }

function login() {
  for (k in Config) {
    Config[k] = $('#' + k).val();
  }
  chrome.storage.local.set(Config);
  var conn = new Strophe.Connection(Config.boshUrl);
  conn.raw_input = console.log;
  conn.raw_output = console.log;
  conn.connect(jid(), Config.password, onStatus);
}

function loadVals() {
  chrome.storage.local.get(Config, function(c) {
    Config = c;
    for (k in Config) {
      $('#'+k).val(Config[k]);
    }
  });
}

$(function() {
  loadVals();
  $('#save').click(function() {
    login();
  });
});

function onStatus(status) {
  if (status == Strophe.Status.CONNECTING) {
    console.log('Connecting...');
  } else if (status == Strophe.Status.CONNFAIL) {
    console.log('Failed to connect!');
  } else if (status == Strophe.Status.DISCONNECTING) {
    console.log('Disconnecting...');
  } else if (status == Strophe.Status.DISCONNECTED) {
    console.log('Disconnected');    
  } else if (status == Strophe.Status.CONNECTED) {
    console.log("Connected!");
  }
}