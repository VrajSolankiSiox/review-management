import jwt from "jsonwebtoken";

type AppJwtPayload = {
  user?: string;
};

export function getUserEmailFromRequest(request: Request) {
  const secretKey = process.env.JWTSECRET;

  if (!secretKey) {
    throw new Error("JWTSECRET environment variable is not set");
  }

  const authorization = request.headers.get("authorization") || "";
  const [scheme, token] = authorization.split(" ");

  if (scheme !== "Bearer" || !token) {
    return "";
  }

  try {
    const decoded = jwt.verify(token, secretKey) as AppJwtPayload;
    return typeof decoded.user === "string" ? decoded.user : "";
  } catch {
    return "";
  }
}
