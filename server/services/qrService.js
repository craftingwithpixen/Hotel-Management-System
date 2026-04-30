const QRCode = require("qrcode");
const { cloudinary } = require("../config/cloudinary");

const frontendBase = () => {
  const raw = (process.env.FRONTEND_URL || "http://localhost:5173").trim();
  const base = raw.replace(/\/+$/, "");
  if (
    process.env.NODE_ENV === "production" &&
    /localhost|127\.0\.0\.1/i.test(base)
  ) {
    console.warn(
      "[qrService] FRONTEND_URL looks like localhost in production — table QR scans will fail on real devices. Set FRONTEND_URL to your Vercel URL on Render and regenerate QRs."
    );
  }
  return base;
};

const generateTableQR = async (tableId) => {
  const url = `${frontendBase()}/scan/table/${tableId}`;
  const qrUrl = url;

  // Design intent: store QR on Cloudinary and return its secure URL.
  // Fallback: if Cloudinary is misconfigured/unavailable, return the data URL
  // so the app still functions locally.
  try {
    const pngBuffer = await QRCode.toBuffer(qrUrl, { type: "image/png", width: 400 });
    const upload = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: "qr_codes",
          public_id: `table_${tableId}`,
          resource_type: "image",
          overwrite: true,
        },
        (error, result) => {
          if (error) return reject(error);
          return resolve(result);
        }
      );

      stream.end(pngBuffer);
    });

    return { qrCode: upload.secure_url, qrUrl };
  } catch (e) {
    const dataUrl = await QRCode.toDataURL(qrUrl, { type: "image/png", width: 400 });
    return { qrCode: dataUrl, qrUrl };
  }
};

module.exports = { generateTableQR };
