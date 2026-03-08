import { useState, useEffect } from "react";
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
import { Badge } from "@/components/ui/badge";
import { Wallet, Plus, Trash2 } from "lucide-react";
import CustomModal from "@/components/ui/custom-modal";
import { showErrorToast } from "@/utils/toast-utils";
import CreateTerminatedPaymentModal from "./CreateTerminatedPaymentModal";

interface Payment {
    payment_id: string;
    terminated_contract_id: string;
    contract_number: string;
    client_name: string;
    apartment_number: string;
    price_type: string;
    price_type_text: string;
    payment_amount: string;
    payment_method: string;
    payment_method_text: string;
    comments: string;
    operator_name: string;
    created_at: string;
}

const TerminatedContractPayments = () => {
    const [payments, setPayments] = useState<Payment[]>([]);
    const [totalCount, setTotalCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [itemsPerPage] = useState(20);
    const [createOpen, setCreateOpen] = useState(false);

    // Delete state
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const handleDeleteClick = (id: string) => {
        setDeleteId(id);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!deleteId) return;
        setDeleting(true);
        try {
            await DeleteData(`api/finance/terminated-contracts/payments/${deleteId}`);
            toast.success("Оплата успешно удалена");
            setIsDeleteModalOpen(false);
            setDeleteId(null);
            fetchPayments();
        } catch (err: any) {
            showErrorToast(err, "Ошибка при удалении оплаты");
        } finally {
            setDeleting(false);
        }
    };

    const fetchPayments = async () => {
        setLoading(true);
        setError("");
        try {
            const response = await GetDataSimple(
                `api/finance/terminated-contracts/payments?page=${currentPage}&limit=${itemsPerPage}`
            );
            if (response) {
                setPayments(response.result || []);
                setTotalPages(response.pages || 1);
                setTotalCount(response.count || 0);
            }
        } catch (err: any) {
            const msg =
                err.response?.data?.message ||
                err.response?.data?.error ||
                "Ошибка при загрузке оплат";
            setError(msg);
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPayments();
    }, [currentPage]);

    /* ── Formatters ──────────────────────────────────────────────── */
    const formatPrice = (val: string | number | undefined) => {
        if (!val) return "—";
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
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const getMethodCls = (method: string) => {
        const map: Record<string, string> = {
            "1": "border-green-300 text-green-600 bg-green-50 dark:border-green-600 dark:text-green-400 dark:bg-green-900/10",
            "2": "border-blue-300 text-blue-600 bg-blue-50 dark:border-blue-600 dark:text-blue-400 dark:bg-blue-900/10",
            "3": "border-purple-300 text-purple-600 bg-purple-50 dark:border-purple-600 dark:text-purple-400 dark:bg-purple-900/10",
            "4": "border-orange-300 text-orange-600 bg-orange-50 dark:border-orange-600 dark:text-orange-400 dark:bg-orange-900/10",
        };
        return map[method] ?? "border-gray-300 text-gray-600 dark:border-gray-600 dark:text-gray-400";
    };

    const getPriceTypeCls = (type: string) => {
        const map: Record<string, string> = {
            "1": "border-green-300 text-green-600 bg-green-50 dark:border-green-600 dark:text-green-400 dark:bg-green-900/10",
            "2": "border-blue-300 text-blue-600 bg-blue-50 dark:border-blue-600 dark:text-blue-400 dark:bg-blue-900/10",
            "3": "border-violet-300 text-violet-600 bg-violet-50 dark:border-violet-600 dark:text-violet-400 dark:bg-violet-900/10",
        };
        return map[type] ?? "border-gray-300 text-gray-600 dark:border-gray-600 dark:text-gray-400";
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
    if (error) {
        return (
            <div className="p-6">
                <Card className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6">
                    <div className="text-center py-8">
                        <p className="text-red-600 dark:text-red-400">{error}</p>
                        <Button onClick={fetchPayments} className="mt-4">Попробовать снова</Button>
                    </div>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-10">

            {/* ── Header ───────────────────────────────────────────── */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-1">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
                        Оплата контрактов
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                        Всего: <span className="font-medium text-gray-700 dark:text-gray-300">{totalCount}</span>
                    </p>
                </div>
                <Button
                    onClick={() => setCreateOpen(true)}
                    className="mt-3 sm:mt-0 flex items-center gap-2 rounded-xl"
                >
                    <Plus className="w-4 h-4" />
                    Добавить оплату
                </Button>
            </div>

            {/* ── Table ────────────────────────────────────────────── */}
            <Card className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader className="bg-mainbg/10">
                                <TableRow>
                                    <TableHead className="text-maintx dark:text-white w-12">#</TableHead>
                                    <TableHead className="text-maintx dark:text-white">№ Контракта</TableHead>
                                    <TableHead className="text-maintx dark:text-white">Клиент</TableHead>
                                    <TableHead className="text-maintx dark:text-white">Квартира</TableHead>
                                    <TableHead className="text-maintx dark:text-white">Тип оплаты</TableHead>
                                    <TableHead className="text-maintx dark:text-white text-right">Сумма</TableHead>
                                    <TableHead className="text-maintx dark:text-white">Метод</TableHead>
                                    <TableHead className="text-maintx dark:text-white">Оператор</TableHead>
                                    <TableHead className="text-maintx dark:text-white">Комментарий</TableHead>
                                    <TableHead className="text-maintx dark:text-white">Дата</TableHead>
                                    <TableHead className="text-maintx dark:text-white w-12"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {payments.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={11} className="text-center py-16 text-gray-400">
                                            <div className="flex flex-col items-center gap-3">
                                                <Wallet className="w-12 h-12 text-gray-200" />
                                                <span>Оплат не найдено</span>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    payments.map((p, idx) => (
                                        <TableRow
                                            key={p.payment_id}
                                            className="border-dashed border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/60"
                                        >
                                            {/* # */}
                                            <TableCell className="text-gray-400 text-sm">
                                                {(currentPage - 1) * itemsPerPage + idx + 1}
                                            </TableCell>

                                            {/* № Контракта */}
                                            <TableCell className="font-semibold text-gray-800 dark:text-white whitespace-nowrap">
                                                {p.contract_number}
                                            </TableCell>

                                            {/* Клиент */}
                                            <TableCell className="text-gray-700 dark:text-gray-300 whitespace-nowrap">
                                                {p.client_name}
                                            </TableCell>

                                            {/* Квартира */}
                                            <TableCell className="text-gray-600 dark:text-gray-400">
                                                {p.apartment_number || "—"}
                                            </TableCell>

                                            {/* Тип оплаты */}
                                            <TableCell>
                                                <Badge variant="outline" className={`text-xs whitespace-nowrap ${getPriceTypeCls(p.price_type)}`}>
                                                    {p.price_type_text}
                                                </Badge>
                                            </TableCell>

                                            {/* Сумма */}
                                            <TableCell className="text-right font-bold text-gray-900 dark:text-white whitespace-nowrap">
                                                {formatPrice(p.payment_amount)}
                                            </TableCell>

                                            {/* Метод */}
                                            <TableCell>
                                                <Badge variant="outline" className={`text-xs whitespace-nowrap ${getMethodCls(p.payment_method)}`}>
                                                    {p.payment_method_text}
                                                </Badge>
                                            </TableCell>

                                            {/* Оператор */}
                                            <TableCell className="text-gray-600 dark:text-gray-400 text-sm whitespace-nowrap">
                                                {p.operator_name || "—"}
                                            </TableCell>

                                            {/* Комментарий */}
                                            <TableCell className="text-gray-500 dark:text-gray-400 text-sm max-w-[160px] truncate">
                                                {p.comments || "—"}
                                            </TableCell>

                                            {/* Дата */}
                                            <TableCell className="text-gray-500 dark:text-gray-400 text-sm whitespace-nowrap">
                                                {formatDate(p.created_at)}
                                            </TableCell>

                                            {/* Actions */}
                                            <TableCell className="text-right px-3">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleDeleteClick(p.payment_id)}
                                                    className="h-8 w-8 p-0 rounded-full text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
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

            {/* ── Create modal ─────────────────────────────────────── */}
            <CreateTerminatedPaymentModal
                isOpen={createOpen}
                onClose={() => setCreateOpen(false)}
                onSuccess={() => {
                    setCreateOpen(false);
                    setCurrentPage(1);
                    fetchPayments();
                }}
            />

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
                            Вы уверены, что хотите удалить эту оплату?
                        </p>
                    </div>
                </div>
            </CustomModal>
        </div>
    );
};

export default TerminatedContractPayments;
