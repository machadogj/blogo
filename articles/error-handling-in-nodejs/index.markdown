It is always a good idea to take good care of the errors and having a clear and efficient strategy for handling them. Node.js is not the exception to this rule, and provides multiple different techniques for handling errors in all the different scenarios.

##Exceptions
Error handling when working with asynchronous code can get a little bit tricky. If you take this code for instance:


    try
    {
        setTimeout(function () {
            throw new Error('who will catch me?');
        }, 1);
    }
    catch (e) {
        console.log('not me');
    }

Since the setTimeout is asynchronous, it will schedule the execution of the function and return right away without throwing, thus causing the `catch` to be ignored. Executing it will look something like this:


    posts/errors » node first.js

    timers.js:103
                if (!process.listeners('uncaughtException').length) throw e;
                                                                          ^
    Error: who will catch me?
        at Object._onTimeout (/Users/gustavo/code/posts/errors/first.js:4:18)
        at Timer.list.ontimeout (timers.js:101:19)

This will cause the process to exit, and print the Error that was raised along with the stack trace.

So how can we catch that uncaught exception?

##Uncaught exceptions

There is one last resort in node for catching uncaught exceptions before it exits the process. It's the [uncaughtException](http://nodejs.org/api/process.html#process_event_uncaughtexception ) event in the process object. Putting the following code at the top of the file will cause the program to exit more gracefully:


    process.on('uncaughtException', function ( err ) {
        console.error('An uncaughtException was found, the program will end.');
        //hopefully do some logging.
        process.exit(1);
    });

Unfortunately, this is not a silver bullet, and should not be used for handling errors in your node.js app. It's merely for being able to report the problem, and shut down gracefully. The state of the app is not guaranteed to be consistent, so the app should be restarted.

So how can we prevent our app from being shut down like this?

##Domains

[Domains](http://nodejs.org/api/domain.html ) provide for an elegant way to create different contexts of executions where `uncaughtExceptions` can be managed on a per Domain basis. So basically, every exception thrown inside of a Domain, will be caught by the domain's error event. Let's see an example (from node.js documentation site)


    // XXX WARNING!  BAD IDEA!

    var d = require('domain').create();
    d.on('error', function(er) {
      // The error won't crash the process, but what it does is worse!
      // Though we've prevented abrupt process restarting, we are leaking
      // resources like crazy if this ever happens.
      // This is no better than process.on('uncaughtException')!
      console.log('error, but oh well', er.message);
    });
    d.run(function() {
      require('http').createServer(function(req, res) {
        handleRequest(req, res);
      }).listen(PORT);
    });

Of course this is a bad idea, because we are just ignoring the fact that an unhanded exception was raised like the comment says, but notice how it's no longer reaching the process.on('uncaughtException'). This will allow us to separate our app into different contexts and act to errors accordingly. You can look into the node.js documentation for an example on how to use it with `cluster` in order to disconnect and fork workers whenever an uncaught exception occurs [here](http://nodejs.org/api/domain.html#domain_warning_don_t_ignore_errors).

Needless to say, that you should try/catch every function that you know that can throw an exception (usually non-async ones).

##EventEmitters

In case you don't know the [EventEmitter](http://nodejs.org/api/events.html#events_class_events_eventemitter) class, it's pretty core and abstracts events for you. Whenever you inherit or use an EventEmitter object, you can let listeners know that events have occurred by 'emit'-ing on it.

You can implement you event emitter like this:


     var util = require('util'),
          EventEmitter = require('events').EventEmitter;

     var MyClass = function () {

          if (!(this instanceof MyClass)) return new MyClass();
         
          EventEmitter.call(this);
     };

     util.inherits(MyClass, EventEmitter);

How is this class relevant for error handling? Well, in two ways. First, whenever implementing an EventEmitter you should respect that the proper event for raising errors, is the `error` event. Second, an `error` event is raised, and nobody is listening, then an exception will be thrown. Special attention needs to be paid to the second point, because it may cause your app to exit.

So what we are saying is that if we emit an error on MyClass it will throw an exception:


     var foo = new MyClass();
     foo.emit('error'); //this will throw
     
If we add a listener to the error event, then it will be handled:


     var foo = new MyClass();
     foo.on('error', function () { console.log('it blew')});
     foo.emit('error'); //this will not throw :)

If you do node.js code long enough, you will end up creating your own EventEmitters, they are a very good abstraction worth exploring. So make sure you keep an eye on error handling behaviour when you do ;)

##Express.js

When working with [express.js](http://expressjs.com/) you have to take care of errors that occurred during the execution of a request. You can send back a response with an error status code whenever an error occurs like this:


    app.get('/', function ( req, res ) {
        res.send(500, 'sorry')
    });

But if you handle errors like this all over your routes, where would you put the error handling and logging infrastructure code?

###Error Handler Middlewares

You should always try to use error handler middlewares. Error handler middle wares have 4 parameters and look like this:


    app.use(function(err, req, res, next){
      console.error(err.stack);
      res.send(500, 'Something broke!');
    });

The error handlers would typically sit at the bottom of the stack (below other app.use) and the way to send errors is by using the third parameter of typical middleware:


    app.use(function ( req, res, next ) {
        next('it blew');
    });

You can either send a string or an Error instance. I always prefer to send Error instances because they provide with the call stack.

###The Error class

One problem that I have with the Error class is that is not so simple to extend. Of course you can inherit the class and create your own Error classes like HttpError, DbError, etc. However that takes time, and doesn't add too much value unless you are doing something with types. Sometimes, you just want to add a message, and keep the inner error, and sometimes you might want to extend the error with parameters, and such. Take this simple example:


    app.get('/', function ( req, res, next ) {

        getSomething(function ( err, data ) {
           
            if ( err ) {
                var report = new Error('unable to get something in home');
                report.status = 500;
                report.inner = err;
                next(report);
                return;
            }

            if ( !data ) {
                var report = new Error('something not found');
                report.status = 404;
                next(report);
                return;
            }

            res.send(200, data);
        })
    });

Working with Error class might be a little verbose. And not so simple to report/print afterwards.

Here's the output of report.toString():


    'Error: unable to get something in home'

Here is the JSON.stringify(report):


    '{"status":500,"inner":"oops"}'

With the stack property we don't have much luck either, since it will not print correctly in most formats:


    'Error: unable to get something in home\n    at repl:1:14\n    at REPLServer.self.eval (repl.js:109:21)\n    at rli.on.self.bufferedCmd (repl.js:258:20)\n    at REPLServer.self.eval (repl.js:116:5)\n    at Interface.<anonymous> (repl.js:248:12)\n    at Interface.EventEmitter.emit (events.js:96:17)\n    at Interface._onLine (readline.js:200:10)\n    at Interface._line (readline.js:518:8)\n    at Interface._ttyWrite (readline.js:736:14)\n    at ReadStream.onkeypress (readline.js:97:10)'

So in order to properly print an Error, you have to:

- .toString() it
- JSON.stringify() it
- append the .stack (maybe .split('\n').join('&lt;br/&gt;') if you want to see it in html)

Because of that, we have written a helper library called [simple-errors](https://github.com/machadogj/node-simple-errors ) that allows you to simple type:


    var report = Error.http(500, 'something...', {foo: 'bar'}, 'oops');

And then use it with Error.toJson that will provide a json object for reporting:


    { message: 'something...',
      stack:
       [ 'Error: something...',
         '    at Function.Error.create (/Users/gustavo/code/posts/errors/node_modules/simple-errors/index.js:20:12)',
         '    at Function.Error.http (/Users/gustavo/code/posts/errors/node_modules/simple-errors/index.js:58:18)',
         '    at repl:1:20',
         '    at REPLServer.self.eval (repl.js:109:21)',
         '    at rli.on.self.bufferedCmd (repl.js:258:20)',
         '    at REPLServer.self.eval (repl.js:116:5)',
         '    at Interface.<anonymous> (repl.js:248:12)',
         '    at Interface.EventEmitter.emit (events.js:96:17)',
         '    at Interface._onLine (readline.js:200:10)',
         '    at Interface._line (readline.js:518:8)' ],
      inner: 'oops',
      foo: 'bar',
      status: 500 }

With these two helper methods, you can easily manage the errors on you Express.js and come up with some fine logging middleware.

##Conclusion

There are multiple different types of errors to account for when working with node.js and all of them require proper handling. Using all the techniques that I've described in this post will hopefully guide you in the right direction.

###Links
The sample code for this post can be found in [this](https://gist.github.com/machadogj/5322588) gist.