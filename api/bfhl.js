import axios from "axios";

const OFFICIAL_EMAIL = "aryan0218.be23@chitkara.edu.in";

export default async function handler(req, res) {
  try {
    // Make the endpoint browser-friendly: opening the URL does a GET.
    // The actual assignment logic remains POST-only.
    if (req.method === "GET") {
      return res.status(200).json({
        is_success: true,
        official_email: OFFICIAL_EMAIL,
        message: "Use POST with a JSON body containing exactly one key: fibonacci | prime | lcm | hcf | AI.",
        examples: {
          fibonacci: { fibonacci: 7 },
          prime: { prime: [1, 2, 3, 4, 5, 11] },
          lcm: { lcm: [4, 6, 8] },
          hcf: { hcf: [12, 18, 24] },
          AI: { AI: "What is the capital of India?" }
        }
      });
    }

    if (req.method !== "POST") {
      return res.status(405).json({
        is_success: false,
        official_email: OFFICIAL_EMAIL,
        data: null
      });
    }

    const body = req.body;
    const keys = Object.keys(body || {});

    if (keys.length !== 1) {
      return res.status(400).json({
        is_success: false,
        official_email: OFFICIAL_EMAIL,
        data: null
      });
    }

    const key = keys[0];
    let data;

    switch (key) {
      case "fibonacci":
        if (!Number.isInteger(body[key]) || body[key] < 0) {
          return res.status(400).json({
            is_success: false,
            official_email: OFFICIAL_EMAIL,
            data: null
          });
        }
        data = fibonacci(body[key]);
        break;

      case "prime":
        if (!Array.isArray(body[key])) {
          return res.status(400).json({
            is_success: false,
            official_email: OFFICIAL_EMAIL,
            data: null
          });
        }
        data = getPrimes(body[key]);
        break;

      case "lcm":
        if (
          !Array.isArray(body[key]) ||
          body[key].length === 0 ||
          !body[key].every((n) => Number.isInteger(n))
        ) {
          return res.status(400).json({
            is_success: false,
            official_email: OFFICIAL_EMAIL,
            data: null
          });
        }
        data = lcmArray(body[key]);
        break;

      case "hcf":
        if (
          !Array.isArray(body[key]) ||
          body[key].length === 0 ||
          !body[key].every((n) => Number.isInteger(n))
        ) {
          return res.status(400).json({
            is_success: false,
            official_email: OFFICIAL_EMAIL,
            data: null
          });
        }
        data = hcfArray(body[key]);
        break;

      case "AI":
        if (typeof body[key] !== "string" || body[key].trim().length === 0) {
          return res.status(400).json({
            is_success: false,
            official_email: OFFICIAL_EMAIL,
            data: null
          });
        }
        if (!process.env.GEMINI_API_KEY) {
          return res.status(500).json({
            is_success: false,
            official_email: OFFICIAL_EMAIL,
            data: null
          });
        }
        try {
          data = await askAI(body[key]);
        } catch (e) {
          // Log details for Vercel Runtime Logs without changing response shape.
          const status = e?.response?.status;
          const details = e?.response?.data || e?.message;
          console.error("Gemini request failed", { status, details });
          return res.status(502).json({
            is_success: false,
            official_email: OFFICIAL_EMAIL,
            data: null
          });
        }
        break;

      default:
        return res.status(400).json({
          is_success: false,
          official_email: OFFICIAL_EMAIL,
          data: null
        });
    }

    return res.status(200).json({
      is_success: true,
      official_email: OFFICIAL_EMAIL,
      data
    });

  } catch (err) {
    console.error("Unhandled error in /bfhl", err?.message || err);
    return res.status(500).json({
      is_success: false,
      official_email: OFFICIAL_EMAIL,
      data: null
    });
  }
}

/* ---------- LOGIC ---------- */

function fibonacci(n) {
  let arr = [];
  let a = 0, b = 1;
  for (let i = 0; i < n; i++) {
    arr.push(a);
    [a, b] = [b, a + b];
  }
  return arr;
}

function getPrimes(arr) {
  return arr.filter(n => Number.isInteger(n) && isPrime(n));
}

function isPrime(n) {
  if (n < 2) return false;
  for (let i = 2; i * i <= n; i++)
    if (n % i === 0) return false;
  return true;
}

function gcd(a, b) {
  return b === 0 ? a : gcd(b, a % b);
}

function lcm(a, b) {
  return Math.abs(a * b) / gcd(a, b);
}

function lcmArray(arr) {
  return arr.reduce((acc, val) => lcm(acc, val));
}

function hcfArray(arr) {
  return arr.reduce((acc, val) => gcd(acc, val));
}

/* ---------- GEMINI ---------- */

async function askAI(question) {
  const apiKey = process.env.GEMINI_API_KEY;
  const url =
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent" +
    `?key=${encodeURIComponent(apiKey)}`;

  const response = await axios.post(
    url,
    {
      contents: [
        {
          parts: [
            {
              text: `${question}\n\nAnswer with exactly one word only. No punctuation, no extra words.`
            }
          ]
        }
      ]
    },
    {
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": process.env.GEMINI_API_KEY
      },
      timeout: 15000
    }
  );

  const text = response.data.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text) throw new Error("Empty AI response");

  return text
    .replace(/[^a-zA-Z]/g, " ")
    .trim()
    .split(" ")[0];
}
