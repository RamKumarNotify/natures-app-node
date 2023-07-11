const express = require('express');
const reviewController = require('./../controllers/reviewController');
const authController = require('./../controllers/authController');

const router = express.Router({ mergeParams: true });

router.use(authController.protect);

router
    .route('/')
    .get(reviewController.getAllReview)
    .post(
        authController.protect,
        authController.restrictedTo('user'),
        reviewController.setTourUserIds,
        reviewController.createReview        
    );

router.route('/:id')
    .get(reviewController.getReview)
    .patch(
        authController.restrictedTo('user', 'admin'),
        reviewController.updateReview
    )
    .delete(
        authController.restrictedTo('user', 'admin'),
        reviewController.deteleReview
    );

module.exports = router;