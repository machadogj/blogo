<div class="bthumb2"><a href=""><img width="100" src="http://cdn.machadogj.com/uploads/2013/11/validator.jpg" alt="validator"></a></div>

Este post surgio como respuesta a una pregunta realizada en el grupo de nodejs-es acerca de como realizar validaciones en las rutas de Express.js. Dado que hay varias alternativas y cosas a tener en cuenta decidi responder con este post.

<hr>

## Devolver lo antes posible

A mi me funciona mejor interrumpir la ejecución ni bien falla alguna validación, ej:

    app.get('/:id', function (req, res) {
        var id = req.params.id;
        if (notValidId(id)) {
            return res.send(400, "invalid id"); //o devolver un json con el mensaje de error
        }
        //seguir con id valido
    });

## Usando un Middleware

Si esta es una validación común que vas a usar en varios lados, te conviene hacer un handler/middleware especifico para eso:

    function idValidator (req, res, next, id) {
        if(notValid(req.params.id) {
            return res.send(400, "invalid id");
        }
        next(); // sigue con el siguiente handler
    }
    //ahora podes usar el `idValidator` en muchas rutas 
    app.get('/:id', idValidator, function (req, res) {
        //si estas aca, es porque el id es valido.
    });

## Usando "app.param"

Si el campo id siempre va a venir por "params", tal vez quieras hacerlo en un solo lugar para todas las rutas:

    app.param('id', function (req, res, next, id) {
        if (notValid(id)) {
            return res.send(400, "invalid id");
        }
        next();
    });

Si lo defines de esta manera, entonces todas los handlers con `:id` en sus rutas habran pasado por aqui primero. Mas informacion [aca](http://expressjs.com/api.html#app.param)

## Un mejor manejo de errores

Y por ultimo te dejo a modo de recomendación, en vez retornar un error directamente desde la ruta especifica, ej:

    return req.res(400, "mensaje");

Es conveniente utilizar un `Error Handler` de express. Los error handlers son middlewares especiales que reciben como primer parametro el error que se quiere manejar, ej:

    function MiErrorHandler (err, req, res, next) {
        //manejar mis errores aca.
        //loggearlos de algun modo efectivo (archivo, mail, logstash, etc...) ej:
        if (err.status > 499) //internal
            sendEmail(err);
        //devolver errores de manera unificada, ej:
        res.json(err.status || 500, {
            message: err.message || 'internal server error',
            //etc
        });
    }

Para que los errores le lleguen a este error handler, primero hay que definirlos a lo ultimo, luego de haber definido
todos los demas `app.use`:
    
    app.configure(function () {
        app.use(...);
        app.use(...);
        //ultimo
        app.use(MiErrorHandler);    
    });

Aunque no es `obligatorio` segun la documentacion de Express.js, es `recomendado` hacerlo de esta manera.

Y luego desde las rutas utilizar el tercer parametro del middleware:

    app.get('/:id', function (req, res, next) {
        if (notValidId(req.params.id)) {
            var report = new Error('Invalid id');
            report.status = 404;
            return next(report);
        }
        //id valido
    });

