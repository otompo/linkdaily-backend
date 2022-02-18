const express = require("express");

const router = express.Router();

// controllers
const {
  create,
  readLinks,
  update,
  viewCount,
  like,
  unLike,
  DeleteLink,
  LikesCount,
} = require("../controllers/link");

const { requireSignin } = require("../controllers/auth");

router.post("/post-link", requireSignin, create);
router.get("/read-links/:page", requireSignin, readLinks);
// router.put("/update", requireSignin, update);
router.put("/view-count/:linkId", requireSignin, viewCount);
router.put("/like", requireSignin, like);
router.put("/unlike", requireSignin, unLike);
router.delete("/delete-link/:linkId", requireSignin, DeleteLink);
router.get("/links-count", requireSignin, LikesCount);

module.exports = router;
