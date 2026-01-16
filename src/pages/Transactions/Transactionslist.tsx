import { useState, useEffect } from "react";
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CustomPagination from "@/components/ui/custom-pagination";
import SearchInput from "@/components/ui/search-input";
import { Button } from "@/components/ui/button";
import { ProgressAuto } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { HiDotsVertical } from "react-icons/hi";
import { CiEdit, CiTrash } from "react-icons/ci";
import { Calendar } from "@/components/ui/calendar";
import { IoMdAdd, IoMdRemove, IoMdSwap } from "react-icons/io";
import DepositModal from "./DepositModal";
import WithdrawModal from "./WithdrawModal";
import TransferModal from "./TransferModal";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";

// Types
interface Transaction {
    id: string;
    type: string;
    type_text: string;
    from_account_id: string | null;
    from_account_name: string | null;
    from_account_code: string | null;
    to_account_id: string | null;
    to_account_name: string | null;
    to_account_code: string | null;
    amount: string;
    payment_method_id: string;
    payment_method_name: string;
    source: string;
    source_text: string;
    related_contract_id: string | null;
    comment: string | null;
    created_by: string;
    created_at: string;
}

interface Account {
    account_id: string;
    name: string;
    code: string;
}

interface PaymentMethod {
    id: string;
    name: string;
}

const Transactionslist = () => {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(20);
    const [searchQuery, setSearchQuery] = useState("");
    const [activeTab, setActiveTab] = useState("all");
    const [selectedTransactions, setSelectedTransactions] = useState<string[]>(
        []
    );

    // Filters
    const [filterType, setFilterType] = useState<string>("");
    const [filterFromAccount, setFilterFromAccount] = useState<string>("");
    const [filterToAccount, setFilterToAccount] = useState<string>("");
    const [filterPaymentMethod, setFilterPaymentMethod] = useState<string>("");
    const [filterSource, setFilterSource] = useState<string>("");
    const [dateFrom, setDateFrom] = useState<Date | undefined>(undefined);
    const [dateTo, setDateTo] = useState<Date | undefined>(undefined);
    const [showFilters, setShowFilters] = useState(false);

    // Accounts and Payment Methods
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);

    // Modals
    const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
    const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
    const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);

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

    const fetchTransactions = async () => {
        setLoading(true);
        setError("");

        try {
            // Build query params
            let queryParams = `page=${currentPage}&limit=${itemsPerPage}`;

            if (filterType) queryParams += `&type=${filterType}`;
            if (filterFromAccount)
                queryParams += `&from_account_id=${filterFromAccount}`;
            if (filterToAccount)
                queryParams += `&to_account_id=${filterToAccount}`;
            if (filterPaymentMethod)
                queryParams += `&payment_method_id=${filterPaymentMethod}`;
            if (filterSource) queryParams += `&source=${filterSource}`;
            if (dateFrom)
                queryParams += `&date_from=${format(dateFrom, "yyyy-MM-dd")}`;
            if (dateTo)
                queryParams += `&date_to=${format(dateTo, "yyyy-MM-dd")}`;

            const response = await GetDataSimple(
                `api/finance/transactions?${queryParams}`
            );

            console.log("Transactions response:", response);

            if (response) {
                setTransactions(response.result || []);
                setTotalPages(response.pages || 1);
            }
        } catch (err: any) {
            console.error("Error fetching transactions:", err);
            setError(
                err.response?.data?.message || "Ошибка при загрузке транзакций"
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Fetch accounts and payment methods on mount
        fetchAccounts();
        fetchPaymentMethods();
    }, []);

    useEffect(() => {
        fetchTransactions();
    }, [
        currentPage,
        itemsPerPage,
        filterType,
        filterFromAccount,
        filterToAccount,
        filterPaymentMethod,
        filterSource,
        dateFrom,
        dateTo,
    ]);

    // Filter transactions by tab
    const getFilteredTransactionsByTab = (transactions: Transaction[]) => {
        switch (activeTab) {
            case "deposit":
                return transactions.filter((t) => t.type === "deposit");
            case "withdraw":
                return transactions.filter((t) => t.type === "withdraw");
            case "transfer":
                return transactions.filter((t) => t.type === "transfer");
            default:
                return transactions;
        }
    };

    // Search filter
    const searchFilteredTransactions = transactions.filter(
        (transaction) =>
            transaction.comment
                ?.toLowerCase()
                .includes(searchQuery.toLowerCase()) ||
            transaction.from_account_name
                ?.toLowerCase()
                .includes(searchQuery.toLowerCase()) ||
            transaction.to_account_name
                ?.toLowerCase()
                .includes(searchQuery.toLowerCase()) ||
            transaction.payment_method_name
                ?.toLowerCase()
                .includes(searchQuery.toLowerCase())
    );

    const filteredTransactions = getFilteredTransactionsByTab(
        searchFilteredTransactions
    );

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handleSearch = (query: string) => {
        setSearchQuery(query);
    };

    const handleItemsPerPageChange = (value: string) => {
        setItemsPerPage(Number(value));
        setCurrentPage(1);
    };

    const handleTabChange = (value: string) => {
        setActiveTab(value);
        setFilterType(value === "all" ? "" : value);
    };

    const handleSelectTransaction = (transactionId: string) => {
        setSelectedTransactions((prev) =>
            prev.includes(transactionId)
                ? prev.filter((id) => id !== transactionId)
                : [...prev, transactionId]
        );
    };

    const handleSelectAll = () => {
        if (selectedTransactions.length === filteredTransactions.length) {
            setSelectedTransactions([]);
        } else {
            setSelectedTransactions(filteredTransactions.map((t) => t.id));
        }
    };

    const handleClearFilters = () => {
        setFilterType("");
        setFilterFromAccount("");
        setFilterToAccount("");
        setFilterPaymentMethod("");
        setFilterSource("");
        setDateFrom(undefined);
        setDateTo(undefined);
        setActiveTab("all");
    };

    const formatBalance = (balance: string | number) => {
        const num = typeof balance === "string" ? parseFloat(balance) : balance;
        return new Intl.NumberFormat("ru-RU", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(num);
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case "deposit":
                return "bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300";
            case "withdraw":
                return "bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300";
            case "transfer":
                return "bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300";
            default:
                return "bg-gray-100 dark:bg-gray-900/20 text-gray-800 dark:text-gray-300";
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
                                onClick={() => fetchTransactions()}
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

    return (
        <div className="space-y-6 pb-10">
            {/* Header */}
            <div className="space-y-4 mb-10">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
                            Транзакции
                        </h1>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            onClick={() => setIsDepositModalOpen(true)}
                            className="bg-maintx text-white duration-300 hover:bg-maintx/80 rounded-xl"
                        >
                            <IoMdAdd className="w-4 h-4 mr-1" />
                            Пополнить
                        </Button>
                        <Button
                            onClick={() => setIsWithdrawModalOpen(true)}
                            className="bg-red-600 text-white duration-300 hover:bg-red-800 rounded-xl"
                        >
                            <IoMdRemove className="w-4 h-4 mr-1" />
                            Снять
                        </Button>
                        <Button
                            onClick={() => setIsTransferModalOpen(true)}
                            className="bg-black text-white duration-300 hover:bg-black/90 rounded-xl"
                        >
                            <IoMdSwap className="w-4 h-4 mr-1" />
                            Перевести
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => setShowFilters(!showFilters)}
                            className="rounded-xl"
                        >
                            {showFilters
                                ? "Скрыть фильтры"
                                : "Показать фильтры"}
                        </Button>
                    </div>
                </div>
            </div>

            {/* Filters */}
            {showFilters && (
                <Card className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700">
                    <CardHeader>
                        <h3 className="text-lg font-semibold">Фильтры</h3>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {/* From Account Filter */}
                            <div className="space-y-2">
                                <Label>Счёт списания</Label>
                                <Select
                                    value={filterFromAccount || "all"}
                                    onValueChange={(value) =>
                                        setFilterFromAccount(
                                            value === "all" ? "" : value
                                        )
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Выберите счёт" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Все</SelectItem>
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

                            {/* To Account Filter */}
                            <div className="space-y-2">
                                <Label>Счёт зачисления</Label>
                                <Select
                                    value={filterToAccount || "all"}
                                    onValueChange={(value) =>
                                        setFilterToAccount(
                                            value === "all" ? "" : value
                                        )
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Выберите счёт" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Все</SelectItem>
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

                            {/* Payment Method Filter */}
                            <div className="space-y-2">
                                <Label>Метод оплаты</Label>
                                <Select
                                    value={filterPaymentMethod || "all"}
                                    onValueChange={(value) =>
                                        setFilterPaymentMethod(
                                            value === "all" ? "" : value
                                        )
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Выберите метод" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Все</SelectItem>
                                        {paymentMethods.map((method) => (
                                            <SelectItem
                                                key={method.id}
                                                value={method.id}
                                            >
                                                {method.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Source Filter */}
                            <div className="space-y-2">
                                <Label>Источник</Label>
                                <Select
                                    value={filterSource || "all"}
                                    onValueChange={(value) =>
                                        setFilterSource(
                                            value === "all" ? "" : value
                                        )
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Выберите источник" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Все</SelectItem>
                                        <SelectItem value="manual">
                                            Вручную
                                        </SelectItem>
                                        <SelectItem value="api">API</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Date From */}
                            <div className="space-y-2">
                                <Label>Дата от</Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className={cn(
                                                "w-full justify-start text-left font-normal",
                                                !dateFrom &&
                                                    "text-muted-foreground"
                                            )}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {dateFrom ? (
                                                format(dateFrom, "dd.MM.yyyy")
                                            ) : (
                                                <span>Выберите дату</span>
                                            )}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0">
                                        <Calendar
                                            mode="single"
                                            selected={dateFrom}
                                            onSelect={setDateFrom}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>

                            {/* Date To */}
                            <div className="space-y-2">
                                <Label>Дата до</Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className={cn(
                                                "w-full justify-start text-left font-normal",
                                                !dateTo &&
                                                    "text-muted-foreground"
                                            )}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {dateTo ? (
                                                format(dateTo, "dd.MM.yyyy")
                                            ) : (
                                                <span>Выберите дату</span>
                                            )}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0">
                                        <Calendar
                                            mode="single"
                                            selected={dateTo}
                                            onSelect={setDateTo}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>
                        </div>

                        <div className="flex justify-end mt-4">
                            <Button
                                variant="outline"
                                onClick={handleClearFilters}
                            >
                                Очистить фильтры
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Transactions Table */}
            <Card className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700">
                <Tabs
                    value={activeTab}
                    onValueChange={handleTabChange}
                    className="border-b"
                >
                    <TabsList className="flex justify-start w-full bg-transparent p-0 h-auto">
                        <TabsTrigger
                            value="all"
                            className="rounded-none border-b-2 border-transparent data-[state=active]:border-black dark:data-[state=active]:border-white data-[state=active]:bg-transparent data-[state=active]:text-black dark:data-[state=active]:text-white text-gray-400 dark:text-gray-500 flex items-center justify-center gap-2 py-3"
                        >
                            <span>Все</span>
                        </TabsTrigger>
                        <TabsTrigger
                            value="deposit"
                            className="rounded-none border-b-2 border-transparent data-[state=active]:border-black dark:data-[state=active]:border-white data-[state=active]:bg-transparent data-[state=active]:text-black dark:data-[state=active]:text-white text-gray-400 dark:text-gray-500 flex items-center justify-center gap-2 py-3"
                        >
                            <span>Пополнение</span>
                        </TabsTrigger>
                        <TabsTrigger
                            value="withdraw"
                            className="rounded-none border-b-2 border-transparent data-[state=active]:border-black dark:data-[state=active]:border-white data-[state=active]:bg-transparent data-[state=active]:text-black dark:data-[state=active]:text-white text-gray-400 dark:text-gray-500 flex items-center justify-center gap-2 py-3"
                        >
                            <span>Снятие</span>
                        </TabsTrigger>
                        <TabsTrigger
                            value="transfer"
                            className="rounded-none border-b-2 border-transparent data-[state=active]:border-black dark:data-[state=active]:border-white data-[state=active]:bg-transparent data-[state=active]:text-black dark:data-[state=active]:text-white text-gray-400 dark:text-gray-500 flex items-center justify-center gap-2 py-3"
                        >
                            <span>Перевод</span>
                        </TabsTrigger>
                    </TabsList>
                </Tabs>
                <CardHeader className="pb-4">
                    <div className="flex flex-col space-y-4">
                        <div className="flex justify-start w-full">
                            <SearchInput
                                placeholder="Поиск транзакций..."
                                value={searchQuery}
                                onChange={handleSearch}
                                onSearch={handleSearch}
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader className="bg-mainbg/10">
                                <TableRow>
                                    <TableHead className="text-maintx dark:text-white w-12">
                                        <Checkbox
                                            checked={
                                                selectedTransactions.length ===
                                                    filteredTransactions.length &&
                                                filteredTransactions.length > 0
                                            }
                                            onCheckedChange={handleSelectAll}
                                        />
                                    </TableHead>
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
                                        Источник
                                    </TableHead>
                                    <TableHead className="text-maintx dark:text-white">
                                        Комментарий
                                    </TableHead>
                                    <TableHead className="text-maintx dark:text-white">
                                        Дата
                                    </TableHead>
                                    <TableHead className="text-right text-maintx dark:text-white">
                                        Действия
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredTransactions.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={11}
                                            className="text-center py-8 text-gray-500"
                                        >
                                            Нет данных
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredTransactions.map((transaction) => (
                                        <TableRow
                                            key={transaction.id}
                                            className="border-dashed border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
                                        >
                                            <TableCell className="w-12">
                                                <Checkbox
                                                    checked={selectedTransactions.includes(
                                                        transaction.id
                                                    )}
                                                    onCheckedChange={() =>
                                                        handleSelectTransaction(
                                                            transaction.id
                                                        )
                                                    }
                                                />
                                            </TableCell>
                                            <TableCell className="font-medium">
                                                #{transaction.id}
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    className={getTypeColor(
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
                                                            {
                                                                transaction.from_account_code
                                                            }
                                                        </p>
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-400">
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
                                                            {
                                                                transaction.to_account_code
                                                            }
                                                        </p>
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-400">
                                                        —
                                                    </span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <span className="font-bold text-base text-gray-900 dark:text-white">
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
                                                <Badge variant="secondary">
                                                    {transaction.source_text}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="max-w-[200px] truncate text-sm text-gray-600 dark:text-gray-300">
                                                    {transaction.comment || "—"}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-sm">
                                                    <p className="text-gray-900 dark:text-white">
                                                        {new Date(
                                                            transaction.created_at
                                                        ).toLocaleDateString(
                                                            "ru-RU"
                                                        )}
                                                    </p>
                                                    <p className="text-xs text-gray-400">
                                                        {new Date(
                                                            transaction.created_at
                                                        ).toLocaleTimeString(
                                                            "ru-RU"
                                                        )}
                                                    </p>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger
                                                        asChild
                                                    >
                                                        <button className="rounded-full outline-none focus:outline-none focus:ring-0 focus:border-0 focus-visible:outline-none focus-visible:ring-0 focus-visible:border-0 hover:bg-gray-200 dark:hover:bg-gray-700 p-2 transition-colors duration-200">
                                                            <HiDotsVertical className="w-4 h-4 text-gray-500" />
                                                        </button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem className="flex items-center gap-2">
                                                            <CiEdit className="w-4 h-4" />
                                                            <span>
                                                                Редактировать
                                                            </span>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem className="flex items-center gap-2 text-red-600 hover:text-red-600">
                                                            <CiTrash className="w-4 h-4" />
                                                            <span>Удалить</span>
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
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
                                <SelectItem value="5">5</SelectItem>
                                <SelectItem value="10">10</SelectItem>
                                <SelectItem value="20">20</SelectItem>
                                <SelectItem value="30">30</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <CustomPagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={handlePageChange}
                    />
                </CardFooter>
            </Card>

            {/* Deposit Modal */}
            <DepositModal
                isOpen={isDepositModalOpen}
                onClose={() => setIsDepositModalOpen(false)}
                onSuccess={() => fetchTransactions()}
            />

            {/* Withdraw Modal */}
            <WithdrawModal
                isOpen={isWithdrawModalOpen}
                onClose={() => setIsWithdrawModalOpen(false)}
                onSuccess={() => fetchTransactions()}
            />

            {/* Transfer Modal */}
            <TransferModal
                isOpen={isTransferModalOpen}
                onClose={() => setIsTransferModalOpen(false)}
                onSuccess={() => fetchTransactions()}
            />
        </div>
    );
};

export default Transactionslist;
