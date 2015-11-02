import $ from 'jquery';

export class NodeManager {
  constructor() {
    var self = this;
    jQuery(function() {
      self.loadVals();
      jQuery('#save').click(function() {
        self.login();
      });
    });
  }
  serverConfig = {
    boshUrl: '',
    xmppDomain:  '',
    userName: '',
    password: ''
  };
  conn = null;
  get  jid()    { return serverConfig.userName;   }
  get  domain() { return serverConfig.xmppDomain; }
  login() {
    for (k in serverConfig) {
      serverConfig[k] = $('#' + k).val();
    }

    chrome.storage.local.set(serverConfig);
    conn = new Strophe.Connection(serverConfig.boshUrl);
    conn.xmlInput = xmlIn;
    conn.xmlOutput = xmlOut;
    conn.connect(jid(), serverConfig.password, onStatus);
  }
  discover() {
    conn.pubsub.connect(jid(), 'pubsub.' + domain());
    conn.pubsub.discoverNodes(gotNodes, logError, 1000);
  }
  gotSubscription(params) {
    log("subscription to pubsub/nodes was successful");
  }
  onSubscriptionEvent(params) {
    log("on subscription event: " + params);
  }
  gotNodes(xml) {
    var items = $(xml).children().children();
    log(items.length + " items discovered.");
    if (items.length < 20) { //arbitraty amount
      var names = items.map(function(i) { return $(items[i]).attr('jid');}).toArray().join(' ');
      log("Go these items: " + names);
    }
  }

  loadVals() {
    chrome.storage.local.get(serverConfig, function(c) {
      serverConfig = c;
      for (k in serverConfig) {
        $('#'+k).val(serverConfig[k]);
      }
    });
  }

  onStatus(status) {
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
  log(msg) {
    $('#msg').append($('<p>').text(msg));
    console.log(msg);
  }
  logError(x) {
    $('#msg').append($('<p>').text(x.outerHTML).addClass('error'));
  }
  xmlIn(x) {
    $('#xml').append($('<p>').text(x.outerHTML).addClass('in'));
  }
  xmlOut(x) {
    $('#xml').append($('<p>').text(x.outerHTML).addClass('out'));
  }
}