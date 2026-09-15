import mongoose from "mongoose";

const userSchema = mongoose.Schema({
  username: {
    type: String,
    unique: [true, "Username already taken"],
    required: true,
  },
  email: {
    type: String,
    unique: [true, "Account Already Exist With This Email Address"],
    required: true,
  },
  password: {
    type: String, //password not required as users can also login with OAuth
  },
  refreshToken: {
    type: String,
  },
  googleId: {
    type: String,
  },
  provider: {
    type: String,
    default: "local", //Local | Google
  },
});

const userModel = mongoose.model("users", userSchema);

export default userModel;
