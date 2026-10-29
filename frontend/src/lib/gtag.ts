export const GA_MEASUREMENT_ID = "G-JNNZJD88GZ";

type GtagEventParams = Record<string, string | number | boolean | undefined>;

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag: (
      command: "config" | "event" | "js",
      targetIdOrEventName: string | Date,
      config?: GtagEventParams
    ) => void;
  }
}

export function pageview(url: string) {
  if (typeof window === "undefined" || !window.gtag) return;

  window.gtag("config", GA_MEASUREMENT_ID, {
    page_path: url,
  });
}

export function event(action: string, params?: GtagEventParams) {
  if (typeof window === "undefined" || !window.gtag) return;

  window.gtag("event", action, params);
}

export function trackSearchClick(searchTerm: string, source: string) {
  event("search_click", {
    search_term: searchTerm,
    source,
  });
}

export function trackProductClick(productId: string, productName: string, source: string) {
  event("product_click", {
    product_id: productId,
    product_name: productName,
    source,
  });
}

export function trackAuthAction(actionType: "login" | "register", method: string, userType?: string) {
  event("auth_action", {
    action_type: actionType,
    method,
    user_type: userType,
  });
}
