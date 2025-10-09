export const SWIFT_REGEX = /^[A-Z]{4}[A-Z]{2}[A-Z0-9]{2}([A-Z0-9]{3})?$/;
export const CURRENCY_REGEX = /^(USD|ZAR|EUR|GBP|TRY|AED|CAD|AUD|JPY|CHF|CNY)$/;
export const ACCOUNT_REGEX  = /^[0-9]{6,12}$/;
export const NAME_REGEX     = /^[A-Za-z][A-Za-z\s'\-]{1,49}$/;
export const AMOUNT_REGEX   = /^(?:0|[1-9]\d{0,8})(?:\.\d{2})$/;
export const REF_REGEX      = /^[A-Za-z0-9 \-._]{0,35}$/;
