import dotenv from "dotenv";
import { createRemoteJWKSet, jwtVerify } from "jose";

dotenv.config();

let JWKS;

function getJWKS() {
  const authUrl = process.env.BETTER_AUTH_URL?.replace(/\/$/, "");

  if (!authUrl) {
    throw new Error("BETTER_AUTH_URL is missing from .env");
  }

  if (!JWKS) {
    JWKS = createRemoteJWKSet(new URL(`${authUrl}/api/auth/jwks`));
  }

  return { JWKS, authUrl };
}

export async function requireAuth(req, res, next) {
  try {

    const authorization = req.headers.authorization;

   
    if (!authorization?.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const token = authorization.slice("Bearer ".length).trim();

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

   
    const { JWKS, authUrl } = getJWKS();


    const { payload } = await jwtVerify(token, JWKS, {
      issuer: authUrl,
      audience: authUrl,
    });


    if (typeof payload.sub !== "string" || !payload.sub) {
      return res.status(401).json({
        success: false,
        message: "Invalid authentication token",
      });
    }

  
    req.user = {
      id: payload.sub,
    };


    next();
  } catch (error) {
    if (
      error.code === "ERR_JWT_INVALID" ||
      error.code === "ERR_JWS_INVALID" ||
      error.code === "ERR_JWT_EXPIRED" ||
      error.code === "ERR_JWS_SIGNATURE_VERIFICATION_FAILED" ||
      error.code === "ERR_JWT_CLAIM_VALIDATION_FAILED" ||
      error.code === "ERR_JWKS_NO_MATCHING_KEY"
    ) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired authentication token",
      });
    }

    console.error("Authentication verification failed:", error);

    return res.status(500).json({
      success: false,
      message: "Authentication service error",
    });
  }
}
