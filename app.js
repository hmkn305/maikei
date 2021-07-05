const express = require('express');
const mysql = require('mysql');
const app = express();
const session = require('express-session');
const bcrypt = require('bcrypt');

app.use(express.static('public'));
app.use(express.urlencoded({extended:true}));

// mySQLの接続情報
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Ken20031225',
  database: 'NIKKEI'
});

app.use(
  session({
    secret: 'my_secret_key',
    resave: false,
    saveUninitialized: false,
  })
);

app.use((req, res, next) => {
  const userId = req.session.userId;
  if(req.session.userId === undefined){
     res.locals.isLoggedIn = false;
  }else{
     res.locals.isLoggedIn = true;
  }
  next();
});

app.get('/', (req, res) => {
  res.render('top.ejs');
});


app.get('/list', (req, res) => {
  connection.query(
    'SELECT * FROM articles' ,
    (error, results) => {
    res.render('list.ejs', { articles: results});
    }
  );
});

app.get('/header', (req, res) => {
  res.render('header.ejs');
});

app.get('/contact', (req, res) => {
  res.render('contact.ejs');
}) 

app.get('/company', (req, res) => {
  res.render('company.ejs');
});

app.get('/article/:id',(req, res) => {
  const id = req.params.id;
  connection.query(
    'SELECT * FROM articles WHERE id = ?' ,
    [id],
    (error, results) => {
      res.render('article.ejs', {article: results[0]});
    }
  );
});

app.get('/register',(req, res) => {
  res.render('register.ejs', {errors: []});
});

app.get('/login',(req, res) => {
  res.render('login.ejs');
});

app.get('/logout', (req, res) => {
  req.session.destroy((error) => {
  res.redirect('/list');
  });
});

app.post('/register', 
(req, res, next) => {
  // 入力値のからチェック
   const email = req.body.email;
   const password = req.body.password;
   const errors = [];

  if(email === ''){
   errors.push('メールアドレスが空です');
  }

  if(password === ''){
   errors.push('パスワードが空です');
  }
  
  if(errors.length > 0){
    res.render('register.ejs', { errors: errors});
  }else{
    next();
  }
　},
(req, res, next) => {
  // メールアドレスの重複チェック
  const email = req.body.email;
  const errors = [];
  connection.query(
    'SELECT * FROM user WHERE email = ?',
    [email],
    (error, results) => {
      if(results.length > 0){
        errors.push('ユーザー登録に失敗しました');
        res.render('register.ejs',{errors: errors});
      }else{
        next();
      }
    }
  );
},
(req, res) => {
  // ユーザー登録
  const email = req.body.email;
  const password = req.body.password;
  bcrypt.hash(password, 10, (error, hash) => {
    connection.query(
      'INSERT INTO user(email, password) VALUES(?,?)',
      [email, hash],
      (error, results) => {
        req.session.userId = results.insertId;
        res.redirect('/list');
      }
    );
  });
}
  
);


  
app.post('/login',(req, res) => {
  　// ユーザー認証
    const email = req.body.email;

    debugger;
  
    connection.query(
      'SELECT * FROM user WHERE email = ?',
      [email],
      (error, results) => {
        if(results.length > 0){
          const plain = req.body.password;
          const hash = results[0].password;
          bcrypt.compare(plain, hash, (error, isEqual) => {
           if(isEqual){
             debugger;
             req.session.userId = results[0].id;
             console.log('ログイン成功！');
             res.redirect('/list');
            }else{
              console.log('ログイン失敗');
             res.render('login.ejs');
            }
          });
        }else{
          res.redirect('/login');
        }
      }
    );
    
  });

app.listen(3000);
