"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  GoogleAuthProvider,
  RecaptchaVerifier,
  createUserWithEmailAndPassword,
  signInWithPhoneNumber,
  signInWithPopup,
  updateProfile,
} from "firebase/auth";
import type { ConfirmationResult } from "firebase/auth";
import { auth } from "@/config/firebaseConfig";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { User, Palette, ArrowLeft } from "lucide-react";
import Link from "next/link";
import {
  COUNTRY_CODES,
  getEmailValidationMessage,
  getFirebaseAuthErrorMessage,
  getPasswordValidationMessage,
  getPhoneValidationMessage,
  normalizePhoneNumber,
} from "@/lib/auth-form-utils";
import { saveVerifiedUserSession } from "@/lib/firebase-auth-session";
import { trackAuthAction } from "@/lib/gtag";

type UserType = "user" | "artisan";
type AuthMode = "email" | "phone";

type AuthWindow = Window & {
  registerRecaptchaVerifier?: RecaptchaVerifier;
};

interface UserFormData {
  name: string;
  email: string;
  countryCode: string;
  phone: string;
  location: string;
  age: string;
  password: string;
  confirmPassword: string;
}

interface ArtisanFormData {
  name: string;
  brandName: string;
  email: string;
  countryCode: string;
  phone: string;
  artworkType: string;
  state: string;
  city: string;
  password: string;
  confirmPassword: string;
  bio: string;
}

const INDIAN_STATES = [
  "Andhra Pradesh", "Assam", "Bihar", "Goa", "Gujarat", "Haryana",
  "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Odisha",
  "Punjab", "Rajasthan", "Tamil Nadu", "Telangana", "Uttar Pradesh", "West Bengal",
];

const ARTWORK_TYPES = [
  "Painting", "Sculpture", "Pottery", "Textiles", "Jewelry",
  "Wood Carving", "Metal Work", "Embroidery", "Handicrafts", "Other",
];

function RegisterPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { signIn } = useAuth();
  const [userType, setUserType] = useState<UserType>("user");
  const [authMode, setAuthMode] = useState<AuthMode>("email");
  const [loading, setLoading] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const [userFormData, setUserFormData] = useState<UserFormData>({
    name: "",
    email: "",
    countryCode: "+91",
    phone: "",
    location: "",
    age: "",
    password: "",
    confirmPassword: "",
  });

  const [artisanFormData, setArtisanFormData] = useState<ArtisanFormData>({
    name: "",
    brandName: "",
    email: "",
    countryCode: "+91",
    phone: "",
    artworkType: "",
    state: "",
    city: "",
    password: "",
    confirmPassword: "",
    bio: "",
  });

  useEffect(() => {
    const type = searchParams.get("type");
    if (type === "artisan" || type === "user") {
      setUserType(type);
    }
  }, [searchParams]);

  useEffect(() => {
    setFormErrors({});
    setOtpCode("");
    setConfirmationResult(null);
  }, [authMode, userType]);

  const handleUserFormChange = (field: keyof UserFormData, value: string) =>
    setUserFormData((prev) => ({ ...prev, [field]: value }));

  const handleArtisanFormChange = (field: keyof ArtisanFormData, value: string) =>
    setArtisanFormData((prev) => ({ ...prev, [field]: value }));

  const currentFormData = userType === "user" ? userFormData : artisanFormData;
  const displayName = userType === "user"
    ? userFormData.name
    : artisanFormData.brandName || artisanFormData.name;

  const saveVerifiedUser = async (
    firebaseUser: { uid: string; displayName: string | null; email: string | null; phoneNumber: string | null; getIdToken: () => Promise<string> },
    method: string = authMode
  ) => {
    await saveVerifiedUserSession({
      firebaseUser,
      signIn,
      userType,
      fallbackName: displayName,
      fallbackEmail: currentFormData.email,
      fallbackPhone: `${currentFormData.countryCode}${normalizePhoneNumber(currentFormData.phone)}`,
    });
    trackAuthAction("register", method, userType);
    router.push("/");
  };

  const getRecaptchaVerifier = () => {
    const authWindow = window as AuthWindow;
    if (!authWindow.registerRecaptchaVerifier) {
      authWindow.registerRecaptchaVerifier = new RecaptchaVerifier(auth, "register-recaptcha", {
        size: "invisible",
      });
    }
    return authWindow.registerRecaptchaVerifier;
  };

  const validateForm = () => {
    const nextErrors: Record<string, string> = {
      phone: getPhoneValidationMessage(currentFormData.phone),
    };

    if (authMode === "email") {
      nextErrors.email = getEmailValidationMessage(currentFormData.email);
      nextErrors.password = getPasswordValidationMessage(currentFormData.password);
      nextErrors.confirmPassword = currentFormData.password !== currentFormData.confirmPassword ? "Passwords do not match." : "";
    } else {
      nextErrors.otp = confirmationResult && !/^\d{6}$/.test(otpCode) ? "Enter the 6-digit OTP." : "";
    }

    setFormErrors(nextErrors);
    return !Object.values(nextErrors).some(Boolean);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);

      if (authMode === "email") {
        const userCredential = await createUserWithEmailAndPassword(auth, currentFormData.email, currentFormData.password);
        if (displayName) {
          await updateProfile(userCredential.user, { displayName });
        }
        await saveVerifiedUser(userCredential.user);
        return;
      }

      if (!confirmationResult) {
        await handleSendOtp();
        return;
      }

      const result = await confirmationResult.confirm(otpCode);
      if (displayName) {
        await updateProfile(result.user, { displayName });
      }
      await saveVerifiedUser(result.user);
    } catch (err: unknown) {
      alert(getFirebaseAuthErrorMessage(err));
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async () => {
    const phoneError = getPhoneValidationMessage(currentFormData.phone);
    setFormErrors((prev) => ({ ...prev, phone: phoneError, otp: "" }));
    if (phoneError) {
      return;
    }

    try {
      setLoading(true);
      const fullPhoneNumber = `${currentFormData.countryCode}${normalizePhoneNumber(currentFormData.phone)}`;
      const verifier = getRecaptchaVerifier();
      const result = await signInWithPhoneNumber(auth, fullPhoneNumber, verifier);
      setConfirmationResult(result);
      alert(`OTP sent to ${fullPhoneNumber}`);
    } catch (err: unknown) {
      alert(getFirebaseAuthErrorMessage(err));
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    try {
      setLoading(true);
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      await saveVerifiedUser(result.user, "google");
    } catch (err: unknown) {
      alert(getFirebaseAuthErrorMessage(err));
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="space-y-1">
          <div className="flex items-center gap-2 mb-4">
            <Link href="/signin">
              <Button variant="ghost" size="sm" className="p-1">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              {userType === "user" ? (
                <User className="h-5 w-5 text-blue-600" />
              ) : (
                <Palette className="h-5 w-5 text-orange-600" />
              )}
              <span className="font-medium">
                {userType === "user" ? "User" : "Artisan"} Registration
              </span>
            </div>
          </div>
          <CardTitle className="text-2xl">Create your account</CardTitle>
          <CardDescription>
            Fill in your details to create your {userType} account
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="mb-4 grid grid-cols-2 gap-2 rounded-lg bg-amber-50 p-1">
            <Button
              type="button"
              variant={authMode === "email" ? "default" : "ghost"}
              onClick={() => setAuthMode("email")}
            >
              Email
            </Button>
            <Button
              type="button"
              variant={authMode === "phone" ? "default" : "ghost"}
              onClick={() => setAuthMode("phone")}
            >
              Phone OTP
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {userType === "user" && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Full Name</Label>
                    <Input
                      value={userFormData.name}
                      onChange={(e) => handleUserFormChange("name", e.target.value)}
                      placeholder="Enter your full name"
                      required
                    />
                  </div>
                  {authMode === "email" ? (
                    <div className="space-y-2">
                      <Label>Email</Label>
                      <Input
                        type="email"
                        value={userFormData.email}
                        onChange={(e) => {
                          handleUserFormChange("email", e.target.value);
                          if (formErrors.email) {
                            setFormErrors((prev) => ({ ...prev, email: getEmailValidationMessage(e.target.value) }));
                          }
                        }}
                        placeholder="Enter your email"
                        required
                      />
                      {formErrors.email ? <p className="text-xs text-red-600">{formErrors.email}</p> : null}
                    </div>
                  ) : null}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Phone</Label>
                    <div className="flex gap-2">
                      <select
                        value={userFormData.countryCode}
                        onChange={(e) => handleUserFormChange("countryCode", e.target.value)}
                        className="w-44 rounded-md border border-input bg-background px-3 py-2 text-sm"
                      >
                        {COUNTRY_CODES.map((item) => (
                          <option key={item.label} value={item.code}>
                            {item.label}
                          </option>
                        ))}
                      </select>
                      <Input
                        type="tel"
                        value={userFormData.phone}
                        onChange={(e) => {
                          handleUserFormChange("phone", e.target.value);
                          if (formErrors.phone) {
                            setFormErrors((prev) => ({ ...prev, phone: getPhoneValidationMessage(e.target.value) }));
                          }
                        }}
                        placeholder="Enter phone number"
                        required
                      />
                    </div>
                    {formErrors.phone ? <p className="text-xs text-red-600">{formErrors.phone}</p> : null}
                  </div>
                  <div className="space-y-2">
                    <Label>Age</Label>
                    <Input
                      type="number"
                      value={userFormData.age}
                      onChange={(e) => handleUserFormChange("age", e.target.value)}
                      placeholder="Age"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Location</Label>
                  <Input
                    value={userFormData.location}
                    onChange={(e) => handleUserFormChange("location", e.target.value)}
                    placeholder="Enter your city, state"
                    required
                  />
                </div>

                {authMode === "email" ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Password</Label>
                      <Input
                        type="password"
                        value={userFormData.password}
                        onChange={(e) => {
                          handleUserFormChange("password", e.target.value);
                          if (formErrors.password) {
                            setFormErrors((prev) => ({ ...prev, password: getPasswordValidationMessage(e.target.value) }));
                          }
                        }}
                        required
                      />
                      <p className="text-xs text-muted-foreground">Minimum 8 characters, including uppercase, lowercase, number, and special character.</p>
                      {formErrors.password ? <p className="text-xs text-red-600">{formErrors.password}</p> : null}
                    </div>
                    <div className="space-y-2">
                      <Label>Confirm Password</Label>
                      <Input
                        type="password"
                        value={userFormData.confirmPassword}
                        onChange={(e) => {
                          handleUserFormChange("confirmPassword", e.target.value);
                          if (formErrors.confirmPassword) {
                            setFormErrors((prev) => ({
                              ...prev,
                              confirmPassword: userFormData.password !== e.target.value ? "Passwords do not match." : "",
                            }));
                          }
                        }}
                        required
                      />
                      {formErrors.confirmPassword ? <p className="text-xs text-red-600">{formErrors.confirmPassword}</p> : null}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label>OTP</Label>
                    <div className="flex gap-2">
                      <Input
                        inputMode="numeric"
                        maxLength={6}
                        value={otpCode}
                        onChange={(e) => {
                          setOtpCode(e.target.value.replace(/\D/g, ""));
                          if (formErrors.otp) {
                            setFormErrors((prev) => ({ ...prev, otp: "" }));
                          }
                        }}
                        placeholder="Enter 6-digit OTP"
                      />
                      <Button type="button" variant="outline" onClick={handleSendOtp} disabled={loading}>
                        {confirmationResult ? "Resend OTP" : "Send OTP"}
                      </Button>
                    </div>
                    {formErrors.otp ? <p className="text-xs text-red-600">{formErrors.otp}</p> : null}
                  </div>
                )}
              </>
            )}

            {userType === "artisan" && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Full Name</Label>
                    <Input
                      value={artisanFormData.name}
                      onChange={(e) => handleArtisanFormChange("name", e.target.value)}
                      placeholder="Enter your name"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Brand Name</Label>
                    <Input
                      value={artisanFormData.brandName}
                      onChange={(e) => handleArtisanFormChange("brandName", e.target.value)}
                      placeholder="Enter brand name"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {authMode === "email" ? (
                    <div className="space-y-2">
                      <Label>Email</Label>
                      <Input
                        type="email"
                        value={artisanFormData.email}
                        onChange={(e) => {
                          handleArtisanFormChange("email", e.target.value);
                          if (formErrors.email) {
                            setFormErrors((prev) => ({ ...prev, email: getEmailValidationMessage(e.target.value) }));
                          }
                        }}
                        placeholder="Enter email"
                        required
                      />
                      {formErrors.email ? <p className="text-xs text-red-600">{formErrors.email}</p> : null}
                    </div>
                  ) : null}
                  <div className="space-y-2">
                    <Label>Phone</Label>
                    <div className="flex gap-2">
                      <select
                        value={artisanFormData.countryCode}
                        onChange={(e) => handleArtisanFormChange("countryCode", e.target.value)}
                        className="w-44 rounded-md border border-input bg-background px-3 py-2 text-sm"
                      >
                        {COUNTRY_CODES.map((item) => (
                          <option key={item.label} value={item.code}>
                            {item.label}
                          </option>
                        ))}
                      </select>
                      <Input
                        type="tel"
                        value={artisanFormData.phone}
                        onChange={(e) => {
                          handleArtisanFormChange("phone", e.target.value);
                          if (formErrors.phone) {
                            setFormErrors((prev) => ({ ...prev, phone: getPhoneValidationMessage(e.target.value) }));
                          }
                        }}
                        placeholder="Enter phone number"
                        required
                      />
                    </div>
                    {formErrors.phone ? <p className="text-xs text-red-600">{formErrors.phone}</p> : null}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Type of Artwork</Label>
                  <Select
                    value={artisanFormData.artworkType}
                    onValueChange={(v) => handleArtisanFormChange("artworkType", v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {ARTWORK_TYPES.map((t) => (
                        <SelectItem key={t} value={t}>
                          {t}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>State</Label>
                    <Select
                      value={artisanFormData.state}
                      onValueChange={(v) => handleArtisanFormChange("state", v)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select state" />
                      </SelectTrigger>
                      <SelectContent>
                        {INDIAN_STATES.map((s) => (
                          <SelectItem key={s} value={s}>
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>City</Label>
                    <Input
                      value={artisanFormData.city}
                      onChange={(e) => handleArtisanFormChange("city", e.target.value)}
                      placeholder="Enter city"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Bio (optional)</Label>
                  <Textarea
                    value={artisanFormData.bio}
                    onChange={(e) => handleArtisanFormChange("bio", e.target.value)}
                    placeholder="Tell us about yourself"
                  />
                </div>

                {authMode === "email" ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Password</Label>
                      <Input
                        type="password"
                        value={artisanFormData.password}
                        onChange={(e) => {
                          handleArtisanFormChange("password", e.target.value);
                          if (formErrors.password) {
                            setFormErrors((prev) => ({ ...prev, password: getPasswordValidationMessage(e.target.value) }));
                          }
                        }}
                        required
                      />
                      <p className="text-xs text-muted-foreground">Minimum 8 characters, including uppercase, lowercase, number, and special character.</p>
                      {formErrors.password ? <p className="text-xs text-red-600">{formErrors.password}</p> : null}
                    </div>
                    <div className="space-y-2">
                      <Label>Confirm Password</Label>
                      <Input
                        type="password"
                        value={artisanFormData.confirmPassword}
                        onChange={(e) => {
                          handleArtisanFormChange("confirmPassword", e.target.value);
                          if (formErrors.confirmPassword) {
                            setFormErrors((prev) => ({
                              ...prev,
                              confirmPassword: artisanFormData.password !== e.target.value ? "Passwords do not match." : "",
                            }));
                          }
                        }}
                        required
                      />
                      {formErrors.confirmPassword ? <p className="text-xs text-red-600">{formErrors.confirmPassword}</p> : null}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label>OTP</Label>
                    <div className="flex gap-2">
                      <Input
                        inputMode="numeric"
                        maxLength={6}
                        value={otpCode}
                        onChange={(e) => {
                          setOtpCode(e.target.value.replace(/\D/g, ""));
                          if (formErrors.otp) {
                            setFormErrors((prev) => ({ ...prev, otp: "" }));
                          }
                        }}
                        placeholder="Enter 6-digit OTP"
                      />
                      <Button type="button" variant="outline" onClick={handleSendOtp} disabled={loading}>
                        {confirmationResult ? "Resend OTP" : "Send OTP"}
                      </Button>
                    </div>
                    {formErrors.otp ? <p className="text-xs text-red-600">{formErrors.otp}</p> : null}
                  </div>
                )}
              </>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading
                ? authMode === "email" ? "Creating Account..." : "Processing..."
                : authMode === "email" ? "Create Account" : confirmationResult ? "Verify OTP & Create Account" : "Send OTP"}
            </Button>

            <div id="register-recaptcha" />

            <Button variant="outline" onClick={handleGoogleSignUp} className="w-full" type="button" disabled={loading}>
              Continue with Google
            </Button>

            {authMode === "phone" ? (
              <p className="text-xs text-muted-foreground text-center">
                Phone OTP signup needs Firebase Phone Authentication enabled for your project.
              </p>
            ) : null}

            <div className="text-center text-sm mt-4">
              <span className="text-muted-foreground">Already have an account? </span>
              <Link href="/signin" className="text-primary hover:underline">
                Sign in
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <RegisterPageContent />
    </Suspense>
  );
}
