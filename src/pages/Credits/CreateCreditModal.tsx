import { useState } from "react";
// @ts-ignore
import { PostDataTokenJson } from "@/service";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import CustomModal from "@/components/ui/custom-modal";
import { Button } from "@/components/ui/button";
import { IoMdAdd, IoMdRemove } from "react-icons/io";

interface CreateCreditModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

interface PlanItem {
    credit_payment_amount: string;
    credit_payment_day: string;
}

const CreateCreditModal = ({ isOpen, onClose, onSuccess }: CreateCreditModalProps) => {
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        credit_name: "",
        bank_name: "",
        date_of_receipt: "",
        interest_rate: "",
        credit_period: "",
        credit_price: "",
        total_credit_price: "",
    });

    const [plan, setPlan] = useState<PlanItem[]>([
        { credit_payment_amount: "", credit_payment_day: "" }
    ]);

    const handleAddPlanItem = () => {
        setPlan([...plan, { credit_payment_amount: "", credit_payment_day: "" }]);
    };

    const handleRemovePlanItem = (index: number) => {
        setPlan(plan.filter((_, i) => i !== index));
    };

    const handlePlanChange = (index: number, field: keyof PlanItem, value: string) => {
        const newPlan = [...plan];
        newPlan[index][field] = value;
        setPlan(newPlan);
    };

    const handleSubmit = async () => {
        if (!form.credit_name || !form.bank_name || !form.date_of_receipt || !form.credit_price) {
            toast.error("Пожалуйста, заполните основные поля");
            return;
        }

        setLoading(true);
        try {
            const payload = {
                ...form,
                interest_rate: parseFloat(form.interest_rate) || 0,
                credit_period: parseInt(form.credit_period) || 0,
                credit_price: parseFloat(form.credit_price) || 0,
                total_credit_price: parseFloat(form.total_credit_price) || 0,
                plan: plan.map(item => ({
                    credit_payment_amount: parseFloat(item.credit_payment_amount) || 0,
                    credit_payment_day: item.credit_payment_day
                })).filter(item => item.credit_payment_amount > 0 && item.credit_payment_day)
            };

            const response = await PostDataTokenJson("api/finance/credits", payload);
            if (response.data) {
                toast.success("Кредит успешно создан!");
                
                // Reset form
                setForm({
                    credit_name: "",
                    bank_name: "",
                    date_of_receipt: "",
                    interest_rate: "",
                    credit_period: "",
                    credit_price: "",
                    total_credit_price: "",
                });
                setPlan([{ credit_payment_amount: "", credit_payment_day: "" }]);
                
                onClose();
                if (onSuccess) onSuccess();
            }
        } catch (err: any) {
            console.error("Create credit error:", err);
            toast.error(err.response?.data?.message || "Ошибка при создании кредита");
        } finally {
            setLoading(false);
        }
    };

    return (
        <CustomModal
            showTrigger={false}
            open={isOpen}
            onOpenChange={onClose}
            title="Добавить новый кредит"
            confirmText={loading ? "Загрузка..." : "Создать"}
            cancelText="Отмена"
            confirmBg="bg-maintx"
            confirmBgHover="bg-maintx/80"
            onConfirm={handleSubmit}
            onCancel={onClose}
            size="xl"
            showCloseButton={true}
        >
            <div className="space-y-6 max-h-[70vh] overflow-y-auto px-1">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Название кредита <span className="text-red-500">*</span></Label>
                        <Input 
                            value={form.credit_name} 
                            onChange={(e) => setForm({...form, credit_name: e.target.value})} 
                            placeholder="Напр: Автокредит"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Название банка <span className="text-red-500">*</span></Label>
                        <Input 
                            value={form.bank_name} 
                            onChange={(e) => setForm({...form, bank_name: e.target.value})} 
                            placeholder="Напр: Ипак Йули"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Дата получения <span className="text-red-500">*</span></Label>
                        <Input 
                            type="date" 
                            className="w-full h-10 px-3 py-2 border rounded-md"
                            value={form.date_of_receipt} 
                            onChange={(e) => setForm({...form, date_of_receipt: e.target.value})} 
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Процентная ставка (%)</Label>
                        <Input 
                            type="number" 
                            value={form.interest_rate} 
                            onChange={(e) => setForm({...form, interest_rate: e.target.value})} 
                            placeholder="25"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Срок кредита (в месяцах)</Label>
                        <Input 
                            type="number" 
                            value={form.credit_period} 
                            onChange={(e) => setForm({...form, credit_period: e.target.value})} 
                            placeholder="12"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Сумма кредита <span className="text-red-500">*</span></Label>
                        <Input 
                            type="number" 
                            value={form.credit_price} 
                            onChange={(e) => setForm({...form, credit_price: e.target.value})} 
                            placeholder="1 000 000"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Общая сумма к возврату</Label>
                        <Input 
                            type="number" 
                            value={form.total_credit_price} 
                            onChange={(e) => setForm({...form, total_credit_price: e.target.value})} 
                            placeholder="1 120 000"
                        />
                    </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold dark:text-white">График платежей</h3>
                        <Button type="button" variant="outline" size="sm" onClick={handleAddPlanItem} className="rounded-xl">
                            <IoMdAdd className="w-4 h-4 mr-1" />
                            Добавить платеж
                        </Button>
                    </div>
                    
                    {plan.map((item, index) => (
                        <div key={index} className="flex gap-4 items-end bg-gray-50 dark:bg-gray-900/50 p-3 rounded-xl relative group">
                            <div className="flex-1 space-y-1">
                                <Label className="text-xs text-gray-500">Сумма платежа</Label>
                                <Input 
                                    type="number" 
                                    value={item.credit_payment_amount} 
                                    onChange={(e) => handlePlanChange(index, "credit_payment_amount", e.target.value)} 
                                    placeholder="100 000"
                                />
                            </div>
                            <div className="flex-1 space-y-1">
                                <Label className="text-xs text-gray-500">Дата платежа</Label>
                                <Input 
                                    type="date" 
                                    className="w-full h-10 px-3 py-2 border rounded-md"
                                    value={item.credit_payment_day} 
                                    onChange={(e) => handlePlanChange(index, "credit_payment_day", e.target.value)} 
                                />
                            </div>
                            {plan.length > 1 && (
                                <Button 
                                    type="button" 
                                    variant="ghost" 
                                    size="icon" 
                                    className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                                    onClick={() => handleRemovePlanItem(index)}
                                >
                                    <IoMdRemove className="w-5 h-5" />
                                </Button>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </CustomModal>
    );
};

export default CreateCreditModal;
