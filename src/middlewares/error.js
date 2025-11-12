export function errorHandler(err, req, res, next) {
  const code = res.statusCode && res.statusCode >= 400 ? res.statusCode : 500;
  res.status(code).json({ error: "error" });
}
