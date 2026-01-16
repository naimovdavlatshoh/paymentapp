import { useState, useEffect } from "react";
// @ts-ignore
import { GetDataSimple, PostDataTokenJson } from "@/service";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import CustomModal from "@/components/ui/custom-modal";

interface PaymentMethod {
    id: string;
    name: string;
}

interface Account {
    account_id: string;
    name: string;
    code: string;
}

interface TransferModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

const TransferModal = ({ isOpen, onClose, onSuccess }: TransferModalProps) => {
    const [loading, setLoading] = useState(false);
    const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [displayAmount, setDisplayAmount] = useState("");

    const [transferForm, setTransferForm] = useState({
        from_account_id: "",
        to_account_id: "",
        amount: "",
        payment_method_id: "",
        comment: "",
    });

    // Fetch Accounts
    const fetchAccounts = async () => {
        try {
            const response = await GetDataSimple(
                "api/finance/accounts?page=1&limit=100"
            );
            if (response && response.result) {
                setAccounts(response.result);
            }
        } catch (err) {
            console.error("Error fetching accounts:", err);
        }
    };

    // Fetch Payment Methods
    const fetchPaymentMethods = async () => {
        try {
            const response = await GetDataSimple("api/finance/payment-methods");
            if (response) {
                setPaymentMethods(response);
            }
        } catch (err) {
            console.error("Error fetching payment methods:", err);
        }
    };

    useEffect(() => {
        if (isOpen) {
            fetchAccounts();
            fetchPaymentMethods();
            // Reset display amount when modal opens
            setDisplayAmount("");
        }
    }, [isOpen]);

    const handleSubmit = async () => {
        // Validation
        if (!transferForm.from_account_id) {
            toast.error("Выберите счёт списания");
            return;
        }
        if (!transferForm.to_account_id) {
            toast.error("Выберите счёт зачисления");
            return;
        }
        if (transferForm.from_account_id === transferForm.to_account_id) {
            toast.error(
                "Счета списания и зачисления не могут быть одинаковыми"
            );
            return;
        }
        if (!transferForm.amount || parseFloat(transferForm.amount) <= 0) {
            toast.error("Введите корректную сумму");
            return;
        }
        if (!transferForm.payment_method_id) {
            toast.error("Выберите метод оплаты");
            return;
        }

        setLoading(true);

        try {
            const payload = {
                from_account_id: parseInt(transferForm.from_account_id),
                to_account_id: parseInt(transferForm.to_account_id),
                amount: parseFloat(transferForm.amount),
                payment_method_id: parseInt(transferForm.payment_method_id),
                comment: transferForm.comment || null,
            };

            const response = await PostDataTokenJson(
                "api/finance/transactions/transfer",
                payload
            );

            console.log("Transfer response:", response);

            if (response.data) {
                toast.success(
                    response.data.message || "Перевод успешно выполнен!"
                );

                // Reset form
                setTransferForm({
                    from_account_id: "",
                    to_account_id: "",
                    amount: "",
                    payment_method_id: "",
                    comment: "",
                });
                setDisplayAmount("");

                // Close modal
                onClose();

                // Call success callback
                if (onSuccess) {
                    onSuccess();
                }
            }
        } catch (err: any) {
            console.error("Transfer error:", err);
            toast.error(
                err.response?.data?.message || "Ошибка при переводе средств"
            );
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        // Reset form
        setTransferForm({
            from_account_id: "",
            to_account_id: "",
            amount: "",
            payment_method_id: "",
            comment: "",
        });
        setDisplayAmount("");
        onClose();
    };

    return (
        <CustomModal
            showTrigger={false}
            open={isOpen}
            onOpenChange={onClose}
            title="Перевод средств"
            confirmText={loading ? "Загрузка..." : "Перевести"}
            cancelText="Отмена"
            confirmBg="bg-black"
            confirmBgHover="bg-black/90"
            onConfirm={handleSubmit}
            onCancel={handleCancel}
            size="lg"
            showCloseButton={true}
        >
            <div className="space-y-4">
                {/* Info Banner */}
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
                    <p className="text-sm text-blue-800 dark:text-blue-300">
                        💸 Перевод средств между счетами
                    </p>
                </div>

                {/* From Account */}
                <div className="space-y-2">
                    <Label>
                        Счёт списания <span className="text-red-500">*</span>
                    </Label>
                    <Select
                        value={transferForm.from_account_id || "placeholder"}
                        onValueChange={(value) =>
                            setTransferForm({
                                ...transferForm,
                                from_account_id:
                                    value === "placeholder" ? "" : value,
                            })
                        }
                        disabled={loading}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Выберите счёт" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="placeholder" disabled>
                                Выберите счёт
                            </SelectItem>
                            {accounts.map((account) => (
                                <SelectItem
                                    key={account.account_id}
                                    value={account.account_id}
                                >
                                    {account.name} ({account.code})
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* To Account */}
                <div className="space-y-2">
                    <Label>
                        Счёт зачисления <span className="text-red-500">*</span>
                    </Label>
                    <Select
                        value={transferForm.to_account_id || "placeholder"}
                        onValueChange={(value) =>
                            setTransferForm({
                                ...transferForm,
                                to_account_id:
                                    value === "placeholder" ? "" : value,
                            })
                        }
                        disabled={loading}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Выберите счёт" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="placeholder" disabled>
                                Выберите счёт
                            </SelectItem>
                            {accounts.map((account) => (
                                <SelectItem
                                    key={account.account_id}
                                    value={account.account_id}
                                >
                                    {account.name} ({account.code})
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Amount */}
                <div className="space-y-2">
                    <Label htmlFor="amount">
                        Сумма <span className="text-red-500">*</span>
                    </Label>
                    <Input
                        id="amount"
                        type="text"
                        placeholder="0"
                        value={displayAmount}
                        onChange={(e) => {
                            // Barcha formatni olib tashlash
                            let rawValue = e.target.value
                                .replace(/\s/g, "") // bo'shliqlarni olib tashlash
                                .replace(/,/g, "."); // vergulni nuqtaga almashtirish

                            // Faqat raqamlar va nuqtani qabul qilish
                            rawValue = rawValue.replace(/[^\d.]/g, "");

                            // Faqat bitta nuqta bo'lishi mumkin
                            const parts = rawValue.split(".");
                            if (parts.length > 2) {
                                rawValue =
                                    parts[0] + "." + parts.slice(1).join("");
                            }

                            // O'nlik qismni 2 ta raqamga cheklash
                            if (parts.length === 2 && parts[1].length > 2) {
                                rawValue =
                                    parts[0] + "." + parts[1].slice(0, 2);
                            }

                            // Raw qiymatni saqlash (backend uchun)
                            setTransferForm({
                                ...transferForm,
                                amount: rawValue,
                            });

                            // Real-time formatlash
                            if (rawValue) {
                                const valueParts = rawValue.split(".");
                                // Integer qismni formatlash (3 raqamdan keyin bo'shliq)
                                const integerPart = valueParts[0].replace(
                                    /\B(?=(\d{3})+(?!\d))/g,
                                    " "
                                );

                                // Display qiymati: integer + o'nlik qism
                                let formatted = integerPart;
                                if (valueParts.length === 2) {
                                    formatted += "," + valueParts[1];
                                }

                                setDisplayAmount(formatted);
                            } else {
                                setDisplayAmount("");
                            }
                        }}
                        disabled={loading}
                    />
                </div>

                {/* Payment Method */}
                <div className="space-y-2">
                    <Label>
                        Метод оплаты <span className="text-red-500">*</span>
                    </Label>
                    <Select
                        value={transferForm.payment_method_id || "placeholder"}
                        onValueChange={(value) =>
                            setTransferForm({
                                ...transferForm,
                                payment_method_id:
                                    value === "placeholder" ? "" : value,
                            })
                        }
                        disabled={loading}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Выберите метод оплаты" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="placeholder" disabled>
                                Выберите метод
                            </SelectItem>
                            {paymentMethods.map((method) => (
                                <SelectItem key={method.id} value={method.id}>
                                    {method.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Comment */}
                <div className="space-y-2">
                    <Label htmlFor="comment">Комментарий</Label>
                    <Input
                        id="comment"
                        type="text"
                        placeholder="Введите комментарий"
                        value={transferForm.comment}
                        onChange={(e) =>
                            setTransferForm({
                                ...transferForm,
                                comment: e.target.value,
                            })
                        }
                        disabled={loading}
                    />
                </div>
            </div>
        </CustomModal>
    );
};

export default TransferModal;
