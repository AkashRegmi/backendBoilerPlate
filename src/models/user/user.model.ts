import bcrypt from "bcryptjs";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { model, Schema } from "mongoose";

import { env } from "process";
import { UserRole } from "../../enums/user/user.enum";
import { ACCOUNT_STATUS } from "../../enums/auth/auth.enum";
import { OTP_EXPIRY_TIME } from "../../utils/constant";
import { IUserDocument } from "../../interfaces/user/user.interface";

const userSchema = new Schema<IUserDocument>(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    tempEmail: { type: String },
    password: { type: String },
    role: {
      type: Number,
      enum: UserRole,
      required: true,
      default: UserRole.CUSTOMER,
    },
    contact: { type: String, required: true, unique: true },
    address: { type: String },
    profilePicture: { type: String },
    isVerifed: { type: Boolean, default: false },
    accountStatus: {
      type: Number,
      enum: ACCOUNT_STATUS,
      default: ACCOUNT_STATUS.INACTIVE,
    },
    otp: { type: String },
    otpExpiry: { type: Date },
    lastLogin: { type: Date, select: false },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  {
    timestamps: true,
  },
);

userSchema.pre("save", async function () {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }
});

userSchema.methods.generateOTP = async function () {
  const otp = crypto.randomInt(1000, 9999).toString();
  const hashedOtp = crypto.createHash("sha256").update(otp).digest("hex");
  this.otp = hashedOtp;
  this.otpExpiry = new Date(Date.now() + OTP_EXPIRY_TIME);
  await this.save();
  return otp;
};

userSchema.methods.verifyOTP = async function (otp: string) {
  const hashedOtp = crypto.createHash("sha256").update(otp).digest("hex");

  return this.otp === hashedOtp && this.otpExpiry > new Date();
};
userSchema.methods.clearOtp = function (): void {
  this.otp = undefined;
  this.otpExpiry = undefined;
  // this.isVerifed = true;
  // this.accountStatus = ACCOUNT_STATUS.ACTIVE;
};

userSchema.methods.comparePassword = async function (
  candidatePassword: string,
): Promise<boolean> {
  return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password;
  return user;
};

userSchema.methods.generateAccessAndRefreshToken = function () {
  const payload = { id: this._id, email: this.email, role: this.role };
  const accessToken = jwt.sign(payload, env.JWT_ACCESS_SECRET!, {
    expiresIn: env.JWT_ACCESS_EXPIRES || "15m",
  } as jwt.SignOptions);
  const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET!, {
    expiresIn: env.JWT_REFRESH_EXPIRES || "30d",
  } as jwt.SignOptions);

  return { accessToken, refreshToken };
};

export const User = model<IUserDocument>("User", userSchema);
