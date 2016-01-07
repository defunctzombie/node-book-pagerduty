var nock = require('nock');
var book = require('book');
var pagerduty = require('../');

suite('book-pagerduty');

var log = undefined;

beforeEach('setup logger', function(done) {
    log = book.default();
    log.use(pagerduty('https://events.pagerduty.com/e93facc04764012d7bfb002500d5d1a6'));
    done();
});

test('should send a trigger request', function(done) {
    var req = nock('https://events.pagerduty.com')
    .post('/generic/2010-04-15/create_event.json', {
        service_key: 'e93facc04764012d7bfb002500d5d1a6',
        event_type: 'trigger',
        incident_key: 'test error',
        description: 'test error'
    })
    .reply(200);

    log.panic('test error');

    req.done();
    done();
});

test('should retry on a 403', function(done) {
    var req = nock('https://events.pagerduty.com')
    .post('/generic/2010-04-15/create_event.json', {
        service_key: 'e93facc04764012d7bfb002500d5d1a6',
        event_type: 'trigger',
        incident_key: 'test error',
        description: 'test error'
    })
    .reply(403)
    .post('/generic/2010-04-15/create_event.json', {
        service_key: 'e93facc04764012d7bfb002500d5d1a6',
        event_type: 'trigger',
        incident_key: 'test error',
        description: 'test error'
    })
    .reply(200)

    log.panic('test error');

    setTimeout(function() {
        req.done();
        done();
    }, 1500);
});

test('should send details if available', function(done) {
    var req = nock('https://events.pagerduty.com')
    .post('/generic/2010-04-15/create_event.json', {
        service_key: 'e93facc04764012d7bfb002500d5d1a6',
        event_type: 'trigger',
        incident_key: 'test error',
        description: 'test error',
        details: {
            foo: 'bar'
        }
    })
    .reply(200);

    log.panic(new Error('test error'), { foo: 'bar' });

    req.done();
    done();
});

/*
POST https://events.pagerduty.com/generic/2010-04-15/create_event.json

{
    service_key: 'e93facc04764012d7bfb002500d5d1a6',
    event_type: 'trigger',
    description: 'short description',

    // consider hash of description and details
    // not required
    incident_key: 'unique key for incident',

    details: {
        // extra stuff, json object.. whatever
    }
}*/
