import { useState } from "react";
import { X, Send } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

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

const RegistrationModal = ({ open, onClose }: RegistrationModalProps) => {
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
  const [loading, setLoading] = useState(false);

  const update = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [value === prev.pref1 ? "" : field]: value, ...(field === "pref1" && value === form.pref2 ? { pref2: "" } : {}), ...(field === "pref1" && value === form.pref3 ? { pref3: "" } : {}), ...(field === "pref2" && value === form.pref3 ? { pref3: "" } : {}), [field]: value }));

  const getAvailableCommittees = (exclude: string[]) =>
    committees.filter((c) => !exclude.includes(c));

  const isValid =
    form.name.trim() &&
    form.mobile.trim() &&
    form.email.trim() &&
    form.school.trim() &&
    form.class.trim() &&
    form.pref1 &&
    form.pref2 &&
    form.pref3;

  const handlePayNow = () => {
    if (!isValid) {
      toast.error("Please fill all fields before proceeding.");
      return;
    }

    if (!RAZORPAY_KEY) {
      toast.error("Payment gateway is not configured yet.");
      return;
    }

    setLoading(true);

    const options = {
      key: RAZORPAY_KEY,
      amount: 1000, // ₹10 in paise
      currency: "INR",
      name: "Ashe MUN 2026",
      description: "Conference Registration Fee",
      prefill: {
        name: form.name,
        email: form.email,
        contact: form.mobile,
      },
      notes: {
        school: form.school,
        class: form.class,
        pref1: form.pref1,
        pref2: form.pref2,
        pref3: form.pref3,
        experience: form.experience,
      },
      theme: {
        color: "#0ea5e9",
      },
      handler: function (response: any) {
        toast.success("Payment successful! Your registration is confirmed.", {
          description: `Payment ID: ${response.razorpay_payment_id}`,
        });
        setLoading(false);
        onClose();
      },
      modal: {
        ondismiss: function () {
          setLoading(false);
        },
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.on("payment.failed", function (response: any) {
      toast.error("Payment failed. Please try again.", {
        description: response.error.description,
      });
      setLoading(false);
    });
    rzp.open();
  };

  const inputClass =
    "w-full px-4 py-3 rounded-xl bg-card border border-border text-foreground placeholder:text-muted-foreground text-sm font-body focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all";
  const selectClass =
    "w-full px-4 py-3 rounded-xl bg-card border border-border text-foreground text-sm font-body focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all appearance-none cursor-pointer";

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

            <h2 className="font-display text-2xl md:text-3xl font-bold gradient-text mb-1">
              Register Now
            </h2>
            <p className="text-sm text-muted-foreground font-body mb-6">
              Fill in your details and select committee preferences.
            </p>

            <form
              className="space-y-3"
              onSubmit={(e) => {
                e.preventDefault();
                handlePayNow();
              }}
            >
              <input
                type="text"
                placeholder="Name"
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                className={inputClass}
                required
              />
              <input
                type="tel"
                placeholder="Mobile Number"
                value={form.mobile}
                onChange={(e) => update("mobile", e.target.value)}
                className={inputClass}
                required
              />
              <input
                type="email"
                placeholder="Email"
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                className={inputClass}
                required
              />
              <input
                type="text"
                placeholder="School"
                value={form.school}
                onChange={(e) => update("school", e.target.value)}
                className={inputClass}
                required
              />
              <input
                type="text"
                placeholder="Class"
                value={form.class}
                onChange={(e) => update("class", e.target.value)}
                className={inputClass}
                required
              />

              {/* Committee Preferences */}
              <div>
                <label className="text-xs text-muted-foreground font-heading uppercase tracking-wider mb-1 block">
                  Preference 1
                </label>
                <select
                  value={form.pref1}
                  onChange={(e) => update("pref1", e.target.value)}
                  className={selectClass}
                  required
                >
                  <option value="">Select Committee</option>
                  {committees.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs text-muted-foreground font-heading uppercase tracking-wider mb-1 block">
                  Preference 2
                </label>
                <select
                  value={form.pref2}
                  onChange={(e) => update("pref2", e.target.value)}
                  className={selectClass}
                  required
                >
                  <option value="">Select Committee</option>
                  {getAvailableCommittees([form.pref1]).map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs text-muted-foreground font-heading uppercase tracking-wider mb-1 block">
                  Preference 3
                </label>
                <select
                  value={form.pref3}
                  onChange={(e) => update("pref3", e.target.value)}
                  className={selectClass}
                  required
                >
                  <option value="">Select Committee</option>
                  {getAvailableCommittees([form.pref1, form.pref2]).map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs text-muted-foreground font-heading uppercase tracking-wider mb-1 block">
                  Experience
                </label>
                <textarea
                  placeholder="Briefly describe your MUN experience (if any)"
                  value={form.experience}
                  onChange={(e) => update("experience", e.target.value)}
                  rows={3}
                  className={`${inputClass} resize-none`}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full font-heading text-sm px-6 py-3.5 rounded-full bg-gradient-to-r from-primary to-secondary text-primary-foreground font-semibold hover:shadow-[0_0_40px_hsl(190_80%_55%/0.3)] transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-60 mt-4"
              >
                <Send size={16} /> {loading ? "Processing..." : "Pay Now"}
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default RegistrationModal;
