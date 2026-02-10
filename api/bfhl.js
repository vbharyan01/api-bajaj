import axios from "axios";

const OFFICIAL_EMAIL = "aryan0218.be23@chitkara.edu.in";

export default async function handler(req, res) {
  try {
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
        if (!Number.isInteger(body[key]) || body[key] < 0) throw new Error();
        data = fibonacci(body[key]);
        break;

      case "prime":
        if (!Array.isArray(body[key])) throw new Error();
        data = getPrimes(body[key]);
        break;

      case "lcm":
        if (!Array.isArray(body[key]) || body[key].length === 0) throw new Error();
        data = lcmArray(body[key]);
        break;

      case "hcf":
        if (!Array.isArray(body[key]) || body[key].length === 0) throw new Error();
        data = hcfArray(body[key]);
        break;

      case "AI":
        if (typeof body[key] !== "string") throw new Error();
        data = await askAI(body[key]);
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
  const response = await axios.post(
    "https://generativelanguage.googleapis.com/v1alpha/models/gemini-2.0-flash:generateContent",
    {
      contents: [{ parts: [{ text: question }] }]
    },
    {
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": process.env.GEMINI_API_KEY
      }
    }
  );

  const text = response.data.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text) throw new Error("Empty AI response");

  return text
    .replace(/[^a-zA-Z]/g, " ")
    .trim()
    .split(" ")[0];
}
