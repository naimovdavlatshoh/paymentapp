import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
// @ts-ignore
import { GetDataSimple } from "@/service";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { IoArrowBack } from "react-icons/io5";
import CustomBreadcrumb from "@/components/ui/custom-breadcrumb";
import { ProgressAuto } from "@/components/ui/progress";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { FaCalendarAlt } from "react-icons/fa";
import { IoMdTrendingUp, IoMdTrendingDown } from "react-icons/io";
import { MdSwapVert } from "react-icons/md";

// Types
interface Balance {
    payment_method_id: string;
    payment_method_name: string;
    balance: string;
}

interface PaymentMethodStats {
    payment_method_id: string;
    payment_method_name: string;
    total_deposit: number;
    total_withdraw: number;
    net_change: number;
}

interface Statistics {
    by_payment_method: PaymentMethodStats[];
    total_deposit: number;
    total_withdraw: number;
    net_change: number;
}

interface StatisticsData {
    account_id: number;
    account_name: string;
    balances: Balance[];
    total_balance: number;
    period: {
        date_from: string;
        date_to: string;
    };
    statistics: Statistics;
}

const AccountStatistics = () => {
    const { accountId } = useParams<{ accountId: string }>();
    const navigate = useNavigate();
    const [statisticsData, setStatisticsData] = useState<StatisticsData | null>(
        null
    );
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Date filters - default to current year
    const currentYear = new Date().getFullYear();
    const [dateFrom, setDateFrom] = useState<Date>(
        new Date(`${currentYear}-01-01`)
    );
    const [dateTo, setDateTo] = useState<Date>(
        new Date(`${currentYear}-12-31`)
    );

    const fetchStatistics = async () => {
        setLoading(true);
        setError("");

        try {
            const dateFromStr = format(dateFrom, "yyyy-MM-dd");
            const dateToStr = format(dateTo, "yyyy-MM-dd");

            const response = await GetDataSimple(
                `api/finance/transactions/account/${accountId}/statistics?date_from=${dateFromStr}&date_to=${dateToStr}`
            );

            console.log("Statistics response:", response);

            if (response) {
                setStatisticsData(response);
            }
        } catch (err: any) {
            console.error("Error fetching statistics:", err);
            setError(
                err.response?.data?.message || "Ошибка при загрузке статистики"
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (accountId) {
            fetchStatistics();
        }
    }, [accountId, dateFrom, dateTo]);

    const formatBalance = (balance: string | number) => {
        const num = typeof balance === "string" ? parseFloat(balance) : balance;
        return new Intl.NumberFormat("ru-RU", {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2,
        }).format(num);
    };

    if (loading) {
        return (
            <div className="h-[80vh] w-full flex justify-center items-center">
                <div className="w-[400px]">
                    <ProgressAuto
                        durationMs={500}
                        startDelayMs={10}
                        className="h-1 rounded-full"
                    />
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6">
                <Card>
                    <CardContent className="p-6">
                        <div className="text-center py-8">
                            <p className="text-red-600 dark:text-red-400">
                                {error}
                            </p>
                            <Button
                                onClick={() => fetchStatistics()}
                                className="mt-4"
                            >
                                Попробовать снова
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (!statisticsData) {
        return null;
    }

    return (
        <div className="space-y-6 pb-10">
            {/* Header */}
            <div className="space-y-4 mb-10">
                <div className="flex items-center gap-3">
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => navigate("/accounts")}
                        className="rounded-xl bg-black text-white hover:bg-black/90 hover:text-white duration-300"
                    >
                        <IoArrowBack className="w-4 h-4" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
                            Статистика: {statisticsData.account_name}
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            Период:{" "}
                            {format(dateFrom, "dd MMM yyyy", { locale: ru })} -{" "}
                            {format(dateTo, "dd MMM yyyy", { locale: ru })}
                        </p>
                    </div>
                </div>
                <CustomBreadcrumb
                    items={[
                        { label: "Счета", href: "/accounts" },
                        {
                            label: statisticsData.account_name,
                            href: `/accounts/${accountId}/statistics`,
                        },
                    ]}
                />
            </div>

            {/* Date Filter */}
            <Card className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700">
                <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Период:
                            </label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className="justify-start text-left font-normal"
                                    >
                                        <FaCalendarAlt className="mr-2 h-4 w-4" />
                                        {format(dateFrom, "dd MMM yyyy", {
                                            locale: ru,
                                        })}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent
                                    className="w-auto p-0"
                                    align="start"
                                >
                                    <Calendar
                                        mode="single"
                                        selected={dateFrom}
                                        onSelect={(date) =>
                                            date && setDateFrom(date)
                                        }
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                            <span className="text-gray-500">—</span>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className="justify-start text-left font-normal"
                                    >
                                        <FaCalendarAlt className="mr-2 h-4 w-4" />
                                        {format(dateTo, "dd MMM yyyy", {
                                            locale: ru,
                                        })}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent
                                    className="w-auto p-0"
                                    align="start"
                                >
                                    <Calendar
                                        mode="single"
                                        selected={dateTo}
                                        onSelect={(date) =>
                                            date && setDateTo(date)
                                        }
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Current Balance Cards */}
            <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Текущий баланс
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {statisticsData.balances.map((balance) => (
                        <Card
                            key={balance.payment_method_id}
                            className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900"
                        >
                            <CardContent className="p-6">
                                <div className="space-y-2">
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        {balance.payment_method_name}
                                    </p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                        {formatBalance(balance.balance)}{" "}
                                        <span className="text-sm text-gray-500">
                                            сум
                                        </span>
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                    <Card className="bg-gradient-to-br from-maintx/10 to-maintx/20 dark:from-maintx/20 dark:to-maintx/30">
                        <CardContent className="p-6">
                            <div className="space-y-2">
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Общий баланс
                                </p>
                                <p className="text-2xl font-bold text-maintx dark:text-white">
                                    {formatBalance(
                                        statisticsData.total_balance
                                    )}{" "}
                                    <span className="text-sm">сум</span>
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Overall Statistics */}
            <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Общая статистика за период
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-800">
                        <CardContent className="p-6">
                            <div className="flex items-start justify-between">
                                <div className="space-y-2">
                                    <p className="text-sm text-green-700 dark:text-green-400 font-medium">
                                        Пополнения
                                    </p>
                                    <p className="text-3xl font-bold text-green-900 dark:text-green-300">
                                        {formatBalance(
                                            statisticsData.statistics
                                                .total_deposit
                                        )}
                                    </p>
                                    <p className="text-xs text-green-600 dark:text-green-500">
                                        сум
                                    </p>
                                </div>
                                <div className="p-3 bg-green-200 dark:bg-green-800/40 rounded-full">
                                    <IoMdTrendingUp className="w-6 h-6 text-green-700 dark:text-green-300" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 border-red-200 dark:border-red-800">
                        <CardContent className="p-6">
                            <div className="flex items-start justify-between">
                                <div className="space-y-2">
                                    <p className="text-sm text-red-700 dark:text-red-400 font-medium">
                                        Списания
                                    </p>
                                    <p className="text-3xl font-bold text-red-900 dark:text-red-300">
                                        {formatBalance(
                                            statisticsData.statistics
                                                .total_withdraw
                                        )}
                                    </p>
                                    <p className="text-xs text-red-600 dark:text-red-500">
                                        сум
                                    </p>
                                </div>
                                <div className="p-3 bg-red-200 dark:bg-red-800/40 rounded-full">
                                    <IoMdTrendingDown className="w-6 h-6 text-red-700 dark:text-red-300" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card
                        className={`bg-gradient-to-br ${
                            statisticsData.statistics.net_change >= 0
                                ? "from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-800"
                                : "from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border-orange-200 dark:border-orange-800"
                        }`}
                    >
                        <CardContent className="p-6">
                            <div className="flex items-start justify-between">
                                <div className="space-y-2">
                                    <p
                                        className={`text-sm font-medium ${
                                            statisticsData.statistics
                                                .net_change >= 0
                                                ? "text-blue-700 dark:text-blue-400"
                                                : "text-orange-700 dark:text-orange-400"
                                        }`}
                                    >
                                        Чистое изменение
                                    </p>
                                    <p
                                        className={`text-3xl font-bold ${
                                            statisticsData.statistics
                                                .net_change >= 0
                                                ? "text-blue-900 dark:text-blue-300"
                                                : "text-orange-900 dark:text-orange-300"
                                        }`}
                                    >
                                        {statisticsData.statistics.net_change >=
                                        0
                                            ? "+"
                                            : ""}
                                        {formatBalance(
                                            statisticsData.statistics.net_change
                                        )}
                                    </p>
                                    <p
                                        className={`text-xs ${
                                            statisticsData.statistics
                                                .net_change >= 0
                                                ? "text-blue-600 dark:text-blue-500"
                                                : "text-orange-600 dark:text-orange-500"
                                        }`}
                                    >
                                        сум
                                    </p>
                                </div>
                                <div
                                    className={`p-3 rounded-full ${
                                        statisticsData.statistics.net_change >=
                                        0
                                            ? "bg-blue-200 dark:bg-blue-800/40"
                                            : "bg-orange-200 dark:bg-orange-800/40"
                                    }`}
                                >
                                    <MdSwapVert
                                        className={`w-6 h-6 ${
                                            statisticsData.statistics
                                                .net_change >= 0
                                                ? "text-blue-700 dark:text-blue-300"
                                                : "text-orange-700 dark:text-orange-300"
                                        }`}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Statistics by Payment Method */}
            <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Статистика по методам оплаты
                </h2>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    {statisticsData.statistics.by_payment_method.map(
                        (method) => (
                            <Card
                                key={method.payment_method_id}
                                className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700"
                            >
                                <CardHeader>
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                        {method.payment_method_name}
                                    </h3>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                        <div>
                                            <p className="text-xs text-green-600 dark:text-green-400 mb-1">
                                                Пополнения
                                            </p>
                                            <p className="text-xl font-bold text-green-900 dark:text-green-300">
                                                {formatBalance(
                                                    method.total_deposit
                                                )}
                                            </p>
                                        </div>
                                        <IoMdTrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
                                    </div>

                                    <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                                        <div>
                                            <p className="text-xs text-red-600 dark:text-red-400 mb-1">
                                                Списания
                                            </p>
                                            <p className="text-xl font-bold text-red-900 dark:text-red-300">
                                                {formatBalance(
                                                    method.total_withdraw
                                                )}
                                            </p>
                                        </div>
                                        <IoMdTrendingDown className="w-5 h-5 text-red-600 dark:text-red-400" />
                                    </div>

                                    <div
                                        className={`flex items-center justify-between p-3 rounded-lg ${
                                            method.net_change >= 0
                                                ? "bg-blue-50 dark:bg-blue-900/20"
                                                : "bg-orange-50 dark:bg-orange-900/20"
                                        }`}
                                    >
                                        <div>
                                            <p
                                                className={`text-xs mb-1 ${
                                                    method.net_change >= 0
                                                        ? "text-blue-600 dark:text-blue-400"
                                                        : "text-orange-600 dark:text-orange-400"
                                                }`}
                                            >
                                                Чистое изменение
                                            </p>
                                            <p
                                                className={`text-xl font-bold ${
                                                    method.net_change >= 0
                                                        ? "text-blue-900 dark:text-blue-300"
                                                        : "text-orange-900 dark:text-orange-300"
                                                }`}
                                            >
                                                {method.net_change >= 0
                                                    ? "+"
                                                    : ""}
                                                {formatBalance(
                                                    method.net_change
                                                )}
                                            </p>
                                        </div>
                                        <MdSwapVert
                                            className={`w-5 h-5 ${
                                                method.net_change >= 0
                                                    ? "text-blue-600 dark:text-blue-400"
                                                    : "text-orange-600 dark:text-orange-400"
                                            }`}
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        )
                    )}
                </div>
            </div>
        </div>
    );
};

export default AccountStatistics;
