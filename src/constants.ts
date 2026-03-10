export const STORAGE_KEY = "dj_pro_v3";

export const WHOP_PAID_URL = "https://whop.com/checkout/plan_2XmKrYfV9RrsB";
export const WHOP_TRIAL_URL = "https://whop.com/checkout/plan_bUdrxoiB0MPhW";

export const openWhopPaid = () => {
  window.open(WHOP_PAID_URL, "_blank");
};

export const openWhopTrial = () => {
  window.open(WHOP_TRIAL_URL, "_blank");
};
