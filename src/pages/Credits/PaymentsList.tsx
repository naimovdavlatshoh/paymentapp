import { useState, useEffect } from "react";
// @ts-ignore
import { GetDataSimple, DeleteData } from "@/service";
import { Card, CardContent } from "@/components/ui/card";
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
import { IoMdAdd } from "react-icons/io";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { showErrorToast } from "@/utils/toast-utils";
import CreatePaymentModal from "./CreatePaymentModal";
import CustomModal from "@/components/ui/custom-modal";

interface Payment {
    id: number;
    credit_id: number;
    credit_name: string;
    payment_amount: string;
    payment_method_name: string;
    comments: string | null;
    created_at: string;
}

const PaymentsList = () => {
    const [payments, setPayments] = useState<Payment[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [itemsPerPage] = useState(20);

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [paymentToDelete, setPaymentToDelete] = useState<number | null>(null);

    const fetchPayments = async () => {
        setLoading(true);
        try {
            const response = await GetDataSimple(`api/finance/credits/payments?page=${currentPage}&limit=${itemsPerPage}`);
            if (response) {
                setPayments(response.result || []);
                setTotalPages(response.pages || 1);
            }
        } catch (err: any) {
            console.error("Error fetching payments:", err);
            showErrorToast(err, "Ошибка при загрузке оплат");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPayments();
    }, [currentPage]);

    const formatPrice = (price: string | number) => {
        const num = typeof price === "string" ? parseFloat(price) : price;
        return new Intl.NumberFormat("ru-RU").format(num);
    };

    const handleDelete = (id: number) => {
        setPaymentToDelete(id);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!paymentToDelete) return;
        
        try {
            const response = await DeleteData(`api/finance/credits/payments/${paymentToDelete}`);
            if (response) {
                toast.success("Оплата успешно удалена");
                fetchPayments();
            }
        } catch (err: any) {
            console.error("Delete payment error:", err);
            showErrorToast(err, "Ошибка при удалении оплаты");
        } finally {
            setIsDeleteModalOpen(false);
            setPaymentToDelete(null);
        }
    };

    if (loading && payments.length === 0) {
        return (
            <div className="h-[80vh] w-full flex justify-center items-center">
                <div className="w-[400px]">
                    <ProgressAuto durationMs={500} startDelayMs={10} className="h-1 rounded-full" />
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-10">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-1">
                <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Оплаты по кредитам</h1>
                <Button 
                    onClick={() => setIsCreateModalOpen(true)}
                    className="bg-maintx text-white hover:bg-maintx/80 rounded-xl"
                >
                    <IoMdAdd className="w-4 h-4 mr-1" />
                    Добавить оплату
                </Button>
            </div>

            <Card className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader className="bg-mainbg/10">
                                <TableRow>
                                    <TableHead className="text-maintx dark:text-white">ID</TableHead>
                                    <TableHead className="text-maintx dark:text-white">Кредит</TableHead>
                                    <TableHead className="text-maintx dark:text-white">Сумма</TableHead>
                                    <TableHead className="text-maintx dark:text-white">Метод</TableHead>
                                    <TableHead className="text-maintx dark:text-white">Комментарий</TableHead>
                                    <TableHead className="text-maintx dark:text-white">Дата</TableHead>
                                    <TableHead className="text-right text-maintx dark:text-white px-6">Действия</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {payments.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center py-12 text-gray-500">
                                            Нет данных
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    payments.map((payment) => (
                                        <TableRow key={payment.id} className="border-dashed border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800">
                                            <TableCell className="font-medium">#{payment.id}</TableCell>
                                            <TableCell className="font-semibold">{payment.credit_name}</TableCell>
                                            <TableCell className="whitespace-nowrap font-bold text-maintx dark:text-white">
                                                {formatPrice(payment.payment_amount)} <span className="text-xs font-normal">сум</span>
                                            </TableCell>
                                            <TableCell>{payment.payment_method_name}</TableCell>
                                            <TableCell className="max-w-[200px] truncate">{payment.comments || "—"}</TableCell>
                                            <TableCell className="whitespace-nowrap">
                                                {new Date(payment.created_at).toLocaleDateString("ru-RU")}
                                            </TableCell>
                                            <TableCell className="text-right px-6">
                                                <Button 
                                                    variant="ghost" 
                                                    size="sm"
                                                    className="rounded-lg hover:bg-red-50 hover:text-red-500 text-gray-400"
                                                    onClick={() => handleDelete(payment.id)}
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

            <CreatePaymentModal 
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSuccess={fetchPayments}
            />

            <CustomModal
                showTrigger={false}
                open={isDeleteModalOpen}
                onOpenChange={setIsDeleteModalOpen}
                title="Подтверждение удаления"
                confirmText="Удалить"
                cancelText="Отмена"
                confirmVariant="destructive"
                confirmBg="bg-red-500"
                confirmBgHover="bg-red-600"
                onConfirm={confirmDelete}
            >
                <div className="py-2">
                    <p className="text-gray-600 dark:text-gray-400">
                        Вы уверены, что хотите удалить эту оплату?
                    </p>
                </div>
            </CustomModal>
        </div>
    );
};

export default PaymentsList;
