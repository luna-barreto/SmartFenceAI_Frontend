import jwt from "jsonwebtoken";

/** Middleware suave: adjunta req.usuario si el token es válido, no rechaza si no hay token. */
export function autenticar(req, _res, next) {
  const token = req.headers.authorization?.split(" ")[1];
  if (token) {
    try { req.usuario = jwt.verify(token, process.env.JWT_SECRET); } catch {}
  }
  next();
}
