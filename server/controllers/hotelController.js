const Hotel = require("../models/Hotel");

exports.getHotel = async (req, res, next) => {
  try {
    const hotel = await Hotel.findOne();
    if (!hotel) return res.status(404).json({ message: "Hotel not found" });
    res.json({ hotel });
  } catch (error) { next(error); }
};

exports.updateHotel = async (req, res, next) => {
  try {
    let hotel = await Hotel.findOne();
    if (!hotel) {
      hotel = await Hotel.create(req.body);
    } else {
      Object.assign(hotel, req.body);
      await hotel.save();
    }
    res.json({ hotel });
  } catch (error) { next(error); }
};

exports.uploadPhotos = async (req, res, next) => {
  try {
    const hotel = await Hotel.findOne();
    if (!hotel) return res.status(404).json({ message: "Hotel not found" });
    const { urls } = req.body;
    hotel.photos.push(...urls);
    await hotel.save();
    res.json({ hotel });
  } catch (error) { next(error); }
};

exports.deletePhoto = async (req, res, next) => {
  try {
    const hotel = await Hotel.findOne();
    if (!hotel) return res.status(404).json({ message: "Hotel not found" });
    const { index } = req.params;
    hotel.photos.splice(Number(index), 1);
    await hotel.save();
    res.json({ hotel });
  } catch (error) { next(error); }
};

exports.toggleAvailability = async (req, res, next) => {
  try {
    const hotel = await Hotel.findOne();
    if (!hotel) return res.status(404).json({ message: "Hotel not found" });
    hotel.isOpen = !hotel.isOpen;
    await hotel.save();
    res.json({ hotel });
  } catch (error) { next(error); }
};
