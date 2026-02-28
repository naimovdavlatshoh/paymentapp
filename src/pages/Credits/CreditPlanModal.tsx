import { useState, useEffect } from "react";
// @ts-ignore
import { GetDataSimple } from "@/service";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import CustomModal from "@/components/ui/custom-modal";
import { ProgressAuto } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { showErrorToast } from "@/utils/toast-utils";

interface PlanItem {
    id: string | number;
    credit_payment_amount: string;
    credit_payment_day: string;
    amount_paid: string;
    payment_status: string | number;
    payment_status_text: string;
    remaining_amount: string;
}

interface Summary {
    total_months: number;
    paid_months: number;
    partial_months: number;
    unpaid_months: number;
    total_amount: number | string;
    total_paid: number | string;
    total_remaining: number | string;
}

interface CreditPlanModalProps {
    isOpen: boolean;
    onClose: () => void;
    creditId: number;
}

const CreditPlanModal = ({ isOpen, onClose, creditId }: CreditPlanModalProps) => {
    const [plan, setPlan] = useState<PlanItem[]>([]);
    const [summary, setSummary] = useState<Summary | null>(null);
    const [loading, setLoading] = useState(false);

    const fetchPlan = async () => {
        setLoading(true);
        try {
            const response = await GetDataSimple(`api/finance/credits/${creditId}/plan`);
            if (response?.result) {
                setPlan(response.result.plan || []);
                setSummary(response.result.summary || null);
            }
        } catch (err) {
            console.error("Error fetching credit plan:", err);
            showErrorToast(err, "Ошибка при загрузке графика платежей");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen && creditId) {
            fetchPlan();
        }
    }, [isOpen, creditId]);

    const formatPrice = (price: string | number) => {
        const num = typeof price === "string" ? parseFloat(price) : price;
        if (isNaN(num)) return "0";
        return new Intl.NumberFormat("ru-RU").format(num);
    };

    const getStatusColor = (status: string | number) => {
        switch (status.toString()) {
            case "1": return "success";   // Оплачено
            case "2": return "secondary"; // Частично
            default: return "warning";    // Не оплачено
        }
    };

    return (
        <CustomModal
            showTrigger={false}
            open={isOpen}
            onOpenChange={onClose}
            title="График платежей"
            confirmText="Закрыть"
            onConfirm={onClose}
            onCancel={onClose}
            size="xl"
            showCloseButton={true}
        >
            {loading ? (
                <div className="py-20 h-[300px] flex items-center justify-center">
                    <div className="w-[300px]">
                        <ProgressAuto durationMs={500} startDelayMs={10} className="h-1 rounded-full" />
                    </div>
                </div>
            ) : (
                <div className="space-y-6">
                    {summary && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-gray-50 dark:bg-gray-900/40 p-4 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700">
                            <div className="space-y-1">
                                <p className="text-[10px] uppercase text-gray-500 font-medium">Всего сумма</p>
                                <p className="text-sm font-bold text-gray-900 dark:text-white">{formatPrice(summary.total_amount)} сум</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] uppercase text-gray-500 font-medium">Оплачено</p>
                                <p className="text-sm font-bold text-green-600">{formatPrice(summary.total_paid)} сум</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] uppercase text-gray-500 font-medium">Остаток</p>
                                <p className="text-sm font-bold text-red-500">{formatPrice(summary.total_remaining)} сум</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] uppercase text-gray-500 font-medium">Месяцы (Опл/Всего)</p>
                                <p className="text-sm font-bold text-maintx">{summary.paid_months} / {summary.total_months}</p>
                            </div>
                        </div>
                    )}

                    <div className="max-h-[50vh] overflow-y-auto pr-2">
                        <Table>
                            <TableHeader className="bg-gray-50 dark:bg-gray-900/50 sticky top-0 z-10">
                                <TableRow>
                                    <TableHead className="dark:text-white">Дата</TableHead>
                                    <TableHead className="dark:text-white">Сумма</TableHead>
                                    <TableHead className="dark:text-white">Оплачено</TableHead>
                                    <TableHead className="dark:text-white">Остаток</TableHead>
                                    <TableHead className="dark:text-white text-right">Статус</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {plan.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                                            График не найден
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    plan.map((item) => (
                                        <TableRow key={item.id} className="border-dashed border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900/30">
                                            <TableCell className="whitespace-nowrap">
                                                {new Date(item.credit_payment_day).toLocaleDateString("ru-RU")}
                                            </TableCell>
                                            <TableCell className="font-semibold text-gray-900 dark:text-white">
                                                {formatPrice(item.credit_payment_amount)}
                                            </TableCell>
                                            <TableCell className="text-green-600 font-medium">
                                                {formatPrice(item.amount_paid)}
                                            </TableCell>
                                            <TableCell className="text-red-500 font-medium">
                                                {formatPrice(item.remaining_amount)}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Badge variant={getStatusColor(item.payment_status)}>
                                                    {item.payment_status_text}
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            )}
        </CustomModal>
    );
};

export default CreditPlanModal;
