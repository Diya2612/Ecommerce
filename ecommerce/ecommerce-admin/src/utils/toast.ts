import { toast, type ExternalToast } from "sonner";

export const notifySuccess = (msg: string, options?: ExternalToast) =>
    toast.success(msg, { duration: 3000, ...options });

export const notifyError = (msg: string, options?: ExternalToast) =>
    toast.error(msg, { duration: 3000, ...options });

export const notifyInfo = (msg: string, options?: ExternalToast) =>
    toast(msg, { duration: 3000, ...options });

export const notifyWarning = (msg: string, options?: ExternalToast) =>
    toast.warning(msg, { duration: 4000, ...options });
