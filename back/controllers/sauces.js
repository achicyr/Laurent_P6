// in controllers/stuff.js

const Sauces = require('../models/sauces');
const fs = require('fs');

exports.createSauces = (req, res, next) => {
   // console.log("début de création d'une sauce") ////////*
   const saucesObject = JSON.parse(req.body.sauce);
   delete saucesObject._id;
   delete saucesObject._userId;
   const sauces = new Sauces({
      ...saucesObject,
      userId: req.auth.userId,
      imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
   });
   // console.log("voici la sauce créée : " + sauces) ////////*

   sauces.save()
      .then(() => { res.status(201).json({ message: 'Objet enregistré !' }) })
      .catch(error => { res.status(400).json({ error }) })
}

exports.modifySauces = (req, res, next) => {
   const saucesObject = req.file ? {
      ...JSON.parse(req.body.sauces),
      imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
   } : { ...req.body };

   delete saucesObject._userId;
   Sauces.findOne({ _id: req.params.id })
      .then((sauces) => {
         if (sauces.userId != req.auth.userId) {
            res.status(401).json({ message: 'Non-autorisé' });
         } else {
            Sauces.updateOne({ _id: req.params.id }, { ...saucesObject, _id: req.params.id })
               .then(() => res.status(200).json({ message: 'Objet modifié!' }))
               .catch(error => res.status(401).json({ error }));
         }
      })
      .catch((error) => {
         res.status(400).json({ error });
      });
}

exports.deleteSauces = (req, res, next) => {
   Sauces.findOne({ _id: req.params.id })
      .then(sauces => {
         if (sauces.userId != req.auth.userId) {
            res.status(401).json({ message: 'Not authorized' });
         } else {
            const filename = sauces.imageUrl.split('/images/')[1];
            fs.unlink(`images/${filename}`, () => {
               Sauces.deleteOne({ _id: req.params.id })
                  .then(() => { res.status(200).json({ message: 'Objet supprimé !' }) })
                  .catch(error => res.status(401).json({ error }));
            });
         }
      })
      .catch(error => {
         res.status(500).json({ error });
      });
}

exports.getOneSauces = (req, res, next) => {
   Sauces.findOne({ _id: req.params.id })
      .then(sauces => res.status(200).json(sauces))
      .catch(error => res.status(404).json({ error }));
}

exports.getAllSauces = (req, res, next) => {
   Sauces.find()
      .then(sauces => res.status(200).json(sauces))
      .catch(error => res.status(400).json({ error }));
}


exports.likeDislikeSauce = (req, res, next) => {
   let userId = req.body.userId
   let likeStatus = req.body.like
   // let sauceId = req.params.id

   console.log(req.body) //////*

   //* Gère le like
   if (likeStatus === 1) {
      Sauces.findOne({ _id: req.params.id })
         .then((sauce) => {
            const likes = sauce.likes + 1
            const usersLiked = sauce.usersLiked
            // console.log(likes) //////*
            usersLiked.push(userId)
            Sauces.updateOne({ _id: req.params.id }, { likes, usersLiked })
               .then((sauce) => {
                  // console.log(sauce) //////*
                  res.status(201).json({ message: ['Like has been increased'] });
               })
               .catch((error) => res.status(400).json(error));
         })
   }

   //* Gère l'annulation de like/dislike
   if (likeStatus === 0) {
      Sauces.findOne({ _id: req.params.id })
         .then((sauce) => {
            const usersLiked = sauce.usersLiked
            const usersDisliked = sauce.usersDisliked

            //* Méthode #1
            if ((usersLiked.find(element => element === userId)) === userId) {
               console.log('Element Liked Found'); //////*
               const likes = sauce.likes - 1
               usersLiked.pull(userId)
               Sauces.updateOne({ _id: req.params.id }, { likes, usersLiked })
                  .then((sauce) => {
                     // console.log(sauce) //////*
                     res.status(201).json({ message: ['Like has been undo'] });
                  })
                  .catch((error) => res.status(400).json(error));
            } 
            // else {
            //    console.log('Element Liked not Found');
            // }

            // if ((usersDisliked.find(element => element === userId)) === userId) {
            else if ((usersDisliked.find(element => element === userId)) === userId) {
               console.log('Element Disliked Found'); //////*
               const dislikes = sauce.dislikes - 1
               usersDisliked.pull(userId)
               Sauces.updateOne({ _id: req.params.id }, { dislikes, usersDisliked })
                  .then((sauce) => {
                     // console.log(sauce) //////*
                     res.status(201).json({ message: ['Disliked has been undo'] });
                  })
                  .catch((error) => res.status(400).json(error));
            } else {
               console.log('Element Liked or Disliked not Found');
            }

            //* Méthode #2
            // if (usersLiked.length != 0) {
            //    for (var i = 0; i < usersLiked.length; i++) {
            //       if (userId === usersLiked[i]) {
            //          console.log('Element Liked Found');
            //          const likes = sauce.likes - 1
            //          usersLiked.pull(userId)
            //          Sauces.updateOne({ _id: req.params.id }, { likes, usersLiked })
            //             .then((sauce) => {
            //                console.log(sauce)
            //                res.status(201).json({ message: ['Like has been undo'] });
            //             })
            //             .catch((error) => res.status(400).json(error));
            //       } else {
            //          console.log('Element Liked not Found');
            //       }
            //    }
            //    console.log("a déjà like")

            // } else if (usersDisliked.length != 0) {
            //    for (var i = 0; i < usersDisliked.length; i++) {
            //       if (userId === usersDisliked[i]) {
            //          console.log('Element Disliked Found');
            //          const dislikes = sauce.dislikes - 1
            //          usersDisliked.pull(userId)
            //          Sauces.updateOne({ _id: req.params.id }, { dislikes, usersDisliked })
            //             .then((sauce) => {
            //                console.log(sauce)
            //                res.status(201).json({ message: ['Disliked has been undo'] });
            //             })
            //             .catch((error) => res.status(400).json(error));
            //       } else {
            //          console.log('Element Disliked not Found');
            //       }
            //    }
            //    console.log("a déjà dislike")

            // } else {
            //    console.log("n'a pas encore like/dislike")
            // }

         })
         .catch((error) => res.status(400).json(error));
   }

   //* Gère le dislike
   if (likeStatus === -1) {
      Sauces.findOne({ _id: req.params.id })
         .then((sauce) => {
            const dislikes = sauce.dislikes + 1
            const usersDisliked = sauce.usersDisliked
            // console.log(dislikes) //////*
            usersDisliked.push(userId)
            Sauces.updateOne({ _id: req.params.id }, { dislikes, usersDisliked })
               .then((sauce) => {
                  // console.log(sauce) //////*
                  res.status(201).json({ message: ['Dislike has been decreased'] });
               })
               .catch((error) => res.status(400).json(error));
         })
   }
}