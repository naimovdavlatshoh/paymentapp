import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
// @ts-ignore
import { GetDataSimple } from "@/service";
import {
    Card,
    CardContent,
    CardHeader,
    CardFooter,
} from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import CustomPagination from "@/components/ui/custom-pagination";
import { Button } from "@/components/ui/button";
import { ProgressAuto } from "@/components/ui/progress";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { IoArrowBack } from "react-icons/io5";
import CustomBreadcrumb from "@/components/ui/custom-breadcrumb";

// Types
interface Balance {
    payment_method_id: string;
    payment_method_name: string;
    balance: string;
}

interface Transaction {
    id: string;
    type: string;
    type_text: string;
    from_account_id: string | null;
    from_account_name: string | null;
    to_account_id: string | null;
    to_account_name: string | null;
    amount: string;
    payment_method_id: string;
    payment_method_name: string;
    source: string;
    comment: string;
    created_at: string;
}

interface AccountData {
    account_id: number;
    account_name: string;
    balances: Balance[];
    total_balance: number;
    page: number;
    limit: number;
    count: number;
    pages: number;
    result: Transaction[];
}

const AccountTransactions = () => {
    const { accountId } = useParams<{ accountId: string }>();
    const navigate = useNavigate();
    const [accountData, setAccountData] = useState<AccountData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(20);

    const fetchAccountTransactions = async () => {
        setLoading(true);
        setError("");

        try {
            const response = await GetDataSimple(
                `api/finance/transactions/account/${accountId}?page=${currentPage}&limit=${itemsPerPage}`
            );

            console.log("Account transactions response:", response);

            if (response) {
                setAccountData(response);
            }
        } catch (err: any) {
            console.error("Error fetching account transactions:", err);
            setError(
                err.response?.data?.message ||
                    "Ошибка при загрузке транзакций счёта"
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (accountId) {
            fetchAccountTransactions();
        }
    }, [accountId, currentPage, itemsPerPage]);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handleItemsPerPageChange = (value: string) => {
        setItemsPerPage(Number(value));
        setCurrentPage(1);
    };

    const formatBalance = (balance: string | number) => {
        const num = typeof balance === "string" ? parseFloat(balance) : balance;
        return new Intl.NumberFormat("ru-RU", {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2,
        }).format(num);
    };

    const formatDate = (dateString: string) => {
        try {
            const date = new Date(dateString);
            return format(date, "dd MMM yyyy, HH:mm", { locale: ru });
        } catch {
            return dateString;
        }
    };

    const getTransactionBadgeVariant = (type: string) => {
        switch (type) {
            case "deposit":
                return "success";
            case "withdraw":
                return "destructive";
            case "transfer":
                return "default";
            default:
                return "secondary";
        }
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
                                onClick={() => fetchAccountTransactions()}
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

    if (!accountData) {
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
                            Транзакции: {accountData.account_name}
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            Всего транзакций: {accountData.count}
                        </p>
                    </div>
                </div>
                <CustomBreadcrumb
                    items={[
                        { label: "Счета", href: "/accounts" },
                        {
                            label: accountData.account_name,
                            href: `/accounts/${accountId}/transactions`,
                        },
                    ]}
                />
            </div>

            {/* Account Balance Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {accountData.balances.map((balance) => (
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
                                {formatBalance(accountData.total_balance)}{" "}
                                <span className="text-sm">сум</span>
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Transactions Table */}
            <Card className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700">
                <CardHeader>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                        История транзакций
                    </h2>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-mainbg/10">
                            <TableRow>
                                <TableHead className="text-maintx dark:text-white">
                                    ID
                                </TableHead>
                                <TableHead className="text-maintx dark:text-white">
                                    Тип
                                </TableHead>
                                <TableHead className="text-maintx dark:text-white">
                                    Счёт списания
                                </TableHead>
                                <TableHead className="text-maintx dark:text-white">
                                    Счёт зачисления
                                </TableHead>
                                <TableHead className="text-maintx dark:text-white">
                                    Сумма
                                </TableHead>
                                <TableHead className="text-maintx dark:text-white">
                                    Метод оплаты
                                </TableHead>
                                <TableHead className="text-maintx dark:text-white">
                                    Комментарий
                                </TableHead>
                                <TableHead className="text-maintx dark:text-white">
                                    Дата
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {accountData.result.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={8}
                                        className="text-center py-8 text-gray-500"
                                    >
                                        Нет транзакций
                                    </TableCell>
                                </TableRow>
                            ) : (
                                accountData.result.map((transaction) => (
                                    <TableRow
                                        key={transaction.id}
                                        className="border-dashed border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
                                    >
                                        <TableCell>
                                            <code className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs">
                                                #{transaction.id}
                                            </code>
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                variant={getTransactionBadgeVariant(
                                                    transaction.type
                                                )}
                                            >
                                                {transaction.type_text}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {transaction.from_account_name ? (
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                        {
                                                            transaction.from_account_name
                                                        }
                                                    </p>
                                                    <p className="text-xs text-gray-400">
                                                        ID:{" "}
                                                        {
                                                            transaction.from_account_id
                                                        }
                                                    </p>
                                                </div>
                                            ) : (
                                                <span className="text-gray-400 text-sm">
                                                    —
                                                </span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {transaction.to_account_name ? (
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                        {
                                                            transaction.to_account_name
                                                        }
                                                    </p>
                                                    <p className="text-xs text-gray-400">
                                                        ID:{" "}
                                                        {
                                                            transaction.to_account_id
                                                        }
                                                    </p>
                                                </div>
                                            ) : (
                                                <span className="text-gray-400 text-sm">
                                                    —
                                                </span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <span
                                                className={`font-bold ${
                                                    transaction.type ===
                                                    "deposit"
                                                        ? "text-green-600 dark:text-green-400"
                                                        : transaction.type ===
                                                          "withdraw"
                                                        ? "text-red-600 dark:text-red-400"
                                                        : "text-gray-900 dark:text-white"
                                                }`}
                                            >
                                                {transaction.type === "deposit"
                                                    ? "+"
                                                    : transaction.type ===
                                                      "withdraw"
                                                    ? "-"
                                                    : ""}
                                                {formatBalance(
                                                    transaction.amount
                                                )}{" "}
                                                <span className="text-xs">
                                                    сум
                                                </span>
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline">
                                                {
                                                    transaction.payment_method_name
                                                }
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <p className="text-sm text-gray-600 dark:text-gray-400 max-w-xs truncate">
                                                {transaction.comment || "—"}
                                            </p>
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-sm text-gray-600 dark:text-gray-400">
                                                {formatDate(
                                                    transaction.created_at
                                                )}
                                            </span>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
                <CardFooter className="flex justify-between items-center border-t border-gray-200 dark:border-gray-700 pt-4">
                    <div className="flex items-center gap-2">
                        <label htmlFor="" className="text-gray-500 text-sm">
                            Строк на странице:
                        </label>
                        <Select
                            value={itemsPerPage.toString()}
                            onValueChange={handleItemsPerPageChange}
                        >
                            <SelectTrigger className="w-16 h-8 border-none">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="10">10</SelectItem>
                                <SelectItem value="20">20</SelectItem>
                                <SelectItem value="30">30</SelectItem>
                                <SelectItem value="50">50</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <CustomPagination
                        currentPage={currentPage}
                        totalPages={accountData.pages}
                        onPageChange={handlePageChange}
                    />
                </CardFooter>
            </Card>
        </div>
    );
};

export default AccountTransactions;
