"use client";

import { Menu, X, ShoppingCart, Store, Palette, Home, MapPin, Video } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { UserProfileDropdown } from "@/components/ui/user-profile-dropdown";

const NAV_LOGO = {
  url: "/",
  src: "https://cdn.builder.io/api/v1/image/assets%2Fa3656e61a5694931a58316df40a95cae%2Ff3112465dbef47929828fdde4e76efaa?format=webp&width=800",
  alt: "KarigarSetu logo",
  title: "KarigarSetu",
};
const NAV_ITEMS = [
  { name: "Home", link: "/", icon: <Home className="w-4 h-4" /> },
  { name: "Explore", link: "/explore", icon: <Store className="w-4 h-4" /> },
  { name: "Exhibition", link: "/exhibition", icon: <Palette className="w-4 h-4" /> },
  { name: "Workshops", link: "/workshops", icon: <Video className="w-4 h-4" /> },
  { name: "Nearby Stores", link: "/nearby-stores", icon: <MapPin className="w-4 h-4" /> },
];

const scrollToSection = (sectionId: string) => {
  const element = document.getElementById(sectionId);
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' });
  }
};

const AnimatedIndicatorNavbar = () => {
  const [activeItem, setActiveItem] = useState(NAV_ITEMS[0].name);
  const [lang, setLang] = useState("hi");
  const { user, isAuthenticated } = useAuth();
  const { cartCount } = useCart();
  const pathname = usePathname();
  const router = useRouter();

  const indicatorRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLUListElement>(null);
  const translationCacheRef = useRef<Record<string, Record<string, string>>>({});

  useEffect(() => {
    const updateIndicator = () => {
      const activeEl = document.querySelector(
        `[data-nav-item="${activeItem}"]`
      ) as HTMLElement;

      if (activeEl && indicatorRef.current && menuRef.current) {
        const menuRect = menuRef.current.getBoundingClientRect();
        const itemRect = activeEl.getBoundingClientRect();

        indicatorRef.current.style.width = `${itemRect.width}px`;
        indicatorRef.current.style.left = `${itemRect.left - menuRect.left}px`;
      }
    };
    updateIndicator();
    window.addEventListener("resize", updateIndicator);

    return () => window.removeEventListener("resize", updateIndicator);
  }, [activeItem]);

  // Sync active nav item with current pathname so active state persists across navigation
  useEffect(() => {
    if (!pathname) return;

    const matched = NAV_ITEMS.find((item) => {
      if (item.link === "/") return pathname === "/";
      // match exact or nested routes (e.g. /exhibition or /exhibition/123)
      return pathname === item.link || pathname.startsWith(item.link + "/");
    });

    if (matched) setActiveItem(matched.name);
    else setActiveItem(NAV_ITEMS[0].name);
  }, [pathname]);

  const handleNavigation = (item: typeof NAV_ITEMS[0]) => {
    setActiveItem(item.name);

    // For regular navigation
    if (item.link.startsWith('#')) {
      const sectionId = item.link.replace('#', '') + '-section';
      scrollToSection(sectionId);
    } else {
      // use Next router to navigate client-side so the app router updates without full reload
      try {
        router.push(item.link);
      } catch (e) {
        // fallback to full navigation if router fails
        window.location.href = item.link;
      }
    }
  };

  const LANGS = [
    { code: "hi", label: "हिंदी" },
    { code: "ta", label: "தமிழ்" },
    { code: "bn", label: "বাংলা" },
    { code: "mr", label: "मराठी" },
    { code: "en", label: "English" },
  ];

  const BACKEND_BASE = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

  async function translatePage(target: string) {
    try {
      if (target === "en") {
        const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null);
        let cur: Node | null = walker.nextNode();
        while (cur) {
          const textNode = cur as Text & { __originalText?: string };
          if (textNode.__originalText !== undefined) {
            textNode.nodeValue = textNode.__originalText;
          }
          cur = walker.nextNode();
        }

        document.querySelectorAll<HTMLElement>("[data-original-attr-placeholder],[data-original-attr-title],[data-original-attr-alt],[data-original-attr-aria-label],[data-original-attr-value]").forEach((el) => {
          const attrs = ["placeholder", "title", "alt", "aria-label", "value"] as const;
          attrs.forEach((attr) => {
            const original = el.getAttribute(`data-original-attr-${attr}`);
            if (!original) return;

            if (attr === "value" && (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement)) {
              el.value = original;
            } else {
              el.setAttribute(attr, original);
            }
          });
        });

        return;
      }

      // Collect text nodes and some common attribute strings so we translate everything visible
      const textNodes: Text[] = [];
      const attrItems: { el: HTMLElement; attr: string; original: string }[] = [];

      const markedEls = Array.from(document.querySelectorAll<HTMLElement>("[data-translate]"));

      const pushTextNodesUnder = (root: Node) => {
        const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
          acceptNode(node: Node) {
            const v = node.nodeValue;
            if (!v) return NodeFilter.FILTER_REJECT;
            if (!v.trim()) return NodeFilter.FILTER_REJECT;
            return NodeFilter.FILTER_ACCEPT;
          },
        } as any);
        let cur: Node | null = walker.nextNode();
        while (cur) {
          textNodes.push(cur as Text);
          cur = walker.nextNode();
        }
      };

      const pushAttributesFor = (el: HTMLElement) => {
        try {
          // common attributes to translate
          const attrs = ["placeholder", "title", "alt", "aria-label"];
          attrs.forEach((attr) => {
            const v = el.getAttribute(attr);
            if (v && v.trim()) {
              attrItems.push({ el, attr, original: v });
            }
          });

          // input/textarea value
          if ((el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) && (el as HTMLInputElement).value) {
            const input = el as HTMLInputElement | HTMLTextAreaElement;
            if (input.type !== "hidden" && input.value.trim()) {
              attrItems.push({ el, attr: "value", original: input.value });
            }
          }
        } catch (e) {
          // ignore attribute read errors
        }
      };

      if (markedEls.length) {
        markedEls.forEach((el) => {
          pushTextNodesUnder(el);
          pushAttributesFor(el);
        });
      } else {
        // Fallback: gather visible common text-bearing elements and collect their text nodes
        const candidates = Array.from(document.querySelectorAll<HTMLElement>("h1,h2,h3,p,button,a,label,span,li,input,textarea"));
        const visible = candidates.filter((el) => {
          const txt = (el.innerText || el.textContent || "").trim();
          // also consider attribute-only elements
          const hasAttrText = !!(el.getAttribute && (el.getAttribute('placeholder') || el.getAttribute('title') || el.getAttribute('aria-label') || (el instanceof HTMLInputElement && (el as HTMLInputElement).value)));
          if (!txt && !hasAttrText) return false;
          // skip interactive menus
          if (el.closest('[role="menu"]')) return false;
          if (el.querySelector && el.querySelector('svg')) return false;
          const style = window.getComputedStyle(el);
          if (style.display === 'none' || style.visibility === 'hidden' || parseFloat(style.opacity || '1') === 0) return false;
          return true;
        });
        // Limit elements to avoid huge requests
        visible.slice(0, 40).forEach((el) => {
          pushTextNodesUnder(el);
          pushAttributesFor(el);
        });
        // Also include SVG <text> nodes (select their text content separately)
        try {
          const svgTextEls = Array.from(document.querySelectorAll<SVGTextElement>('svg text'));
          svgTextEls.forEach((st) => pushTextNodesUnder(st as unknown as Node));
        } catch (e) {}
      }

      if (!textNodes.length && !attrItems.length) return;

      // Save original text on each text node (non-standard property but safe in client)
      textNodes.forEach((tn) => {
        if (!(tn as any).__originalText) (tn as any).__originalText = tn.nodeValue;
      });

      // Save original attributes on elements (use dataset to persist)
      attrItems.forEach(({ el, attr, original }) => {
        try {
          const storageAttr = `data-original-attr-${attr}`;
          if (!el.getAttribute(storageAttr)) {
            el.setAttribute(storageAttr, original);
          }
        } catch (e) {}
      });

      // Build combined texts array (first text nodes, then attributes) to send in one batch.
      // We dedupe before sending so repeated labels do not burn translation quota.
      const texts: string[] = [
        ...textNodes.map((tn) => ((tn as any).__originalText || tn.nodeValue || "").trim()),
        ...attrItems.map((it) => it.original.trim()),
      ].filter(Boolean);

      if (!texts.length) return;

      const targetCache = translationCacheRef.current[target] || {};
      translationCacheRef.current[target] = targetCache;

      const uniqueTexts: string[] = [];
      const seen = new Set<string>();
      texts.forEach((text) => {
        if (!seen.has(text)) {
          seen.add(text);
          uniqueTexts.push(text);
        }
      });

      const uncachedTexts = uniqueTexts.filter((text) => !targetCache[text]);

      if (uncachedTexts.length) {
        const res = await fetch(`${BACKEND_BASE}/translate`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: uncachedTexts, target }),
        });
        const json = await res.json();
        if (!json.success) {
          console.error("Translate failed:", json.error);
          return;
        }

        const newTranslations: string[] = json.translations || [];
        uncachedTexts.forEach((text, index) => {
          if (newTranslations[index]) {
            targetCache[text] = newTranslations[index];
          }
        });
      }

      const translations = texts.map((text) => targetCache[text]);
      if (!translations.length) return;

      // Diagnostic log: how many items we sent vs received
      try { console.debug('[translatePage] uniqueTexts=', uniqueTexts.length, 'uncachedTexts=', uncachedTexts.length, 'translationsReceived=', translations.length); } catch (e) {}

      // Apply translations back to text nodes (skip undefined translations to avoid clearing text)
      for (let i = 0; i < textNodes.length; i++) {
        if (translations[i] === undefined) continue;
        const t = translations[i];
        try {
          textNodes[i].nodeValue = t;
        } catch (e) {
          // ignore failures on read-only nodes
        }
      }

      // Apply translations back to attributes (skip undefined)
      for (let j = 0; j < attrItems.length; j++) {
        const idx = textNodes.length + j;
        if (translations[idx] === undefined) continue;
        const trans = translations[idx];
        const { el, attr } = attrItems[j];
        try {
          if (attr === 'value') {
            if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) {
              (el as HTMLInputElement | HTMLTextAreaElement).value = trans;
            }
          } else {
            el.setAttribute(attr, trans);
          }
        } catch (e) {}
      }
    } catch (e) {
      console.error("Translate error:", e);
    }
  }

  return (
    <section className="relative py-4 bg-background border-b border-border">
      <nav className="container mx-auto flex items-center justify-between">
        {/* Compact language selector (top-left) */}
        <div className="absolute left-4 top-3 z-50">
          <label htmlFor="site-lang" className="sr-only">Select language</label>
          <select
            id="site-lang"
            value={lang}
            onChange={async (e) => {
              const v = e.target.value;
              setLang(v);
              // translate visible marked strings
              await translatePage(v);
            }}
            className="rounded-md border px-2 py-1 text-sm bg-white"
            aria-label="Select language"
          >
            {LANGS.map((l) => (
              <option key={l.code} value={l.code}>{l.label}</option>
            ))}
          </select>
        </div>
        {/* Left WordMark */}
        <Link href={NAV_LOGO.url} className="flex items-center gap-4">
          <img src={NAV_LOGO.src} className="max-h-20 w-20 md:max-h-24 md:w-24" alt={NAV_LOGO.alt} />
          <span className="text-xl font-bold tracking-tighter text-amber-800 font-display">
            {NAV_LOGO.title}
          </span>
        </Link>

        <NavigationMenu className="hidden lg:block">
          <NavigationMenuList
            ref={menuRef}
            className="rounded-4xl flex items-center gap-6 px-8 py-3"
          >
            {NAV_ITEMS.map((item) => (
              <React.Fragment key={item.name}>
                <NavigationMenuItem>
                  <button
                    data-nav-item={item.name}
                    onClick={() => handleNavigation(item)}
                    className={`relative cursor-pointer text-sm font-medium hover:bg-transparent transition-colors flex items-center gap-2 bg-transparent border-none ${activeItem === item.name
                        ? "text-primary"
                        : "text-muted-foreground hover:text-foreground"
                      }`}
                  >
                    {item.icon && item.icon}
                    {item.name}
                  </button>
                </NavigationMenuItem>
              </React.Fragment>
            ))}
            {/* Active Indicator */}
            <div
              ref={indicatorRef}
              className="absolute bottom-2 flex h-1 items-center justify-center px-2 transition-all duration-300"
            >
              <div className="bg-primary h-0.5 w-full rounded-t-none transition-all duration-300" />
            </div>
          </NavigationMenuList>
        </NavigationMenu>

        {/* Mobile Menu Popover */}
        <MobileNav 
          activeItem={activeItem} 
          setActiveItem={setActiveItem} 
          user={user} 
          isAuthenticated={isAuthenticated}
          onNavigation={handleNavigation}
        />

        <div className="hidden items-center gap-3 lg:flex">
          {/* Cart Icon - Only show for users, not artisans */}
          {(!isAuthenticated || (user && user.type === "user")) && (
            <Link href="/cart">
              <Button
                variant="ghost"
                size="sm"
                className="relative h-10 w-10 p-0 hover:bg-muted"
                aria-label="Shopping Cart"
              >
                <ShoppingCart className="h-5 w-5 text-muted-foreground hover:text-foreground" />
                {/* Cart counter badge */}
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-xs font-bold text-primary-foreground flex items-center justify-center">
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
              </Button>
            </Link>
          )}

          {isAuthenticated && user ? (
            <UserProfileDropdown user={user} />
          ) : (
            <>
              <Link href="/signin">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-10 py-2.5 text-sm font-normal border-border text-foreground hover:bg-muted"
                >
                  Sign In
                </Button>
              </Link>
              <Link href="/register">
                <Button
                  size="sm"
                  className="h-10 py-2.5 text-sm font-normal bg-primary text-primary-foreground hover:bg-marketplace-secondary"
                >
                  Sign Up
                </Button>
              </Link>
            </>
          )}
        </div>
      </nav>
    </section>
  );
};

export { AnimatedIndicatorNavbar };

const AnimatedHamburger = ({ isOpen }: { isOpen: boolean }) => {
  return (
    <div className="group relative h-6 w-6">
      <div className="absolute inset-0">
        <Menu
          className={`text-muted-foreground group-hover:text-foreground absolute transition-all duration-300 ${isOpen ? "rotate-90 opacity-0" : "rotate-0 opacity-100"
            }`}
        />
        <X
          className={`text-muted-foreground group-hover:text-foreground absolute transition-all duration-300 ${isOpen ? "rotate-0 opacity-100" : "-rotate-90 opacity-0"
            }`}
        />
      </div>
    </div>
  );
};

const MobileNav = ({
  activeItem,
  setActiveItem,
  user,
  isAuthenticated,
  onNavigation,
}: {
  activeItem: string;
  setActiveItem: (item: string) => void;
  user: any;
  isAuthenticated: boolean;
  onNavigation: (item: typeof NAV_ITEMS[0]) => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const { cartCount } = useCart();

  return (
    <div className="block lg:hidden">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger>
          <AnimatedHamburger isOpen={isOpen} />
        </PopoverTrigger>

        <PopoverContent
          align="end"
          className="relative -left-4 -top-4 block w-screen max-w-md overflow-hidden rounded-xl p-0 lg:hidden bg-background border-border"
        >
          <ul className="bg-background text-foreground w-full py-4">
            {NAV_ITEMS.map((navItem, idx) => (
              <li key={idx}>
                <button
                  onClick={() => {
                    onNavigation(navItem);
                    setIsOpen(false); // Close mobile menu
                  }}
                  className={`w-full text-left flex items-center gap-3 border-l-[3px] px-6 py-4 text-sm font-medium transition-all duration-75 bg-transparent border-none ${activeItem === navItem.name
                      ? "border-primary text-primary"
                      : "text-muted-foreground hover:text-foreground border-transparent"
                    }`}
                >
                  {navItem.icon && navItem.icon}
                  {navItem.name}
                </button>
              </li>
            ))}

            {/* Mobile Cart - Only show for users, not artisans */}
            {(!isAuthenticated || (user && user.type === "user")) && (
              <li className="border-l-[3px] border-transparent px-6 py-4">
                <Link href="/cart">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="relative w-full justify-start gap-3 h-10"
                    aria-label="Shopping Cart"
                  >
                    <ShoppingCart className="h-4 w-4" />
                    Cart
                    {cartCount > 0 && (
                      <span className="absolute right-3 top-2 h-5 w-5 rounded-full bg-primary text-xs font-bold text-primary-foreground flex items-center justify-center">
                        {cartCount > 99 ? '99+' : cartCount}
                      </span>
                    )}
                  </Button>
                </Link>
              </li>
            )}

            {isAuthenticated && user ? (
              <li className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <p className="text-sm font-medium">{user.name}</p>
                      <p className="text-xs text-muted-foreground">{user.email || user.phone || "Phone verified account"}</p>
                  </div>
                  <UserProfileDropdown user={user} />
                </div>
              </li>
            ) : (
              <li className="flex flex-col gap-2 px-7 py-2">
                <Link href="/signin">
                  <Button variant="outline" className="w-full border-border text-foreground hover:bg-muted">
                    Sign In
                  </Button>
                </Link>
                <Link href="/register">
                  <Button className="w-full bg-primary text-primary-foreground hover:bg-marketplace-secondary">
                    Sign Up
                  </Button>
                </Link>
              </li>
            )}
          </ul>
        </PopoverContent>
      </Popover>
    </div>
  );
};
