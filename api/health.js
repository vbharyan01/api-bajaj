const OFFICIAL_EMAIL = "aryan0218.be23@chitkara.edu.in";

export default function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({
      is_success: false,
      official_email: OFFICIAL_EMAIL
    });
  }

  return res.status(200).json({
    is_success: true,
    official_email: OFFICIAL_EMAIL
  });
}
