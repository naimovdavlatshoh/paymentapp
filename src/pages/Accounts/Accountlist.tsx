import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
// @ts-ignore
import { GetDataSimple } from "@/service";
import { Badge } from "@/components/ui/badge";
// import CustomBreadcrumb from "@/components/ui/custom-breadcrumb";
import { Button } from "@/components/ui/button";
// import { IoMdAdd } from "react-icons/io";
import { ProgressAuto } from "@/components/ui/progress";
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
    const [currentPage] = useState(1);
    const [itemsPerPage] = useState(100);
    const [hoveredAccount, setHoveredAccount] = useState<string | null>(null);

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
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
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
                </div>
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
                </div>
            </div>

            {/* Accounts Cards */}
            {accounts.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                    Нет данных
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-8">
                    {accounts.map((account, index) => {
                        const isHovered = hoveredAccount === account.account_id;
                        const cardGradients = [
                            "from-blue-500 via-blue-600 to-indigo-700",
                            "from-purple-500 via-purple-600 to-pink-700",
                            "from-green-500 via-emerald-600 to-teal-700",
                            "from-orange-500 via-red-600 to-pink-700",
                            "from-cyan-500 via-blue-600 to-indigo-700",
                            "from-violet-500 via-purple-600 to-fuchsia-700",
                        ];
                        const gradient =
                            cardGradients[index % cardGradients.length];

                        return (
                            <div
                                key={account.account_id}
                                className="relative group"
                                onMouseEnter={() =>
                                    setHoveredAccount(account.account_id)
                                }
                                onMouseLeave={() => setHoveredAccount(null)}
                                onClick={(e) => {
                                    // Prevent card click if clicking on button area
                                    const target = e.target as HTMLElement;
                                    if (
                                        target.closest(
                                            "[data-dropdown-trigger]"
                                        )
                                    ) {
                                        e.stopPropagation();
                                    }
                                }}
                            >
                                {/* Plastic Card */}
                                <div
                                    className={`relative h-56 rounded-3xl bg-gradient-to-br ${gradient} shadow-xl hover:cursor-pointer transition-all duration-500 transform hover:scale-[1.02] hover:shadow-2xl overflow-hidden`}
                                >
                                    {/* Card Pattern Overlay */}
                                    <div className="absolute inset-0 opacity-10">
                                        <div
                                            className="absolute inset-0"
                                            style={{
                                                backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
                                                backgroundSize: "40px 40px",
                                            }}
                                        ></div>
                                    </div>

                                    {/* Card Content */}
                                    <div className="relative h-full p-6 flex flex-col justify-between text-white">
                                        {/* Top Section - Show account name always */}
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                {!isHovered && (
                                                    <Badge
                                                        variant={
                                                            account.is_active ===
                                                            "1"
                                                                ? "success"
                                                                : "warning"
                                                        }
                                                        className="bg-white/20 mb-3 backdrop-blur-sm text-white border-white/30"
                                                    >
                                                        {account.is_active_text}
                                                    </Badge>
                                                )}
                                                <h3 className="text-xl font-bold mb-1 line-clamp-1">
                                                    {account.name}
                                                </h3>
                                            </div>
                                        </div>

                                        {/* Action Button - Always visible */}
                                        <div
                                            className="absolute top-4 right-4 z-50"
                                            onMouseEnter={(e) =>
                                                e.stopPropagation()
                                            }
                                            onMouseLeave={(e) =>
                                                e.stopPropagation()
                                            }
                                        >
                                            <DropdownMenu
                                                onOpenChange={(open) => {
                                                    if (open) {
                                                        setHoveredAccount(
                                                            account.account_id
                                                        );
                                                    }
                                                }}
                                            >
                                                <DropdownMenuTrigger asChild>
                                                    <button
                                                        data-dropdown-trigger="true"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                        }}
                                                        onMouseDown={(e) => {
                                                            e.stopPropagation();
                                                        }}
                                                        onMouseUp={(e) => {
                                                            e.stopPropagation();
                                                        }}
                                                        className="relative z-50 rounded-full outline-none focus:outline-none focus:ring-0 focus:border-0 focus-visible:outline-none focus-visible:ring-0 focus-visible:border-0 hover:bg-white/20 p-2 transition-colors duration-200 pointer-events-auto"
                                                    >
                                                        <HiDotsVertical className="w-5 h-5 text-white" />
                                                    </button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent
                                                    align="end"
                                                    className="z-[100]"
                                                    onCloseAutoFocus={(e) =>
                                                        e.preventDefault()
                                                    }
                                                >
                                                    <DropdownMenuItem
                                                        className="flex items-center gap-2 text-violet-600 hover:text-violet-800 duration-300 cursor-pointer"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            navigate(
                                                                `/accounts/${account.account_id}/transactions`
                                                            );
                                                        }}
                                                    >
                                                        <MdOutlineSwapHoriz className="w-4 h-4" />
                                                        <span>Транзакции</span>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        className="flex items-center gap-2 text-maintx hover:text-maintx/80 duration-300 cursor-pointer"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            navigate(
                                                                `/accounts/${account.account_id}/statistics`
                                                            );
                                                        }}
                                                    >
                                                        <IoStatsChart className="w-4 h-4" />
                                                        <span>Статистика</span>
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>

                                        {/* Balance Section */}
                                        <div className="mt-auto">
                                            {!isHovered ? (
                                                <div>
                                                    <div className="text-xs opacity-80 mb-1">
                                                        Общий баланс
                                                    </div>
                                                    <div
                                                        className={`text-3xl font-bold ${
                                                            account.total_balance >
                                                            0
                                                                ? "text-white"
                                                                : "text-white/70"
                                                        }`}
                                                    >
                                                        {formatBalance(
                                                            account.total_balance
                                                        )}
                                                        <span className="text-lg ml-2">
                                                            сум
                                                        </span>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="space-y-2.5 animate-in fade-in duration-300 w-full mt-2">
                                                    {account.balances.length >
                                                    0 ? (
                                                        account.balances.map(
                                                            (balance) => (
                                                                <div
                                                                    key={
                                                                        balance.payment_method_id
                                                                    }
                                                                    className="flex items-center justify-between text-base"
                                                                >
                                                                    <span className="opacity-90 font-medium">
                                                                        {
                                                                            balance.payment_method_name
                                                                        }
                                                                        :
                                                                    </span>
                                                                    <span
                                                                        className={`font-semibold ${
                                                                            parseFloat(
                                                                                balance.balance
                                                                            ) >
                                                                            0
                                                                                ? "text-white"
                                                                                : "text-white/70"
                                                                        }`}
                                                                    >
                                                                        {formatBalance(
                                                                            balance.balance
                                                                        )}{" "}
                                                                        сум
                                                                    </span>
                                                                </div>
                                                            )
                                                        )
                                                    ) : (
                                                        <div className="text-base opacity-70">
                                                            Нет данных
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Shine Effect */}
                                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default Accountlist;
