const express = require("express");
const tourController = require("./../controllers/tourController");
const authController = require("./../controllers/authController");
//const reviewController = require('./../controllers/reviewController');
const reviewRoute = require("./reviewRoutes");

const router = express.Router();

// router.param('id', tourController.checkId);

router.use("/:tourId/review", reviewRoute);

router
  .route("/top-5-cheap")
  .get(tourController.aliasTopTours, tourController.getAllTours);

router.route("/top-average").get(tourController.getTourStats);

router
  .route("/tours-within/:distance/center/:latlng/unit/:unit")
  .get(tourController.getToursWithin);

router
  .route("/distances/:latlng/unit/:unit")
  .get(tourController.getDistances);

router
  .route("/get-monthlyPlan/:year")
  .get(
    authController.protect,
    authController.restrictedTo("admin", "lead-guide", "guide"),
    tourController.getMonthlyPlan
  );

router
  .route("/")
  .get(tourController.getAllTours)
  .post(
    authController.protect,
    authController.restrictedTo("admin", "lead-guide"),
    tourController.createTours
  );

router
  .route("/:id")
  .get(tourController.getTour)
  .patch(
    authController.protect,
    authController.restrictedTo("admin", "lead-guide"),
    tourController.uploadTourImages,
    tourController.resizeTourImages,
    tourController.updateTour
  )
  .delete(
    authController.protect,
    authController.restrictedTo("admin", "lead-guide"),
    tourController.deleteTour
  );

// router.route("/:tourId/review")
// .post(
//     authController.protect,
//     authController.restrictedTo('user'),
//     reviewController.createReview
// );

module.exports = router;
