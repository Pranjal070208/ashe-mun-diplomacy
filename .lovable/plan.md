## Goal
Tighten Payment ID validation in the upgrade flow and surface clearer, friendlier errors when the input is empty, malformed, or not found.

## Scope
Frontend only — `src/components/RegistrationModal.tsx` upgrade tab. No backend or schema changes. Server-side `lookup-registration` already returns `{ found: false }` for misses, which we'll keep using.

## Razorpay Payment ID format
Razorpay payment IDs are of the shape `pay_` followed by 14 alphanumeric chars (e.g. `pay_NABCdef1234567`). We'll validate with:

```
/^pay_[A-Za-z0-9]{14}$/
```

## Changes

### 1. Add a zod schema + inline error state
At the top of the upgrade section, define:
```ts
const paymentIdSchema = z
  .string()
  .trim()
  .min(1, "Payment ID is required")
  .regex(/^pay_[A-Za-z0-9]{14}$/, 'Payment ID must look like "pay_" followed by 14 letters/numbers');
```
Add `const [upgradeIdError, setUpgradeIdError] = useState<string | null>(null);`

### 2. Validate on input change and on submit
- onChange: clear error if value now passes, otherwise leave silent until blur/submit
- onBlur: run schema, set inline error message
- `handleUpgradeLookup`: run schema first; on failure show toast + inline error and abort (no network call)

### 3. Friendlier server-error messaging in `handleUpgradeLookup`
Replace generic toasts:
- Empty (shouldn't reach here after validation): `"Please enter your Payment ID."`
- `data.found === false`: `"We couldn't find a registration with that Payment ID. Double-check the ID from your confirmation email."` + keep user on the lookup step with inline error
- Network/edge error: `"We couldn't reach the server. Please check your connection and try again."`
- Unknown: `"Something went wrong while looking up your Payment ID. Please try again or contact support."`

Use `toast.error(title, { description })` so the message has a clear title + actionable detail.

### 4. UI affordances on the lookup step
- Show inline red helper text under the input when `upgradeIdError` is set
- Add aria-invalid + a small hint line: `Format: pay_ followed by 14 letters or numbers`
- Disable submit button when input fails the regex (not just empty)
- Trim+normalize value (strip surrounding whitespace and any accidental leading/trailing quotes) before validating

### 5. Reset error state when user switches tabs or restarts upgrade flow
Clear `upgradeIdError` and `upgradePaymentIdInput` when `mode` changes away from `upgrade` or when the upgrade flow completes/resets.

## Files touched
- `src/components/RegistrationModal.tsx` (only)

## Out of scope
- No changes to `lookup-registration`, `apply-upgrade`, DB, or email functions.
- No changes to the individual/school registration flow.
