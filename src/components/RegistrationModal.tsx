import { useState } from "react";
import { X, Send, Plus, Trash2, ChevronDown, ChevronUp, Users, User, Search, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";

const PAYMENT_ID_REGEX = /^pay_[A-Za-z0-9]{14}$/;
const paymentIdSchema = z
  .string()
  .trim()
  .min(1, { message: "Payment ID is required" })
  .regex(PAYMENT_ID_REGEX, {
    message: 'Payment ID must look like "pay_" followed by 14 letters or numbers',
  });

const normalizePaymentId = (raw: string) =>
  raw.trim().replace(/^['"]+|['"]+$/g, "");

const committees = [
  "UNSC - United Nations Security Council",
  "UNCND - United Nations Commission on Narcotics and Drugs",
  "UNGA LEGAL - United Nations General Assembly",
  "AD-HOC - Ad-Hoc Committee",
  "CCS - Cabinet Committee on Security",
  "AIPPM - All India Political Parties Meet",
  "IPP - International Press Photography",
  "IPJ - International Press Journalism",
  "IPC - International Press Caricature",
];

interface RegistrationModalProps {
  open: boolean;
  onClose: () => void;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

const RAZORPAY_KEY = "rzp_live_Sdjq0W15ZVeiHg";

type Category = "mun" | "mun_comedy_general" | "mun_comedy_fanpit";

const CATEGORY_PRICE: Record<Category, number> = {
  mun: 400,
  mun_comedy_general: 500,
  mun_comedy_fanpit: 600,
};
const CATEGORY_TIER: Record<Category, number> = {
  mun: 1,
  mun_comedy_general: 2,
  mun_comedy_fanpit: 3,
};
const CATEGORY_LABEL: Record<Category, string> = {
  mun: "MUN",
  mun_comedy_general: "MUN + Comedy Night (General)",
  mun_comedy_fanpit: "MUN + Comedy Night (Fanpit)",
};
const CATEGORY_SHORT: Record<Category, string> = {
  mun: "MUN only",
  mun_comedy_general: "MUN + Comedy (General)",
  mun_comedy_fanpit: "MUN + Comedy (Fanpit)",
};
const CATEGORIES: Category[] = ["mun", "mun_comedy_general", "mun_comedy_fanpit"];

interface DelegateForm {
  name: string;
  mobile: string;
  email: string;
  class: string;
  pref1: string;
  pref2: string;
  pref3: string;
  experience: string;
}

const emptyDelegate = (): DelegateForm => ({
  name: "",
  mobile: "",
  email: "",
  class: "",
  pref1: "",
  pref2: "",
  pref3: "",
  experience: "",
});

const isMobileValid = (mobile: string) => /^\d{10}$/.test(mobile);

const isDelegateValid = (d: DelegateForm) =>
  d.name.trim() && isMobileValid(d.mobile) && d.email.trim() && d.class.trim() && d.pref1 && d.pref2 && d.pref3;

const getAvailableCommittees = (exclude: string[]) =>
  committees.filter((c) => !exclude.includes(c));

const RegistrationModal = ({ open, onClose }: RegistrationModalProps) => {
  const [mode, setMode] = useState<"individual" | "school" | "upgrade">("individual");
  const [category, setCategory] = useState<Category>("mun");

  // Individual form state
  const [form, setForm] = useState({
    name: "",
    mobile: "",
    email: "",
    school: "",
    class: "",
    pref1: "",
    pref2: "",
    pref3: "",
    experience: "",
  });

  // School delegation state
  const [schoolName, setSchoolName] = useState("");
  const [delegates, setDelegates] = useState<DelegateForm[]>(
    () => Array.from({ length: 10 }, emptyDelegate)
  );
  const [expandedDelegate, setExpandedDelegate] = useState<number>(0);

  const [loading, setLoading] = useState(false);

  // Upgrade flow state
  const [upgradeStep, setUpgradeStep] = useState<"lookup" | "confirm" | "choose" | "blocked" | "done">("lookup");
  const [upgradePaymentIdInput, setUpgradePaymentIdInput] = useState("");
  const [upgradeIdError, setUpgradeIdError] = useState<string | null>(null);
  const [upgradeDelegates, setUpgradeDelegates] = useState<any[]>([]);
  const [upgradeCurrentCategory, setUpgradeCurrentCategory] = useState<Category>("mun");
  const [upgradeChoice, setUpgradeChoice] = useState<Category | null>(null);

  const update = (field: string, value: string) =>
    setForm((prev) => ({
      ...prev,
      ...(field === "pref1" && value === prev.pref2 ? { pref2: "" } : {}),
      ...(field === "pref1" && value === prev.pref3 ? { pref3: "" } : {}),
      ...(field === "pref2" && value === prev.pref3 ? { pref3: "" } : {}),
      [field]: value,
    }));

  const updateDelegate = (index: number, field: keyof DelegateForm, value: string) => {
    setDelegates((prev) => {
      const updated = [...prev];
      const d = { ...updated[index] };
      if (field === "pref1" && value === d.pref2) d.pref2 = "";
      if (field === "pref1" && value === d.pref3) d.pref3 = "";
      if (field === "pref2" && value === d.pref3) d.pref3 = "";
      d[field] = value;
      updated[index] = d;
      return updated;
    });
  };

  const addDelegate = () => {
    if (delegates.length < 20) {
      setDelegates((prev) => [...prev, emptyDelegate()]);
      setExpandedDelegate(delegates.length);
    }
  };

  const removeDelegate = (index: number) => {
    if (delegates.length > 10) {
      setDelegates((prev) => prev.filter((_, i) => i !== index));
      if (expandedDelegate === index) setExpandedDelegate(Math.max(0, index - 1));
      else if (expandedDelegate > index) setExpandedDelegate(expandedDelegate - 1);
    }
  };

  const isIndividualValid =
    form.name.trim() && isMobileValid(form.mobile) && form.email.trim() && form.school.trim() && form.class.trim() && form.pref1 && form.pref2 && form.pref3;

  const completedDelegates = delegates.filter(isDelegateValid).length;
  const isSchoolValid = schoolName.trim() && completedDelegates === delegates.length;

  const perDelegatePrice = CATEGORY_PRICE[category];
  const individualAmount = perDelegatePrice;
  const schoolAmount = perDelegatePrice * delegates.length;

  const handlePayNow = async () => {
    if (mode === "individual" && !isIndividualValid) {
      toast.error("Please fill all fields before proceeding.");
      return;
    }
    if (mode === "school" && !isSchoolValid) {
      toast.error(`Please complete all ${delegates.length} delegate forms.`);
      return;
    }

    setLoading(true);
    const amount = mode === "individual" ? individualAmount : schoolAmount;

    // Create a Razorpay order on the server (auto-capture enabled).
    let orderId: string;
    let orderKey: string;
    try {
      const { data, error } = await supabase.functions.invoke("create-razorpay-order", {
        body: {
          amount,
          currency: "INR",
          receipt: `mun_${Date.now()}`,
        notes: { mode, category, delegates: String(mode === "school" ? delegates.length : 1) },
        },
      });
      if (error) throw error;
      if (!data?.order_id) throw new Error("No order_id returned");
      orderId = data.order_id;
      orderKey = data.key_id || RAZORPAY_KEY;
    } catch (err) {
      console.error("Order creation failed:", err);
      toast.error("Could not initiate payment. Please try again.");
      setLoading(false);
      return;
    }

    const options = {
      key: orderKey,
      order_id: orderId,
      amount,
      currency: "INR",
      name: "Ashe MUN 2026",
      description: mode === "individual" ? "Individual Registration Fee" : `School Delegation (${delegates.length} delegates)`,
      prefill: mode === "individual"
        ? { name: form.name, email: form.email, contact: form.mobile }
        : { name: schoolName },
      theme: { color: "#0ea5e9" },
      handler: async function (response: any) {
        try {
          const delegatePayload = mode === "individual"
            ? [{
                name: form.name, mobile: form.mobile, email: form.email,
                school: form.school, class: form.class,
                preference_1: form.pref1, preference_2: form.pref2, preference_3: form.pref3,
                experience: form.experience || null,
              }]
            : delegates.map((d) => ({
                name: d.name, mobile: d.mobile, email: d.email,
                school: schoolName, class: d.class,
                preference_1: d.pref1, preference_2: d.pref2, preference_3: d.pref3,
                experience: d.experience || null,
              }));
          const { data: regData, error: regErr } = await supabase.functions.invoke("create-registration", {
            body: {
              delegation_type: mode,
              category,
              delegates: delegatePayload,
              school_name: mode === "school" ? schoolName : undefined,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            },
          });
          if (regErr || (regData as any)?.error) {
            throw new Error((regData as any)?.error || regErr?.message || "Could not save registration");
          }
          toast.success("Payment successful! Registration confirmed.", {
            description: `Payment ID: ${response.razorpay_payment_id}`,
          });
        } catch (err) {
          console.error("Failed to save registration:", err);
          toast.error("Payment captured, but we couldn't save your registration.", {
            description: `Please contact support with Payment ID: ${response.razorpay_payment_id}`,
          });
        }
        setLoading(false);
        onClose();
      },
      modal: {
        ondismiss: () => setLoading(false),
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.on("payment.failed", (response: any) => {
      toast.error("Payment failed. Please try again.", { description: response.error.description });
      setLoading(false);
    });
    rzp.open();
  };

  // ─── Upgrade flow ───
  const handleUpgradeLookup = async () => {
    const normalized = normalizePaymentId(upgradePaymentIdInput);
    const parsed = paymentIdSchema.safeParse(normalized);
    if (!parsed.success) {
      const msg = parsed.error.issues[0]?.message ?? "Invalid Payment ID";
      setUpgradeIdError(msg);
      toast.error("Check your Payment ID", { description: msg });
      return;
    }
    setUpgradeIdError(null);
    setUpgradePaymentIdInput(parsed.data);
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("lookup-registration", {
        body: { paymentId: parsed.data },
      });
      if (error) {
        console.error(error);
        toast.error("Couldn't reach the server", {
          description: "Please check your connection and try again.",
        });
        return;
      }
      if (!data?.found) {
        const msg = "We couldn't find a registration with that Payment ID. Double-check the ID from your confirmation email.";
        setUpgradeIdError("No registration found for this Payment ID");
        toast.error("Registration not found", { description: msg });
        return;
      }
      if (data?.blocked) {
        const msg = data.message || "This payment has been refunded. Upgrade is not allowed.";
        setUpgradeDelegates(data.delegates || []);
        setUpgradeIdError(msg);
        setUpgradeStep("blocked");
        toast.error(msg);
        return;
      }
      setUpgradeDelegates(data.delegates);
      const cur = (data.delegates[0]?.upgrade_category || data.delegates[0]?.category || "mun") as Category;
      setUpgradeCurrentCategory(cur);
      setUpgradeStep("confirm");
    } catch (err) {
      console.error(err);
      toast.error("Lookup failed", {
        description: "Something went wrong while looking up your Payment ID. Please try again or contact support.",
      });
    } finally {
      setLoading(false);
    }
  };

  const upgradeOptions: Category[] = CATEGORIES.filter(
    (c) => CATEGORY_TIER[c] > CATEGORY_TIER[upgradeCurrentCategory],
  );

  const handleUpgradePay = async () => {
    if (upgradeDelegates.some((delegate) => delegate.refunded)) {
      toast.error("This payment has been refunded. Upgrade is not allowed.");
      setUpgradeStep("blocked");
      return;
    }
    if (!upgradeChoice) {
      toast.error("Choose an upgrade option");
      return;
    }
    const diff = CATEGORY_PRICE[upgradeChoice] - CATEGORY_PRICE[upgradeCurrentCategory];
    const totalDiff = diff * upgradeDelegates.length;
    setLoading(true);

    let orderId: string;
    let orderKey: string;
    try {
      const { data, error } = await supabase.functions.invoke("create-razorpay-order", {
        body: {
          amount: totalDiff,
          currency: "INR",
          receipt: `upg_${Date.now()}`,
          notes: { type: "upgrade", originalPaymentId: upgradePaymentIdInput.trim(), newCategory: upgradeChoice },
        },
      });
      if (error) throw error;
      orderId = data.order_id;
      orderKey = data.key_id || RAZORPAY_KEY;
    } catch (err) {
      console.error(err);
      toast.error("Could not initiate payment. Please try again.");
      setLoading(false);
      return;
    }

    const firstDelegate = upgradeDelegates[0];
    const options = {
      key: orderKey,
      order_id: orderId,
      amount: totalDiff,
      currency: "INR",
      name: "Ashe MUN 2026",
      description: `Upgrade to ${CATEGORY_LABEL[upgradeChoice]} (${upgradeDelegates.length} delegate${upgradeDelegates.length > 1 ? "s" : ""})`,
      prefill: { name: firstDelegate?.name, email: firstDelegate?.email, contact: firstDelegate?.mobile },
      theme: { color: "#0ea5e9" },
      handler: async function (response: any) {
        try {
          const { error } = await supabase.functions.invoke("apply-upgrade", {
            body: {
              originalPaymentId: upgradePaymentIdInput.trim(),
              newCategory: upgradeChoice,
              newPaymentId: response.razorpay_payment_id,
              expectedAmount: totalDiff,
            },
          });
          if (error) throw error;
          toast.success("Upgrade successful! A confirmation email has been sent.", {
            description: `Payment ID: ${response.razorpay_payment_id}`,
          });
          setUpgradeStep("done");
        } catch (err) {
          console.error(err);
          toast.error("Payment captured, but upgrade could not be applied. Contact support with your Payment ID.", {
            description: `Payment ID: ${response.razorpay_payment_id}`,
          });
        } finally {
          setLoading(false);
        }
      },
      modal: { ondismiss: () => setLoading(false) },
    };

    const rzp = new window.Razorpay(options);
    rzp.on("payment.failed", (response: any) => {
      toast.error("Payment failed. Please try again.", { description: response.error.description });
      setLoading(false);
    });
    rzp.open();
  };

  const resetUpgrade = () => {
    setUpgradeStep("lookup");
    setUpgradePaymentIdInput("");
    setUpgradeIdError(null);
    setUpgradeDelegates([]);
    setUpgradeChoice(null);
  };

  const inputClass =
    "w-full px-4 py-3 rounded-xl bg-card border border-border text-foreground placeholder:text-muted-foreground text-sm font-body focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all";
  const selectClass =
    "w-full px-4 py-3 rounded-xl bg-card border border-border text-foreground text-sm font-body focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all appearance-none cursor-pointer";

  const renderCommitteeSelects = (
    pref1: string,
    pref2: string,
    pref3: string,
    onUpdate: (field: string, value: string) => void
  ) => (
    <>
      <div>
        <label className="text-xs text-muted-foreground font-heading uppercase tracking-wider mb-1 block">Preference 1</label>
        <select value={pref1} onChange={(e) => onUpdate("pref1", e.target.value)} className={selectClass} required>
          <option value="">Select Committee</option>
          {committees.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>
      <div>
        <label className="text-xs text-muted-foreground font-heading uppercase tracking-wider mb-1 block">Preference 2</label>
        <select value={pref2} onChange={(e) => onUpdate("pref2", e.target.value)} className={selectClass} required>
          <option value="">Select Committee</option>
          {getAvailableCommittees([pref1]).map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>
      <div>
        <label className="text-xs text-muted-foreground font-heading uppercase tracking-wider mb-1 block">Preference 3</label>
        <select value={pref3} onChange={(e) => onUpdate("pref3", e.target.value)} className={selectClass} required>
          <option value="">Select Committee</option>
          {getAvailableCommittees([pref1, pref2]).map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>
    </>
  );

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3 }}
            className="glass-card w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 md:p-8 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-card border border-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
            >
              <X size={16} />
            </button>

            <h2 className="font-display text-2xl md:text-3xl font-bold gradient-text mb-1">Register Now</h2>
            <p className="text-sm text-muted-foreground font-body mb-4">Choose your delegation type to get started.</p>

            {/* Category Toggle */}
            <div className="flex gap-2 mb-5">
              <button
                type="button"
                onClick={() => { setMode("individual"); setUpgradeIdError(null); }}
                className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-3 rounded-xl text-xs sm:text-sm font-semibold transition-all border ${
                  mode === "individual"
                    ? "bg-primary text-primary-foreground border-primary shadow-lg"
                    : "bg-card border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                <User size={14} /> Individual
              </button>
              <button
                type="button"
                onClick={() => { setMode("school"); setUpgradeIdError(null); }}
                className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-3 rounded-xl text-xs sm:text-sm font-semibold transition-all border ${
                  mode === "school"
                    ? "bg-primary text-primary-foreground border-primary shadow-lg"
                    : "bg-card border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                <Users size={14} /> School
              </button>
            </div>

            {/* Category picker (only for register flows) */}
            {mode !== "upgrade" && (
              <div className="mb-5">
                <label className="text-xs text-muted-foreground font-heading uppercase tracking-wider mb-2 block">
                  Choose Package
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {CATEGORIES.map((c) => {
                    const active = category === c;
                    return (
                      <button
                        type="button"
                        key={c}
                        onClick={() => setCategory(c)}
                        className={`text-left px-3 py-2.5 rounded-xl border transition-all ${
                          active
                            ? "border-primary bg-primary/10 ring-2 ring-primary/30"
                            : "border-border bg-card hover:border-primary/40"
                        }`}
                      >
                        <div className="text-xs font-semibold text-foreground">{CATEGORY_SHORT[c]}</div>
                        <div className="text-[11px] text-muted-foreground">₹{CATEGORY_PRICE[c] / 100} / delegate</div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ─── INDIVIDUAL FORM ─── */}
            {mode === "individual" && (
              <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); handlePayNow(); }}>
                <input type="text" placeholder="Name" value={form.name} onChange={(e) => update("name", e.target.value)} className={inputClass} required />
                <input type="tel" placeholder="Mobile Number" value={form.mobile} onChange={(e) => { const v = e.target.value.replace(/\D/g, "").slice(0, 10); update("mobile", v); }} className={inputClass} required maxLength={10} pattern="\d{10}" />
                {form.mobile && !isMobileValid(form.mobile) && <p className="text-xs text-red-400 -mt-1">Enter exactly 10 digits</p>}
                <input type="email" placeholder="Email" value={form.email} onChange={(e) => update("email", e.target.value)} className={inputClass} required />
                <input type="text" placeholder="School" value={form.school} onChange={(e) => update("school", e.target.value)} className={inputClass} required />
                <input type="text" placeholder="Class" value={form.class} onChange={(e) => update("class", e.target.value)} className={inputClass} required />
                {renderCommitteeSelects(form.pref1, form.pref2, form.pref3, (f, v) => update(f, v))}
                <div>
                  <label className="text-xs text-muted-foreground font-heading uppercase tracking-wider mb-1 block">Experience</label>
                  <textarea placeholder="Briefly describe your MUN experience (if any)" value={form.experience} onChange={(e) => update("experience", e.target.value)} rows={3} className={`${inputClass} resize-none`} />
                </div>
                <button type="submit" disabled={loading} className="w-full font-heading text-sm px-6 py-3.5 rounded-full bg-gradient-to-r from-primary to-secondary text-primary-foreground font-semibold hover:shadow-[0_0_40px_hsl(190_80%_55%/0.3)] transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-60 mt-4">
                  <Send size={16} /> {loading ? "Processing..." : `Pay ₹${individualAmount / 100}`}
                </button>
              </form>
            )}

            {/* ─── SCHOOL DELEGATION FORM ─── */}
            {mode === "school" && (
              <div className="space-y-4">
                {/* School name pinned at top */}
                <input type="text" placeholder="School Name (shared for all delegates)" value={schoolName} onChange={(e) => setSchoolName(e.target.value)} className={inputClass} required />

                {/* Progress */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs text-muted-foreground font-heading">
                    <span>{completedDelegates}/{delegates.length} delegates completed</span>
                    <span>{delegates.length} × ₹{perDelegatePrice / 100} = ₹{schoolAmount / 100}</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-card border border-border overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-300 rounded-full"
                      style={{ width: `${(completedDelegates / delegates.length) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Delegate Accordion */}
                <div className="space-y-2 max-h-[45vh] overflow-y-auto pr-1">
                  {delegates.map((d, i) => {
                    const valid = isDelegateValid(d);
                    const isExpanded = expandedDelegate === i;
                    return (
                      <div key={i} className={`rounded-xl border transition-all ${valid ? "border-primary/40 bg-primary/5" : "border-border bg-card/50"}`}>
                        {/* Header */}
                        <button
                          type="button"
                          onClick={() => setExpandedDelegate(isExpanded ? -1 : i)}
                          className="w-full flex items-center justify-between px-4 py-3 text-sm"
                        >
                          <div className="flex items-center gap-2">
                            <span className={`w-6 h-6 rounded-full text-xs flex items-center justify-center font-bold ${valid ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                              {valid ? "✓" : i + 1}
                            </span>
                            <span className="font-semibold text-foreground">
                              {d.name.trim() || `Delegate ${i + 1}`}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            {i >= 10 && (
                              <span
                                onClick={(e) => { e.stopPropagation(); removeDelegate(i); }}
                                className="text-destructive hover:text-destructive/80 cursor-pointer"
                              >
                                <Trash2 size={14} />
                              </span>
                            )}
                            {isExpanded ? <ChevronUp size={16} className="text-muted-foreground" /> : <ChevronDown size={16} className="text-muted-foreground" />}
                          </div>
                        </button>

                        {/* Expanded fields */}
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden"
                            >
                              <div className="px-4 pb-4 space-y-2">
                                <input type="text" placeholder="Name" value={d.name} onChange={(e) => updateDelegate(i, "name", e.target.value)} className={inputClass} />
                                <div className="grid grid-cols-2 gap-2">
                                  <input type="tel" placeholder="Mobile" value={d.mobile} onChange={(e) => { const v = e.target.value.replace(/\D/g, "").slice(0, 10); updateDelegate(i, "mobile", v); }} className={inputClass} maxLength={10} />
                                  <input type="email" placeholder="Email" value={d.email} onChange={(e) => updateDelegate(i, "email", e.target.value)} className={inputClass} />
                                </div>
                                <input type="text" placeholder="Class" value={d.class} onChange={(e) => updateDelegate(i, "class", e.target.value)} className={inputClass} />
                                {renderCommitteeSelects(d.pref1, d.pref2, d.pref3, (f, v) => updateDelegate(i, f as keyof DelegateForm, v))}
                                <textarea placeholder="MUN experience (optional)" value={d.experience} onChange={(e) => updateDelegate(i, "experience", e.target.value)} rows={2} className={`${inputClass} resize-none`} />
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>

                {/* Add delegate button */}
                {delegates.length < 20 && (
                  <button type="button" onClick={addDelegate} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-border text-sm text-muted-foreground hover:text-foreground hover:border-primary/40 transition-all">
                    <Plus size={14} /> Add Delegate ({delegates.length}/20)
                  </button>
                )}

                {/* Submit */}
                <button
                  type="button"
                  onClick={handlePayNow}
                  disabled={loading || !isSchoolValid}
                  className="w-full font-heading text-sm px-6 py-3.5 rounded-full bg-gradient-to-r from-primary to-secondary text-primary-foreground font-semibold hover:shadow-[0_0_40px_hsl(190_80%_55%/0.3)] transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-60 mt-2"
                >
                  <Send size={16} /> {loading ? "Processing..." : `Pay ₹${schoolAmount / 100} (${delegates.length} delegates)`}
                </button>
              </div>
            )}

            {/* ─── UPGRADE FLOW ─── */}
            {mode === "upgrade" && (
              <div className="space-y-4">
                {upgradeStep === "lookup" && (
                  <>
                    <p className="text-sm text-muted-foreground">
                      Enter the <strong className="text-foreground">Payment ID</strong> we sent to you in your registration confirmation email.
                    </p>
                    <input
                      type="text"
                      placeholder="pay_XXXXXXXXXXXXXX"
                      value={upgradePaymentIdInput}
                      onChange={(e) => {
                        const v = e.target.value;
                        setUpgradePaymentIdInput(v);
                        if (upgradeIdError && PAYMENT_ID_REGEX.test(normalizePaymentId(v))) {
                          setUpgradeIdError(null);
                        }
                      }}
                      onBlur={() => {
                        const v = normalizePaymentId(upgradePaymentIdInput);
                        if (!v) {
                          setUpgradeIdError(null);
                          return;
                        }
                        const parsed = paymentIdSchema.safeParse(v);
                        setUpgradeIdError(parsed.success ? null : (parsed.error.issues[0]?.message ?? "Invalid Payment ID"));
                      }}
                      aria-invalid={!!upgradeIdError}
                      aria-describedby="upgrade-payment-id-hint"
                      className={inputClass}
                    />
                    {upgradeIdError ? (
                      <p id="upgrade-payment-id-hint" className="text-xs text-destructive">{upgradeIdError}</p>
                    ) : (
                      <p id="upgrade-payment-id-hint" className="text-xs text-muted-foreground">
                        Format: <code>pay_</code> followed by 14 letters or numbers.
                      </p>
                    )}
                    <button
                      type="button"
                      onClick={handleUpgradeLookup}
                      disabled={loading || !PAYMENT_ID_REGEX.test(normalizePaymentId(upgradePaymentIdInput))}
                      className="w-full font-heading text-sm px-6 py-3.5 rounded-full bg-gradient-to-r from-primary to-secondary text-primary-foreground font-semibold flex items-center justify-center gap-2 disabled:opacity-60"
                    >
                      <Search size={16} /> {loading ? "Looking up..." : "Find My Registration"}
                    </button>
                  </>
                )}

                {upgradeStep === "confirm" && (
                  <>
                    <p className="text-sm text-muted-foreground">
                      We found <strong className="text-foreground">{upgradeDelegates.length}</strong> {upgradeDelegates.length > 1 ? "delegates" : "delegate"} under this Payment ID. Please confirm this is you:
                    </p>
                    <div className="rounded-xl border border-border bg-card/50 p-3 space-y-2 max-h-48 overflow-y-auto">
                      {upgradeDelegates.map((d, i) => (
                        <div key={d.id} className="text-sm">
                          <div className="font-semibold text-foreground">{i + 1}. {d.name}</div>
                          <div className="text-xs text-muted-foreground">{d.email} · {d.school} · Class {d.class}</div>
                        </div>
                      ))}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Current package: <span className="font-semibold text-foreground">{CATEGORY_LABEL[upgradeCurrentCategory]}</span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={resetUpgrade}
                        className="flex-1 px-4 py-3 rounded-full bg-card border border-border text-sm font-semibold text-muted-foreground hover:text-foreground"
                      >
                        Not me
                      </button>
                      <button
                        type="button"
                        onClick={() => setUpgradeStep("choose")}
                        className="flex-1 px-4 py-3 rounded-full bg-gradient-to-r from-primary to-secondary text-primary-foreground text-sm font-semibold flex items-center justify-center gap-2"
                      >
                        <CheckCircle2 size={16} /> Yes, that's me
                      </button>
                    </div>
                  </>
                )}

                {upgradeStep === "blocked" && (
                  <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 space-y-3">
                    <p className="text-sm font-semibold text-destructive">This payment has been refunded. Upgrade is not allowed.</p>
                    {upgradeDelegates.length > 0 && (
                      <p className="text-xs text-muted-foreground">
                        Refund ID: <span className="font-mono text-foreground">{upgradeDelegates[0]?.refund_id || "—"}</span>
                      </p>
                    )}
                    <button
                      type="button"
                      onClick={resetUpgrade}
                      className="w-full px-4 py-3 rounded-full bg-card border border-border text-sm font-semibold text-muted-foreground hover:text-foreground"
                    >
                      Try another Payment ID
                    </button>
                  </div>
                )}

                {upgradeStep === "choose" && (
                  <>
                    {upgradeOptions.length === 0 ? (
                      <div className="text-sm text-center py-6">
                        <p className="text-foreground font-semibold">You're already on the highest package.</p>
                        <p className="text-muted-foreground mt-1">No further upgrade available.</p>
                      </div>
                    ) : (
                      <>
                        <p className="text-sm text-muted-foreground">
                          Choose your upgrade. You'll pay only the difference × {upgradeDelegates.length} delegate{upgradeDelegates.length > 1 ? "s" : ""}.
                        </p>
                        <div className="space-y-2">
                          {upgradeOptions.map((c) => {
                            const diff = CATEGORY_PRICE[c] - CATEGORY_PRICE[upgradeCurrentCategory];
                            const total = diff * upgradeDelegates.length;
                            const active = upgradeChoice === c;
                            return (
                              <button
                                type="button"
                                key={c}
                                onClick={() => setUpgradeChoice(c)}
                                className={`w-full text-left px-4 py-3 rounded-xl border transition-all ${
                                  active ? "border-primary bg-primary/10 ring-2 ring-primary/30" : "border-border bg-card hover:border-primary/40"
                                }`}
                              >
                                <div className="flex justify-between items-center">
                                  <div>
                                    <div className="text-sm font-semibold text-foreground">{CATEGORY_LABEL[c]}</div>
                                    <div className="text-xs text-muted-foreground">+ ₹{diff / 100} per delegate</div>
                                  </div>
                                  <div className="text-base font-bold text-primary">₹{total / 100}</div>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                        <button
                          type="button"
                          onClick={handleUpgradePay}
                          disabled={loading || !upgradeChoice}
                          className="w-full font-heading text-sm px-6 py-3.5 rounded-full bg-gradient-to-r from-primary to-secondary text-primary-foreground font-semibold flex items-center justify-center gap-2 disabled:opacity-60 mt-2"
                        >
                          <Send size={16} /> {loading ? "Processing..." : "Pay & Upgrade"}
                        </button>
                      </>
                    )}
                  </>
                )}

                {upgradeStep === "done" && (
                  <div className="text-center py-6 space-y-3">
                    <CheckCircle2 size={48} className="mx-auto text-primary" />
                    <p className="text-foreground font-semibold">Upgrade complete!</p>
                    <p className="text-sm text-muted-foreground">A confirmation email has been sent with your new payment ID.</p>
                    <button
                      type="button"
                      onClick={() => { resetUpgrade(); onClose(); }}
                      className="px-6 py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-semibold"
                    >
                      Done
                    </button>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default RegistrationModal;
