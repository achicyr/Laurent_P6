const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken');
const User = require('../models/user')

const passwordValidator = require("password-validator")
const passwordSchema = new passwordValidator()

// Schéma à respecter pour le mot de passe
passwordSchema
.is().min(8)                                    // Minimum length 8
.is().max(100)                                  // Maximum length 100
.has().uppercase()                              // Must have uppercase letters
.has().lowercase()                              // Must have lowercase letters
.has().digits(2)                                // Must have at least 2 digits
.has().not().spaces()                           // Should not have spaces
.is().not().oneOf(['Passw0rd', 'Password123']); // Blacklist these values

exports.signup = (req, res, next) => {
   if (!passwordSchema.validate(req.body.password)) {
      //TODO ==> afficher un message d'erreur de MDP
      console.log("Le MDP n'est pas OK !") ////////////*
      console.log(passwordSchema.validate('req.body.password', { details: true })) ////////////*
      // console.log(`Le mot de passe n'est pas assez fort ! ${passwordSchema.validate('req.body.password', { list: true })}`)
      return res.status(400).json({ message: "Le mot de passe n'est pas assez fort !" + console.log(passwordSchema.validate('req.body.password', { details: true })) });
      // return res.status(400).json({ message: "Le mot de passe n'est pas assez fort ! " });
      // return res.status(400).json({ message: (`Le mot de passe n'est pas assez fort ! ${passwordSchema.validate('req.body.password', { list: true })}`) });
   } else {
      console.log("Le MDP est OK") ////////////*
      bcrypt.hash(req.body.password, 10)
         .then(hash => {
            const user = new User({
               email: req.body.email,
               password: hash
            });
            user.save()
               .then(() => res.status(201).json({ message: 'Utilisateur créé !' }))
               .catch(error => res.status(400).json({ error }));
         })
         .catch(error => res.status(500).json({ error }));
   }
};

exports.login = (req, res, next) => {
   User.findOne({ email: req.body.email })
      .then(user => {
         if (!user) {
            return res.status(401).json({ message: 'Paire login/mot de passe incorrecte' });
         }
         bcrypt.compare(req.body.password, user.password)
            .then(valid => {
               if (!valid) {
                  return res.status(401).json({ message: 'Paire login/mot de passe incorrecte' });
               }
               res.status(200).json({
                  userId: user._id,
                  token: jwt.sign(
                     { userId: user._id },
                     // process.env.TOKEN,
                     'RANDOM_TOKEN_SECRET',
                     { expiresIn: '24h' }
                     )
                  });
            })
            .catch(error => res.status(500).json({ error }));
      })
      .catch(error => res.status(500).json({ error }));
};