var express = require('express');
var mysql = require('./dbcon.js');
var app = express();
var handlebars = require('express-handlebars').create({defaultLayout:'main'});
var bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(express.static('public'));

app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');
app.set('port', 3398);

function showtable(table){
    try {
        return function(req, res, next){
            var context = {};
            mysql.pool.query('SELECT * FROM '+table, function(err, rows, fields){
                if(err){
                    next(err);
                    return;
                }
                context.fields = fields;
                context.results = rows;
                context.table = table;
                res.render('table', context);
            });
        };
    } catch(e) { res.render('home', context); console.log(e); throw e;
    } finally { console.log("Render failed.") }
}

app.get('/',function(req,res,next){
    var context = {};
    res.render('home',context);   
});
    
//app.get('/',showtable('wizard'));
app.get('/wizards',showtable('wizard'));
app.get('/spells',showtable('spell'));
app.get('/creatures',showtable('creature'));
app.get('/potions',showtable('potion'));

app.post('/insert',function(req,res,next){
    if (req.body.table === 'wizard'){
        attribs=" (`name`,`special`,`life`,`magick`)"+
            " VALUES ((?),(?),(?),(?))";
        fields = [req.body.name,req.body.special,req.body.life, req.body.magick];
    } else if (req.body.table === 'potion'){
        attribs=" (`name`) VALUES (?)";
        fields = [req.body.name];
    } else if (req.body.table === 'creature'){
        attribs=" (`name`,`w_friend`,`ability`,`damage`,`life`)"+
            " VALUES ((?),(?),(?),(?),(?))";
        fields =[req.body.name,req.body.w_friend,req.body.ability,req.body.damage, req.body.life]
    } else if (req.body.table === 'spell'){
        attribs=" (`name`,`cost`,`rate`) VALUES ((?),(?),(?))";
        fields = [req.body.name,req.body.cost,req.body.rate]
    }
    var context = {};
    console.log=(req.body)
        mysql.pool.query("INSERT INTO "+req.body.table+attribs, fields, function(err, result){
            if(err){
                next(err);
                return;
            }
        mysql.pool.query('SELECT * FROM '+req.body.table, function(err, rows, fields){
        if(err){
            next(err);
            return;
        }
        context.fields = fields;
        context.results = rows;
        context.table = req.body.table;
        res.render('table', context);
       });
    });
});

app.post('/delete', function(req,res,next){
  var context = {};
  mysql.pool.query("DELETE FROM "+req.body.table+" WHERE `id`=(?)", parseInt(req.body.id), function(err, result){
    if(err){
      next(err);
      return;
    }	
    mysql.pool.query('SELECT * FROM '+req.body.table, function(err, rows, fields){
    if(err){
        next(err);
        return;
    }
    context.fields = fields;
    context.results = rows;
    context.table = req.body.table;
    res.render('table', context);
    });
  });
});

//app.get('/delete',function(req,res,next){
//  var context = {};
//  mysql.pool.query("DELETE FROM "+req.query.table+" WHERE `id`=(?)", parseInt(req.query.id), function(err, result){
//    if(err){
//      next(err);
//      return;
//    }	
//    mysql.pool.query('SELECT * FROM wizard', function(err, rows, fields){
//    if(err){
//        next(err);
//        return;
//    }
//    context.results = rows;
//    res.render('table', context);
//	});
//  });
//});


app.post('/update',function(req,res,next){
  var context = {};
  mysql.pool.query("SELECT * FROM wizard WHERE `id`=(?)", [req.query.id], function(err, result){
    if(err){
      next(err);
      return;
    }
    if(result.length == 1){
      var curVals = result[0];
      mysql.pool.query("UPDATE wizard SET `name`=(?), `special`=(?), `life`=(?), `magick`=(?) WHERE `id`=(?)",
        [req.query.name || curVals.name, req.query.special || curVals.special, req.query.life || curVals.life, req.query.magick || curVals.magick, req.query.id],
        function(err, result){
        if(err){
          next(err);
          return;
        }
        context.results = "Updated " + result.changedRows + " rows.";
        res.render('table',context);
      });
    }
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
