import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
// @ts-ignore
import { GetDataSimple } from "@/service";
import { ProgressAuto } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { showErrorToast } from "@/utils/toast-utils";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    ArrowLeft,
    CalendarDays,
    CheckCircle2,
    Clock,
    AlertCircle,
    TrendingDown,
    DollarSign,
    ListChecks,
    Banknote,
} from "lucide-react";

/* ── Interfaces ──────────────────────────────────────────────────────── */
interface PlanItem {
    id: string;
    terminated_contract_id: string;
    contract_payment_amount: string;
    contract_payment_date: string;
    given_amount: string;
    payment_status: string;
    payment_status_text: string;
    remaining_amount: string;
    created_at: string;
    updated_at: string | null;
}

interface PriceItem {
    id: string;
    terminated_contract_id: string;
    price_type: string;
    price_type_text: string;
    total_price: string;
    total_paid: string;
    total_remaining: string;
    payment_status: string;
    payment_status_text: string;
    created_at: string;
}

interface PlanSummary {
    total_months: number;
    paid_months: number;
    partial_months: number;
    unpaid_months: number;
    total_amount: number;
    total_paid: number;
    total_remaining: number;
}

interface PlanResponse {
    prices: PriceItem[];
    plan_summary: PlanSummary;
    plan: PlanItem[];
    payments: any[];
}

/* ── Component ───────────────────────────────────────────────────────── */
const TerminatedContractPlan = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [data, setData] = useState<PlanResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchPlan = async () => {
        setLoading(true);
        setError("");
        try {
            const response = await GetDataSimple(
                `api/finance/terminated-contracts/${id}/plan`
            );
            if (response?.result) {
                setData(response.result);
            }
        } catch (err: any) {
            const msg =
                err.response?.data?.message ||
                err.response?.data?.error ||
                "Ошибка при загрузке графика платежей";
            setError(msg);
            showErrorToast(err, msg);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id) fetchPlan();
    }, [id]);

    /* ── Formatters ─────────────────────────────────────────────── */
    const formatPrice = (val: string | number | undefined) => {
        if (val === undefined || val === null || val === "") return "—";
        const num = typeof val === "string" ? parseFloat(val) : val;
        if (isNaN(num)) return "—";
        return new Intl.NumberFormat("ru-RU").format(num);
    };

    const formatDate = (dateStr?: string) => {
        if (!dateStr) return "—";
        return new Date(dateStr).toLocaleDateString("ru-RU", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
        });
    };

    const getStatusStyle = (status: string) => {
        switch (status) {
            case "2":
                return {
                    cls: "border-green-300 text-green-600 bg-green-50 dark:border-green-600 dark:text-green-400 dark:bg-green-900/10",
                    icon: <CheckCircle2 className="w-3.5 h-3.5" />,
                };
            case "1":
                return {
                    cls: "border-yellow-300 text-yellow-600 bg-yellow-50 dark:border-yellow-600 dark:text-yellow-400 dark:bg-yellow-900/10",
                    icon: <Clock className="w-3.5 h-3.5" />,
                };
            default:
                return {
                    cls: "border-red-300 text-red-600 bg-red-50 dark:border-red-600 dark:text-red-400 dark:bg-red-900/10",
                    icon: <AlertCircle className="w-3.5 h-3.5" />,
                };
        }
    };

    const getPriceStatusStyle = (status: string) => {
        if (status === "2") return "border-green-300 text-green-600 bg-green-50 dark:border-green-600 dark:text-green-400 dark:bg-green-900/10";
        if (status === "1") return "border-yellow-300 text-yellow-600 bg-yellow-50 dark:border-yellow-600 dark:text-yellow-400 dark:bg-yellow-900/10";
        return "border-red-300 text-red-600 bg-red-50 dark:border-red-600 dark:text-red-400 dark:bg-red-900/10";
    };

    /* ── Loading ─────────────────────────────────────────────────── */
    if (loading) {
        return (
            <div className="h-[80vh] w-full flex justify-center items-center">
                <div className="w-[400px]">
                    <ProgressAuto durationMs={500} startDelayMs={10} className="h-1 rounded-full" />
                </div>
            </div>
        );
    }

    /* ── Error ───────────────────────────────────────────────────── */
    if (error || !data) {
        return (
            <div className="p-6">
                <Card className="rounded-2xl border border-gray-100 dark:border-gray-700 p-8">
                    <div className="text-center py-8">
                        <AlertCircle className="w-12 h-12 mx-auto mb-3 text-red-400" />
                        <p className="text-red-600 dark:text-red-400 mb-4">{error || "Данные не найдены"}</p>
                        <Button size="sm" onClick={() => navigate(-1)}>
                            <ArrowLeft className="w-4 h-4 mr-2" /> Назад
                        </Button>
                    </div>
                </Card>
            </div>
        );
    }

    const { plan, plan_summary: s, prices } = data;
    // const paidPct = s.total_amount > 0
    //     ? Math.min(100, Math.round((s.total_paid / s.total_amount) * 100))
    //     : 0;

    return (
        <div className="space-y-6 pb-10">

            {/* ── Header ────────────────────────────────────────────── */}
            <div className="flex items-center gap-3 px-1">
                <Button
                    size="sm"
                    onClick={() => navigate(-1)}
                    className="rounded-xl gap-1 text-white"
                >
                    <ArrowLeft className="w-4 h-4" />
                </Button>
                <div>
                    <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                        График платежей
                    </h1>
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                        Расторгнутый контракт · ID {id}
                    </p>
                </div>
            </div>

            {/* ── Summary cards ─────────────────────────────────────── */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <SummaryCard
                    icon={<DollarSign className="w-5 h-5" />}
                    label="Общая сумма"
                    value={formatPrice(s.total_amount)}
                    color="blue"
                />
                <SummaryCard
                    icon={<CheckCircle2 className="w-5 h-5" />}
                    label="Оплачено"
                    value={formatPrice(s.total_paid)}
                    color="green"
                />
                <SummaryCard
                    icon={<TrendingDown className="w-5 h-5" />}
                    label="Остаток"
                    value={formatPrice(s.total_remaining)}
                    color="red"
                />
                <SummaryCard
                    icon={<CalendarDays className="w-5 h-5" />}
                    label="Месяцы (Опл / Всего)"
                    value={`${s.paid_months} / ${s.total_months}`}
                    color="purple"
                    sub={`Не оплачено: ${s.unpaid_months}`}
                />
            </div>

          

            {/* ── Prices (виды платежей) ────────────────────────────── */}
            {prices.length > 0 && (
                <Card className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                    <CardContent className="p-0">
                        <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 dark:border-gray-700">
                            <Banknote className="w-4 h-4 text-maintx" />
                            <p className="text-sm font-semibold text-gray-800 dark:text-white">
                                Виды платежей
                            </p>
                            <span className="text-xs bg-mainbg/10 text-maintx px-2 py-0.5 rounded-full font-medium">
                                {prices.length}
                            </span>
                        </div>
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader className="bg-mainbg/10">
                                    <TableRow>
                                        <TableHead className="text-maintx dark:text-white w-12">#</TableHead>
                                        <TableHead className="text-maintx dark:text-white">Тип</TableHead>
                                        <TableHead className="text-maintx dark:text-white text-right">Сумма</TableHead>
                                        <TableHead className="text-maintx dark:text-white text-right">Оплачено</TableHead>
                                        <TableHead className="text-maintx dark:text-white text-right">Остаток</TableHead>
                                        <TableHead className="text-maintx dark:text-white">Статус</TableHead>
                                        <TableHead className="text-maintx dark:text-white">Дата</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {prices.map((p, idx) => (
                                        <TableRow
                                            key={p.id}
                                            className="border-dashed border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/60"
                                        >
                                            <TableCell className="text-gray-400 text-sm">{idx + 1}</TableCell>
                                            <TableCell className="font-medium text-gray-800 dark:text-white">
                                                {p.price_type_text}
                                            </TableCell>
                                            <TableCell className="text-right font-bold text-gray-900 dark:text-white whitespace-nowrap">
                                                {formatPrice(p.total_price)}
                                            </TableCell>
                                            <TableCell className="text-right font-semibold text-green-600 dark:text-green-400 whitespace-nowrap">
                                                {formatPrice(s.total_paid)}
                                            </TableCell>
                                            <TableCell className="text-right font-bold text-red-500 dark:text-red-400 whitespace-nowrap">
                                                {formatPrice(s.total_remaining)}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className={`text-xs whitespace-nowrap ${getPriceStatusStyle(p.payment_status)}`}>
                                                    {p.payment_status_text}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-gray-500 dark:text-gray-400 text-sm whitespace-nowrap">
                                                {formatDate(p.created_at)}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* ── Plan table ────────────────────────────────────────── */}
            <Card className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                <CardContent className="p-0">
                    <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 dark:border-gray-700">
                        <ListChecks className="w-4 h-4 text-maintx" />
                        <p className="text-sm font-semibold text-gray-800 dark:text-white">
                            График платежей
                        </p>
                        <span className="text-xs bg-mainbg/10 text-maintx px-2 py-0.5 rounded-full font-medium">
                            {plan.length}
                        </span>
                    </div>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader className="bg-mainbg/10">
                                <TableRow>
                                    <TableHead className="text-maintx dark:text-white w-12">#</TableHead>
                                    <TableHead className="text-maintx dark:text-white">Дата платежа</TableHead>
                                    <TableHead className="text-maintx dark:text-white text-right">Сумма</TableHead>
                                    <TableHead className="text-maintx dark:text-white text-right">Оплачено</TableHead>
                                    <TableHead className="text-maintx dark:text-white text-right">Остаток</TableHead>
                                    <TableHead className="text-maintx dark:text-white">Статус</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {plan.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-16 text-gray-400">
                                            <div className="flex flex-col items-center gap-3">
                                                <CalendarDays className="w-12 h-12 text-gray-200" />
                                                <span>График не найден</span>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    plan.map((item, idx) => {
                                        const status = getStatusStyle(item.payment_status);
                                        return (
                                            <TableRow
                                                key={item.id}
                                                className="border-dashed border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/60"
                                            >
                                                <TableCell className="text-gray-400 text-sm">{idx + 1}</TableCell>

                                                {/* Дата */}
                                                <TableCell className="whitespace-nowrap">
                                                    <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300 font-medium">
                                                        <CalendarDays className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                                                        {formatDate(item.contract_payment_date)}
                                                    </div>
                                                </TableCell>

                                                {/* Сумма */}
                                                <TableCell className="text-right font-semibold text-gray-800 dark:text-white whitespace-nowrap">
                                                    {formatPrice(item.contract_payment_amount)}
                                                </TableCell>

                                                {/* Оплачено */}
                                                <TableCell className="text-right font-semibold text-green-600 dark:text-green-400 whitespace-nowrap">
                                                    {formatPrice(item.given_amount)}
                                                </TableCell>

                                                {/* Остаток */}
                                                <TableCell className="text-right font-bold text-red-500 dark:text-red-400 whitespace-nowrap">
                                                    {formatPrice(item.remaining_amount)}
                                                </TableCell>

                                                {/* Статус */}
                                                <TableCell>
                                                    <Badge
                                                        variant="outline"
                                                        className={`text-xs whitespace-nowrap ${status.cls}`}
                                                    >
                                                        <span className="flex items-center gap-1">
                                                            {status.icon}
                                                            {item.payment_status_text}
                                                        </span>
                                                    </Badge>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

/* ── SummaryCard ─────────────────────────────────────────────────────── */
const SummaryCard = ({
    icon, label, value, color, sub,
}: {
    icon: React.ReactNode;
    label: string;
    value: string;
    color: "blue" | "green" | "red" | "yellow" | "purple";
    sub?: string;
}) => {
    const c = {
        blue:   { bg: "bg-blue-50 dark:bg-blue-900/10",     border: "border-blue-100 dark:border-blue-900/30",     icon: "text-blue-500",   text: "text-blue-700 dark:text-blue-300",   sub: "text-blue-400 dark:text-blue-500" },
        green:  { bg: "bg-green-50 dark:bg-green-900/10",   border: "border-green-100 dark:border-green-900/30",   icon: "text-green-500",  text: "text-green-700 dark:text-green-300", sub: "text-green-400 dark:text-green-500" },
        red:    { bg: "bg-red-50 dark:bg-red-900/10",       border: "border-red-100 dark:border-red-900/30",       icon: "text-red-500",    text: "text-red-600 dark:text-red-400",     sub: "text-red-400 dark:text-red-500" },
        yellow: { bg: "bg-yellow-50 dark:bg-yellow-900/10", border: "border-yellow-100 dark:border-yellow-900/30", icon: "text-yellow-500", text: "text-yellow-700 dark:text-yellow-300", sub: "text-yellow-400 dark:text-yellow-500" },
        purple: { bg: "bg-purple-50 dark:bg-purple-900/10", border: "border-purple-100 dark:border-purple-900/30", icon: "text-purple-500", text: "text-purple-700 dark:text-purple-300", sub: "text-purple-400 dark:text-purple-500" },
    }[color];

    return (
        <div className={`rounded-2xl border p-4 ${c.bg} ${c.border}`}>
            <div className={`mb-2 ${c.icon}`}>{icon}</div>
            <p className="text-[10px] uppercase text-gray-400 font-medium tracking-wide">{label}</p>
            <p className={`text-lg font-bold mt-0.5 ${c.text}`}>{value}</p>
            {sub && <p className={`text-[11px] mt-0.5 ${c.sub}`}>{sub}</p>}
        </div>
    );
};

export default TerminatedContractPlan;
