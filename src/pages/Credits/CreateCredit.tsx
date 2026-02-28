import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
// @ts-ignore
import { PostDataTokenJson } from "@/service";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { showErrorToast } from "@/utils/toast-utils";
import { addMonths, format } from "date-fns";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";

interface PlanItem {
    credit_payment_amount: string;
    credit_payment_day: Date | undefined;
    suggested_amount?: string;
    suggested_day?: Date;
}

const CreateCredit = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        credit_name: "",
        bank_name: "",
        date_of_receipt: undefined as Date | undefined,
        interest_rate: "",
        credit_period: "",
        credit_price: "",
        total_credit_price: "",
    });

    const [plan, setPlan] = useState<PlanItem[]>([]);

    // Helper to format number with spaces
    const formatNumber = (val: string | number) => {
        if (!val && val !== 0) return "";
        const s = val.toString().replace(/\s/g, "").replace(/,/g, ".");
        const parts = s.split(".");
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, " ");
        return parts.join(",");
    };

    // Helper to parse formatted number back to raw string for state and calculation
    const parseNumber = (val: string) => {
        return val.replace(/\s/g, "").replace(/,/g, ".");
    };

    // Automatically generate plan when period, receipt date or price change
    useEffect(() => {
        const period = parseInt(form.credit_period);
        const receiptDate = form.date_of_receipt;
        const totalPrice = parseFloat(parseNumber(form.total_credit_price)) || parseFloat(parseNumber(form.credit_price)) || 0;

        if (period > 0 && period <= 60 && receiptDate && totalPrice > 0) {
            const newPlan: PlanItem[] = [];
            const amountPerMonth = Math.round(totalPrice / period).toString();

            for (let i = 1; i <= period; i++) {
                newPlan.push({
                    credit_payment_amount: "", 
                    credit_payment_day: undefined,
                    suggested_amount: amountPerMonth,
                    suggested_day: addMonths(receiptDate, i),
                });
            }
            setPlan(newPlan);
        }
    }, [form.credit_period, form.date_of_receipt, form.total_credit_price, form.credit_price]);

    const handlePlanChange = (index: number, field: keyof PlanItem, value: any) => {
        const newPlan = [...plan];
        if (field === "credit_payment_amount") {
            const raw = parseNumber(value);
            if (/^\d*\.?\d*$/.test(raw)) {
                newPlan[index] = { ...newPlan[index], [field]: raw };
            }
        } else {
            newPlan[index] = { ...newPlan[index], [field]: value };
        }
        setPlan(newPlan);
    };

    const handleAddPlanItem = () => {
        const lastDate = plan.length > 0 && (plan[plan.length - 1].credit_payment_day || plan[plan.length - 1].suggested_day)
            ? (plan[plan.length - 1].credit_payment_day || plan[plan.length - 1].suggested_day) 
            : (form.date_of_receipt || new Date());
        
        setPlan([...plan, { 
            credit_payment_amount: "", 
            credit_payment_day: undefined,
            suggested_day: addMonths(lastDate!, 1) 
        }]);
    };

    const handleRemovePlanItem = (index: number) => {
        setPlan(plan.filter((_, i) => i !== index));
    };

    const handleSubmit = async () => {
        if (!form.credit_name || !form.bank_name || !form.date_of_receipt || !form.credit_price) {
            toast.error("Пожалуйста, заполните основные поля");
            return;
        }

        if (plan.length === 0) {
            toast.error("Пожалуйста, добавьте график платежей");
            return;
        }
        setLoading(true);
        try {
            const payload = {
                ...form,
                date_of_receipt: form.date_of_receipt ? format(form.date_of_receipt, "yyyy-MM-dd") : "",
                interest_rate: parseFloat(form.interest_rate) || 0,
                credit_period: parseInt(form.credit_period) || 0,
                credit_price: parseFloat(parseNumber(form.credit_price)) || 0,
                total_credit_price: parseFloat(parseNumber(form.total_credit_price)) || 0,
                plan: plan.map(item => {
                    const amount = item.credit_payment_amount || item.suggested_amount || "0";
                    const date = item.credit_payment_day || item.suggested_day;
                    return {
                        credit_payment_amount: parseFloat(parseNumber(amount)) || 0,
                        credit_payment_day: date ? format(date, "yyyy-MM-dd") : ""
                    };
                }).filter(item => item.credit_payment_amount > 0 && item.credit_payment_day)
            };

            const response = await PostDataTokenJson("api/finance/credits", payload);
            if (response.data) {
                toast.success("Кредит успешно создан!");
                navigate("/credits");
            }
        } catch (err: any) {
            console.error("Create credit error:", err);
            showErrorToast(err, "Ошибка при создании кредита");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 pb-10">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => navigate("/credits")} className="rounded-full">
                    <ArrowLeft className="w-5 h-5" />
                </Button>
                <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Добавить новый кредит</h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Info */}
                <Card className="lg:col-span-1 h-fit bg-white dark:bg-gray-800 rounded-2xl shadow-lg border-gray-100 dark:border-gray-700">
                    <CardHeader>
                        <CardTitle className="text-lg">Основная информация</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>Название кредита <span className="text-red-500">*</span></Label>
                            <Input 
                                value={form.credit_name} 
                                onChange={(e) => setForm({...form, credit_name: e.target.value})} 
                                placeholder="Напр: Автокредит"
                                className="rounded-xl"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Название банка <span className="text-red-500">*</span></Label>
                            <Input 
                                value={form.bank_name} 
                                onChange={(e) => setForm({...form, bank_name: e.target.value})} 
                                placeholder="Напр: Ипак Йуli"
                                className="rounded-xl"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Дата получения <span className="text-red-500">*</span></Label>
                            <DatePicker 
                                date={form.date_of_receipt}
                                onSelect={(date) => setForm({...form, date_of_receipt: date})}
                                placeholder="Выберите дату"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Процентная ставка (%)</Label>
                            <Input 
                                type="number" 
                                value={form.interest_rate} 
                                onChange={(e) => setForm({...form, interest_rate: e.target.value})} 
                                placeholder="25"
                                className="rounded-xl"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Срок кредита (в месяцах)</Label>
                            <Input 
                                type="number" 
                                value={form.credit_period} 
                                onChange={(e) => setForm({...form, credit_period: e.target.value})} 
                                placeholder="12"
                                className="rounded-xl"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Сумма кредита <span className="text-red-500">*</span></Label>
                            <Input 
                                type="text" 
                                value={formatNumber(form.credit_price)} 
                                onChange={(e) => {
                                    const raw = parseNumber(e.target.value);
                                    if (/^\d*\.?\d*$/.test(raw)) {
                                        setForm({...form, credit_price: raw});
                                    }
                                }} 
                                placeholder="1 000 000"
                                className="rounded-xl"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Общая сумма к возврату</Label>
                            <Input 
                                type="text" 
                                value={formatNumber(form.total_credit_price)} 
                                onChange={(e) => {
                                    const raw = parseNumber(e.target.value);
                                    if (/^\d*\.?\d*$/.test(raw)) {
                                        setForm({...form, total_credit_price: raw});
                                    }
                                }} 
                                placeholder="1 120 000"
                                className="rounded-xl"
                            />
                        </div>

                        <Button 
                            className="w-full bg-maintx hover:bg-maintx/90 text-white rounded-xl py-6 mt-4"
                            onClick={handleSubmit}
                            disabled={loading}
                        >
                            {loading ? "Создание..." : "Создать кредит"}
                        </Button>
                    </CardContent>
                </Card>

                {/* Payment Plan */}
                <Card className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border-gray-100 dark:border-gray-700">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-lg">График платежей</CardTitle>
                        <Button variant="outline" size="sm" onClick={handleAddPlanItem} className="rounded-xl">
                            <Plus className="w-4 h-4 mr-1" />
                            Добавить платеж
                        </Button>
                    </CardHeader>
                    <CardContent>
                        {plan.length === 0 ? (
                            <div className="text-center py-20 text-gray-500 border-2 border-dashed border-gray-100 dark:border-gray-700 rounded-2xl">
                                Укажите срок, дату и сумму кредита для автоматической генерации графика
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {plan.map((item, index) => (
                                    <div key={index} className="flex items-center gap-3 bg-gray-50 dark:bg-gray-900/40 p-3 rounded-2xl group transition-all hover:bg-gray-100 dark:hover:bg-gray-900/60">
                                        <div className="flex-none flex items-center justify-center w-8 h-8 rounded-full bg-maintx/10 text-maintx font-bold text-xs">
                                            {index + 1}
                                        </div>
                                        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            <div className="space-y-1">
                                                <Label className="text-[10px] uppercase text-gray-400 ml-1">Сumma платежа</Label>
                                                <Input 
                                                    type="text" 
                                                    value={formatNumber(item.credit_payment_amount)} 
                                                    onChange={(e) => handlePlanChange(index, "credit_payment_amount", e.target.value)} 
                                                    placeholder={item.suggested_amount ? formatNumber(item.suggested_amount) : "100 000"}
                                                    className="rounded-xl border-none bg-white dark:bg-gray-800 shadow-sm"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <Label className="text-[10px] uppercase text-gray-400 ml-1">Дата платежа</Label>
                                                <DatePicker 
                                                    date={item.credit_payment_day}
                                                    onSelect={(date) => handlePlanChange(index, "credit_payment_day", date)}
                                                    placeholder={item.suggested_day ? format(item.suggested_day, "dd.MM.yyyy") : "Выберите дату"}
                                                    className="border-none bg-white dark:bg-gray-800 shadow-sm"
                                                />
                                            </div>
                                        </div>
                                        <Button 
                                            variant="ghost" 
                                            size="icon" 
                                            className="text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"
                                            onClick={() => handleRemovePlanItem(index)}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default CreateCredit;
