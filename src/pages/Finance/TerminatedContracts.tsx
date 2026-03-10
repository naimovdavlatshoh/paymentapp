import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
// @ts-ignore
import { GetDataSimple, DeleteData } from "@/service";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ProgressAuto } from "@/components/ui/progress";
import CustomPagination from "@/components/ui/custom-pagination";
import { FileX2, MoreVertical, Eye, CalendarDays, Trash2, CreditCard } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import CustomModal from "@/components/ui/custom-modal";
import { showErrorToast } from "@/utils/toast-utils";
import CreateTerminatedPaymentModal from "./CreateTerminatedPaymentModal";

interface TerminatedContract {
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
    total_to_return: string;
    initial_payment: string;
    initial_payment_status: string;
    created_at: string;
    total_paid: string;
    total_remaining: string;
}

const TerminatedContracts = () => {
    const navigate = useNavigate();
    const [contracts, setContracts] = useState<TerminatedContract[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [itemsPerPage] = useState(20);

    // Delete state
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deleting, setDeleting] = useState(false);

    // Payment modal state
    const [paymentOpen, setPaymentOpen] = useState(false);
    const [selectedContractId, setSelectedContractId] = useState<string | null>(null);

    const openDetail = (id: string) => {
        navigate(`/terminated-contracts/${id}`);
    };

    const openPlan = (id: string) => {
        navigate(`/terminated-contracts/${id}/plan`);
    };

    const handleDeleteClick = (id: string) => {
        setDeleteId(id);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!deleteId) return;
        setDeleting(true);
        try {
            await DeleteData(`api/finance/terminated-contracts/${deleteId}`);
            toast.success("Контракт успешно удалён");
            setIsDeleteModalOpen(false);
            setDeleteId(null);
            fetchContracts();
        } catch (err: any) {
            showErrorToast(err, "Ошибка при удалении контракта");
        } finally {
            setDeleting(false);
        }
    };

    const fetchContracts = async () => {
        setLoading(true);
        setError("");
        try {
            const response = await GetDataSimple(
                `api/finance/terminated-contracts?page=${currentPage}&limit=${itemsPerPage}`
            );
            if (response) {
                setContracts(response.result || []);
                setTotalPages(response.pages || 1);
            }
        } catch (err: any) {
            console.error("Error fetching terminated contracts:", err);
            const msg =
                err.response?.data?.message ||
                err.response?.data?.error ||
                "Ошибка при загрузке расторгнутых контрактов";
            setError(msg);
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchContracts();
    }, [currentPage]);

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
        });
    };

    const getContractType = (type: string) => {
        const types: Record<string, string> = {
            "1": "Рассрочка",
            "2": "Ипотека",
            "3": "Наличные",
        };
        return types[type] || type;
    };

    const getContractTypeCls = (type: string) => {
        const map: Record<string, string> = {
            "1": "border-violet-300 text-violet-600 bg-violet-50 dark:border-violet-600 dark:text-violet-400 dark:bg-violet-900/10",
            "2": "border-blue-300 text-blue-600 bg-blue-50 dark:border-blue-600 dark:text-blue-400 dark:bg-blue-900/10",
            "3": "border-green-300 text-green-600 bg-green-50 dark:border-green-600 dark:text-green-400 dark:bg-green-900/10",
        };
        return map[type] ?? "border-gray-300 text-gray-600 dark:border-gray-600 dark:text-gray-400";
    };

    const getCashType = (type: string) => {
        const types: Record<string, string> = {
            "1": "Наличные",
            "2": "Безналичные",
        };
        return types[type] || type;
    };

    const getCashTypeCls = (type: string) => {
        const map: Record<string, string> = {
            "1": "border-green-300 text-green-600 bg-green-50 dark:border-green-600 dark:text-green-400 dark:bg-green-900/10",
            "2": "border-blue-300 text-blue-600 bg-blue-50 dark:border-blue-600 dark:text-blue-400 dark:bg-blue-900/10",
        };
        return map[type] ?? "border-gray-300 text-gray-600 dark:border-gray-600 dark:text-gray-400";
    };

    if (loading) {
        return (
            <div className="h-[80vh] w-full flex justify-center items-center">
                <div className="w-[400px]">
                    <ProgressAuto durationMs={500} startDelayMs={10} className="h-1 rounded-full" />
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6">
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
                    <div className="text-center py-8">
                        <p className="text-red-600 dark:text-red-400">{error}</p>
                        <Button onClick={() => fetchContracts()} className="mt-4">
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
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-1">
                <div className="flex items-center gap-3">
                    
                    <div>
                        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
                            Расторгнутые контракты
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                            Всего: <span className="font-medium text-gray-700 dark:text-gray-300">{contracts.length}</span>
                        </p>
                    </div>
                </div>
            </div>

            {/* Table */}
            <Card className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader className="bg-mainbg/10">
                                <TableRow>
                                    <TableHead className="text-maintx dark:text-white w-12">#</TableHead>
                                    <TableHead className="text-maintx dark:text-white">№ Контракта</TableHead>
                                    <TableHead className="text-maintx dark:text-white">Клиент</TableHead>
                                    <TableHead className="text-maintx dark:text-white">Квартира</TableHead>
                                    <TableHead className="text-maintx dark:text-white">Тип</TableHead>
                                    <TableHead className="text-maintx dark:text-white">Оплата</TableHead>
                                    <TableHead className="text-maintx dark:text-white">Дата</TableHead>
                                    <TableHead className="text-maintx dark:text-white text-right">Общая сумма</TableHead>
                                    <TableHead className="text-maintx dark:text-white text-right">Оплачено</TableHead>
                                    <TableHead className="text-maintx dark:text-white text-right">Остаток</TableHead>
                                    <TableHead className="text-maintx dark:text-white w-12"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {contracts.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={10}
                                            className="text-center py-16 text-gray-500"
                                        >
                                            <div className="flex flex-col items-center gap-3">
                                                <FileX2 className="w-12 h-12 text-gray-300" />
                                                <span>Расторгнутых контрактов нет</span>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    contracts.map((contract, index) => (
                                        <TableRow
                                            key={contract.terminated_contract_id}
                                            className="border-dashed border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/60"
                                        >
                                            {/* # */}
                                            <TableCell className="text-gray-400 text-sm font-medium">
                                                {(currentPage - 1) * itemsPerPage + index + 1}
                                            </TableCell>

                                            {/* Контракт № */}
                                            <TableCell>
                                                <span className="font-semibold text-maintx dark:text-blue-400">
                                                    {contract.contract_number}
                                                </span>
                                            </TableCell>

                                            {/* Клиент */}
                                            <TableCell className="font-medium text-gray-800 dark:text-white whitespace-nowrap">
                                                {contract.client_name}
                                            </TableCell>

                                            {/* Квартира */}
                                            <TableCell className="text-gray-600 dark:text-gray-300">
                                                {contract.apartment_number || "—"}
                                            </TableCell>

                                            {/* Тип контракта */}
                                            <TableCell>
                                                <Badge
                                                    variant="outline"
                                                    className={`text-xs whitespace-nowrap ${getContractTypeCls(contract.contract_type)}`}
                                                >
                                                    {getContractType(contract.contract_type)}
                                                </Badge>
                                            </TableCell>

                                            {/* Тип оплаты */}
                                            <TableCell>
                                                <Badge
                                                    variant="outline"
                                                    className={`text-xs whitespace-nowrap ${getCashTypeCls(contract.contract_cash_type)}`}
                                                >
                                                    {getCashType(contract.contract_cash_type)}
                                                </Badge>
                                            </TableCell>

                                            {/* Дата */}
                                            <TableCell className="text-gray-500 dark:text-gray-400 whitespace-nowrap text-sm">
                                                {formatDate(contract.created_at)}
                                            </TableCell>

                                            {/* Общая сумма */}
                                            <TableCell className="text-right font-semibold text-gray-800 dark:text-white whitespace-nowrap">
                                                {formatPrice(contract.total_to_return)}{" "}
                                                <span className="text-xs font-normal text-gray-400"></span>
                                            </TableCell>

                                            {/* Оплачено */}
                                            <TableCell className="text-right whitespace-nowrap">
                                                <span className="font-semibold text-green-600 dark:text-green-400">
                                                    {formatPrice(contract.total_paid)}
                                                </span>{" "}
                                            </TableCell>

                                            {/* Остаток */}
                                            <TableCell className="text-right whitespace-nowrap">
                                                <span className="font-bold text-red-500 dark:text-red-400">
                                                    {formatPrice(contract.total_remaining)}
                                                </span>{" "}
                                            </TableCell>

                                             {/* Actions */}
                                             <TableCell className="text-right px-3">
                                                 <DropdownMenu>
                                                     <DropdownMenuTrigger asChild>
                                                         <Button
                                                             variant="ghost"
                                                             size="sm"
                                                             className="h-8 w-8 p-0 rounded-full"
                                                         >
                                                             <MoreVertical className="h-4 w-4" />
                                                         </Button>
                                                     </DropdownMenuTrigger>
                                                     <DropdownMenuContent align="end" className="w-44 rounded-xl">
                                                         <DropdownMenuItem
                                                             onClick={() => openDetail(contract.terminated_contract_id)}
                                                             className="flex items-center gap-2 cursor-pointer"
                                                         >
                                                             <Eye className="w-4 h-4 text-maintx" />
                                                             <span>Подробнее</span>
                                                         </DropdownMenuItem>
                                                          <DropdownMenuItem
                                                              onClick={() => openPlan(contract.terminated_contract_id)}
                                                              className="flex items-center gap-2 cursor-pointer"
                                                          >
                                                              <CalendarDays className="w-4 h-4 text-purple-500" />
                                                              <span>График</span>
                                                          </DropdownMenuItem>
                                                          <DropdownMenuItem
                                                              onClick={() => {
                                                                  setSelectedContractId(contract.terminated_contract_id);
                                                                  setPaymentOpen(true);
                                                              }}
                                                              className="flex items-center gap-2 cursor-pointer text-green-600 focus:text-green-600"
                                                          >
                                                              <CreditCard className="w-4 h-4" />
                                                              <span>Оплата</span>
                                                          </DropdownMenuItem>
                                                     <DropdownMenuItem
                                                         onClick={() => handleDeleteClick(contract.terminated_contract_id)}
                                                         className="flex items-center gap-2 cursor-pointer text-red-500 focus:text-red-500"
                                                     >
                                                         <Trash2 className="w-4 h-4" />
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
                {totalPages > 1 && (
                    <div className="p-4 border-t border-gray-100 dark:border-gray-700">
                        <CustomPagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={setCurrentPage}
                        />
                    </div>
                )}
            </Card>

            {/* ── Delete confirm modal ────────────────────────────── */}
            <CustomModal
                showTrigger={false}
                open={isDeleteModalOpen}
                onOpenChange={(open) => {
                    if (!open) {
                        setIsDeleteModalOpen(false);
                        setDeleteId(null);
                    }
                }}
                title="Подтверждение удаления"
                confirmText={deleting ? "Удаление..." : "Удалить"}
                cancelText="Отмена"
                confirmVariant="destructive"
                confirmBg="bg-red-500"
                confirmBgHover="bg-red-600"
                onConfirm={confirmDelete}
                onCancel={() => {
                    setIsDeleteModalOpen(false);
                    setDeleteId(null);
                }}
            >
                <div className="py-2 space-y-3">
                    <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-xl">
                        <Trash2 className="w-5 h-5 text-red-500 shrink-0" />
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                            Вы уверены, что хотите удалить этот расторгнутый контракт?
                        </p>
                    </div>
                </div>
            </CustomModal>

            {/* ── Payment modal ─────────────────────────────────────── */}
            <CreateTerminatedPaymentModal
                isOpen={paymentOpen}
                selectedContractId={selectedContractId}
                onClose={() => {
                    setPaymentOpen(false);
                    setTimeout(() => setSelectedContractId(null), 200);
                }}
                onSuccess={() => {
                    setPaymentOpen(false);
                    setSelectedContractId(null);
                    fetchContracts();
                }}
            />
        </div>
    );
};

export default TerminatedContracts;
