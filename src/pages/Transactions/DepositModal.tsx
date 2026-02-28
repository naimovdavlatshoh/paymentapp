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
import { showErrorToast } from "@/utils/toast-utils";
import CustomModal from "@/components/ui/custom-modal";

interface PaymentMethod {
    id: string;
    name: string;
}

interface DepositModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

const DepositModal = ({ isOpen, onClose, onSuccess }: DepositModalProps) => {
    const [loading, setLoading] = useState(false);
    const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
    const [displayAmount, setDisplayAmount] = useState("");

    const [depositForm, setDepositForm] = useState({
        to_account_id: "2", // Faqat Bobo Bank (ID=2)
        amount: "",
        payment_method_id: "",
        comment: "",
    });

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
            fetchPaymentMethods();
            // Reset display amount when modal opens
            setDisplayAmount("");
        }
    }, [isOpen]);

    const handleSubmit = async () => {
        // Validation
        if (!depositForm.amount || parseFloat(depositForm.amount) <= 0) {
            toast.error("Введите корректную сумму");
            return;
        }
        if (!depositForm.payment_method_id) {
            toast.error("Выберите метод оплаты");
            return;
        }

        setLoading(true);

        try {
            const payload = {
                to_account_id: parseInt(depositForm.to_account_id),
                amount: parseFloat(depositForm.amount),
                payment_method_id: parseInt(depositForm.payment_method_id),
                comment: depositForm.comment || null,
            };

            const response = await PostDataTokenJson(
                "api/finance/transactions/deposit",
                payload
            );

            console.log("Deposit response:", response);

            if (response.data) {
                toast.success(
                    response.data.message || "Счёт успешно пополнен!"
                );

                // Reset form
                setDepositForm({
                    to_account_id: "2",
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
            console.error("Deposit error:", err);
            showErrorToast(err, "Ошибка при пополнении счёта");
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        // Reset form
        setDepositForm({
            to_account_id: "2",
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
            title="Пополнение счёта"
            confirmText={loading ? "Загрузка..." : "Пополнить"}
            cancelText="Отмена"
            confirmBg="bg-maintx"
            confirmBgHover="bg-maintx/80"
            onConfirm={handleSubmit}
            onCancel={handleCancel}
            size="lg"
            showCloseButton={true}
        >
            <div className="space-y-4">
                {/* Account Info */}
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
                    <p className="text-sm text-blue-800 dark:text-blue-300">
                        📌 Пополнение доступно только для счёта{" "}
                        <span className="font-semibold">
                            Бобо Банк (BOBO_BANK)
                        </span>
                    </p>
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
                            setDepositForm({
                                ...depositForm,
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
                        value={depositForm.payment_method_id || "placeholder"}
                        onValueChange={(value) =>
                            setDepositForm({
                                ...depositForm,
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
                        value={depositForm.comment}
                        onChange={(e) =>
                            setDepositForm({
                                ...depositForm,
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

export default DepositModal;
