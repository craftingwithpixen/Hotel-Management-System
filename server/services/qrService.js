const QRCode = require("qrcode");

const generateTableQR = async (tableId) => {
  const url = `${process.env.FRONTEND_URL}/scan/table/${tableId}`;
  const dataUrl = await QRCode.toDataURL(url, { type: "image/png", width: 400 });
  return { qrCode: dataUrl, qrUrl: url };
};

module.exports = { generateTableQR };
