var superagent = require('superagent');
var url = require('url');
var retry = require('retry');

module.exports = function(uri) {
    if (!uri) {
        throw new Error('book-pagerduty requires a URL parameter');
    }

    uri = url.parse(uri);

    var service_key = uri.pathname.slice(1);
    if (!service_key) {
        throw new Error('book-pagerduty url is not valid. Check your service key.');
    }

    uri.pathname = '/generic/2010-04-15/create_event.json';
    uri.href = '';

    var trigger_url = url.format(uri);

    return function() {
        // only send panic to pagerduty
        if (this.level > 0) {
            return;
        }

        var body = {
            service_key: service_key,
            event_type: 'trigger',
            incident_key: this.message,
            description: this.message
        };

        // user can pass optional second arg with object of `details`
        if (arguments.length > 1 && typeof arguments[1] == 'object') {
            body.details = arguments[1];
        }

        var op = retry.operation();

        // see https://developer.pagerduty.com/documentation/integration/events
        // API response codes and retry logic
        op.attempt(function() {
            superagent
            .post(trigger_url)
            .send(body)
            .end(function(err, res) {
                // retry
                if (op.retry(err)) {
                    return;
                }

                // welp, sucks
                if (err) {
                    return console.error(op.mainError());
                }

                // bad key or request, no retry
                if (res.status == 400) {
                    console.error(new Error(res.body.message));
                    return;
                }

                // 200, \o/
                if (res.status == 200) {
                    return;
                }

                // some other error, if we can retry, we will
                if (op.retry(new Error(res.body.message))) {
                    return;
                }

                // we are out of retries, just print to console
                console.error(op.mainError());
            });
        });
    };
};
