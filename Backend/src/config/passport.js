import passport from "passport";
import userModel from "../models/user.model.js";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { configDotenv } from "dotenv";
configDotenv();
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await userModel.findOne({ googleId: profile.id });
        if (!user) {
          user = await userModel.findOne({ email: profile.emails[0].value });
          if (user) {
            user.googleId = profile.id;
            user.provider = "google";
            await user.save();
          } else {
            // Generate a unique fallback username
            const baseUsername = profile.displayName
              .replace(/\s+/g, "")
              .toLowerCase();
            const uniqueSuffix = Math.floor(1000 + Math.random() * 9000);
            const generatedUsername = `${baseUsername}_${uniqueSuffix}`;
            user = await userModel.create({
              username: generatedUsername,
              email: profile.emails[0].value,
              googleId: profile.id,
              provider: "google",
            });
          }
        }
        return done(null, user); //pass user to route handler if no error(null)
      } catch (error) {
        return done(error, null); //pass error
      }
    },
  ),
);
export default passport;
