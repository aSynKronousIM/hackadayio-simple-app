var apiData = {};

apiData.clientId = "AolBk66fJQfcKw4tFIYX9Aoksw5fA4wPg44hSZE6E6AKEJRk";
apiData.clientSecret = "b9YsR7VBQmL4eYNmiyG6LvMeTV66cvM9U9tTXnLXzyvEuwYE";
apiData.userKey = "tK1CvfYSIp1zqm3a";

apiData.apiKey = '?api_key=' + apiData.userKey;
apiData.apiUrl = 'https://api.hackaday.io/v1';
apiData.apiAuthUrl = 'https://api.hackaday.io/v1/me' + apiData.apiKey;
apiData.oAuthRedirect = 'https://hackaday.io/authorize?client_id=' + apiData.clientId + '&response_type=code';
apiData.createTokenUrl = function (code) {
  return ('https://auth.hackaday.io/access_token?' +
  'client_id=' + this.clientId +
  '&client_secret=' + this.clientSecret +
  '&code=' + code +
  '&grant_type=authorization_code');
};

if (!apiData.userKey || !apiData.clientId || !apiData.clientSecret) {
  console.log('Please fill in your client data!  See line 10 in server.js.');
  console.log('Ending node process.');
  process.exit();
}

var express = require('express'),
    request = require('request'),
    app     = express(),
    server  = app,
    port    = 3000;

server.listen(port);
console.log("The server has started on port 3000.");

app.set('views', __dirname + '/public');
app.set('view engine', 'ejs');

app.get('/', function (req, res) {
  console.log('\ninside /');
  res.render('index.ejs', {
    dataType: null,
    apiData: null
  });
});

// Queries HAD API for user data
app.get('/users/:id', function (req, res) {
  console.log('\ninside /users/:id');

  var id = req.params.id,
      url = apiData.apiUrl + '/users/' + id + apiData.apiKey;

  console.log('\nUser Data Query: ', url);

  request.get(url, function (error, response, body) {
    if (!error && response.statusCode === 200) {
      var bodyData = parseJSON(body);
      res.render('index', {
        dataType: 'Top Skulled Projects',
        apiData: bodyData
      });
    } else {
      console.log('\nError: ', error, '\nResponse body: ', body);
      res.render(body);
    }
  });
});

// Queries HAD API for project data
app.get('/projects/skulls', function (req, res) {
  console.log('\ninside /projects/skulls');
  var url = apiData.apiUrl + '/projects' + apiData.apiKey + '&sortby=skulls';
  console.log('\nProject Data Query: ', url);

  request.get(url, function (error, response, body) {
    var bodyData = parseJSON(body);
    res.render('index', {
      dataType: 'Top Skulled Projects',
      apiData: bodyData
    });
  });
});

// HAD API oAuth
app.get('/authorize', function (req, res) {
  res.redirect(apiData.oAuthRedirect);
});

// HAD API Callback
app.get('/callback', function (req, res) {
  var code = req.query.code;
  if (!code) {
    return res.redirect('/');
  }

  console.log('\nAccess code: ', code);

  var postUrl = apiData.createTokenUrl(code);

  console.log('\nPost Url: ', postUrl);

  request.post(postUrl, function (err, res2, body) {

    var parsedData = parseJSON(body),
        token = null;

    if (parsedData) {
      token = parsedData.access_token;
    }

    if (!token) {
      console.log('\nError parsing access_token: ', body);
      return res.redirect('/');
    }

    console.log('\nToken: ', token);

    // Add token to header for oAuth queries
    var options = {
      url: apiData.apiAuthUrl,
      headers: {Authorization: 'token ' + token}
    };

    request.get(options, function (err, res3, body) {
      var bodyData = parseJSON(body);
      if (!bodyData) {
        console.log('\nError parsing bodyData');
        return res.redirect('/');
      }
      console.log('\noAuth successful!');
      res.render('index', {
        dataType: 'oAuth Data',
        token: token,
        apiData: bodyData
      });
    });

  });
});


app.all('*', function (req, res) {
  res.redirect('/');
});

function parseJSON (value) {
  var parsed;
  try {
    parsed = JSON.parse(value);
  } catch (e) {
    console.log('Error parsing JSON: ', e, '\nInput: ', value);
  }
  return parsed || false;
}

