"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

export type Locale = "en" | "ur";

const translations = {
  en: {
    app: {
      name: "ANAM-AI",
      tagline: "Securing Your Health in a Digital World",
    },
    nav: {
      overview: "Overview",
      chat: "Chat",
      booking: "Booking",
      documents: "Documents",
      family: "Family",
      settings: "Settings",
      logout: "Sign Out",
      patients: "Patients",
      provider_dashboard: "Provider Dashboard",
    },
    landing: {
      hero_title: "Securing Your Health\nin a Digital World",
      hero_sub:
        "AI-powered platform that bridges the gap between patients and healthcare providers — proactive, centralized, and always available.",
      get_started: "Get Started Free",
      learn_more: "Learn More",
      features_title: "Everything you need for proactive healthcare",
      features_sub:
        "ANAM-AI brings together AI risk identification, seamless communication, and centralized records in one secure platform.",
      feat1_title: "AI Risk Identification",
      feat1_desc:
        "Advanced algorithms analyze your health data to spot risks before they become crises.",
      feat2_title: "Seamless Communication",
      feat2_desc:
        "Reach your healthcare providers 24/7 — no waiting rooms, no phone queues.",
      feat3_title: "Centralized Records",
      feat3_desc:
        "All your medical history, test results, and prescriptions in one secure, accessible place.",
      feat4_title: "Family Health Hub",
      feat4_desc:
        "Manage the health of your entire family under a single plan, like you do with streaming services.",
      how_title: "How it works",
      step1_title: "Create your account",
      step1_desc: "Sign up in under a minute — individual or family plan.",
      step2_title: "Connect your health data",
      step2_desc: "Import records or enter your health profile manually.",
      step3_title: "Let AI watch over you",
      step3_desc:
        "Receive proactive risk alerts, chat with providers, and book appointments instantly.",
      cta_title: "Ready to take control of your health?",
      cta_sub: "Join thousands of patients who chose proactive over reactive.",
      cta_btn: "Start for Free",
      login: "Sign In",
      trusted: "Trusted by patients across Pakistan",
    },
    auth: {
      login: "Sign In",
      login_sub: "Welcome back to ANAM-AI",
      register: "Create Account",
      register_sub: "Start securing your health today",
      email: "Email address",
      password: "Password",
      name: "Full name",
      account_type: "Account type",
      individual: "Individual",
      individual_desc: "Just for you",
      family_head: "Family Plan Head",
      family_head_desc: "Manage up to 5 family members",
      have_account: "Already have an account?",
      no_account: "Don't have an account?",
      forgot: "Forgot password?",
      sign_in: "Sign In",
      create_account: "Create Account",
      or: "or",
      email_placeholder: "you@example.com",
      password_placeholder: "At least 8 characters",
      name_placeholder: "Your full name",
      terms: "By creating an account you agree to our Terms of Service and Privacy Policy.",
    },
    dashboard: {
      welcome: "Welcome back",
      overview: "Overview",
      good_morning: "Good morning",
      good_afternoon: "Good afternoon",
      good_evening: "Good evening",
      upcoming_label: "Upcoming Appointments",
      messages_label: "Unread Messages",
      docs_label: "Documents",
      quick_actions: "Quick Actions",
      new_chat: "New Chat",
      book_appt: "Book Appointment",
      upload_doc: "Upload Document",
      recent_activity: "Recent Activity",
      no_activity: "No recent activity",
      health_score: "Health Score",
      risk_level: "Risk Level",
      low: "Low",
      medium: "Medium",
      high: "High",
    },
    chat: {
      title: "Health Assistant",
      new_chat: "New Conversation",
      placeholder: "Ask about your health, symptoms, or medications…",
      thinking: "Thinking…",
      today: "Today",
      yesterday: "Yesterday",
      send: "Send",
      ai_name: "ANAM Assistant",
      disclaimer:
        "AI responses are for informational purposes only and do not replace professional medical advice.",
    },
    booking: {
      title: "Appointments",
      book: "Book Appointment",
      today: "Today",
      upcoming: "Upcoming",
      past: "Past",
      confirmed: "Confirmed",
      pending: "Pending",
      cancelled: "Cancelled",
      available_slots: "Available Slots",
      no_slots: "No slots available for this day",
      select_date: "Select a date to see available slots",
      doctor: "Doctor",
      specialty: "Specialty",
      date: "Date",
      time: "Time",
      cancel_appt: "Cancel",
      reschedule: "Reschedule",
      book_slot: "Book this slot",
      confirm_booking: "Confirm Booking",
    },
    documents: {
      title: "Documents",
      upload: "Upload",
      search: "Search files…",
      all: "All Files",
      reports: "Lab Reports",
      prescriptions: "Prescriptions",
      imaging: "Imaging",
      other: "Other",
      no_preview: "Select a file to preview",
      drop_hint: "Drag & drop files here, or click Upload",
      file_info: "File Information",
      uploaded: "Uploaded",
      size: "Size",
      type: "Type",
      download: "Download",
      delete: "Delete",
    },
    family: {
      title: "Family Plan",
      head: "Account Head",
      member: "Member",
      pending_invite: "Pending Invite",
      invite: "Invite Member",
      invite_email: "Enter email address to invite",
      send_invite: "Send Invite",
      plan_info: "Family Plan · Up to 5 members",
      slots_used: "members",
      remove: "Remove",
      cancel_invite: "Cancel Invite",
      you: "You",
      manage_plan: "Manage Plan",
      upgrade: "Upgrade Plan",
      individual_note:
        "You are on an Individual plan. Upgrade to Family to add members.",
    },
    settings: {
      title: "Settings",
      profile: "Profile",
      localization: "Localization",
      notifications: "Notifications",
      privacy: "Privacy",
      language: "Language",
      date_format: "Date Format",
      timezone: "Timezone",
      save: "Save Changes",
      saved: "Saved!",
      full_name: "Full Name",
      email: "Email Address",
      phone: "Phone Number",
      dob: "Date of Birth",
      gender: "Gender",
      male: "Male",
      female: "Female",
      prefer_not: "Prefer not to say",
      notif_appt: "Appointment reminders",
      notif_msg: "New messages",
      notif_risk: "Health risk alerts",
      notif_family: "Family activity",
      privacy_data: "Data sharing for AI improvement",
      privacy_analytics: "Anonymous analytics",
      danger_zone: "Danger Zone",
      delete_account: "Delete Account",
      english: "English",
      urdu: "اردو (Urdu)",
    },
  },

  ur: {
    app: {
      name: "ANAM-AI",
      tagline: "ڈیجیٹل دنیا میں آپ کی صحت محفوظ",
    },
    nav: {
      overview: "جائزہ",
      chat: "چیٹ",
      booking: "بکنگ",
      documents: "دستاویزات",
      family: "خاندان",
      settings: "ترتیبات",
      logout: "باہر نکلیں",
      patients: "مریض",
      provider_dashboard: "فراہم کنندہ ڈیش بورڈ",
    },
    landing: {
      hero_title: "ڈیجیٹل دنیا میں\nآپ کی صحت محفوظ",
      hero_sub:
        "AI سے چلنے والا پلیٹ فارم جو مریضوں اور صحت کے فراہم کنندگان کے درمیان فاصلہ ختم کرتا ہے۔",
      get_started: "مفت شروع کریں",
      learn_more: "مزید جانیں",
      features_title: "فعال صحت کی دیکھ بھال کے لیے ہر چیز",
      features_sub:
        "ANAM-AI AI خطرے کی شناخت، آسان رابطہ، اور مرکزی ریکارڈ کو ایک محفوظ پلیٹ فارم میں جمع کرتا ہے۔",
      feat1_title: "AI خطرے کی شناخت",
      feat1_desc:
        "جدید الگورتھم آپ کے صحت کے ڈیٹا کا تجزیہ کرتے ہیں تاکہ خطرات کو پہلے سے پہچانا جا سکے۔",
      feat2_title: "آسان رابطہ",
      feat2_desc:
        "اپنے صحت کے فراہم کنندگان تک 24/7 پہنچیں — کوئی انتظار نہیں۔",
      feat3_title: "مرکزی ریکارڈ",
      feat3_desc:
        "آپ کی تمام طبی تاریخ، ٹیسٹ کے نتائج، اور نسخے ایک محفوظ جگہ پر۔",
      feat4_title: "خاندانی صحت مرکز",
      feat4_desc:
        "ایک پلان کے تحت اپنے پورے خاندان کی صحت کا انتظام کریں۔",
      how_title: "یہ کیسے کام کرتا ہے",
      step1_title: "اپنا اکاؤنٹ بنائیں",
      step1_desc: "ایک منٹ سے کم میں سائن اپ کریں۔",
      step2_title: "اپنا صحت کا ڈیٹا جوڑیں",
      step2_desc: "ریکارڈ درآمد کریں یا دستی طور پر درج کریں۔",
      step3_title: "AI کو نگرانی کرنے دیں",
      step3_desc: "فعال خطرے کی الرٹس، چیٹ، اور ملاقاتیں فوری بک کریں۔",
      cta_title: "اپنی صحت کا کنٹرول لینے کے لیے تیار ہیں؟",
      cta_sub: "ان ہزاروں مریضوں میں شامل ہوں جنہوں نے فعال راستہ چنا۔",
      cta_btn: "مفت شروع کریں",
      login: "لاگ ان",
      trusted: "پاکستان بھر کے مریضوں کا اعتماد",
    },
    auth: {
      login: "لاگ ان",
      login_sub: "ANAM-AI میں واپس خوش آمدید",
      register: "اکاؤنٹ بنائیں",
      register_sub: "آج اپنی صحت محفوظ کرنا شروع کریں",
      email: "ای میل پتہ",
      password: "پاس ورڈ",
      name: "پورا نام",
      account_type: "اکاؤنٹ کی قسم",
      individual: "انفرادی",
      individual_desc: "صرف آپ کے لیے",
      family_head: "خاندانی پلان سربراہ",
      family_head_desc: "5 تک خاندانی اراکین کا انتظام",
      have_account: "پہلے سے اکاؤنٹ ہے؟",
      no_account: "اکاؤنٹ نہیں ہے؟",
      forgot: "پاس ورڈ بھول گئے؟",
      sign_in: "لاگ ان",
      create_account: "اکاؤنٹ بنائیں",
      or: "یا",
      email_placeholder: "آپ@مثال.کام",
      password_placeholder: "کم از کم 8 حروف",
      name_placeholder: "آپ کا پورا نام",
      terms: "اکاؤنٹ بنا کر آپ ہماری شرائط اور رازداری پالیسی سے متفق ہیں۔",
    },
    dashboard: {
      welcome: "خوش آمدید",
      overview: "جائزہ",
      good_morning: "صبح بخیر",
      good_afternoon: "دوپہر بخیر",
      good_evening: "شام بخیر",
      upcoming_label: "آنے والی ملاقاتیں",
      messages_label: "غیر پڑھے پیغامات",
      docs_label: "دستاویزات",
      quick_actions: "فوری اقدامات",
      new_chat: "نئی چیٹ",
      book_appt: "ملاقات بک کریں",
      upload_doc: "دستاویز اپلوڈ کریں",
      recent_activity: "حالیہ سرگرمی",
      no_activity: "کوئی حالیہ سرگرمی نہیں",
      health_score: "صحت کا اسکور",
      risk_level: "خطرے کی سطح",
      low: "کم",
      medium: "درمیانہ",
      high: "زیادہ",
    },
    chat: {
      title: "صحت معاون",
      new_chat: "نئی گفتگو",
      placeholder: "اپنی صحت، علامات، یا دوائوں کے بارے میں پوچھیں…",
      thinking: "سوچ رہا ہے…",
      today: "آج",
      yesterday: "کل",
      send: "بھیجیں",
      ai_name: "ANAM معاون",
      disclaimer:
        "AI کے جوابات صرف معلوماتی مقاصد کے لیے ہیں اور پیشہ ورانہ طبی مشورے کا متبادل نہیں ہیں۔",
    },
    booking: {
      title: "ملاقاتیں",
      book: "ملاقات بک کریں",
      today: "آج",
      upcoming: "آنے والی",
      past: "گزشتہ",
      confirmed: "تصدیق شدہ",
      pending: "زیر التواء",
      cancelled: "منسوخ",
      available_slots: "دستیاب وقت",
      no_slots: "اس دن کوئی وقت دستیاب نہیں",
      select_date: "دستیاب وقت دیکھنے کے لیے تاریخ منتخب کریں",
      doctor: "ڈاکٹر",
      specialty: "خصوصیت",
      date: "تاریخ",
      time: "وقت",
      cancel_appt: "منسوخ کریں",
      reschedule: "دوبارہ شیڈول",
      book_slot: "یہ وقت بک کریں",
      confirm_booking: "بکنگ کی تصدیق کریں",
    },
    documents: {
      title: "دستاویزات",
      upload: "اپلوڈ",
      search: "فائلیں تلاش کریں…",
      all: "تمام فائلیں",
      reports: "لیب رپورٹس",
      prescriptions: "نسخے",
      imaging: "امیجنگ",
      other: "دیگر",
      no_preview: "پیش نظارہ کے لیے فائل منتخب کریں",
      drop_hint: "فائلیں یہاں ڈراپ کریں، یا اپلوڈ پر کلک کریں",
      file_info: "فائل معلومات",
      uploaded: "اپلوڈ کیا گیا",
      size: "سائز",
      type: "قسم",
      download: "ڈاؤنلوڈ",
      delete: "حذف",
    },
    family: {
      title: "خاندانی پلان",
      head: "اکاؤنٹ سربراہ",
      member: "رکن",
      pending_invite: "زیر التواء دعوت",
      invite: "رکن مدعو کریں",
      invite_email: "دعوت کے لیے ای میل پتہ درج کریں",
      send_invite: "دعوت بھیجیں",
      plan_info: "خاندانی پلان · 5 اراکین تک",
      slots_used: "اراکین",
      remove: "ہٹائیں",
      cancel_invite: "دعوت منسوخ",
      you: "آپ",
      manage_plan: "پلان منظم کریں",
      upgrade: "پلان اپگریڈ",
      individual_note:
        "آپ انفرادی پلان پر ہیں۔ اراکین شامل کرنے کے لیے خاندانی پلان میں اپگریڈ کریں۔",
    },
    settings: {
      title: "ترتیبات",
      profile: "پروفائل",
      localization: "مقامی کاری",
      notifications: "اطلاعات",
      privacy: "رازداری",
      language: "زبان",
      date_format: "تاریخ کا فارمیٹ",
      timezone: "ٹائم زون",
      save: "تبدیلیاں محفوظ کریں",
      saved: "محفوظ ہو گیا!",
      full_name: "پورا نام",
      email: "ای میل پتہ",
      phone: "فون نمبر",
      dob: "تاریخ پیدائش",
      gender: "جنس",
      male: "مرد",
      female: "عورت",
      prefer_not: "بتانا پسند نہیں",
      notif_appt: "ملاقات یاد دہانی",
      notif_msg: "نئے پیغامات",
      notif_risk: "صحت کے خطرے کی الرٹس",
      notif_family: "خاندانی سرگرمی",
      privacy_data: "AI بہتری کے لیے ڈیٹا شیئرنگ",
      privacy_analytics: "گمنام تجزیات",
      danger_zone: "خطرناک زون",
      delete_account: "اکاؤنٹ حذف کریں",
      english: "English",
      urdu: "اردو (Urdu)",
    },
  },
} as const;

export type Translations = typeof translations.en;

interface LocaleContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: Translations;
  isRtl: boolean;
}

const LocaleContext = createContext<LocaleContextType | null>(null);

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en");

  useEffect(() => {
    const saved = localStorage.getItem("anam-locale") as Locale | null;
    if (saved === "en" || saved === "ur") setLocaleState(saved);
  }, []);

  const setLocale = (l: Locale) => {
    setLocaleState(l);
    localStorage.setItem("anam-locale", l);
    document.documentElement.dir = l === "ur" ? "rtl" : "ltr";
    document.documentElement.lang = l;
  };

  useEffect(() => {
    document.documentElement.dir = locale === "ur" ? "rtl" : "ltr";
    document.documentElement.lang = locale;
  }, [locale]);

  return (
    <LocaleContext.Provider
      value={{
        locale,
        setLocale,
        t: translations[locale] as Translations,
        isRtl: locale === "ur",
      }}
    >
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useLocale must be used within LocaleProvider");
  return ctx;
}
