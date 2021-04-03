const Campground = require("../models/campground");
const {cloudinary} = require("../cloudinary");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapboxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapboxToken });

module.exports.index = async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render("campgrounds/index", { campgrounds });
}

module.exports.renderNewForm = (req, res) => {
    res.render("campgrounds/new");
}

module.exports.createNewCampground = async (req, res) => {
    const geoDataConfig = {
        query: req.body.campground.location,
        limit: 1
    }
    const geoData = await geocoder.forwardGeocode(geoDataConfig).send();
    const campground = new Campground(req.body.campground);
    campground.geometry = geoData.body.features[0].geometry;
    campground.images = req.files.map(f => ({ url: f.path, filename: f.filename }));
    campground.author = req.user._id;
    await campground.save();
    req.flash("success", "Successfully made a new campground!");
    res.redirect(`/campgrounds/${campground._id}`);
}

module.exports.showCampgrounds = async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id).populate({ path: "reviews", populate: { path: "author" } }).populate("author", "username");
    if (!campground) {
        req.flash("error", "Could not found that campground");
        return res.redirect("/campgrounds");
    }
    res.render("campgrounds/show", { campground });
}

module.exports.updateCampground = async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground }, { useFindAndModify: false });
    const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }));
    campground.images.push(...imgs);
    await campground.save();
    if(req.body.deleteImages){
        for(let filename of req.body.deleteImages){
            await cloudinary.uploader.destroy(filename);
        }
        await campground.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } });
    }
    req.flash("success", "Succesfullt updated Campground");
    res.redirect(`/campgrounds/${id}`);
}

module.exports.renderEditForm = async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if (!campground) {
        req.flash("error", "Could not found that campground");
        return res.redirect("/campgrounds");
    }
    res.render("campgrounds/edit", { campground });
}

module.exports.deleteCampground = async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndDelete(id, { useFindAndModify: false });
    req.flash("success", "Succesfullt deleted Campground");
    res.redirect("/campgrounds");
}