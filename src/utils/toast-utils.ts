import { toast } from "sonner";

/**
 * Common error handler for API requests.
 * Displays the error message from the backend if available, 
 * otherwise uses a provided or default fallback message.
 */
export const showErrorToast = (err: any, fallbackMessage: string = "Произошла ошибка") => {
    const backendMessage = err?.response?.data?.message || err?.response?.data?.error;
    const message = backendMessage || fallbackMessage;
    
    toast.error(message);
    return message;
};
