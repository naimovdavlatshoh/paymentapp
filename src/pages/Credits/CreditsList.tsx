import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
// @ts-ignore
import { GetDataSimple, DeleteData } from "@/service";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { showErrorToast } from "@/utils/toast-utils";
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
import { Eye, Trash2, MoreVertical, CreditCard } from "lucide-react";
import CreditPlanModal from "./CreditPlanModal";
import CreatePaymentModal from "./CreatePaymentModal";
import CustomModal from "@/components/ui/custom-modal";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Credit {
    id: number;
    credit_name: string;
    bank_name: string;
    date_of_receipt: string;
    interest_rate: string | number;
    credit_period: number;
    credit_price: string;
    total_credit_price: string;
    created_at: string;
}

const CreditsList = () => {
    const navigate = useNavigate();
    const [credits, setCredits] = useState<Credit[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [itemsPerPage] = useState(20);
    
    const [selectedCreditId, setSelectedCreditId] = useState<number | null>(null);
    const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [creditToDelete, setCreditToDelete] = useState<number | null>(null);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [creditForPayment, setCreditForPayment] = useState<number | null>(null);

    const fetchCredits = async () => {
        setLoading(true);
        setError("");
        try {
            const response = await GetDataSimple(`api/finance/credits?page=${currentPage}&limit=${itemsPerPage}`);
            if (response) {
                setCredits(response.result || []);
                setTotalPages(response.pages || 1);
            }
        } catch (err: any) {
            console.error("Error fetching credits:", err);
            const msg = err.response?.data?.message || err.response?.data?.error || "Ошибка при загрузке кредитов";
            setError(msg);
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = (id: number) => {
        setCreditToDelete(id);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!creditToDelete) return;
        
        try {
            const response = await DeleteData(`api/finance/credits/${creditToDelete}`);
            if (response) {
                toast.success("Кредит успешно удален");
                fetchCredits();
            }
        } catch (err: any) {
            console.error("Delete credit error:", err);
            showErrorToast(err, "Ошибка при удалении кредита");
        } finally {
            setIsDeleteModalOpen(false);
            setCreditToDelete(null);
        }
    };

    useEffect(() => {
        fetchCredits();
    }, [currentPage]);

    const formatPrice = (price: string | number) => {
        const num = typeof price === "string" ? parseFloat(price) : price;
        return new Intl.NumberFormat("ru-RU").format(num);
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
                        <Button onClick={() => fetchCredits()} className="mt-4">
                            Попробовать снова
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-10">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-1">
                <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Кредиты</h1>
                <Button 
                    onClick={() => navigate("/credits/create")}
                    className="bg-maintx text-white hover:bg-maintx/80 rounded-xl"
                >
                    <IoMdAdd className="w-4 h-4 mr-1" />
                    Добавить кредит
                </Button>
            </div>

            <Card className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader className="bg-mainbg/10">
                                <TableRow>
                                    <TableHead className="text-maintx dark:text-white">Название</TableHead>
                                    <TableHead className="text-maintx dark:text-white">Банк</TableHead>
                                    <TableHead className="text-maintx dark:text-white">Дата получения</TableHead>
                                    <TableHead className="text-maintx dark:text-white text-center">Ставка (%)</TableHead>
                                    <TableHead className="text-maintx dark:text-white text-center">Срок (мес)</TableHead>
                                    <TableHead className="text-maintx dark:text-white">Сумма</TableHead>
                                    <TableHead className="text-maintx dark:text-white">Итого к возврату</TableHead>
                                    <TableHead className="text-right text-maintx dark:text-white px-6">Действия</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {credits.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={8} className="text-center py-12 text-gray-500">
                                            Нет данных
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    credits.map((credit) => (
                                        <TableRow key={credit.id} className="border-dashed border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800">
                                            <TableCell className="font-bold text-gray-900 dark:text-white">{credit.credit_name}</TableCell>
                                            <TableCell>{credit.bank_name}</TableCell>
                                            <TableCell className="whitespace-nowrap">
                                                {new Date(credit.date_of_receipt).toLocaleDateString("ru-RU")}
                                            </TableCell>
                                            <TableCell className="text-center font-medium">{credit.interest_rate}%</TableCell>
                                            <TableCell className="text-center font-medium">{credit.credit_period}</TableCell>
                                            <TableCell className="whitespace-nowrap font-semibold">
                                                {formatPrice(credit.credit_price)} <span className="text-xs font-normal">сум</span>
                                            </TableCell>
                                            <TableCell className="whitespace-nowrap font-bold text-maintx dark:text-white">
                                                {formatPrice(credit.total_credit_price)} <span className="text-xs font-normal">сум</span>
                                            </TableCell>
                                            <TableCell className="text-right px-6">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full">
                                                            <MoreVertical className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="w-48 rounded-xl">
                                                        <DropdownMenuItem 
                                                            onClick={() => {
                                                                setCreditForPayment(credit.id);
                                                                setIsPaymentModalOpen(true);
                                                            }}
                                                            className="flex items-center gap-2 cursor-pointer"
                                                        >
                                                            <CreditCard className="w-4 h-4 text-green-500" />
                                                            <span>Оплатить</span>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem 
                                                            onClick={() => {
                                                                setSelectedCreditId(credit.id);
                                                                setIsPlanModalOpen(true);
                                                            }}
                                                            className="flex items-center gap-2 cursor-pointer"
                                                        >
                                                            <Eye className="w-4 h-4 text-maintx" />
                                                            <span>График платежей</span>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem 
                                                            onClick={() => handleDelete(credit.id)}
                                                            className="flex items-center gap-2 cursor-pointer text-red-500 focus:text-red-500"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                            <span>Удалить кредит</span>
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


            {selectedCreditId && (
                <CreditPlanModal 
                    isOpen={isPlanModalOpen} 
                    onClose={() => {
                        setIsPlanModalOpen(false);
                        setSelectedCreditId(null);
                    }} 
                    creditId={selectedCreditId}
                />
            )}

            <CreatePaymentModal 
                isOpen={isPaymentModalOpen}
                onClose={() => {
                    setIsPaymentModalOpen(false);
                    setCreditForPayment(null);
                }}
                onSuccess={() => {
                    fetchCredits(); // Refresh list if needed, though payments reflect in plan
                }}
                initialCreditId={creditForPayment}
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
                        Вы уверены, что хотите удалить этот кредит? Bu amalni ortga qaytarib bo'lmaydi.
                    </p>
                </div>
            </CustomModal>
        </div>
    );
};

export default CreditsList;
