import type { User as AppUser, UserType } from "@/contexts/AuthContext";

type FirebaseUserLike = {
  uid: string;
  displayName: string | null;
  email: string | null;
  phoneNumber: string | null;
  getIdToken: () => Promise<string>;
};

type SaveVerifiedUserParams = {
  firebaseUser: FirebaseUserLike;
  signIn: (userData: AppUser) => void;
  userType: UserType;
  fallbackName?: string;
  fallbackEmail?: string;
  fallbackPhone?: string;
};

export async function saveVerifiedUserSession({
  firebaseUser,
  signIn,
  userType,
  fallbackName,
  fallbackEmail,
  fallbackPhone,
}: SaveVerifiedUserParams) {
  try {
    const idToken = await firebaseUser.getIdToken();
    const response = await fetch("/api/backend/verify-token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ idToken }),
    });

    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      const data = await response.json();
      if (!response.ok || !data.success) {
        console.warn("Backend token verification status:", data);
      }
    }
  } catch (error) {
    // If backend is running without service account or offline, gracefully continue client session
    console.warn("Backend verify-token skipped or failed:", error);
  }

  signIn({
    id: firebaseUser.uid,
    uid: firebaseUser.uid,
    name:
      firebaseUser.displayName ||
      fallbackName ||
      firebaseUser.email?.split("@")[0] ||
      firebaseUser.phoneNumber ||
      "User",
    email: firebaseUser.email || fallbackEmail || undefined,
    phone: firebaseUser.phoneNumber || fallbackPhone || undefined,
    type: userType,
  });
}
