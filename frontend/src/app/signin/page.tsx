"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  GoogleAuthProvider,
  RecaptchaVerifier,
  signInWithEmailAndPassword,
  signInWithPhoneNumber,
  signInWithPopup,
} from "firebase/auth";
import type { ConfirmationResult } from "firebase/auth";
import { auth } from "@/config/firebaseConfig";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { User, Palette, Mail, Lock, ArrowLeft, Phone } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
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

type UserType = "user" | "artisan" | null;
type AuthMode = "email" | "phone";

type AuthWindow = Window & {
  recaptchaVerifier?: RecaptchaVerifier;
};

export default function SignInPage() {
  const [userType, setUserType] = useState<UserType>(null);
  const [authMode, setAuthMode] = useState<AuthMode>("email");
  const [email, setEmail] = useState("");
  const [countryCode, setCountryCode] = useState("+91");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [formErrors, setFormErrors] = useState<{ email?: string; phone?: string; password?: string; otp?: string }>({});
  const { signIn } = useAuth();
  const router = useRouter();
  const [redirectUrl, setRedirectUrl] = useState<string>("/");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const redirect = params.get("redirect");
    if (redirect) {
      setRedirectUrl(redirect);
    }
  }, []);

  useEffect(() => {
    setFormErrors({});
    setOtpCode("");
    setConfirmationResult(null);
  }, [authMode]);

  const handleRoleSelection = (type: UserType) => setUserType(type);

  const saveVerifiedUser = async (
    firebaseUser: { uid: string; displayName: string | null; email: string | null; phoneNumber: string | null; getIdToken: () => Promise<string> },
    method: string = authMode
  ) => {
    await saveVerifiedUserSession({
      firebaseUser,
      signIn,
      userType: userType!,
    });
    trackAuthAction("login", method, userType || undefined);
    router.push(redirectUrl);
  };

  const getRecaptchaVerifier = () => {
    const authWindow = window as AuthWindow;
    if (!authWindow.recaptchaVerifier) {
      authWindow.recaptchaVerifier = new RecaptchaVerifier(auth, "signin-recaptcha", {
        size: "invisible",
      });
    }
    return authWindow.recaptchaVerifier;
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();

    if (authMode === "phone") {
      await handleSendOtp();
      return;
    }

    const nextErrors = {
      email: getEmailValidationMessage(email),
      password: getPasswordValidationMessage(password),
      phone: "",
      otp: "",
    };

    setFormErrors(nextErrors);
    if (nextErrors.email || nextErrors.password) {
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      await saveVerifiedUser(userCredential.user);
    } catch (err: unknown) {
      const error = err as Error;
      console.error("Sign-in error:", error);
      alert(error.message === "Server returned non-JSON response"
        ? "Unable to connect to the authentication server. Please try again later."
        : getFirebaseAuthErrorMessage(err));
    }
  };

  const handleSendOtp = async () => {
    const nextErrors = {
      email: "",
      password: "",
      phone: getPhoneValidationMessage(phone),
      otp: "",
    };

    setFormErrors(nextErrors);
    if (nextErrors.phone) {
      return;
    }

    const fullPhoneNumber = `${countryCode}${normalizePhoneNumber(phone)}`;

    try {
      setSendingOtp(true);
      const verifier = getRecaptchaVerifier();
      const result = await signInWithPhoneNumber(auth, fullPhoneNumber, verifier);
      setConfirmationResult(result);
      alert(`OTP sent to ${fullPhoneNumber}`);
    } catch (err: unknown) {
      console.error("Phone OTP send error:", err);
      alert(getFirebaseAuthErrorMessage(err));
    } finally {
      setSendingOtp(false);
    }
  };

  const handleVerifyOtp = async () => {
    const otpError = /^\d{6}$/.test(otpCode) ? "" : "Enter the 6-digit OTP.";
    setFormErrors((prev) => ({ ...prev, otp: otpError }));
    if (otpError || !confirmationResult) {
      return;
    }

    try {
      setVerifyingOtp(true);
      const result = await confirmationResult.confirm(otpCode);
      await saveVerifiedUser(result.user);
    } catch (err: unknown) {
      console.error("OTP verification error:", err);
      alert(getFirebaseAuthErrorMessage(err));
    } finally {
      setVerifyingOtp(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      await saveVerifiedUser(result.user, "google");
    } catch (err: unknown) {
      const error = err as Error;
      console.error("Google Sign-in Error:", error);
      alert(error.message === "Server returned non-JSON response"
        ? "Unable to connect to the authentication server. Please try again later."
        : getFirebaseAuthErrorMessage(err));
    }
  };

  const handleAppleSignIn = () => {
    alert("Apple Sign-In coming soon!");
  };

  if (!userType) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-amber-800 mb-2">Welcome Back</h1>
            <p className="text-amber-600">Choose how you&apos;d like to sign in</p>
          </div>

          <div className="space-y-4">
            <Card
              className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-amber-300"
              onClick={() => handleRoleSelection("user")}
            >
              <CardContent className="p-6 flex items-center gap-4">
                <User className="h-6 w-6 text-blue-600" />
                <div>
                  <h3 className="font-semibold text-lg">Sign in as User</h3>
                  <p className="text-sm text-muted-foreground">
                    Browse and purchase beautiful handcrafted items
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card
              className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-amber-300"
              onClick={() => handleRoleSelection("artisan")}
            >
              <CardContent className="p-6 flex items-center gap-4">
                <Palette className="h-6 w-6 text-orange-600" />
                <div>
                  <h3 className="font-semibold text-lg">Sign in as Artisan</h3>
                  <p className="text-sm text-muted-foreground">
                    Sell your artwork and manage your business
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="text-center mt-6">
            <Link href="/" className="text-amber-600 hover:text-amber-800 text-sm">
              &larr; Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-md">
        <CardHeader>
          <div className="flex items-center gap-2 mb-4">
            <Button variant="ghost" size="sm" onClick={() => setUserType(null)} className="p-1">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-2">
              {userType === "user" ? (
                <User className="h-5 w-5 text-blue-600" />
              ) : (
                <Palette className="h-5 w-5 text-orange-600" />
              )}
              <span className="font-medium">
                {userType === "user" ? "User" : "Artisan"} Sign In
              </span>
            </div>
          </div>
          <CardTitle className="text-2xl">Welcome back</CardTitle>
          <CardDescription>Enter your credentials to access your {userType} account</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-2 rounded-lg bg-amber-50 p-1">
            <Button
              type="button"
              variant={authMode === "email" ? "default" : "ghost"}
              className="w-full"
              onClick={() => setAuthMode("email")}
            >
              Email
            </Button>
            <Button
              type="button"
              variant={authMode === "phone" ? "default" : "ghost"}
              className="w-full"
              onClick={() => setAuthMode("phone")}
            >
              Phone OTP
            </Button>
          </div>

          <form onSubmit={handleSignIn} className="space-y-4">
            {authMode === "email" ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (formErrors.email) {
                          setFormErrors((prev) => ({ ...prev, email: getEmailValidationMessage(e.target.value) }));
                        }
                      }}
                      className="pl-10"
                      required
                    />
                  </div>
                  {formErrors.email ? <p className="text-xs text-red-600">{formErrors.email}</p> : null}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (formErrors.password) {
                          setFormErrors((prev) => ({ ...prev, password: getPasswordValidationMessage(e.target.value) }));
                        }
                      }}
                      className="pl-10"
                      required
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">Minimum 8 characters, including uppercase, lowercase, number, and special character.</p>
                  {formErrors.password ? <p className="text-xs text-red-600">{formErrors.password}</p> : null}
                </div>

                <Button type="submit" className="w-full">
                  Sign In
                </Button>
              </>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <div className="flex gap-2">
                    <select
                      aria-label="Country code"
                      value={countryCode}
                      onChange={(e) => setCountryCode(e.target.value)}
                      className="w-44 rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      {COUNTRY_CODES.map((item) => (
                        <option key={item.label} value={item.code}>
                          {item.label}
                        </option>
                      ))}
                    </select>
                    <div className="relative flex-1">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="Phone number"
                        value={phone}
                        onChange={(e) => {
                          setPhone(e.target.value);
                          if (formErrors.phone) {
                            setFormErrors((prev) => ({ ...prev, phone: getPhoneValidationMessage(e.target.value) }));
                          }
                        }}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                  {formErrors.phone ? <p className="text-xs text-red-600">{formErrors.phone}</p> : null}
                </div>

                {confirmationResult ? (
                  <div className="space-y-2">
                    <Label htmlFor="otp">OTP</Label>
                    <Input
                      id="otp"
                      inputMode="numeric"
                      maxLength={6}
                      placeholder="Enter 6-digit OTP"
                      value={otpCode}
                      onChange={(e) => {
                        setOtpCode(e.target.value.replace(/\D/g, ""));
                        if (formErrors.otp) {
                          setFormErrors((prev) => ({ ...prev, otp: "" }));
                        }
                      }}
                    />
                    {formErrors.otp ? <p className="text-xs text-red-600">{formErrors.otp}</p> : null}
                  </div>
                ) : null}

                <div className="grid grid-cols-2 gap-3">
                  <Button type="button" className="w-full" onClick={handleSendOtp} disabled={sendingOtp}>
                    {sendingOtp ? "Sending..." : confirmationResult ? "Resend OTP" : "Send OTP"}
                  </Button>
                  <Button type="button" variant="outline" className="w-full" onClick={handleVerifyOtp} disabled={!confirmationResult || verifyingOtp}>
                    {verifyingOtp ? "Verifying..." : "Verify OTP"}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Phone OTP sign-in needs Firebase Phone Authentication enabled for your project.
                </p>
              </>
            )}
          </form>

          <div id="signin-recaptcha" />

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator className="w-full" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" onClick={handleGoogleSignIn}>
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Google
            </Button>

            <Button variant="outline" onClick={handleAppleSignIn}>
              <span>Apple</span>
            </Button>
          </div>

          <div className="text-center text-sm">
            <span className="text-muted-foreground">Don&apos;t have an account? </span>
            <Link href={`/register?type=${userType}`} className="text-primary hover:underline">
              Create account
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
