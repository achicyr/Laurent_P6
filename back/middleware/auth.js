const jwt = require('jsonwebtoken')

module.exports = (req, res, next) => {
   try {
      const token = req.headers.authorization.split(' ')[1]
      const decodedToken = jwt.verify(token, process.env.TOKEN)
      const userId = decodedToken.userId
      req.auth = {
         userId: userId
      }
      if (req.body.userId && req.body.userId !== userId) {
         throw new Error('403: unauthorized request.')
      } else {
         next()
      }
   } catch (error) {
      res.status(401).json({ error })
   }
}