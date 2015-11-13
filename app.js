var Config = {
  boshUrl: '',
  xmppDomain:  '',
  userName: '',
  password: ''
}
var conn = null;
function  jid()    { return Config.userName;   }
function  domain() { return Config.xmppDomain; }
function login() {
  for (k in Config) {
    Config[k] = $('#' + k).val();
  }
  chrome.storage.local.set(Config);
  conn = new Strophe.Connection(Config.boshUrl);
  conn.xmlInput = xmlIn;
  conn.xmlOutput = xmlOut;
  conn.connect(jid(), Config.password, onStatus);
}
function discover() {
  conn.pubsub.connect(jid(), 'pubsub.' + domain());
  conn.pubsub.discoverNodes(gotNodes, logError, 1000);
}
function gotSubscription(params) {
  log("subscription to pubsub/nodes was successful");
}
function onSubscriptionEvent(params) {
  log("on subscription event: " + params);
}
function gotNodes(xml) {
  var items = $(xml).children().children();
  log(items.length + " items discovered.");
  if (items.length < 20) { //arbitraty amount
    var names = items.map(function(i) {
      return $(items[i]).attr('node');
    }).toArray().join(' ');
    log("Go these items: " + names);
  }
}

function loadVals() {
  chrome.storage.local.get(Config, function(c) {
    Config = c;
    for (k in Config) {
      $('#'+k).val(Config[k]);
    }
    if (Config.password) {
      $('#xmpp-details').hide();
      login();
    }
  });
}

$(function() {
  setupTogglers();
  loadVals();
  $('#save').click(function() {
    login();
  });
});
function setupTogglers() {
  $('a[toggle-for]').click(function() {
    var deets = $(this).attr('toggle-for');
    $(deets).toggle();
  });

}
function onStatus(status) {
  if (status == Strophe.Status.CONNECTING) {
    log('Connecting...');
  } else if (status == Strophe.Status.CONNFAIL) {
    log('Failed to connect!');
  } else if (status == Strophe.Status.DISCONNECTING) {
    log('Disconnecting...');
  } else if (status == Strophe.Status.DISCONNECTED) {
    log('Disconnected');    
  } else if (status == Strophe.Status.CONNECTED) {
    log("Connected!");
    discover();
  }
}
function log(msg) {
  $('#msg').append($('<p>').text(msg));
  console.log(msg);
}
function logError(x) {
  $('#msg').append($('<p>').text(x.outerHTML).addClass('error'));
}
function xmlIn(x) {
  $('#xml').append($('<p>').text(x.outerHTML).addClass('in'));
}
function xmlOut(x) {
  $('#xml').append($('<p>').text(x.outerHTML).addClass('out'));
}