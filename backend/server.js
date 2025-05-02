const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;
const passport = require('passport');
const OAuth2Strategy = require('passport-oauth2').Strategy;

passport.use(new OAuth2Strategy({
    authorizationURL: 'https://provider.com/oauth2/authorize',
    tokenURL: 'https://provider.com/oauth2/token',
    clientID: 'your-client-id',
    clientSecret: 'your-client-secret',
    callbackURL: 'http://localhost:3000/auth/callback'
  },
  function(accessToken, refreshToken, profile, cb) {
    // Here you would find or create a user in your database
    return cb(null, profile);
  }
));

app.use(passport.initialize());

app.get('/auth/provider', passport.authenticate('oauth2'));

app.get('/auth/callback', 
  passport.authenticate('oauth2', { failureRedirect: '/' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/');
  });

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});