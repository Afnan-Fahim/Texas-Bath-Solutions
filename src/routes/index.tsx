import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { format } from "date-fns";
import {
  Phone,
  Menu,
  X,
  Star,
  ShieldCheck,
  Award,
  Home,
  Sparkles,
  Clock,
  Droplets,
  CalendarDays,
  MapPin,
  Check,
  ChevronRight,
  ChevronLeft,
  Waves,
  CreditCard,
  ClipboardCheck,
  Ruler,
  ShowerHead,
  Mail,
} from "lucide-react";
import logoImg from "@/assets/logo-header.webp";
import logoFooterImg from "@/assets/logo-footer.webp";

import heroPoster from "@/assets/hero-video-poster.avif";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { LazyCalendar } from "@/components/LazyCalendar";
import { submitLead } from "@/lib/leads.functions";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";
import { LegalTerms } from "@/components/LegalTerms";
import { QuizFlow, QuizState } from "@/components/quiz/QuizFlow";

import heroShower from "@/assets/hero-shower.avif";
import afterSubway from "@/assets/after-subway.avif";
import afterSubway2 from "@/assets/after-subway-2.avif";
import afterSubway3 from "@/assets/after-subway-3.avif";
import afterMarble from "@/assets/after-marble.avif";
import afterVenatino from "@/assets/after-venatino.avif";
import afterModern from "@/assets/after-modern.avif";
import afterModern2 from "@/assets/after-modern-2.avif";
import offerTeachers from "@/assets/offer-teachers-first-responders.avif";
import offerMilitary from "@/assets/offer-military-veterans.avif";
import offerSeniors from "@/assets/offer-seniors.avif";
import offerSummer from "@/assets/offer-summer-sale.avif";
import beforeBeige from "@/assets/before-beige.avif";
import beforeFiberglass from "@/assets/before-fiberglass.avif";
import beforePink from "@/assets/before-pink.avif";
import beforeWhiteTile from "@/assets/before-white-tile.avif";

/* ---------------------------------------------------------------
 * TEMPORARY VERIFICATION LOGGING (safe to delete after QA)
 * Every log below is prefixed with [TBS Pixel] so you can filter the
 * browser console by "TBS Pixel" and confirm:
 *   1. Meta Pixel is initialized (fbq present on window)
 *   2. Lead fires ONLY on successful form completion (once per lead)
 *   3. Contact fires on tel: clicks
 * Remove this block + the pixelLog() calls to clean up.
 * --------------------------------------------------------------- */
const PIXEL_DEBUG = true;
function pixelLog(...args: unknown[]) {
  if (!PIXEL_DEBUG || typeof window === "undefined") return;
  // eslint-disable-next-line no-console
  console.log("[TBS Pixel]", ...args);
}

function getFbq() {
  if (typeof window === "undefined") return undefined;
  return (window as unknown as { fbq?: (...args: unknown[]) => void }).fbq;
}

/** TEMP: verifies the base pixel loaded and PageView fired on this page load. */
function usePixelInitCheck() {
  useEffect(() => {
    let tries = 0;
    const id = window.setInterval(() => {
      tries += 1;
      if (getFbq()) {
        pixelLog("✅ Meta Pixel initialized — base code loaded, PageView fired on load.");
        window.clearInterval(id);
      } else if (tries > 10) {
        pixelLog(
          "❌ Meta Pixel NOT detected (window.fbq missing). Check the Pixel ID in the site head.",
        );
        window.clearInterval(id);
      }
    }, 500);
    return () => window.clearInterval(id);
  }, []);
}

/* -------- Conversions API (server-side mirror of the browser pixel) -------- */
export type LeadIdentity = { email?: string; phone?: string; name?: string };

function readCookie(name: string): string {
  if (typeof document === "undefined") return "";
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]!) : "";
}

function newEventId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

/** Sends the same event server-side with the shared event_id so Meta de-duplicates. */
function sendServerEvent(
  eventName: "Lead" | "Schedule" | "Contact",
  eventId: string,
  identity: LeadIdentity = {},
  extra: { value?: number; contentName?: string; contentCategory?: string } = {},
) {
  if (typeof window === "undefined") return;
  const [firstName, ...rest] = (identity.name ?? "").trim().split(/\s+/);
  const payload = {
    eventName,
    eventId,
    eventSourceUrl: window.location.href,
    email: identity.email ?? "",
    phone: identity.phone ?? "",
    firstName: firstName ?? "",
    lastName: rest.join(" "),
    fbc: readCookie("_fbc"),
    fbp: readCookie("_fbp"),
    currency: "USD",
    ...(extra.value !== undefined ? { value: extra.value } : {}),
    contentName: extra.contentName ?? "",
    contentCategory: extra.contentCategory ?? "",
  };
  void fetch("/api/meta-capi", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    keepalive: true,
  })
    .then(() => pixelLog("📡 CAPI server event sent:", eventName, eventId))
    .catch(() => {
      /* CAPI is best-effort; the browser pixel already fired */
    });
}


/**
 * Fires the Meta `Lead` event exactly once per genuine completed submission.
 * `dedupeKey` prevents duplicates from React re-mounts / StrictMode double effects.
 */
const firedLeadKeys = new Set<string>();
export function trackLeadEvent(dedupeKey = "default", identity: LeadIdentity = {}) {
  if (typeof window === "undefined") return;
  if (firedLeadKeys.has(dedupeKey)) {
    pixelLog("↩︎ Lead skipped (already fired for this submission):", dedupeKey);
    return;
  }
  firedLeadKeys.add(dedupeKey);
  const eventId = newEventId("lead");
  const w = getFbq();
  if (w) {
    w(
      "track",
      "Lead",
      {
        value: 150,
        currency: "USD",
        content_name: "Bathroom Estimate Request",
        content_category: "Estimate Form",
      },
      { eventID: eventId },
    );
    pixelLog("🎯 Lead fired — successful form completion only. key:", dedupeKey);
  } else {
    pixelLog("⚠️ Lead NOT sent — window.fbq unavailable. key:", dedupeKey);
  }
  sendServerEvent("Lead", eventId, identity, {
    value: 150,
    contentName: "Bathroom Estimate Request",
    contentCategory: "Estimate Form",
  });
}

function trackContactEvent() {
  if (typeof window === "undefined") return;
  const eventId = newEventId("contact");
  const w = getFbq();
  if (w) {
    w("track", "Contact", {}, { eventID: eventId });
    pixelLog("📞 Contact fired — tel: link clicked.");
  } else {
    pixelLog("⚠️ Contact NOT sent — window.fbq unavailable.");
  }
  sendServerEvent("Contact", eventId);
}

export function trackScheduleEvent(identity: LeadIdentity = {}) {
  if (typeof window === "undefined") return;
  const eventId = newEventId("schedule");
  const w = getFbq();
  if (w) {
    w(
      "track",
      "Schedule",
      { content_name: "Estimate Appointment" },
      { eventID: eventId },
    );
    pixelLog("🗓️ Schedule fired — Calendly booking confirmed.");
  }
  sendServerEvent("Schedule", eventId, identity, {
    contentName: "Estimate Appointment",
  });
}



/* ---------------- Ad attribution (UTM / fbclid) ---------------- */
const ATTRIBUTION_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
  "fbclid",
  "gclid",
] as const;

const ATTRIBUTION_STORAGE_KEY = "tbs_attribution";

/** Captures ad params on first landing so they survive in-page navigation. */
function captureAttribution() {
  if (typeof window === "undefined") return;
  try {
    const params = new URLSearchParams(window.location.search);
    const found: Record<string, string> = {};
    for (const k of ATTRIBUTION_KEYS) {
      const v = params.get(k);
      if (v) found[k] = v;
    }
    if (Object.keys(found).length === 0) return;
    const stored = window.sessionStorage.getItem(ATTRIBUTION_STORAGE_KEY);
    const merged = { ...(stored ? JSON.parse(stored) : {}), ...found };
    window.sessionStorage.setItem(ATTRIBUTION_STORAGE_KEY, JSON.stringify(merged));
  } catch {
    /* storage unavailable — attribution is best-effort */
  }
}

export function getAttribution(): Record<string, string> {
  if (typeof window === "undefined") return {};
  try {
    const params = new URLSearchParams(window.location.search);
    const stored = window.sessionStorage.getItem(ATTRIBUTION_STORAGE_KEY);
    const out: Record<string, string> = stored ? JSON.parse(stored) : {};
    for (const k of ATTRIBUTION_KEYS) {
      const v = params.get(k);
      if (v) out[k] = v;
    }
    return out;
  } catch {
    return {};
  }
}

function attributionNote(): string {
  const a = getAttribution();
  const entries = Object.entries(a);
  if (entries.length === 0) return "";
  return `\n\nAd attribution: ${entries.map(([k, v]) => `${k}=${v}`).join(", ")}`;
}

function LeadEventTracker({
  dedupeKey = "default",
  identity,
}: {
  dedupeKey?: string;
  identity?: LeadIdentity;
}) {
  useEffect(() => {
    trackLeadEvent(dedupeKey, identity ?? {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dedupeKey]);
  return null;
}


function trackViewContent(contentName: string) {
  if (typeof window === "undefined") return;
  const w = window as unknown as { fbq?: (...args: unknown[]) => void };
  if (w.fbq) {
    w.fbq("track", "ViewContent", {
      content_name: contentName,
      content_category: "Bathroom Remodel",
    });
  }
}

function useViewContentTracking(contentName: string) {
  const ref = useRef<HTMLElement>(null);
  const tracked = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined" || tracked.current) return;
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !tracked.current) {
          tracked.current = true;
          trackViewContent(contentName);
        }
      },
      { threshold: 0.5 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [contentName]);

  return ref;
}



const SITE_URL = "https://texasbathsolutions.com";

/** Social crawlers require absolute URLs; bundled asset paths are root-relative. */
function absoluteUrl(path: string) {
  return path.startsWith("http") ? path : `${SITE_URL}${path.startsWith("/") ? "" : "/"}${path}`;
}

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Texas Bath Solutions | San Antonio Shower & Bathroom Remodeling" },
      {
        name: "description",
        content:
          "San Antonio's Trusted Shower Experts. Acrylic and Onyx shower remodels from $8,477, installed in days. Free estimates, $0 down financing, A+ BBB rated.",
      },
      { property: "og:title", content: "Texas Bath Solutions | San Antonio Shower Remodeling" },
      {
        property: "og:description",
        content:
          "Acrylic & Onyx shower remodels from $8,477. Family-owned, licensed installers, A+ BBB rated. Book your free San Antonio estimate.",
      },
      { property: "og:url", content: `${SITE_URL}/` },
      { property: "og:image", content: absoluteUrl(heroShower) },
      { property: "og:image:alt", content: "Completed acrylic shower remodel by Texas Bath Solutions" },
      { name: "twitter:image", content: absoluteUrl(heroShower) },
    ],
    links: [
      { rel: "canonical", href: `${SITE_URL}/` },
      { rel: "preload", as: "image", href: logoImg, fetchPriority: "high" },
      { rel: "preload", as: "image", href: heroPoster, fetchPriority: "high" },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "LocalBusiness",
          name: "Texas Bath Solutions",
          description:
            "Family-owned San Antonio bathroom remodeler specializing in acrylic and Onyx shower systems and tub-to-shower conversions. Trusted Shower Experts.",
          
          areaServed: "San Antonio, TX",
          address: { "@type": "PostalAddress", addressLocality: "San Antonio", addressRegion: "TX", addressCountry: "US" },
          url: "https://www.texasbathsolutions.com",
        }),
      },
    ],
  }),
  component: Index,
});

/* Phone is stored encoded so it never appears in the raw HTML/JS source as a
   harvestable string; it is decoded in the browser after hydration. */
const PHONE_B64 = "KDIxMCkgNzAyLTA3NTM=";

function decodePhone() {
  if (typeof window === "undefined") return null;
  try {
    const display = window.atob(PHONE_B64);
    return { display, tel: `tel:+1${display.replace(/\D/g, "")}` };
  } catch {
    return null;
  }
}

function usePhone() {
  const [phone, setPhone] = useState<{ display: string; tel: string } | null>(null);
  useEffect(() => {
    setPhone(decodePhone());
  }, []);
  return phone;
}

/** Renders the phone link with identical styling; number injected client-side. */
function PhoneLink({
  className,
  children,
}: {
  className?: string;
  children: (display: string) => React.ReactNode;
}) {
  const phone = usePhone();
  return (
    <a
      href={phone?.tel}
      className={className}
      aria-label="Call Texas Bath Solutions"
      onClick={(e) => {
        trackContactEvent();
        if (!phone) {
          e.preventDefault();
          const p = decodePhone();
          if (p) window.location.href = p.tel;
        }
      }}
    >
      {children(phone?.display ?? "")}
    </a>
  );
}

/* ---------------- LOGO ---------------- */
function Logo({
  className,
  size = "default",
  dark,
  variant = "header",
}: {
  className?: string;
  size?: "default" | "sm";
  dark?: boolean;
  variant?: "header" | "footer";
}) {
  const isFooter = variant === "footer";
  return (
    <a href="#top" className={cn("flex flex-row items-center gap-3 group", className)}>
      <img
        src={isFooter ? logoFooterImg : logoImg}
        alt="Texas Bath Solutions"
        width={isFooter ? 1400 : 900}
        height={isFooter ? 524 : 669}
        fetchPriority={isFooter ? "low" : "high"}
        decoding="async"
        loading={isFooter ? "lazy" : "eager"}
        className={cn(
          "w-auto object-contain",
          isFooter ? "h-40 md:h-48" : size === "sm" ? "h-30 md:h-36" : "h-60 md:h-72",
        )}
      />

      {!isFooter && (
      <div className="hidden sm:flex flex-col leading-tight">

        <span
          className={cn(
            "text-[0.78rem] md:text-[0.8775rem] font-medium tracking-wide whitespace-nowrap",
            dark ? "text-white/70" : "text-navy/70",
          )}
        >
          San Antonio, TX
        </span>
      </div>
      )}
    </a>
  );
}

/* ---------------- NAVBAR ---------------- */
function Navbar({ onBook, onContact }: { onBook: () => void; onContact: () => void }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = [
    { href: "#work", label: "Our Work" },
    { href: "#offers", label: "Offers" },
    { href: "#why", label: "Why Us" },
    { href: "#process", label: "The Process" },
    { href: "#book", label: "Book Estimate" },
  ];

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-background/85 backdrop-blur-md border-b border-border shadow-sm"
          : "bg-background/60 backdrop-blur-sm",
      )}
    >
      <div className="container-x flex h-40 items-center gap-4 md:h-48">
        <Logo size="sm" />
        <nav className="ml-auto hidden lg:flex items-center gap-8">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm font-medium text-foreground/80 hover:text-navy transition-colors"
            >
              {l.label}
            </a>
          ))}
        </nav>
        <div className="ml-auto lg:ml-6 flex items-center gap-2 md:gap-3">
          <PhoneLink className="hidden md:flex items-center gap-2 text-navy font-semibold hover:text-teal transition-colors">
            {(display) => (
              <>
                <Phone className="h-4 w-4" />
                <span className="text-sm md:text-base">{display}</span>
              </>
            )}
          </PhoneLink>
          <div className="flex flex-col items-stretch gap-1.5">
            <Button
              onClick={onBook}
              size="default"
              className="h-9 px-3 text-xs sm:h-10 sm:px-4 sm:text-sm bg-navy text-navy-foreground hover:bg-navy/90 shadow-sm"
            >
              Book Free Estimate
            </Button>
            <Button
              onClick={onContact}
              size="default"
              variant="outline"
              className="h-9 px-3 text-xs sm:h-10 sm:px-4 sm:text-sm border-navy/25 text-navy hover:bg-navy/5 hover:text-navy"
            >
              Contact Us
            </Button>
          </div>
          <button
            onClick={() => setOpen((v) => !v)}
            className="lg:hidden grid h-10 w-10 place-items-center rounded-md border border-border"
            aria-label="Toggle menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>
      {open && (
        <div className="lg:hidden border-t border-border bg-background">
          <div className="container-x py-4 flex flex-col gap-1">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-3 text-base font-medium hover:bg-secondary"
              >
                {l.label}
              </a>
            ))}
            <PhoneLink className="mt-2 flex items-center justify-center gap-2 rounded-md bg-secondary px-3 py-3 font-semibold text-navy">
              {(display) => (
                <>
                  <Phone className="h-4 w-4" /> {display}
                </>
              )}
            </PhoneLink>
            <Button
              onClick={() => {
                setOpen(false);
                onBook();
              }}
              className="mt-2 bg-navy text-navy-foreground hover:bg-navy/90"
            >
              Book Free Estimate
            </Button>
            <Button
              onClick={() => {
                setOpen(false);
                onContact();
              }}
              variant="outline"
              className="border-navy/25 text-navy hover:bg-navy/5 hover:text-navy"
            >
              Contact Us
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}

/* ---------------- FLOATING MOBILE BOOK + PHONE CTA ---------------- */
function MobilePhoneCTA({ onBook }: { onBook: () => void }) {
  const [dismissed, setDismissed] = useState(() => {
    if (typeof window === "undefined") return false;
    try {
      return window.sessionStorage.getItem("tbs_mobile_cta_dismissed") === "1";
    } catch {
      return false;
    }
  });

  const dismiss = () => {
    setDismissed(true);
    try {
      window.sessionStorage.setItem("tbs_mobile_cta_dismissed", "1");
    } catch {
      /* ignore */
    }
  };

  if (dismissed) return null;

  return (
    <div className="lg:hidden fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 backdrop-blur-md shadow-[0_-10px_40px_-12px_rgba(13,59,102,0.18)]">
      <div className="container-x flex items-center gap-3 py-3">
        <Button
          onClick={onBook}
          size="default"
          className="flex-1 h-12 bg-navy text-navy-foreground hover:bg-navy/90 text-sm font-semibold shadow-sm"
        >
          <CalendarDays className="h-4 w-4 mr-2" />
          Book Free Estimate
        </Button>
        <PhoneLink className="flex-1">
          {(display) => (
            <Button
              variant="outline"
              size="default"
              className="w-full h-12 border-navy/25 text-navy hover:bg-navy/5 hover:text-navy text-sm font-semibold"
            >
              <Phone className="h-4 w-4 mr-2" />
              {display || "Call Us"}
            </Button>
          )}
        </PhoneLink>
        <button
          onClick={dismiss}
          className="grid h-10 w-10 shrink-0 place-items-center rounded-md text-muted-foreground hover:bg-secondary hover:text-navy"
          aria-label="Hide mobile booking bar"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}

/* ---------------- HERO ---------------- */
function Hero({ onBook }: { onBook: () => void }) {
  return (
    <section id="top" className="relative pt-52 md:pt-60 pb-12 md:pb-16 overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,_color-mix(in_oklab,var(--teal)_18%,transparent)_0%,transparent_60%)]" />
      <div className="container-x grid gap-10 lg:grid-cols-2 lg:gap-16 items-center">
        <div className="animate-fade-up">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-semibold uppercase tracking-wider text-navy">
            <Award className="h-3.5 w-3.5" /> A+ BBB • Zero Complaints
          </span>
          <h1 className="mt-5 text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-navy text-balance leading-[1.05]">
            San Antonio's Trusted Bathroom Remodel Experts
          </h1>
          <p className="mt-5 text-lg md:text-xl text-muted-foreground text-balance max-w-xl">
            Beautiful showers. Fast, clean installs.
          </p>
          <p className="mt-3 text-sm md:text-base font-medium text-foreground/80">
            Family-Owned <span className="text-muted-foreground">•</span> Professional Licensed Installers{" "}
            <span className="text-muted-foreground">•</span> A+ BBB Rated — Zero Complaints
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button
              size="lg"
              onClick={onBook}
              className="bg-navy text-navy-foreground hover:bg-navy/90 shadow-elegant text-base h-12 px-6"
            >
              Book Your Hassle-Free Estimate
            </Button>
            <a href="#work">
              <Button
                size="lg"
                variant="outline"
                className="border-navy/25 text-navy hover:bg-navy/5 text-base h-12 px-6"
              >
                See Our Transformations
              </Button>
            </a>
          </div>
          <div className="mt-6 flex items-start gap-3 rounded-xl border border-teal/30 bg-teal/5 p-4 max-w-xl">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-teal/15 text-navy">
              <CreditCard className="h-5 w-5" />
            </div>
            <div className="text-sm">
              <div className="font-semibold text-navy">$0 Down Financing Available</div>
              <p className="mt-0.5 text-foreground/75">
                Hassle-free <span className="font-semibold text-navy">soft credit check</span> — won't affect your score.
                Qualify for <span className="font-semibold text-navy">up to 12 months no interest</span>, &amp; payments as
                low as <span className="font-semibold text-navy">$115 a month</span>.
              </p>

            </div>
          </div>
        </div>
        <div className="relative animate-fade-up">
          <div className="absolute -inset-6 -z-10 rounded-[2rem] bg-gradient-to-br from-teal/25 via-transparent to-navy/20 blur-2xl" />
          <HeroVideo />
          <div className="mt-4 mx-auto w-fit max-w-full flex md:mt-0 md:mx-0 md:w-auto md:absolute md:-bottom-6 md:-left-6 items-center gap-2.5 md:gap-3 rounded-xl bg-card px-3 py-2.5 md:px-4 md:py-3 shadow-card ring-1 ring-border">
            <svg className="h-6 w-6 shrink-0" viewBox="0 0 48 48" aria-hidden="true">
              <path fill="#4285F4" d="M45.12 24.5c0-1.56-.14-3.06-.4-4.5H24v8.51h11.84c-.51 2.75-2.06 5.08-4.39 6.64v5.52h7.11c4.16-3.83 6.56-9.47 6.56-16.17z" />
              <path fill="#34A853" d="M24 46c5.94 0 10.92-1.97 14.56-5.33l-7.11-5.52c-1.97 1.32-4.49 2.1-7.45 2.1-5.73 0-10.58-3.87-12.31-9.07H4.34v5.7C7.96 41.07 15.4 46 24 46z" />
              <path fill="#FBBC05" d="M11.69 28.18c-.44-1.32-.69-2.73-.69-4.18s.25-2.86.69-4.18v-5.7H4.34C2.85 17.09 2 20.45 2 24s.85 6.91 2.34 9.88l7.35-5.7z" />
              <path fill="#EA4335" d="M24 10.75c3.23 0 6.13 1.11 8.41 3.29l6.31-6.31C34.91 4.18 29.93 2 24 2 15.4 2 7.96 6.93 4.34 14.12l7.35 5.7c1.73-5.2 6.58-9.07 12.31-9.07z" />
            </svg>
            <div className="text-sm">
              <div className="font-semibold text-navy">Loved by San Antonio homeowners</div>
              <div className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className="flex">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <Star key={i} className="h-3.5 w-3.5" style={{ fill: "#FBBC04", color: "#FBBC04" }} />
                  ))}
                </span>
                <span>Rated 5 Stars on Google</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

/* ---------------- HERO VIDEO (auto-play) ---------------- */
function HeroVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(false);
  const [finished, setFinished] = useState(false);
  const playsRef = useRef(0);
  // Desktop (and large tablets in landscape) get the widescreen cut so it fills
  // the space; phones/tablets keep the original portrait video.
  const [wide, setWide] = useState(false);
  // Defer the actual video download until after the page has painted/LCP so the
  // hero text + poster render fast on mobile. No visual change.
  const [srcReady, setSrcReady] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const apply = () => setWide(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    const start = () => setSrcReady(true);
    const idle =
      (window as unknown as { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number })
        .requestIdleCallback;
    let t: number | undefined;
    if (document.readyState === "complete") {
      if (idle) idle(start, { timeout: 1500 });
      else t = window.setTimeout(start, 300);
    } else {
      window.addEventListener("load", () => (idle ? idle(start, { timeout: 1500 }) : start()), {
        once: true,
      });
    }
    return () => {
      if (t) clearTimeout(t);
    };
  }, []);


  useEffect(() => {
    const v = videoRef.current;
    if (!v || !srcReady) return;
    playsRef.current = 0;
    setFinished(false);
    let cleanup = () => {};
    // First play: with sound. Browsers block unmuted autoplay until the visitor
    // has interacted with the page, so fall back to muted playback and unmute
    // (restarting from the top) on their very first interaction.
    v.muted = false;
    v.volume = 1;
    setMuted(false);
    v.play().catch(() => {
      v.muted = true;
      setMuted(true);
      v.play().catch(() => {});

      const enableSound = () => {
        const el = videoRef.current;
        if (!el) return;
        el.muted = false;
        el.volume = 1;
        setMuted(false);
        if (playsRef.current === 0) el.currentTime = 0;
        el.play().catch(() => {});
        cleanup();
      };
      const events = ["pointerdown", "touchstart", "keydown", "scroll", "wheel"] as const;
      events.forEach((e) =>
        window.addEventListener(e, enableSound, { once: true, passive: true }),
      );
      cleanup = () => events.forEach((e) => window.removeEventListener(e, enableSound));
    });
    return () => cleanup();
  }, [wide, srcReady]);


  const handleEnded = () => {
    const v = videoRef.current;
    if (!v) return;
    playsRef.current += 1;
    if (playsRef.current === 1) {
      // Second pass plays muted — the customer chooses to unmute.
      v.muted = true;
      setMuted(true);
      v.currentTime = 0;
      v.play().catch(() => {});
    } else {
      // Stop after the second play and hold on the final frame.
      setFinished(true);
    }
  };

  const toggleSound = () => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    if (!v.muted) v.volume = 1;
    setMuted(v.muted);
  };

  const replay = () => {
    const v = videoRef.current;
    if (!v) return;
    setFinished(false);
    v.currentTime = 0;
    v.play().catch(() => {});
  };

  return (
    <div
      className={`relative mx-auto w-full overflow-hidden rounded-2xl shadow-elegant ring-1 ring-black/5 bg-navy ${
        wide ? "max-w-none" : "max-w-sm"
      }`}
    >
      <video
        ref={videoRef}
        key={wide ? "wide" : "portrait"}
        className="block h-auto w-full"
        src={srcReady ? "/texas-bath-solutions-hero.mp4" : undefined}
        poster={wide ? undefined : heroPoster}
        width={wide ? 1880 : 720}
        height={wide ? 1080 : 1280}
        autoPlay
        muted={muted}
        playsInline
        controls
        preload={srcReady ? "metadata" : "none"}
        onEnded={handleEnded}
        aria-label="Texas Bath Solutions shower remodel walkthrough video"
      />

      <button
        type="button"
        onClick={toggleSound}
        className="absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-black/60 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur hover:bg-black/75"
        aria-label={muted ? "Unmute video" : "Mute video"}
      >
        {muted ? "🔇 Tap for sound" : "🔊 Sound on"}
      </button>

      {finished && (
        <button
          type="button"
          onClick={replay}
          className="absolute inset-0 flex items-center justify-center bg-black/20 transition-colors hover:bg-black/30"
          aria-label="Play video again"
        >
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white/90 shadow-elegant">
            <svg viewBox="0 0 24 24" className="ml-1 h-7 w-7 fill-navy" aria-hidden="true">
              <path d="M8 5v14l11-7z" />
            </svg>
          </span>
        </button>
      )}
    </div>
  );
}

/* ---------------- BEFORE/AFTER REEL (auto-play) ---------------- */
const REEL_PAIRS = [
  { before: beforeFiberglass, after: afterMarble, label: "Fiberglass → Marble" },
  { before: beforePink, after: afterSubway, label: "Dated Tile → Modern Subway" },
  { before: beforeBeige, after: afterVenatino, label: "Beige Tub → Venatino Walk-In" },
  { before: beforeWhiteTile, after: afterSubway2, label: "Tired Tile → Bright White Subway" },
];

function BeforeAfterReel() {
  const [i, setI] = useState(0);
  const [phase, setPhase] = useState<"before" | "after">("before");
  useEffect(() => {
    const t = setInterval(() => {
      setPhase((p) => {
        if (p === "before") return "after";
        setI((n) => (n + 1) % REEL_PAIRS.length);
        return "before";
      });
    }, 2400);
    return () => clearInterval(t);
  }, []);
  const pair = REEL_PAIRS[i];
  return (
    <div className="relative overflow-hidden rounded-2xl shadow-elegant ring-1 ring-black/5 aspect-[4/3] bg-navy">
      {REEL_PAIRS.map((p, idx) => (
        <div
          key={idx}
          className={cn(
            "absolute inset-0 transition-opacity duration-700",
            idx === i ? "opacity-100" : "opacity-0",
          )}
        >
          <img
            src={p.before}
            alt={`${p.label} — before`}
            loading="lazy"
            decoding="async"
            width={1200}
            height={900}
            className={cn(
              "absolute inset-0 h-full w-full object-cover transition-opacity duration-700",
              idx === i && phase === "before" ? "opacity-100" : "opacity-0",
            )}
          />
          <img
            src={p.after}
            alt={`${p.label} — after`}
            loading="lazy"
            decoding="async"
            width={1200}
            height={900}
            className={cn(
              "absolute inset-0 h-full w-full object-cover transition-opacity duration-700",
              idx === i && phase === "after" ? "opacity-100" : "opacity-0",
            )}
          />
        </div>
      ))}
      {/* corner label */}
      <div className="absolute left-4 top-4 rounded-full bg-black/60 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-white backdrop-blur">
        {phase === "before" ? "Before" : "After"}
      </div>
      <div className="absolute right-4 top-4 rounded-full bg-white/90 px-3 py-1 text-[11px] font-semibold text-navy shadow">
        {pair.label}
      </div>
      {/* pricing overlay */}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/50 to-transparent p-5 md:p-6 text-white">
        <div className="flex items-end justify-between gap-4 flex-wrap">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-teal-foreground/90 text-white/80">
              Acrylic Shower Remodel
            </div>
            <div className="mt-1 font-display text-2xl md:text-3xl font-bold leading-tight">
              Starting at <span className="text-gold">$8,477</span>
            </div>
            <div className="mt-1 text-xs md:text-sm text-white/80">
              Full walk-in conversion • Installed in as little as 1 day
            </div>
          </div>
          <ul className="grid grid-cols-1 gap-1 text-xs md:text-sm text-white/90">
            <li className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-teal" /> Lifetime warranty</li>
            <li className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-teal" /> Mold Resistant</li>
            <li className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-teal" /> $0 down financing</li>
          </ul>
        </div>
        {/* progress dots */}
        <div className="mt-4 flex items-center gap-1.5">
          {REEL_PAIRS.map((_, idx) => (
            <span
              key={idx}
              className={cn(
                "h-1 rounded-full transition-all",
                idx === i ? "w-8 bg-gold" : "w-3 bg-white/40",
              )}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------------- TRUST BAR ---------------- */
function TrustBar() {
  const items = [
    { icon: Award, label: "A+ BBB Rating", sub: "Zero Complaints" },
    { icon: Home, label: "Family Owned", sub: "San Antonio, TX" },
    { icon: Clock, label: "Hassle-Free", sub: "Estimates" },
    { icon: Droplets, label: "Acrylic & Onyx", sub: "Fast & Leak-Proof" },
    { icon: MapPin, label: "Local Service", sub: "San Antonio Area" },
  ];
  return (
    <section className="border-y border-border bg-secondary/60">
      <div className="container-x py-6 md:py-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {items.map((it) => (
          <div key={it.label} className="flex items-center gap-3">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-navy/10 text-navy">
              <it.icon className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <div className="text-sm font-semibold text-navy truncate">{it.label}</div>
              <div className="text-xs text-muted-foreground truncate">{it.sub}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ---------------- FINANCING BANNER ---------------- */
function FinancingBanner({ onBook }: { onBook: () => void }) {
  const financingRef = useViewContentTracking("Financing Options");
  const perks = [
    { icon: CreditCard, title: "$0 Down", copy: "Start your remodel with payments as low as $115 a month." },
    { icon: CalendarDays, title: "Up to 12 Months No Interest", copy: "Enjoy your New Bathroom with No Interest for a Full Year." },
    { icon: ShieldCheck, title: "Soft Credit Check", copy: "Prequalify in minutes — won't affect your score." },
  ];

  return (
    <section ref={financingRef} className="py-8 md:py-12">
      <div className="container-x">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-navy via-navy to-navy/85 text-navy-foreground shadow-elegant ring-1 ring-white/10">
          <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-teal/25 blur-3xl" aria-hidden />
          <div className="absolute -left-12 -bottom-16 h-48 w-48 rounded-full bg-teal/15 blur-3xl" aria-hidden />

          <div className="relative p-6 md:p-10">
            <div className="text-center max-w-2xl mx-auto">
              <span className="inline-flex items-center gap-2 rounded-full border border-teal/40 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-teal">
                Flexible Financing
              </span>
              <h3 className="mt-3 font-display text-2xl md:text-3xl font-semibold text-navy-foreground text-balance">
                Zero money down. Payments as low as $115 a month.
              </h3>
              <p className="mt-2 text-sm md:text-base text-navy-foreground/75 text-balance">
                Approved homeowners can start their remodel now and pay later — up to 12 months no payments, with no
                upfront cost.
              </p>

            </div>

            <div className="mt-7 grid gap-3 sm:grid-cols-3">
              {perks.map((p) => (
                <div
                  key={p.title}
                  className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm"
                >
                  <div className="grid h-9 w-9 place-items-center rounded-lg bg-teal/20 text-teal">
                    <p.icon className="h-4.5 w-4.5" />
                  </div>
                  <div className="mt-3 font-semibold text-sm text-navy-foreground">{p.title}</div>
                  <p className="mt-1 text-xs leading-relaxed text-navy-foreground/70">{p.copy}</p>
                </div>
              ))}
            </div>

            <div className="mt-7 flex flex-col items-center gap-2">
              <Button
                onClick={onBook}
                size="lg"
                className="bg-white text-navy hover:bg-white/90 font-semibold shadow-sm w-full sm:w-auto px-8"
              >
                See If I Prequalify
              </Button>
              <p className="text-[11px] text-navy-foreground/60">
                Subject to credit approval. Terms may vary by lender.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}



/* ---------------- ABOUT ---------------- */
function About() {
  return (
    <section className="pt-12 pb-8 md:pt-16 md:pb-10">
      <div className="container-x max-w-3xl text-center">
        <span className="inline-flex items-center gap-2 rounded-full bg-navy/5 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-navy">
          About Us
        </span>
        <h2 className="mt-4 text-3xl md:text-4xl text-navy text-balance">
          A local San Antonio family, transforming bathrooms our neighbors love.
        </h2>
        <p className="mt-5 text-lg text-muted-foreground text-balance">
          We're a family business dedicated to turning outdated bathrooms into beautiful,
          functional spaces. We believe in clean, honest, upfront pricing and doing the job right
          the first time.
        </p>
      </div>
    </section>
  );
}

/* ---------------- GALLERY ---------------- */
type GalleryItem = {
  id: string;
  category: "subway" | "marble" | "modern";
  after: string;
  before?: string;
  title: string;
  location: string;
};

const GALLERY: GalleryItem[] = [
  {
    id: "1",
    category: "marble",
    before: beforeBeige,
    after: heroShower,
    title: "Tub-to-Shower Conversion",
    location: "Alamo Heights",
  },
  {
    id: "2",
    category: "subway",
    before: beforeFiberglass,
    after: afterSubway,
    title: "Full Shower Update",
    location: "Stone Oak",
  },
  {
    id: "3",
    category: "marble",
    before: beforePink,
    after: afterMarble,
    title: "Master Bath Remodel",
    location: "Terrell Hills",
  },
  {
    id: "5",
    category: "marble",
    after: afterVenatino,
    title: "Walk-In Shower with Bench",
    location: "Helotes",
  },
  {
    id: "9",
    category: "subway",
    after: afterSubway2,
    title: "Bright White Subway Conversion",
    location: "Alamo Ranch",
  },
  {
    id: "10",
    category: "subway",
    after: afterSubway3,
    title: "Vertical Subway with Bench",
    location: "Schertz",
  },
  {
    id: "11",
    category: "modern",
    before: beforeWhiteTile,
    after: afterModern,
    title: "Modern Minimal Walk-In",
    location: "Boerne",
  },
  {
    id: "12",
    category: "modern",
    after: afterModern2,
    title: "Seamless White Shower Conversion",
    location: "Converse",
  },
];

const FILTERS = [
  { id: "all", label: "All" },
  { id: "subway", label: "Subway Tile" },
  { id: "marble", label: "Marble & Stone" },
  { id: "modern", label: "Modern Minimal" },
] as const;


function Gallery() {
  const galleryRef = useViewContentTracking("Bathroom Transformations");
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["id"]>("all");
  const [activeIdx, setActiveIdx] = useState<number | null>(null);
  const [sliderPos, setSliderPos] = useState(50);

  const items = useMemo(
    () => (filter === "all" ? GALLERY : GALLERY.filter((g) => g.category === filter)),
    [filter],
  );

  const active = activeIdx !== null ? items[activeIdx] : null;

  useEffect(() => {
    setSliderPos(50);
  }, [activeIdx]);

  const next = () =>
    setActiveIdx((i) => (i === null ? 0 : (i + 1) % items.length));
  const prev = () =>
    setActiveIdx((i) => (i === null ? 0 : (i - 1 + items.length) % items.length));

  return (
    <section ref={galleryRef} id="work" className="pt-8 pb-12 md:pt-12 md:pb-16 bg-gradient-to-b from-secondary/40 to-background">
      <div className="container-x">
        <div className="max-w-3xl mx-auto text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-navy/5 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-navy">
            Our Work
          </span>
          <h2 className="mt-4 text-3xl md:text-5xl text-navy text-balance">
            See the Difference — Real San Antonio Bathroom Transformations
          </h2>
          <p className="mt-4 text-lg text-muted-foreground text-balance">
            Every project starts with a Free Estimate. Here's what we deliver.
          </p>
        </div>

        <div className="mt-10 mx-auto max-w-3xl">
          <BeforeAfterReel />
        </div>

        <div className="mt-8 flex flex-wrap justify-center gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-medium transition-colors border",
                filter === f.id
                  ? "bg-navy text-navy-foreground border-navy"
                  : "bg-card text-foreground border-border hover:border-navy/40",
              )}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {items.map((item, idx) => (
            <button
              key={item.id}
              onClick={() => setActiveIdx(idx)}
              className="group relative overflow-hidden rounded-2xl bg-card shadow-card ring-1 ring-border text-left"
            >
              <div className="relative aspect-[4/5] overflow-hidden">
                <img
                  src={item.after}
                  alt={`${item.title} — ${item.location}`}
                  loading="lazy"
                  decoding="async"
                  width={1200}
                  height={1200}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                {item.before && (
                  <span className="absolute left-3 top-3 rounded-full bg-navy/90 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-navy-foreground">
                    Before & After
                  </span>
                )}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-navy/85 via-navy/40 to-transparent p-4">
                  <div className="text-navy-foreground">
                    <div className="text-sm font-semibold">{item.title}</div>
                    <div className="text-xs opacity-90">{item.location}</div>
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>

        <p className="mt-10 text-center text-sm text-muted-foreground max-w-2xl mx-auto">
          All showers feature durable, leak-resistant premium acrylic or Onyx shower systems — Professionally Installed.
        </p>
      </div>

      <Dialog open={active !== null} onOpenChange={(o) => !o && setActiveIdx(null)}>
        <DialogContent className="max-w-5xl p-0 overflow-hidden bg-background">
          {active && (
            <div className="relative">
              {active.before ? (
                <div
                  className="relative aspect-[16/10] select-none"
                  onMouseMove={(e) => {
                    const r = e.currentTarget.getBoundingClientRect();
                    setSliderPos(Math.max(0, Math.min(100, ((e.clientX - r.left) / r.width) * 100)));
                  }}
                  onTouchMove={(e) => {
                    const r = e.currentTarget.getBoundingClientRect();
                    const x = e.touches[0].clientX - r.left;
                    setSliderPos(Math.max(0, Math.min(100, (x / r.width) * 100)));
                  }}
                >
                  <img src={active.after} alt="After" decoding="async" width={1200} height={1200} className="absolute inset-0 h-full w-full object-cover" />
                  <div
                    className="absolute inset-0 overflow-hidden"
                    style={{ width: `${sliderPos}%` }}
                  >
                    <img
                      src={active.before}
                      alt="Before"
                      decoding="async"
                      width={1200}
                      height={1200}
                      className="absolute inset-0 h-full object-cover"
                      style={{ width: `${100 / (sliderPos / 100 || 0.001)}%`, maxWidth: "none" }}
                    />
                  </div>
                  <div
                    className="absolute inset-y-0 w-0.5 bg-white shadow-lg"
                    style={{ left: `${sliderPos}%` }}
                  >
                    <div className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 grid h-10 w-10 place-items-center rounded-full bg-white text-navy shadow-lg">
                      <ChevronLeft className="h-4 w-4" />
                    </div>
                  </div>
                  <span className="absolute left-4 top-4 rounded-full bg-black/70 px-3 py-1 text-xs font-bold text-white">
                    BEFORE
                  </span>
                  <span className="absolute right-4 top-4 rounded-full bg-navy px-3 py-1 text-xs font-bold text-navy-foreground">
                    AFTER
                  </span>
                </div>
              ) : (
                <img src={active.after} alt={active.title} decoding="async" width={1200} height={1200} className="w-full h-auto" />
              )}
              <div className="flex items-center justify-between p-5 border-t border-border">
                <div>
                  <div className="font-display text-lg font-semibold text-navy">{active.title}</div>
                  <div className="text-sm text-muted-foreground">{active.location}</div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="icon" onClick={prev}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" onClick={next}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              {active.before && (
                <p className="px-5 pb-5 text-xs text-muted-foreground">
                  Drag across the image to compare before and after.
                </p>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}

/* ---------------- OFFERS ---------------- */
type Offer = {
  amount: string;
  headline: string;
  sub: string;
  detail: string;
  image: string;
  badge: string;
};

const OFFERS: Offer[] = [
  {
    amount: "$1,000 Off",
    headline: "Teachers & First Responders",
    sub: "Educators, police, fire, EMS & nurses",
    detail:
      "Our biggest thank-you goes to the people who teach and protect San Antonio. Teachers, school staff, police officers, firefighters, EMS, and nurses save $1,000 on a complete shower or bath remodel. Just show your school, department, or hospital ID at your Free Estimate.",
    image: offerTeachers,
    badge: "Most Popular",
  },
  {
    amount: "$1,000 Off",
    headline: "Military & Veterans",
    sub: "Active duty, Guard, Reserve, retirees & Veterans",
    detail:
      "San Antonio is Military City USA. Active duty, Guard, Reserve, retirees, and Veterans receive $1,000 off any complete remodel with a valid military or VA ID — plus priority scheduling around duty hours.",
    image: offerMilitary,
    badge: "Military City USA",
  },
  {
    amount: "$750 Off",
    headline: "Senior Citizens (60+)",
    sub: "Free grab bar & fold-down safety seat upgrade",
    detail:
      "Homeowners 60 and older save $750 on a walk-in shower conversion and receive a complimentary grab bar plus fold-down safety seat upgrade. Low-threshold bases and glass doors make daily bathing safer and easier.",
    image: offerSeniors,
    badge: "Safety Upgrade",
  },
  {
    amount: "$500 Off",
    headline: "Summer Sale",
    sub: "Limited-time savings on any shower remodel",
    detail:
      "Beat the San Antonio heat with a brand-new shower. Save $500 on any complete acrylic or Onyx shower remodel booked during our Summer Sale — light marble walls, rain shower head, and matte black glass barn doors available.",
    image: offerSummer,
    badge: "Limited Time",
  },
];

function Offers() {
  const offersRef = useViewContentTracking("Offers & Discounts");
  const [active, setActive] = useState<Offer | null>(null);
  const [claimed, setClaimed] = useState(false);
  const [scheduling, setScheduling] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", email: "", address: "" });

  const open = (o: Offer) => {
    setActive(o);
    setClaimed(false);
    setScheduling(false);
    setForm({ name: "", phone: "", email: "", address: "" });
  };


  return (
    <section ref={offersRef} id="offers" className="py-12 md:py-16 bg-secondary/40">
      <div className="container-x">
        <div className="max-w-3xl mx-auto text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-navy/5 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-navy">
            Current Savings
          </span>
          <h2 className="mt-4 text-3xl md:text-5xl text-navy text-balance">
            San Antonio, TX Bathroom Remodel Offers &amp; Discounts
          </h2>
          <p className="mt-4 text-muted-foreground">
            We save our best pricing for the people who serve San Antonio every day.
          </p>
          <p className="mt-4 inline-flex flex-wrap items-center justify-center gap-2 rounded-xl border border-navy/15 bg-card px-4 py-3 text-sm font-semibold text-navy shadow-card">
            One offer can be stacked with $0 down financing, up to 12 months no payments &amp; no
            interest, and a hassle-free soft credit check.
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {OFFERS.map((o) => (
            <article
              key={o.headline}
              role="button"
              tabIndex={0}
              onClick={() => open(o)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  open(o);
                }
              }}
              aria-label={`Claim ${o.amount} — ${o.headline}`}
              className="group cursor-pointer overflow-hidden rounded-2xl border border-border bg-card shadow-card hover:shadow-elegant transition-shadow flex flex-col focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <img
                  src={o.image}
                  alt={`${o.headline} bathroom remodel discount in San Antonio, TX`}
                  loading="lazy"
                  decoding="async"
                  width={1024}
                  height={768}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <span className="absolute left-3 top-3 rounded-full bg-navy/90 px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-wide text-navy-foreground">
                  {o.badge}
                </span>
              </div>
              <div className="flex flex-1 flex-col p-6">
                <p className="text-3xl font-bold text-navy">{o.amount}</p>
                <h3 className="mt-1 text-lg font-semibold text-navy">{o.headline}</h3>
                <p className="mt-2 text-sm text-muted-foreground flex-1">{o.sub}</p>
                <Button className="mt-5 w-full" onClick={() => open(o)}>
                  Claim Offer
                </Button>
              </div>
            </article>
          ))}
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          One discount per household. Cannot be combined with other discounts. Valid on new contracts
          only — mention your offer at your Free Estimate.
        </p>
      </div>

      <Dialog open={!!active} onOpenChange={(v) => !v && setActive(null)}>
        <DialogContent
          className={
            scheduling && !claimed
              ? "sm:max-w-3xl max-h-[92vh] overflow-y-auto"
              : "sm:max-w-md max-h-[90vh] overflow-y-auto"
          }
        >
          {active && !claimed && !scheduling && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl text-navy">
                  Claim {active.amount} — {active.headline}
                </DialogTitle>
                <DialogDescription>
                  {active.detail} Book your Free Estimate below to lock in this offer.
                </DialogDescription>
              </DialogHeader>
              <form
                className="mt-2 space-y-3"
                onSubmit={(e) => {
                  e.preventDefault();
                  void submitLead({
                    data: {
                      name: form.name,
                      phone: form.phone,
                      email: form.email,
                      address: form.address,
                      timeframe: "",
                      notes: `Offer claimed: ${active.amount} — ${active.headline}` + attributionNote(),
                      source: "Offers & Discounts form",
                    },
                  }).catch((err: unknown) => console.error("Lead notification failed", err));
                  setScheduling(true);
                }}
              >
                <div className="space-y-1.5">
                  <Label htmlFor="offer-name">Full name</Label>
                  <Input
                    id="offer-name"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Your Name"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="offer-phone">Phone</Label>
                  <Input
                    id="offer-phone"
                    required
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: formatPhone(e.target.value) })}
                    placeholder="(210) 555-0123"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="offer-email">Email</Label>
                  <Input
                    id="offer-email"
                    required
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="Your Email"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="offer-address">Address</Label>
                  <Input
                    id="offer-address"
                    required
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                    placeholder="123 Main St, San Antonio"
                    autoComplete="street-address"
                  />
                </div>
                <Button type="submit" className="w-full">
                  Claim My {active.amount} &amp; Book Free Estimate
                </Button>
                <p className="text-center text-xs text-muted-foreground">
                  Stackable with $0 down financing · Soft credit check only · No payments for up to
                  12 months
                </p>
              </form>
            </>
          )}
          {active && !claimed && scheduling && (
            <>
              <DialogHeader className="sr-only">
                <DialogTitle>
                  Claim {active.amount} — {active.headline}
                </DialogTitle>
                <DialogDescription>Pick your Free Estimate appointment time.</DialogDescription>
              </DialogHeader>
              <CalendlyEmbed
                prefill={{ ...form, offer: `${active.amount} — ${active.headline}` }}
                title={`Pick your time to lock in ${active.amount}`}
                subtitle={`Your ${active.headline} discount is attached to this appointment.`}
                onBack={() => setScheduling(false)}
                onScheduled={() => setClaimed(true)}
              />
            </>
          )}
          {active && claimed && (
            <div className="py-4 text-center">
              <LeadEventTracker dedupeKey="offer-claim" />
              <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-navy text-navy-foreground">
                <Check className="h-7 w-7" />
              </div>
              <DialogTitle className="mt-4 text-2xl text-navy">
                Your {active.amount} is reserved!
              </DialogTitle>
              <DialogDescription className="mt-2">
                Your Free Estimate is booked and your {active.headline} discount is attached. Watch
                for your confirmation text and email.
              </DialogDescription>
              <div className="mt-5 grid gap-2">
                <Button onClick={() => setActive(null)}>Done</Button>
              </div>
            </div>
          )}

        </DialogContent>
      </Dialog>
    </section>
  );
}

/* ---------------- WHY US ---------------- */
function WhyUs() {
  const whyRef = useViewContentTracking("Why Choose Us");
  const items = [
    {
      icon: Clock,
      title: "Free Estimates",
      body: "No obligation, no pressure. We come to you and give you an honest quote at a time that works for you.",
    },
    {
      icon: Sparkles,
      title: "Premium Acrylic & Onyx Systems",
      body: "Choose classic acrylic or upgrade to Onyx shower systems — subway tile, marble, and stone looks with lifetime durability and easy cleaning.",
    },
    {
      icon: Droplets,
      title: "Fast, Clean Installations",
      body: "Most showers completed in two or three days with careful protection of your home and minimal disruption.",
    },
    {
      icon: Home,
      title: "Local Family-Owned Care",
      body: "We're your neighbors. We treat your home like our own — because our reputation in San Antonio is everything.",
    },
    {
      icon: ShieldCheck,
      title: "A+ BBB, Zero Complaints",
      body: "Fully licensed, insured, and accredited with the Better Business Bureau. Your trust matters.",
    },
  ];
  return (
    <section ref={whyRef} id="why" className="cv-auto py-12 md:py-16">
      <div className="container-x">
        <div className="max-w-3xl mx-auto text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-navy/5 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-navy">
            Why Texas Bath Solutions
          </span>
          <h2 className="mt-4 text-3xl md:text-5xl text-navy text-balance">
            Everything you'd want from a remodeler — nothing you wouldn't.
          </h2>
        </div>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((it, i) => (
            <div
              key={it.title}
              className={cn(
                "rounded-2xl border border-border bg-card p-6 shadow-card hover:shadow-elegant transition-shadow",
                i === 4 && "lg:col-span-1",
              )}
            >
              <div className="grid h-12 w-12 place-items-center rounded-xl bg-navy text-navy-foreground">
                <it.icon className="h-6 w-6" />
              </div>
              <h3 className="mt-5 text-xl font-semibold text-navy">{it.title}</h3>
              <p className="mt-2 text-muted-foreground">{it.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- PROCESS ---------------- */
function Process() {
  const processRef = useViewContentTracking("Our Process");
  const steps = [
    { n: "1", Icon: ClipboardCheck, title: "Book Your Free Estimate", body: "Call or fill out the form — same day or next day appointments are often available." },
    { n: "2", Icon: Ruler, title: "We Visit, Measure & Design", body: "A friendly, no-obligation home visit with an honest, upfront quote — then we walk you through beautiful acrylic and Onyx tile, marble, and stone options." },
    { n: "3", Icon: ShowerHead, title: "Professional Installation", body: "Fast, clean installation — and we provide Post-Care for Peace of Mind." },
  ];
  return (
    <section ref={processRef} id="process" className="cv-auto py-5 md:py-8 bg-gradient-to-b from-navy to-navy/95 text-navy-foreground">
      <div className="container-x">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl text-navy-foreground text-balance">
            Our Process
          </h2>
        </div>
        <ol className="mt-4 grid gap-3 grid-cols-3">
          {steps.map((s) => (
            <li
              key={s.n}
              className="relative flex flex-col items-center text-center rounded-xl bg-white/5 backdrop-blur border border-white/10 p-3 md:p-4"
            >
              <div className="relative">
                <div className="grid h-12 w-12 md:h-14 md:w-14 place-items-center rounded-full bg-white/10 border border-white/20 text-teal">
                  <s.Icon className="h-6 w-6 md:h-7 md:w-7" strokeWidth={1.75} aria-hidden="true" />
                </div>
                <span className="absolute -top-1 -right-1 grid h-5 w-5 place-items-center rounded-full bg-white text-navy font-display font-bold text-[10px]">
                  {s.n}
                </span>
              </div>
              <h3 className="mt-2 text-[11px] md:text-sm font-semibold text-navy-foreground text-balance">{s.title}</h3>
              <p className="mt-1 text-[9px] md:text-[11px] leading-snug text-navy-foreground/75">{s.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/* ---------------- TESTIMONIALS ---------------- */
function Testimonials() {
  const items = [
    {
      name: "Maria G.",
      area: "Alamo Heights",
      body: "They came out quickly, gave me an honest quote, and my new shower looks straight out of a magazine. Zero hassle from start to finish.",
    },
    {
      name: "David R.",
      area: "Stone Oak",
      body: "Old fiberglass tub gone in a day. The marble-look walls are gorgeous and the crew was respectful of my home. Best remodel decision we've made.",
    },
    {
      name: "Jennifer T.",
      area: "Shavano Park",
      body: "Family-owned really shows. They treated us like neighbors, not customers. Estimate was upfront, no pressure, no surprises.",
    },
    {
      name: "Robert & Linda M.",
      area: "Boerne",
      body: "We got three quotes — Texas Bath Solutions was the most professional and by far the easiest to work with. Beautiful subway-tile shower.",
    },
    {
      name: "Anthony P.",
      area: "Helotes",
      body: "Clean, fast, and stunning results. I've already recommended them to two neighbors. The A+ BBB rating is well-earned.",
    },
  ];
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = items.length;
  const go = (dir: number) => setIndex((i) => (i + dir + count) % count);

  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % count), 6000);
    return () => clearInterval(id);
  }, [paused, count]);

  return (
    <section className="cv-auto py-12 md:py-16">
      <div className="container-x">
        <div className="max-w-3xl mx-auto text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-navy/5 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-navy">
            Reviews
          </span>
          <h2 className="mt-4 text-3xl md:text-5xl text-navy text-balance">
            What our San Antonio neighbors say
          </h2>
        </div>

        <div
          className="relative mt-10 md:mt-12"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          {/* Peek-style track */}
          <div className="overflow-hidden px-[6%] md:px-[18%]">
            <div
              className="flex transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
              style={{ transform: `translateX(-${index * 100}%)` }}
            >
              {items.map((t, i) => {
                const active = i === index;
                return (
                  <figure
                    key={t.name}
                    aria-hidden={!active}
                    className={`w-full shrink-0 px-2 md:px-4 transition-all duration-700 ${
                      active ? "opacity-100 scale-100" : "opacity-40 scale-[0.92]"
                    }`}
                  >
                    <div className="h-full rounded-2xl border border-border bg-card p-6 md:p-8 shadow-card">
                      <div className="flex gap-0.5">
                        {[0, 1, 2, 3, 4].map((s) => (
                          <Star key={s} className="h-4 w-4 fill-gold text-gold" />
                        ))}
                      </div>
                      <blockquote className="mt-4 text-foreground/90 leading-relaxed md:text-lg">
                        "{t.body}"
                      </blockquote>
                      <figcaption className="mt-5 text-sm">
                        <div className="font-semibold text-navy">{t.name}</div>
                        <div className="text-muted-foreground">{t.area}</div>
                      </figcaption>
                    </div>
                  </figure>
                );
              })}
            </div>
          </div>

          {/* Soft edge fades */}
          <div className="pointer-events-none absolute inset-y-0 left-0 w-[8%] bg-gradient-to-r from-background to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-[8%] bg-gradient-to-l from-background to-transparent" />

          <button
            type="button"
            aria-label="Previous review"
            onClick={() => go(-1)}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 grid h-10 w-10 place-items-center rounded-full border border-border bg-card/90 text-navy shadow-card backdrop-blur transition hover:bg-card"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            aria-label="Next review"
            onClick={() => go(1)}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 grid h-10 w-10 place-items-center rounded-full border border-border bg-card/90 text-navy shadow-card backdrop-blur transition hover:bg-card"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-6 flex justify-center gap-2">
          {items.map((t, i) => (
            <button
              key={t.name}
              type="button"
              aria-label={`Go to review ${i + 1}`}
              onClick={() => setIndex(i)}
              className={`h-1.5 rounded-full transition-all ${
                i === index ? "w-7 bg-navy" : "w-2.5 bg-navy/25 hover:bg-navy/40"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- BOOKING FORM ---------------- */
function formatPhone(input: string) {
  const digits = input.replace(/\D/g, "").slice(0, 10);
  if (digits.length < 4) return digits;
  if (digits.length < 7) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

type BookingFields = "name" | "phone" | "email" | "address" | "project";

function validateBookingField(k: BookingFields, v: string): string {
  switch (k) {
    case "name":
      return v.trim().length < 2 ? "Please enter your full name" : "";
    case "phone":
      return v.replace(/\D/g, "").length !== 10
        ? "Enter a 10-digit phone number, e.g. (210) 555-0123"
        : "";
    case "email":
      if (!v.trim()) return "We need your email to send the confirmation";
      return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim())
        ? ""
        : "That email looks incomplete — check for typos";
    case "address":
      return v.trim().length < 5
        ? "Enter the street address where the work will be done"
        : "";
    case "project":
      return v ? "" : "Choose when you'd like your new bathroom";
  }
}

function BookingForm({ formRef }: { formRef: React.RefObject<HTMLElement | null> }) {
  const [calendlyCompleted, setCalendlyCompleted] = useState(false);
  const [showCalendly, setShowCalendly] = useState(false);
  const [quizData, setQuizData] = useState<QuizState | null>(null);
  const [calendlyUrl, setCalendlyUrl] = useState("https://calendly.com/rugsafari/texas-bath-solutions");
  const [isQuizOpen, setIsQuizOpen] = useState(false);

  useEffect(() => {
    captureAttribution();
  }, []);

  const handleShowCalendly = (data: QuizState, url?: string) => {
    setQuizData(data);
    if (url) setCalendlyUrl(url);
    setShowCalendly(true);
  };

  const handleCalendlyScheduled = () => {
    setCalendlyCompleted(true);
    setShowCalendly(false);
  };

  const handleCalendlyBack = () => {
    setShowCalendly(false);
  };

  const handleQuizComplete = async (finalData: QuizState) => {
    try {
      const notes = [
        `Homeowner: ${finalData.homeowner}`,
        `Upgrade: ${finalData.desiredUpgrade}`,
        `Problem: ${finalData.mainProblem}`
      ].join('\n') + attributionNote();

      const leadData = {
        name: "Provided in Calendly", 
        email: "calendly@provided.com",
        phone: finalData.phone,
        address: finalData.address,
        timeframe: finalData.timeline,
        notes: notes,
        source: "Website quiz form",
      };

      await submitLead({ data: leadData });
      trackLeadEvent(`quiz:${finalData.phone}`, { phone: finalData.phone });

      alert("Thank you! Your visit is confirmed.");
      setIsQuizOpen(false);
      const mw = (window as any).MessengerExtensions;
      if (mw) {
        mw.requestCloseBrowser(
          function success() {},
          function error(err: any) {
            window.location.reload();
          }
        );
      } else {
        window.location.reload();
      }
    } catch (e) {
      console.error(e);
      alert("Failed to submit. Please try again.");
    }
  };

  return (
    <section
      id="book"
      ref={formRef as React.RefObject<HTMLElement>}
      className="scroll-mt-24 py-12 md:py-16 bg-gradient-to-b from-background to-secondary/60"
    >
      <div className="container-x grid gap-10 lg:grid-cols-5 items-start">
        <div className="lg:col-span-2 lg:sticky lg:top-28">
          <span className="inline-flex items-center gap-2 rounded-full bg-navy/5 px-3 py-1 text-xs font-semibold normal-case tracking-wide text-navy">
            Book Your Free Estimate
          </span>
          <h2 className="mt-4 text-3xl md:text-5xl text-navy text-balance">
            Ready to see your new shower? Schedule your Free, no-obligation estimate.
          </h2>
          <p className="mt-5 text-lg text-muted-foreground">
            Tell us about your project, then pick the exact time that works for you.
          </p>
          <ul className="mt-6 space-y-3">
            {[
              "No pressure. No obligation.",
              "$0 down financing — up to 12 months no payments",
              "Soft credit check only — won't affect your score",
              "Hassle-free estimates for most San Antonio homes",
              "Honest, upfront pricing — no surprises",
              "A+ BBB rated with zero complaints",
            ].map((b) => (
              <li key={b} className="flex items-start gap-3 text-foreground/85">
                <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-navy text-navy-foreground">
                  <Check className="h-3 w-3" strokeWidth={3} />
                </span>
                <span>{b}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="lg:col-span-3">
          <div className="rounded-3xl bg-card border border-teal/20 shadow-2xl p-8 md:p-12 text-center flex flex-col items-center justify-center h-full min-h-[400px] relative overflow-hidden group hover:shadow-[0_10px_50px_rgba(13,59,102,0.12)] transition-all duration-500">
            {/* Background Glows */}
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 rounded-full bg-teal/10 blur-3xl opacity-50 pointer-events-none group-hover:opacity-100 transition-opacity duration-700"></div>
            <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 rounded-full bg-navy/5 blur-3xl opacity-50 pointer-events-none group-hover:opacity-100 transition-opacity duration-700"></div>
            
            <div className="relative z-10 grid h-24 w-24 place-items-center rounded-full bg-teal/10 text-teal mb-6 animate-pulse">
              <ClipboardCheck className="h-12 w-12" />
            </div>
            <h3 className="relative z-10 text-3xl md:text-4xl font-bold text-navy mb-4 leading-tight">Get Your Free Quote Instantly</h3>
            <p className="relative z-10 text-muted-foreground mb-8 text-lg max-w-md">Answer 3 quick questions about your project to instantly lock in your appointment time.</p>
            <Button 
              onClick={() => setIsQuizOpen(true)}
              size="lg" 
              className="relative z-10 w-full sm:w-auto h-16 px-10 text-xl font-semibold bg-teal hover:bg-teal/90 text-white shadow-xl hover:shadow-2xl transition-all animate-bounce mt-4"
            >
              Start My Quote Quiz
            </Button>
          </div>
        </div>
      </div>

      <Dialog open={isQuizOpen} onOpenChange={setIsQuizOpen}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden bg-transparent border-none shadow-none [&>button]:text-white [&>button]:bg-navy/50 [&>button]:hover:bg-navy/80 [&>button]:rounded-full [&>button]:p-2 [&>button]:w-10 [&>button]:h-10 [&>button]:-top-4 [&>button]:-right-4 sm:[&>button]:-right-12">
          <div className="max-h-[85vh] overflow-y-auto rounded-[2rem] hide-scrollbar w-full relative">
            <div className={showCalendly ? "hidden" : "block w-full"}>
              <QuizFlow
                onShowCalendly={handleShowCalendly}
                onComplete={handleQuizComplete}
                calendlyCompleted={calendlyCompleted}
              />
            </div>
            <div className={showCalendly ? "block w-full bg-card rounded-[2rem] shadow-2xl border-2 border-teal/20 p-6 md:p-8" : "hidden"}>
              <CalendlyEmbed
                url={calendlyUrl}
                prefill={{
                  name: "",
                  email: "",
                  phone: quizData?.phone || "",
                  project: quizData?.timeline || "",
                }}
                onBack={handleCalendlyBack}
                onScheduled={handleCalendlyScheduled}
                title="Pick a time for your free estimate"
                subtitle="Lock in your appointment to discuss your project."
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}

const CALENDLY_URL = "https://calendly.com/rugsafari/texas-bath-solutions";

export type Prefill = {
  name: string;
  phone: string;
  email: string;
  address?: string;
  project?: string;
  notes?: string;
  offer?: string;
};

export function CalendlyEmbed({
  url,
  prefill,
  onBack,
  onScheduled,
  title,
  subtitle,
}: {
  url: string;
  prefill: Prefill;
  onBack: () => void;
  onScheduled: () => void;
  title?: string;
  subtitle?: string;
}) {
  const hostRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const id = "calendly-widget-script";
    if (!document.getElementById(id)) {
      const s = document.createElement("script");
      s.id = id;
      s.src = "https://assets.calendly.com/assets/external/widget.js";
      s.async = true;
      document.body.appendChild(s);
    }
    const onMessage = (e: MessageEvent) => {
      if (
        typeof e.origin === "string" &&
        e.origin.includes("calendly.com") &&
        e.data?.event === "calendly.event_scheduled"
      ) {
        const identity = {
          email: prefill.email,
          phone: prefill.phone,
          name: prefill.name,
        };
        trackScheduleEvent(identity);
        trackLeadEvent(`calendly:${prefill.email}:${prefill.phone}`, identity);
        onScheduled();
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [onScheduled]);

  const details = [
    prefill.offer ? `Offer claimed: ${prefill.offer}` : "",
    prefill.project ? `Desired timeframe: ${prefill.project}` : "",
    prefill.address ? `Address: ${prefill.address}` : "",
    `Phone: ${prefill.phone}`,
    prefill.notes ? `Notes: ${prefill.notes}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  const attribution = getAttribution();
  const params = new URLSearchParams({
    hide_gdpr_banner: "1",
    primary_color: "0D3B66",
    name: prefill.name,
    email: prefill.email,
    // Calendly invitee question prefills (a1 = first question, a2 = second, ...)
    a1: prefill.phone,
    a2: details,
    location: prefill.phone,
    utm_campaign: attribution.utm_campaign ?? prefill.offer ?? "Website Estimate",
    utm_source: attribution.utm_source ?? "texasbathsolutions.com",
    utm_medium: attribution.utm_medium ?? (prefill.offer ? "offer-claim" : "main-form"),
    ...(attribution.utm_content ? { utm_content: attribution.utm_content } : {}),
    ...(attribution.utm_term ? { utm_term: attribution.utm_term } : {}),
  });

  const finalUrl = `${url}?${params.toString()}`;

  useEffect(() => {
    let cancelled = false;
    const tryInit = () => {
      if (cancelled) return;
      const host = hostRef.current;
      const C = (window as unknown as { Calendly?: { initInlineWidget: (o: Record<string, unknown>) => void } })
        .Calendly;
      if (host && C) {
        host.innerHTML = "";
        C.initInlineWidget({ url: finalUrl, parentElement: host });
      } else {
        setTimeout(tryInit, 200);
      }
    };
    tryInit();
    return () => {
      cancelled = true;
    };
  }, [url]);

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-xl font-display font-semibold text-navy">
            {title ?? `Almost done, ${prefill.name.split(" ")[0]} — pick your time`}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {subtitle ?? "Choose any open slot."}
          </p>
        </div>
        <Button type="button" variant="outline" className="shrink-0 border-navy/25 text-navy" onClick={onBack}>
          Back
        </Button>
      </div>

      <div className="mt-4 overflow-hidden rounded-2xl border border-border">
        <div ref={hostRef} style={{ minWidth: "300px", height: "760px" }} />
      </div>

      <noscript>
        <a href={CALENDLY_URL} target="_blank" rel="noreferrer">
          Book your Free estimate
        </a>
      </noscript>
    </div>
  );
}


function Field({

  label,
  error,
  required,
  htmlFor,
  children,
}: {
  label: string;
  error?: string;
  required?: boolean;
  htmlFor?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={htmlFor} className="text-sm font-medium text-foreground">
        {label} {required && <span className="text-destructive">*</span>}
      </Label>
      {children}
      {error && (
        <p id={htmlFor ? `${htmlFor}-error` : undefined} className="text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}


function ConfirmationScreen({
  state,
  onReset,
}: {
  state: {
    name: string;
    phone: string;
    email: string;
    project: string;
    address: string;
  };
  onReset: () => void;
}) {
  useEffect(() => {
    trackLeadEvent(`booking:${state.email}:${state.phone}`, {
      email: state.email,
      phone: state.phone,
      name: state.name,
    });
  }, [state.email, state.phone]);

  return (
    <div
      className="text-center py-4"
      id="booking-success"
      data-lead-success="true"
      role="status"
      aria-live="polite"
      aria-label="Booking confirmed"
    >
      <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-navy text-navy-foreground">
        <Check className="h-8 w-8" strokeWidth={3} />
      </div>
      <h3 className="mt-5 text-2xl font-display font-semibold text-navy">You're booked, {state.name.split(" ")[0]}!</h3>
      <p className="mt-2 text-muted-foreground max-w-md mx-auto">
        Your appointment is confirmed. A confirmation was sent to{" "}
        <span className="font-semibold text-foreground">{state.email}</span>, and you'll get automatic
        text reminders at <span className="font-semibold text-foreground">{state.phone}</span> before
        your visit.
      </p>
      <dl className="mt-6 grid gap-3 sm:grid-cols-2 text-left max-w-md mx-auto bg-secondary/60 rounded-xl p-5">
        <div>
          <dt className="text-xs uppercase tracking-wider text-muted-foreground">Project</dt>
          <dd className="font-medium text-navy">{state.project}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wider text-muted-foreground">Location</dt>
          <dd className="font-medium text-navy">{state.address}</dd>
        </div>
      </dl>
      <ol className="mt-5 grid gap-2 text-left max-w-md mx-auto text-sm text-muted-foreground">
        {[
          "Check your inbox — your confirmation email is on its way.",
          "We'll text you a reminder before your appointment — no need to confirm with us.",
          "A licensed installer arrives, measures, and gives you upfront pricing the same visit.",
        ].map((s, i) => (
          <li key={s} className="flex items-start gap-3">
            <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-navy text-navy-foreground text-[11px] font-semibold">
              {i + 1}
            </span>
            <span>{s}</span>
          </li>
        ))}
      </ol>

      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Button onClick={onReset} className="bg-navy text-navy-foreground hover:bg-navy/90">
          Book another appointment
        </Button>
      </div>

    </div>
  );
}

/* ---------------- FAQ ---------------- */
function FAQ() {
  const items = [
    {
      q: "How long does a shower installation take?",
      a: "Most acrylic and Onyx shower installations are completed in 2–3 days. Larger remodels or tub-to-shower conversions with plumbing moves typically take 3–5 days. We protect your floors, clean up daily, and keep your bathroom as usable as possible throughout the project.",
    },
    {
      q: "Do you really offer free, no-pressure estimates?",
      a: "Yes. Your estimate is 100% free and comes with absolutely no pressure to buy. We'll measure your space, walk you through your options, and leave you with a clear written quote you can review on your own time. We respect your home and your decision.",
    },
    {
      q: "What do your acrylic and Onyx shower systems cost?",
      a: "Every bathroom is different, so we provide a free custom quote based on your exact measurements and needs. Many tub-to-shower conversions start around $8,477, and we offer flexible financing so you can enjoy your new bathroom now and pay over time.",
    },
    {
      q: "Are your acrylic and Onyx panels really as durable as tile?",
      a: "Yes — and in many ways they're better. Our premium acrylic and Onyx wall systems are non-porous, leak-resistant, and backed by a solid warranty. They won't crack, stain, or grow mold in grout lines like tile can, and they clean up in minutes with just a wipe.",
    },
    {
      q: "Do you serve all of San Antonio?",
      a: "Yes. We serve San Antonio and the surrounding areas, including Alamo Heights, Stone Oak, Shavano Park, Boerne, Helotes, Fair Oaks Ranch, and beyond. Because we're a local, family-owned company, we can respond quickly and stand behind every installation we complete.",
    },
  ];
  return (
    <section className="cv-auto py-12 md:py-16 bg-secondary/40">
      <div className="container-x max-w-3xl">
        <div className="text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-navy/5 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-navy">
            FAQ
          </span>
          <h2 className="mt-4 text-3xl md:text-4xl text-navy text-balance">
            Frequently Asked Questions
          </h2>
        </div>
        <Accordion type="single" collapsible className="mt-8">
          {items.map((it, i) => (
            <AccordionItem key={i} value={`item-${i}`} className="border-border">
              <AccordionTrigger className="text-left text-base font-medium text-navy hover:no-underline">
                {it.q}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">{it.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}

/* ---------------- FOOTER ---------------- */
function Footer() {
  return (
    <footer className="cloth-gray text-neutral-800">
      <div className="container-x pt-4 pb-14 grid gap-10 md:grid-cols-2">
        <div>
          <Logo size="sm" variant="footer" />
          <p className="mt-5 text-neutral-700 text-sm max-w-sm">
            Family-owned bathroom remodeling. Beautiful showers, fast installs, zero hassle.
          </p>
          <p className="mt-3 text-neutral-600 text-sm">
            Proudly serving San Antonio and surrounding areas.
          </p>
          <a
            href="mailto:Contact@TexasBathSolutions.com"
            className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-navy hover:text-teal transition-colors"
          >
            <Mail className="h-4 w-4" /> Contact@TexasBathSolutions.com
          </a>
        </div>
        <div className="md:justify-self-end">
          <h4 className="font-semibold text-neutral-900">Trust &amp; Credentials</h4>
          <div className="mt-3 flex flex-wrap gap-2">
            <a
              href="https://www.bbb.org"
              target="_blank"
              rel="noreferrer"
              className="rounded-md bg-neutral-900/8 px-3 py-2 text-xs font-semibold text-neutral-800 hover:bg-neutral-900/15"
            >
              A+ BBB Accredited
            </a>
            <span className="rounded-md bg-neutral-900/8 px-3 py-2 text-xs font-semibold">
              Zero Complaints
            </span>
            <span className="rounded-md bg-neutral-900/8 px-3 py-2 text-xs font-semibold">
              Licensed &amp; Insured
            </span>
          </div>
          <p className="mt-4 text-xs text-neutral-600 max-w-xs">
            Quality acrylic and Onyx shower systems featuring premium finishes and lifetime durability.
          </p>
        </div>
      </div>
      <div className="border-t border-neutral-900/10">
        <div className="container-x py-5 flex flex-wrap items-center justify-between gap-3 text-xs text-neutral-600">
          <div>© {new Date().getFullYear()} Texas Bath Solutions. All rights reserved.</div>
          <div className="flex items-center gap-3 text-neutral-600">
            <span>Licensed &amp; Insured · San Antonio, Texas</span>
            <span>·</span>
            <a href="/admin" className="hover:text-navy hover:underline transition-colors">Admin Panel</a>
          </div>
        </div>
      </div>
      <LegalTerms />


    </footer>
  );
}

/* ---------------- PAGE ---------------- */
/* ---------------- CONTACT US DIALOG ---------------- */
function ContactUsDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const [state, setState] = useState({ name: "", email: "", phone: "", message: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const update = <K extends keyof typeof state>(k: K, v: (typeof state)[K]) => {
    setState((s) => ({ ...s, [k]: v }));
    if (errors[k]) setErrors((e) => ({ ...e, [k]: "" }));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!state.name.trim()) e.name = "Please enter your name";
    if (state.phone.replace(/\D/g, "").length !== 10) e.phone = "Enter a valid 10-digit phone";
    if (!state.email.trim()) e.email = "Email is required";
    else if (!/^\S+@\S+\.\S+$/.test(state.email)) e.email = "Invalid email";
    if (!state.message.trim()) e.message = "Please enter a message";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    void submitLead({
      data: {
        name: state.name,
        phone: state.phone,
        email: state.email,
        address: "Not provided (Contact Us form)",
        timeframe: "",
        notes: state.message + attributionNote(),
        source: "Contact Us form",
      },
    }).catch((err: unknown) => console.error("Lead notification failed", err));
    setSubmitted(true);
  };

  const reset = () => {
    setState({ name: "", email: "", phone: "", message: "" });
    setErrors({});
    setSubmitted(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl text-navy">Contact Us</DialogTitle>
          <DialogDescription>
            Send a message to{" "}
            <a href="mailto:Contact@TexasBathSolutions.com" className="font-semibold text-navy hover:underline">
              Contact@TexasBathSolutions.com
            </a>
            . We typically reply within one business day.
          </DialogDescription>
        </DialogHeader>
        {submitted ? (
          <div className="py-8 text-center space-y-4" data-lead-success="true">
            <LeadEventTracker
              dedupeKey={`contact:${state.email}:${state.phone}`}
              identity={{ name: state.name, email: state.email, phone: state.phone }}
            />
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-navy text-navy-foreground">
              <Check className="h-7 w-7" strokeWidth={3} />
            </div>
            <h3 className="text-xl font-semibold text-navy">Message sent</h3>
            <p className="text-muted-foreground">
              Thanks! Our team has your message and will reply within one business day.
            </p>
            <Button onClick={reset} variant="outline" className="border-navy/25 text-navy hover:bg-navy/5">
              Send another message
            </Button>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-4" noValidate>
            <Field label="Full Name" error={errors.name} required>
              <Input
                value={state.name}
                onChange={(e) => update("name", e.target.value)}
                placeholder="Your Name"
                autoComplete="name"
              />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Email" error={errors.email} required>
                <Input
                  type="email"
                  value={state.email}
                  onChange={(e) => update("email", e.target.value)}
                  placeholder="Your Email"
                  autoComplete="email"
                />
              </Field>
              <Field label="Phone Number" error={errors.phone} required>
                <Input
                  value={state.phone}
                  onChange={(e) => update("phone", formatPhone(e.target.value))}
                  placeholder="(210) 555-0123"
                  inputMode="tel"
                  autoComplete="tel"
                />
              </Field>
            </div>
            <Field label="Message" error={errors.message} required>
              <Textarea
                value={state.message}
                onChange={(e) => update("message", e.target.value)}
                placeholder="How can we help with your bathroom project?"
                rows={4}
              />
            </Field>
            <div className="rounded-lg bg-secondary p-3 text-sm text-muted-foreground">
              Recipient: <span className="font-medium text-foreground">Contact@TexasBathSolutions.com</span>
            </div>
            <Button
              type="submit"
              size="lg"
              className="w-full h-12 bg-navy text-navy-foreground hover:bg-navy/90 text-base font-semibold shadow-elegant"
            >
              Send Message
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

function Index() {
  const formRef = useRef<HTMLElement | null>(null);
  // TEMP (QA): logs "[TBS Pixel] ✅ Meta Pixel initialized" once fbq is on window.
  usePixelInitCheck();
  // Capture fbclid / UTM params on landing, before any in-page navigation.
  useEffect(() => {
    captureAttribution();
  }, []);
  const [contactOpen, setContactOpen] = useState(false);
  const [calendlyUrl, setCalendlyUrl] = useState("");
  const scrollToBook = () => {
    const el = document.getElementById("book");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleShowCalendly = (url: string) => {
    setCalendlyUrl(url);
  };

  // Add the telephone to structured data only in the browser, so it is not in
  // the raw HTML source for scrapers (search engines execute JS and still see it).
  useEffect(() => {
    const phone = decodePhone();
    if (!phone) return;
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "LocalBusiness",
      name: "Texas Bath Solutions",
      telephone: `+1${phone.display.replace(/\D/g, "")}`,
      url: "https://www.texasbathsolutions.com",
    });
    document.head.appendChild(script);
    return () => {
      script.remove();
    };
  }, []);


  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar onBook={scrollToBook} onContact={() => setContactOpen(true)} />
      <main className="pb-[4.5rem] lg:pb-0">
        <Hero onBook={scrollToBook} />
        <TrustBar />
        <About />
        <BookingForm formRef={formRef} />
        <Gallery />
        <Offers />
        <WhyUs />
        <Process />
        <FAQ />
        <Testimonials />
      </main>
      <FinancingBanner onBook={scrollToBook} />
      <Footer />
      <MobilePhoneCTA onBook={scrollToBook} />
      <ContactUsDialog open={contactOpen} onOpenChange={setContactOpen} />
    </div>
  );
}
