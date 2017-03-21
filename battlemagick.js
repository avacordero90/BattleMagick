var express = require('express');
var mysql = require('./dbcon.js');
var app = express();
var handlebars = require('express-handlebars').create({defaultLayout:'main'});
var bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(express.static('public'));
//app.use(session({secret:'###'}));
app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');
app.set('port', 3398);

//go to root of site, display tables.
app.get('/', function(req, res, next){
	var context = {};
	mysql.pool.query('SELECT * FROM wizard', function(err, rows, fields){
		if(err){
			next(err);
			return;
		}
		context.results = rows;
		res.render('home', context);
	});
});

app.get('/insert',function(req,res,next){
    var context = {};
        mysql.pool.query("INSERT INTO wizard (`name`,`special`,`life`,`magick`) VALUES ((?),(?),(?),(?))", [req.query.name, req.query.special, req.query.life, req.query.magick], function(err, result){
            if(err){
                next(err);
                return;
            }
        mysql.pool.query('SELECT * FROM wizard', function(err, rows, fields){
		if(err){
			next(err);
			return;
		}
		context.results = rows;
		res.render('home', context);
	});
        });
});

app.get('/delete',function(req,res,next){
  var context = {};
  mysql.pool.query("DELETE FROM wizard WHERE `id`=(?)", [req.query.id], function(err, result){
    if(err){
      next(err);
      return;
    }	
    mysql.pool.query('SELECT * FROM wizard', function(err, rows, fields){
    if(err){
        next(err);
        return;
    }
    context.results = rows;
    res.render('home', context);
	});
  });
});

app.get('/update',function(req,res,next){
      mysql.pool.query("UPDATE wizard SET `name`=(?), `special`=(?), `life`=(?), `magick`=(?) WHERE `id`=(?)",
        [req.query.name || curVals.name, req.query.special || curVals.special, req.query.life || curVals.life, req.query.magick || curVals.magick, req.query.id],
        function(err, result){
        if(err){
          next(err);
          return;
        }
        context.results = "Updated " + result.changedRows + " rows.";
        res.render('home',context);
      });
});


//
//app.get('/update',function(req,res,next){
//  var context = {};
//  mysql.pool.query("SELECT * FROM wizard WHERE `id`=(?)", [req.query.id], function(err, result){
//    if(err){
//      next(err);
//      return;
//    }
//    if(result.length == 1){
//      var curVals = result[0];
//      mysql.pool.query("UPDATE wizard SET `name`=(?), `special`=(?), `life`=(?), `magick`=(?) WHERE `id`=(?)",
//        [req.query.name || curVals.name, req.query.special || curVals.special, req.query.life || curVals.life, req.query.magick || curVals.magick, req.query.id],
//        function(err, result){
//        if(err){
//          next(err);
//          return;
//        }
//        context.results = "Updated " + result.changedRows + " rows.";
//        res.render('home',context);
//      });
//    }
//  });
//});

//never do this in real-life -- just a shortcut for this class.
app.get('/reset-table',function(req,res,next){
  var context = {};
  mysql.pool.query("DROP TABLE IF EXISTS wizard", function(err){
    var createString = "CREATE TABLE `wizard` ("+
  "`id` int(11) NOT NULL AUTO_INCREMENT,"+
  "`name` varchar(30) NOT NULL,"+
  "`special` int(11) NOT NULL,"+
  "`life` varchar(255) NOT NULL,"+
  "`magick` varchar(255) NOT NULL,"+
  "PRIMARY KEY (`id`),"+
  "UNIQUE KEY `name` (`name`)"+
") ENGINE=InnoDB DEFAULT CHARSET=utf8;";
    mysql.pool.query(createString, function(err){
      context.results = "Table reset";
      res.render('home',context);
    })
  });
});

app.use(function(req,res){
  res.status(404);
  res.render('404');
});

app.use(function(err, req, res, next){
  console.error(err.stack);
  res.status(500);
  res.render('500');
});

app.listen(app.get('port'), function(){
  console.log('Express started on http://localhost:' + app.get('port') + '; press Ctrl-C to terminate.');
});
