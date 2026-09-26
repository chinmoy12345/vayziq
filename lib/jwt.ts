import jwt, {
  type SignOptions,
  type JwtPayload as JWTLibraryPayload,
} from "jsonwebtoken";

const jwtSecret = process.env.JWT_SECRET;

if (!jwtSecret) {
  throw new Error(
    "JWT_SECRET is not defined in .env.local"
  );
}

const JWT_SECRET: string = jwtSecret;

export interface AppJwtPayload {
  sub: string;
  email: string;
}

export function signToken(
  payload: AppJwtPayload
): string {
  const options: SignOptions = {
    expiresIn: "7d",
  };

  return jwt.sign(
    payload,
    JWT_SECRET,
    options
  );
}

export function verifyToken(
  token: string
): AppJwtPayload | null {
  try {
    const decoded = jwt.verify(
      token,
      JWT_SECRET
    );

    if (
      typeof decoded !== "object" ||
      decoded === null
    ) {
      return null;
    }

    const payload =
      decoded as JWTLibraryPayload & {
        sub?: string;
        email?: string;
      };

    if (
      typeof payload.sub !== "string" ||
      typeof payload.email !== "string"
    ) {
      return null;
    }

    return {
      sub: payload.sub,
      email: payload.email,
    };
  } catch {
    return null;
  }
}