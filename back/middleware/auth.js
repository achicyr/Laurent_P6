const jwt = require('jsonwebtoken')
const User = require('../controllers/user')

module.exports = (req, res, next) => {
   try {
      const idUser = req.body.userId //TODO ==> récupérer l'id de l'user dans la variable
      const token = req.headers.authorization.split(' ')[1]
      const decodedToken = jwt.verify(token, 'RANDOM_TOKEN_SECRET')
      console.log(idUser,req.body)
      const userId = decodedToken.userId
      if (idUser && idUser != userId) {
         console.log("Accès refusé")
         return res.status(403).json({ message: "Accès refusé !" });
      }
      console.log("Accès autorisé")
      req.auth = {
         userId: userId
      };
      next()
   } catch (error) {
      res.status(401).json({ error })
   }
}

//* ------ CODE DE BASE ------ *//
// const jwt = require('jsonwebtoken')

// module.exports = (req, res, next) => {
//    try {
//       const token = req.headers.authorization.split(' ')[1]
//       // const decodedToken = jwt.verify(token, process.env.TOKEN)
//       const decodedToken = jwt.verify(token, 'RANDOM_TOKEN_SECRET')
//       const userId = decodedToken.userId
//       req.auth = {
//          userId: userId
//       };
//       next()
//    } catch (error) {
//       res.status(401).json({ error })
//    }
// }