import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
// @ts-ignore
import { GetDataSimple } from "@/service";
import { ProgressAuto } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { showErrorToast } from "@/utils/toast-utils";
import { Card, CardContent } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    FileX2,
    User,
    Home,
    Calendar,
    Hash,
    Banknote,
    ListChecks,
    ArrowLeft,
} from "lucide-react";

interface PriceItem {
    id: string;
    terminated_contract_id: string;
    price_type: string;
    price_type_text: string;
    total_price: string;
    payment_status: string;
    payment_status_text: string;
    created_at: string;
}

interface TerminatedContractDetail {
    terminated_contract_id: string;
    contract_id: string;
    contract_type: string;
    contract_cash_type: string;
    is_barter: string;
    barter_type: string;
    client_id: string;
    client_name: string;
    contract_number: string;
    apartment_number: string;
    total_price: string;
    initial_payment: string;
    initial_payment_status: string;
    created_at: string;
    prices: PriceItem[];
}

const TerminatedContractDetail = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [detail, setDetail] = useState<TerminatedContractDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchDetail = async () => {
        setLoading(true);
        setError("");
        try {
            const response = await GetDataSimple(
                `api/finance/terminated-contracts/${id}`
            );
            if (response) {
                setDetail(response.result || response.data || response);
            }
        } catch (err: any) {
            console.error("Error fetching terminated contract detail:", err);
            const msg =
                err.response?.data?.message ||
                err.response?.data?.error ||
                "Ошибка при загрузке данных контракта";
            setError(msg);
            showErrorToast(err, msg);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id) fetchDetail();
    }, [id]);

    /* ── Formatters ───────────────────────────────────────────────── */
    const formatPrice = (price: string | number | undefined) => {
        if (price === undefined || price === null || price === "") return "—";
        const num = typeof price === "string" ? parseFloat(price) : price;
        if (isNaN(num)) return "—";
        return new Intl.NumberFormat("ru-RU").format(num);
    };

    const formatDate = (dateStr?: string) => {
        if (!dateStr) return "—";
        return new Date(dateStr).toLocaleDateString("ru-RU", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const getContractType = (type: string) => {
        const map: Record<string, { label: string; cls: string }> = {
            "1": { label: "Рассрочка", cls: "border-blue-300 text-blue-600 dark:border-blue-500 dark:text-blue-400" },
            "2": { label: "Ипотека",   cls: "border-purple-300 text-purple-600 dark:border-purple-500 dark:text-purple-400" },
            "3": { label: "Наличные",  cls: "border-green-300 text-green-600 dark:border-green-500 dark:text-green-400" },
        };
        return map[type] || { label: type, cls: "border-gray-300 text-gray-600" };
    };

    const getCashType = (type: string) =>
        ({ "1": "Наличные", "2": "Безналичные" }[type] ?? type);

    const getPaymentStatusCls = (status: string) => {
        if (status === "2") return "border-green-300 text-green-600 dark:border-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/10";
        if (status === "1") return "border-yellow-300 text-yellow-600 dark:border-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/10";
        return "border-red-300 text-red-600 dark:border-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/10";
    };

    /* ── Loading ──────────────────────────────────────────────────── */
    if (loading) {
        return (
            <div className="h-[80vh] w-full flex justify-center items-center">
                <div className="w-[400px]">
                    <ProgressAuto durationMs={500} startDelayMs={10} className="h-1 rounded-full" />
                </div>
            </div>
        );
    }

    /* ── Error ────────────────────────────────────────────────────── */
    if (error || !detail) {
        return (
            <div className="p-6">
                <Card className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-8">
                    <div className="text-center py-8">
                        <FileX2 className="w-14 h-14 mx-auto mb-4 text-gray-300" />
                        <p className="text-red-600 dark:text-red-400 mb-4">{error || "Данные не найдены"}</p>
                        <Button onClick={() => navigate("/terminated-contracts")} variant="outline">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Назад
                        </Button>
                    </div>
                </Card>
            </div>
        );
    }

    /* ── Page ─────────────────────────────────────────────────────── */
    return (
        <div className="space-y-6 pb-10">

            {/* ── Page header ─────────────────────────────────────── */}
            <div className="flex items-center justify-between flex-wrap gap-3 px-1">
                <div className="flex items-center gap-3">
                    <Button
                        size="sm"
                        onClick={() => navigate("/terminated-contracts")}
                        className="rounded-xl gap-2 text-white dark:text-gray-400 border-gray-200 dark:border-gray-700"
                    >
                        <ArrowLeft className="w-4 h-4" />
                      
                    </Button>
                    <div className="flex items-center gap-2">
                        
                        <div>
                            <h1 className="text-xl font-bold text-gray-900 dark:text-white leading-tight">
                                Контракт № {detail.contract_number}
                            </h1>
                            <p className="text-xs text-gray-400 dark:text-gray-500">
                                Расторгнутый контракт
                            </p>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="outline" className={`text-xs ${getContractType(detail.contract_type).cls}`}>
                        {getContractType(detail.contract_type).label}
                    </Badge>
                    <Badge variant="outline" className="text-xs border-gray-300 text-gray-600 dark:border-gray-600 dark:text-gray-400">
                        {getCashType(detail.contract_cash_type)}
                    </Badge>
                    {detail.is_barter === "2" && (
                        <Badge variant="outline" className="text-xs border-orange-300 text-orange-600 dark:border-orange-500 dark:text-orange-400">
                            Barter
                        </Badge>
                    )}
                </div>
            </div>

            {/* ── Main grid: info + finance ────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

                {/* Left — info card */}
                <Card className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <CardContent className="p-6 space-y-4">
                        <p className="text-xs uppercase text-gray-400 font-semibold tracking-widest">
                            Основная информация
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <InfoRow
                                icon={<User className="w-4 h-4 text-maintx" />}
                                label="Клиент"
                                value={detail.client_name}
                            />
                            <InfoRow
                                icon={<Home className="w-4 h-4 text-maintx" />}
                                label="Квартира"
                                value={detail.apartment_number || "—"}
                            />
                            <InfoRow
                                icon={<Hash className="w-4 h-4 text-maintx" />}
                                label="ID контракта"
                                value={`#${detail.contract_id}`}
                            />
                            <InfoRow
                                icon={<Hash className="w-4 h-4 text-red-400" />}
                                label="ID расторжения"
                                value={`#${detail.terminated_contract_id}`}
                            />
                            <InfoRow
                                icon={<Calendar className="w-4 h-4 text-maintx" />}
                                label="Дата"
                                value={formatDate(detail.created_at)}
                                wide
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Right — finance cards */}
                <div className="space-y-3">
                    <FinanceCard
                        icon={<Banknote className="w-5 h-5" />}
                        label="Общая сумма"
                        value={formatPrice(detail.total_price)}
                        color="blue"
                    />
                    <FinanceCard
                        icon={<Banknote className="w-5 h-5" />}
                        label="Первоначальный взнос"
                        value={formatPrice(detail.initial_payment)}
                        color={detail.initial_payment_status === "1" ? "green" : "yellow"}
                        badge={detail.initial_payment_status === "1" ? "Оплачен" : "Не оплачен"}
                    />
                </div>
            </div>

            {/* ── Prices table ────────────────────────────────────── */}
            <Card className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                <CardContent className="p-0">
                    {/* Section header */}
                    <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 dark:border-gray-700">
                        <ListChecks className="w-4 h-4 text-maintx" />
                        <p className="text-sm font-semibold text-gray-800 dark:text-white">
                            Платежи по расторжению
                        </p>
                        <span className="text-xs bg-mainbg/10 text-maintx px-2 py-0.5 rounded-full font-medium">
                            {detail.prices?.length ?? 0}
                        </span>
                    </div>

                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader className="bg-mainbg/10">
                                <TableRow>
                                    <TableHead className="text-maintx dark:text-white w-12">#</TableHead>
                                    <TableHead className="text-maintx dark:text-white">Тип платежа</TableHead>
                                    <TableHead className="text-maintx dark:text-white text-right">Сумма</TableHead>
                                    <TableHead className="text-maintx dark:text-white">Статус</TableHead>
                                    <TableHead className="text-maintx dark:text-white">Дата</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {!detail.prices || detail.prices.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-12 text-gray-400">
                                            <div className="flex flex-col items-center gap-2">
                                                <ListChecks className="w-10 h-10 text-gray-200" />
                                                <span>Платежей нет</span>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    detail.prices.map((item, idx) => (
                                        <TableRow
                                            key={item.id}
                                            className="border-dashed border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/60"
                                        >
                                            <TableCell className="text-gray-400 text-sm">{idx + 1}</TableCell>
                                            <TableCell className="font-medium text-gray-800 dark:text-white whitespace-nowrap">
                                                {item.price_type_text}
                                            </TableCell>
                                            <TableCell className="text-right font-bold text-gray-900 dark:text-white whitespace-nowrap">
                                                {formatPrice(item.total_price)}
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant="outline"
                                                    className={`text-xs whitespace-nowrap ${getPaymentStatusCls(item.payment_status)}`}
                                                >
                                                    {item.payment_status_text}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-gray-500 dark:text-gray-400 text-sm whitespace-nowrap">
                                                {formatDate(item.created_at)}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

/* ── Sub-components ──────────────────────────────────────────────────── */

const InfoRow = ({
    icon, label, value, wide,
}: {
    icon: React.ReactNode;
    label: string;
    value: string;
    wide?: boolean;
}) => (
    <div className={`flex items-start gap-3 bg-gray-50 dark:bg-gray-900/40 border border-gray-100 dark:border-gray-700 rounded-xl px-4 py-3 ${wide ? "sm:col-span-2" : ""}`}>
        <div className="mt-0.5">{icon}</div>
        <div>
            <p className="text-[10px] uppercase text-gray-400 font-medium tracking-wide">{label}</p>
            <p className="text-sm font-semibold text-gray-800 dark:text-white">{value}</p>
        </div>
    </div>
);

const FinanceCard = ({
    icon, label, value, color, badge,
}: {
    icon: React.ReactNode;
    label: string;
    value: string;
    color: "blue" | "green" | "yellow" | "red";
    badge?: string;
}) => {
    const c = {
        blue:   { bg: "bg-blue-50 dark:bg-blue-900/10",     border: "border-blue-100 dark:border-blue-900/30",     icon: "text-blue-500",   text: "text-blue-700 dark:text-blue-300" },
        green:  { bg: "bg-green-50 dark:bg-green-900/10",   border: "border-green-100 dark:border-green-900/30",   icon: "text-green-500",  text: "text-green-700 dark:text-green-300" },
        yellow: { bg: "bg-yellow-50 dark:bg-yellow-900/10", border: "border-yellow-100 dark:border-yellow-900/30", icon: "text-yellow-500", text: "text-yellow-700 dark:text-yellow-300" },
        red:    { bg: "bg-red-50 dark:bg-red-900/10",       border: "border-red-100 dark:border-red-900/30",       icon: "text-red-500",    text: "text-red-600 dark:text-red-400" },
    }[color];

    return (
        <div className={`rounded-2xl border p-5 ${c.bg} ${c.border}`}>
            <div className={`mb-3 ${c.icon}`}>{icon}</div>
            <p className="text-[10px] uppercase text-gray-400 font-medium tracking-wide">{label}</p>
            <div className="flex items-center gap-2 mt-1">
                <p className={`text-xl font-bold ${c.text}`}>{value}</p>
                {badge && (
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${c.border} ${c.text}`}>
                        {badge}
                    </span>
                )}
            </div>
        </div>
    );
};

export default TerminatedContractDetail;
