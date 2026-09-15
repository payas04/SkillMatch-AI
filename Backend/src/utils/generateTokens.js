import jwt from "jsonwebtoken";

export const generateAccessToken = (userId, userEmail) => {
  return jwt.sign({ userId, userEmail }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "15m",
  });
};

export const generateRefreshToken = (userId) => {
  return jwt.sign({ userId }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: "7d",
  });
};

export const generateAccessAndRefreshTokens = (userId, userEmail) => {
  const accessToken = generateAccessToken(userId, userEmail);
  const refreshToken = generateRefreshToken(userId);
  return { accessToken, refreshToken };
};
