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

function getApiUrl() {
  return process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
}

export async function saveVerifiedUserSession({
  firebaseUser,
  signIn,
  userType,
  fallbackName,
  fallbackEmail,
  fallbackPhone,
}: SaveVerifiedUserParams) {
  const idToken = await firebaseUser.getIdToken();
  const response = await fetch(`${getApiUrl()}/verify-token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ idToken }),
  });

  const contentType = response.headers.get("content-type");
  if (!contentType || !contentType.includes("application/json")) {
    throw new Error("Server returned non-JSON response");
  }

  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.error || "Verification failed");
  }

  signIn({
    id: firebaseUser.uid,
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
