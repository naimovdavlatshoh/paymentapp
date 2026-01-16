import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
// import CustomBreadcrumb from "@/components/ui/custom-breadcrumb";
import { Button } from "@/components/ui/button";
// import { IoMdAdd } from "react-icons/io";
import { ProgressAuto } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { HiDotsVertical } from "react-icons/hi";
// import { CiEdit, CiTrash } from "react-icons/ci";
import { IoStatsChart } from "react-icons/io5";
import { MdOutlineSwapHoriz } from "react-icons/md";

// Types
interface Balance {
    payment_method_id: string;
    payment_method_name: string;
    balance: string;
}

interface Account {
    account_id: string;
    name: string;
    code: string;
    is_active: string;
    is_active_text: string;
    balances: Balance[];
    total_balance: number;
}

const Accountlist = () => {
    const navigate = useNavigate();
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [searchQuery, setSearchQuery] = useState("");
    const [activeTab, setActiveTab] = useState("all");
    const [selectedAccounts, setSelectedAccounts] = useState<string[]>([]);

    // Random badge colors
    const badgeColors = [
        "bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300",
        "bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300",
        "bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-300",
        "bg-pink-100 dark:bg-pink-900/20 text-pink-800 dark:text-pink-300",
    ];

    const getRandomBadgeColor = (index: number) => {
        return badgeColors[index % badgeColors.length];
    };

    const fetchAccounts = async () => {
        setLoading(true);
        setError("");

        try {
            const response = await GetDataSimple(
                `api/finance/accounts?page=${currentPage}&limit=${itemsPerPage}`
            );

            console.log("Accounts response:", response);

            if (response) {
                setAccounts(response.result || []);
                setTotalPages(response.pages || 1);
                setTotalCount(response.count || 0);
            }
        } catch (err: any) {
            console.error("Error fetching accounts:", err);
            setError(
                err.response?.data?.message || "Ошибка при загрузке счетов"
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAccounts();
    }, [currentPage, itemsPerPage]);

    // Filter accounts by tab
    const getFilteredAccountsByTab = (accounts: Account[]) => {
        switch (activeTab) {
            case "active":
                return accounts.filter((acc) => acc.is_active === "1");
            case "inactive":
                return accounts.filter((acc) => acc.is_active !== "1");
            case "positive":
                return accounts.filter((acc) => acc.total_balance > 0);
            default:
                return accounts;
        }
    };

    // Search filter
    const searchFilteredAccounts = accounts.filter(
        (account) =>
            account.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            account.code.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filteredAccounts = getFilteredAccountsByTab(searchFilteredAccounts);

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
    };

    const handleSelectAccount = (accountId: string) => {
        setSelectedAccounts((prev) =>
            prev.includes(accountId)
                ? prev.filter((id) => id !== accountId)
                : [...prev, accountId]
        );
    };

    const handleSelectAll = () => {
        if (selectedAccounts.length === filteredAccounts.length) {
            setSelectedAccounts([]);
        } else {
            setSelectedAccounts(filteredAccounts.map((acc) => acc.account_id));
        }
    };

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
                                onClick={() => fetchAccounts()}
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
                            Все счета
                        </h1>
                    </div>
                    {/* <Button className="bg-black text-white duration-300 hover:bg-black/70 rounded-xl">
                        <IoMdAdd className="w-3 h-3" /> Добавить счёт
                    </Button> */}
                </div>
                {/* <CustomBreadcrumb
                    items={[
                        { label: "Счета", href: "/" },
                    ]}
                /> */}
            </div>

            {/* Accounts Table */}
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
                            <Badge
                                variant="secondary"
                                className={`${getRandomBadgeColor(
                                    0
                                )} text-xs px-2 py-0.5 rounded-lg`}
                            >
                                {totalCount}
                            </Badge>
                        </TabsTrigger>
                        {/* <TabsTrigger
                            value="active"
                            className="rounded-none border-b-2 border-transparent data-[state=active]:border-black dark:data-[state=active]:border-white data-[state=active]:bg-transparent data-[state=active]:text-black dark:data-[state=active]:text-white text-gray-400 dark:text-gray-500 flex items-center justify-center gap-2 py-3"
                        >
                            <span>Активные</span>
                            <Badge
                                variant="secondary"
                                className={`${getRandomBadgeColor(
                                    1
                                )} text-xs px-2 py-0.5 rounded-lg`}
                            >
                                {
                                    accounts.filter((a) => a.is_active === "1")
                                        .length
                                }
                            </Badge>
                        </TabsTrigger> */}
                        {/* <TabsTrigger
                            value="inactive"
                            className="rounded-none border-b-2 border-transparent data-[state=active]:border-black dark:data-[state=active]:border-white data-[state=active]:bg-transparent data-[state=active]:text-black dark:data-[state=active]:text-white text-gray-400 dark:text-gray-500 flex items-center justify-center gap-2 py-3"
                        >
                            <span>Неактивные</span>
                            <Badge
                                variant="secondary"
                                className={`${getRandomBadgeColor(
                                    2
                                )} text-xs px-2 py-0.5 rounded-lg`}
                            >
                                {
                                    accounts.filter((a) => a.is_active !== "1")
                                        .length
                                }
                            </Badge>
                        </TabsTrigger>
                        <TabsTrigger
                            value="positive"
                            className="rounded-none border-b-2 border-transparent data-[state=active]:border-black dark:data-[state=active]:border-white data-[state=active]:bg-transparent data-[state=active]:text-black dark:data-[state=active]:text-white text-gray-400 dark:text-gray-500 flex items-center justify-center gap-2 py-3"
                        >
                            <span>С балансом</span>
                            <Badge
                                variant="secondary"
                                className={`${getRandomBadgeColor(
                                    3
                                )} text-xs px-2 py-0.5 rounded-lg`}
                            >
                                {
                                    accounts.filter((a) => a.total_balance > 0)
                                        .length
                                }
                            </Badge>
                        </TabsTrigger> */}
                    </TabsList>
                </Tabs>
                <CardHeader className="pb-4">
                    <div className="flex flex-col space-y-4">
                        <div className="flex justify-start w-full">
                            <SearchInput
                                placeholder="Поиск счетов..."
                                value={searchQuery}
                                onChange={handleSearch}
                                onSearch={handleSearch}
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-mainbg/10">
                            <TableRow>
                                <TableHead className="text-maintx dark:text-white w-12">
                                    <Checkbox
                                        checked={
                                            selectedAccounts.length ===
                                                filteredAccounts.length &&
                                            filteredAccounts.length > 0
                                        }
                                        onCheckedChange={handleSelectAll}
                                    />
                                </TableHead>
                                <TableHead className="text-maintx dark:text-white">
                                    Счёт
                                </TableHead>
                                <TableHead className="text-maintx dark:text-white">
                                    Код
                                </TableHead>
                                <TableHead className="text-maintx dark:text-white">
                                    Статус
                                </TableHead>
                                <TableHead className="text-maintx dark:text-white">
                                    Балансы по методам
                                </TableHead>
                                <TableHead className="text-right text-maintx dark:text-white">
                                    Общий баланс
                                </TableHead>
                                <TableHead className="text-right text-maintx dark:text-white">
                                    Действия
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredAccounts.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={7}
                                        className="text-center py-8 text-gray-500"
                                    >
                                        Нет данных
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredAccounts.map((account) => (
                                    <TableRow
                                        key={account.account_id}
                                        className="border-dashed border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
                                    >
                                        <TableCell className="w-12">
                                            <Checkbox
                                                checked={selectedAccounts.includes(
                                                    account.account_id
                                                )}
                                                onCheckedChange={() =>
                                                    handleSelectAccount(
                                                        account.account_id
                                                    )
                                                }
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center space-x-3">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-mainbg/20 to-mainbg/40 flex items-center justify-center">
                                                    <span className="text-mainbg font-bold text-sm">
                                                        {account.name
                                                            .charAt(0)
                                                            .toUpperCase()}
                                                    </span>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                        {account.name}
                                                    </p>
                                                    <p className="text-xs text-gray-400">
                                                        ID: {account.account_id}
                                                    </p>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <code className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs text-gray-600 dark:text-gray-300">
                                                {account.code}
                                            </code>
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                variant={
                                                    account.is_active === "1"
                                                        ? "success"
                                                        : "warning"
                                                }
                                            >
                                                {account.is_active_text}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="space-y-1">
                                                {account.balances.map(
                                                    (balance) => (
                                                        <div
                                                            key={
                                                                balance.payment_method_id
                                                            }
                                                            className="flex items-center justify-between text-xs"
                                                        >
                                                            <span className="text-gray-600 dark:text-gray-400">
                                                                {
                                                                    balance.payment_method_name
                                                                }
                                                                :
                                                            </span>
                                                            <span
                                                                className={`font-medium ml-2 ${
                                                                    parseFloat(
                                                                        balance.balance
                                                                    ) > 0
                                                                        ? "text-green-600 dark:text-green-400"
                                                                        : "text-gray-600 dark:text-gray-400"
                                                                }`}
                                                            >
                                                                {formatBalance(
                                                                    balance.balance
                                                                )}{" "}
                                                                сум
                                                            </span>
                                                        </div>
                                                    )
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <span
                                                className={`font-bold text-base ${
                                                    account.total_balance > 0
                                                        ? "text-green-600 dark:text-green-400"
                                                        : "text-gray-600 dark:text-gray-400"
                                                }`}
                                            >
                                                {formatBalance(
                                                    account.total_balance
                                                )}{" "}
                                                <span className="text-xs">
                                                    сум
                                                </span>
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <button className="rounded-full outline-none focus:outline-none focus:ring-0 focus:border-0 focus-visible:outline-none focus-visible:ring-0 focus-visible:border-0 hover:bg-gray-200 dark:hover:bg-gray-700 p-2 transition-colors duration-200">
                                                        <HiDotsVertical className="w-4 h-4 text-gray-500" />
                                                    </button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem
                                                        className="flex items-center gap-2 text-violet-600 hover:text-violet-800 duration-300"
                                                        onClick={() =>
                                                            navigate(
                                                                `/accounts/${account.account_id}/transactions`
                                                            )
                                                        }
                                                    >
                                                        <MdOutlineSwapHoriz className="w-4 h-4" />
                                                        <span>Транзакции</span>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        className="flex items-center gap-2 text-maintx hover:text-maintx/80 duration-300"
                                                        onClick={() =>
                                                            navigate(
                                                                `/accounts/${account.account_id}/statistics`
                                                            )
                                                        }
                                                    >
                                                        <IoStatsChart className="w-4 h-4" />
                                                        <span>Статистика</span>
                                                    </DropdownMenuItem>
                                                    {/* <DropdownMenuItem className="flex items-center gap-2">
                                                        <CiEdit className="w-4 h-4" />
                                                        <span>
                                                            Редактировать
                                                        </span>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem className="flex items-center gap-2 text-red-600 hover:text-red-600">
                                                        <CiTrash className="w-4 h-4" />
                                                        <span>Удалить</span>
                                                    </DropdownMenuItem> */}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
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
        </div>
    );
};

export default Accountlist;
