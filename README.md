# book-pagerduty

[Pagerduty](http://www.pagerduty.com/) notifier for panic logs from [book](https://github.com/defunctzombie/node-book)

```js
var log = require('book').default();
var pagerduty = require('book-pagerduty');

// configure with your service_key URL style
log.use(pagerduty('https://events.pagerduty.com/e93facc04764012d7bfb002500d5d1a6'));

// will send to pagerduty
log.panic('test error');

// will not send to pagerduty
log.error('no pagerduty');
```

## Tips

I recommend using [bookrc](https://github.com/defunctzombie/node-bookrc) for your apps and setting up your logging configration there.

## License

MIT
