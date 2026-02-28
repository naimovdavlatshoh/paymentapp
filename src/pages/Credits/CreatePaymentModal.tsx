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
import CustomModal from "@/components/ui/custom-modal";
import { toast } from "sonner";
import { showErrorToast } from "@/utils/toast-utils";

interface Credit {
    id: number;
    credit_name: string;
    bank_name: string;
}

interface PaymentMethod {
    id: string | number;
    name: string;
}

interface CreatePaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    initialCreditId?: number | null;
}

const CreatePaymentModal = ({
    isOpen,
    onClose,
    onSuccess,
    initialCreditId,
}: CreatePaymentModalProps) => {
    const [credits, setCredits] = useState<Credit[]>([]);
    const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
    const [submitting, setSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        credit_id: "",
        payment_amount: "",
        payment_method: "",
        comments: "",
    });

    useEffect(() => {
        if (isOpen) {
            fetchInitialData();
            if (initialCreditId) {
                setFormData((prev) => ({ ...prev, credit_id: initialCreditId.toString() }));
            } else {
                setFormData({
                    credit_id: "",
                    payment_amount: "",
                    payment_method: "",
                    comments: "",
                });
            }
        }
    }, [isOpen, initialCreditId]);

    const fetchInitialData = async () => {
        try {
            const [creditsRes, methodsRes] = await Promise.all([
                GetDataSimple("api/finance/credits?page=1&limit=100"),
                GetDataSimple("api/finance/payment-methods"),
            ]);

            if (creditsRes?.result) {
                setCredits(creditsRes.result);
            }
            if (methodsRes) {
                setPaymentMethods(methodsRes);
            }
        } catch (err) {
            console.error("Error fetching initial data:", err);
            showErrorToast(err, "Ошибка при загрузке данных");
        }
    };

    const handleSubmit = async () => {
        if (!formData.credit_id || !formData.payment_amount || !formData.payment_method) {
            toast.error("Пожалуйста, заполните все обязательные поля");
            return;
        }

        setSubmitting(true);
        try {
            const payload = {
                credit_id: parseInt(formData.credit_id),
                payment_amount: parseFloat(formData.payment_amount.replace(/\s/g, "")),
                payment_method: formData.payment_method,
                comments: formData.comments,
            };

            const response = await PostDataTokenJson("api/finance/credits/payments", payload);
            if (response) {
                toast.success("Оплата успешно добавлена");
                onSuccess();
                onClose();
            }
        } catch (err: any) {
            console.error("Error creating payment:", err);
            showErrorToast(err, "Ошибка при добавлении оплаты");
        } finally {
            setSubmitting(false);
        }
    };

    const formatNumber = (value: string) => {
        const number = value.replace(/\D/g, "");
        return number.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
    };

    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const formatted = formatNumber(e.target.value);
        setFormData({ ...formData, payment_amount: formatted });
    };

    return (
        <CustomModal
            showTrigger={false}
            open={isOpen}
            onOpenChange={onClose}
            title="Добавить оплату"
            confirmText={submitting ? "Сохранение..." : "Добавить"}
            onConfirm={handleSubmit}
            onCancel={onClose}
            size="md"
        >
            <div className="space-y-4 py-2">
                <div className="space-y-2">
                    <Label>Кредит</Label>
                    <Select
                        value={formData.credit_id}
                        onValueChange={(val) => setFormData({ ...formData, credit_id: val })}
                        disabled={!!initialCreditId}
                    >
                        <SelectTrigger className="rounded-xl h-12">
                            <SelectValue placeholder="Выберите кредит" />
                        </SelectTrigger>
                        <SelectContent>
                            {credits.map((credit) => (
                                <SelectItem key={credit.id} value={credit.id.toString()}>
                                    {credit.credit_name} ({credit.bank_name})
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label>Сумма оплаты</Label>
                    <Input
                        placeholder="0"
                        value={formData.payment_amount}
                        onChange={handleAmountChange}
                        className="rounded-xl h-12"
                    />
                </div>

                <div className="space-y-2">
                    <Label>Метод оплаты</Label>
                    <Select
                        value={formData.payment_method}
                        onValueChange={(val) => setFormData({ ...formData, payment_method: val })}
                    >
                        <SelectTrigger className="rounded-xl h-12">
                            <SelectValue placeholder="Выберите метод" />
                        </SelectTrigger>
                        <SelectContent>
                            {paymentMethods.map((method) => (
                                <SelectItem key={method.id} value={method.id.toString()}>
                                    {method.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label>Комментарий</Label>
                    <Input
                        placeholder="Введите комментарий"
                        value={formData.comments}
                        onChange={(e) => setFormData({ ...formData, comments: e.target.value })}
                        className="rounded-xl h-12"
                    />
                </div>
            </div>
        </CustomModal>
    );
};

export default CreatePaymentModal;
