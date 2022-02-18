const Link = require("../models/link");

exports.create = async (req, res) => {
  try {
    const link = await Link({
      ...req.body,
      postedBy: req.user._id,
    }).save();
    res.send(link);
  } catch (err) {
    console.log(err);
  }
};

exports.readLinks = async (req, res) => {
  try {
    const perPage = 5;
    const page = req.params.page ? req.params.page : 1;
    const data = await Link.find()
      .skip((page - 1) * perPage)
      .sort({ createdAt: -1 })
      .limit(perPage)
      .populate("postedBy", "_id name");
    res.send(data);
  } catch (err) {
    console.log(err);
  }
};

exports.update = async (req, res) => {
  //
};

exports.DeleteLink = async (req, res) => {
  try {
    const link = await Link.findById(req.params.linkId).select("+postedBy");
    if (link.postedBy._id.toString() === req.user._id.toString()) {
      const deleted = await Link.findByIdAndRemove(req.params.linkId);
      res.json(deleted);
    }
  } catch (err) {
    console.log(err);
  }
};

exports.viewCount = async (req, res) => {
  try {
    const link = await Link.findById(req.params.linkId);

    if (!link) return res.status(404).send("Link not found");

    const updatelike = await Link.findByIdAndUpdate(
      link._id,
      { $inc: { views: 1 } },
      { new: true }
    );
    // console.log(updatelike);
    res.json({ ok: true });
  } catch (err) {
    console.log(err);
  }
};

exports.like = async (req, res) => {
  try {
    // const link = await Link.findById(req.body.linkId);
    // if (!link) return res.status(404).send("Link not found");

    const like = await Link.findByIdAndUpdate(
      req.body.linkId,
      { $addToSet: { likes: req.user._id } },
      { new: true }
    );
    // console.log(like);
    res.json(like);
  } catch (err) {
    console.log(err);
  }
};

exports.unLike = async (req, res) => {
  try {
    // const link = await Link.findById(req.body.linkId);
    // if (!link) return res.status(404).send("Link not found");

    const like = await Link.findByIdAndUpdate(
      req.body.linkId,
      { $pull: { likes: req.user._id } },
      { new: true }
    );
    res.json(like);
  } catch (err) {
    console.log(err);
  }
};

exports.LikesCount = async (req, res) => {
  try {
    const count = await Link.countDocuments();
    // console.log(count);
    res.json(count);
  } catch (err) {
    console.log(err);
  }
};
