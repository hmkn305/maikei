const express = require('express');
const mysql = require('mysql');
const app = express();

app.use(express.static('public'));
app.use(express.urlencoded({extended:true}));


// mySQLの接続情報
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Ken20031225',
  database: 'NIKKEI'
});

// 接続できていない時にエラーを表示する
connection.connect((err) => {
  if (err) {
    console.log('error connecting: ' + err.stack);
    return;
  }
  console.log('success');
});

// '/'のルーティング
app.get('/', (req, res) => {
  connection.query(
    'SELECT * FROM user',
    (error, results) => {
      console.log(results);
      res.render('hello.ejs');
    }
  );
});

app.get('/top', (req, res) => {
  res.render('top.ejs');
});

app.get('/list',(req, res) => {
  res.render('list.ejs');
});

app.get('/company', (req, res) => {
  res.render('company.ejs');
});

app.get('/article',(req, res) => {
  res.render('article.ejs');
});

app.get('/register',(req, res) => {
  res.render('register.ejs');
});

app.get('/login',(req, res) => {
  // ログイン画面表示
  res.render('login.ejs', {errors : []});
});

app.post('/login',(req, res) => {
　// ユーザー認証
  const email = req.body.email;

  connection.query(
    'SELECT * FROM user WHERE email = ?',
    [email],
    (error, results) => {
      if(results.length > 0){
         if(req.body.password === results[0].password){
           console.log('認証に成功しました');
           res.redirect('/list');
         }
      }else{
        console.log('認証に失敗しました');
        res.redirect('/login');
      }
    }
  );
  
});

app.post('/register', (req, res) => {
  console.log('ユーザー登録');
  const email = req.body.email;
  const password = req.body.password;
　
  connection.query(
    'INSERT INTO user (email, password) VALUES(?, ?)',
    [email, password],
    (error, results) => {
      res.redirect('/list');
    }
  );

});

app.listen(3000);
