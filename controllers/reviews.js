const Review = require("../models/review");
const Campground = require("../models/campground");

module.exports.createReview = async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    const review = new Review(req.body.review)
    review.author = req.user._id;
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    req.flash("success", "Added a new review!");
    res.redirect(`/campgrounds/${id}`);
}

module.exports.deleteReview = async (req, res) => {
    const { id, reviewId } = req.params;
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } }, { useFindAndModify: false });
    await Review.findByIdAndDelete(reviewId, { useFindAndModify: false });
    req.flash("success", "Review deleted!");
    res.redirect(`/campgrounds/${id}`)
}