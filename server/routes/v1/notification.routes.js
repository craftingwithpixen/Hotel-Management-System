const router = require("express").Router();
const authenticate = require("../../middleware/authenticate");
const Notification = require("../../models/Notification");

router.get("/", authenticate, async (req, res, next) => {
  try {
    const limit = Number(req.query.limit || 20);
    const recipient = req.user._id;

    const [notifications, total, unread] = await Promise.all([
      Notification.find({ recipient }).sort({ createdAt: -1 }).limit(limit),
      Notification.countDocuments({ recipient }),
      Notification.countDocuments({ recipient, read: false }),
    ]);

    res.json({ notifications, total, unreadCount: unread });
  } catch (error) {
    next(error);
  }
});

router.put("/:id/read", authenticate, async (req, res, next) => {
  try {
    const { id } = req.params;
    const updated = await Notification.findOneAndUpdate(
      { _id: id, recipient: req.user._id },
      { read: true },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: "Notification not found" });
    res.json({ notification: updated });
  } catch (error) {
    next(error);
  }
});

router.put("/read-all", authenticate, async (req, res, next) => {
  try {
    await Notification.updateMany(
      { recipient: req.user._id, read: false },
      { $set: { read: true } }
    );
    res.json({ message: "All notifications marked as read" });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
