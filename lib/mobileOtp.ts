import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const OTP_COOKIE = "mobile_otp_challenge";

interface OtpChallenge {
  mobile: string;
  codeHash: string;
  purpose: "mobile-auth";
}

function getSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is not defined in .env.local");
  return secret;
}

export async function createOtpChallenge(mobile: string) {
  const code = String(Math.floor(100000 + Math.random() * 900000));
  const token = jwt.sign(
    { mobile, codeHash: await bcrypt.hash(code, 12), purpose: "mobile-auth" },
    getSecret(),
    { expiresIn: "5m" },
  );

  return { code, token };
}

export async function verifyOtpChallenge(token: string | undefined, mobile: string, code: string) {
  if (!token) return false;

  try {
    const challenge = jwt.verify(token, getSecret()) as Partial<OtpChallenge>;
    if (challenge.purpose !== "mobile-auth" || challenge.mobile !== mobile || !challenge.codeHash) return false;
    return bcrypt.compare(code, challenge.codeHash);
  } catch {
    return false;
  }
}

export const mobileOtpCookie = OTP_COOKIE;
