import { useState } from "react";
import { X, Send, Plus, Trash2, ChevronDown, ChevronUp, Users, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const committees = [
  "UNSC - United Nations Security Council",
  "UNGA - United Nations General Assembly",
  "WHO - World Health Organization",
  "DISEC - Disarmament & International Security",
  "ICJ - International Court of Justice",
  "UNHRC - UN Human Rights Council",
  "AIPPM - All India Political Parties Meet",
  "CC - Crisis Committee",
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
  const [mode, setMode] = useState<"individual" | "school">("individual");

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
    const amount = mode === "individual" ? 400 : delegates.length * 400;

    // Create a Razorpay order on the server (auto-capture enabled).
    let orderId: string;
    let orderKey: string;
    try {
      const { data, error } = await supabase.functions.invoke("create-razorpay-order", {
        body: {
          amount,
          currency: "INR",
          receipt: `mun_${Date.now()}`,
          notes: { mode, delegates: String(mode === "school" ? delegates.length : 1) },
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
          if (mode === "individual") {
            const { error } = await supabase.from("registrations").insert({
              name: form.name,
              mobile: form.mobile,
              email: form.email,
              school: form.school,
              class: form.class,
              preference_1: form.pref1,
              preference_2: form.pref2,
              preference_3: form.pref3,
              experience: form.experience || null,
              razorpay_payment_id: response.razorpay_payment_id,
              amount_paid: amount,
              paid_at: new Date().toISOString(),
              delegation_type: "individual",
            });
            if (error) throw error;
          } else {
            const groupId = crypto.randomUUID();
            const perDelegate = Math.floor(amount / delegates.length);
            const rows = delegates.map((d) => ({
              name: d.name,
              mobile: d.mobile,
              email: d.email,
              school: schoolName,
              class: d.class,
              preference_1: d.pref1,
              preference_2: d.pref2,
              preference_3: d.pref3,
              experience: d.experience || null,
              razorpay_payment_id: response.razorpay_payment_id,
              amount_paid: perDelegate,
              paid_at: new Date().toISOString(),
              delegation_type: "school",
              delegation_group_id: groupId,
            }));
            const { error } = await supabase.from("registrations").insert(rows);
            if (error) throw error;
          }
          toast.success("Payment successful! Registration confirmed.", {
            description: `Payment ID: ${response.razorpay_payment_id}`,
          });
        } catch (err) {
          console.error("Failed to save registration:", err);
          toast.success("Payment successful! Registration saved.", {
            description: `Payment ID: ${response.razorpay_payment_id}`,
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
            <div className="flex gap-2 mb-6">
              <button
                type="button"
                onClick={() => setMode("individual")}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold transition-all border ${
                  mode === "individual"
                    ? "bg-primary text-primary-foreground border-primary shadow-lg"
                    : "bg-card border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                <User size={16} /> Individual
              </button>
              <button
                type="button"
                onClick={() => setMode("school")}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold transition-all border ${
                  mode === "school"
                    ? "bg-primary text-primary-foreground border-primary shadow-lg"
                    : "bg-card border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                <Users size={16} /> School Delegation
              </button>
            </div>

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
                  <Send size={16} /> {loading ? "Processing..." : "Pay ₹4"}
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
                    <span>{delegates.length} × ₹4 = ₹{delegates.length * 4}</span>
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
                  <Send size={16} /> {loading ? "Processing..." : `Pay ₹${delegates.length * 4} (${delegates.length} delegates)`}
                </button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default RegistrationModal;
