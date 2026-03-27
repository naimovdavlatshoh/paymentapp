import { useState, useEffect } from "react";
// @ts-ignore
import { GetDataSimple, DownloadFile } from "@/service";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { showErrorToast } from "@/utils/toast-utils";
import CustomModal from "@/components/ui/custom-modal";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface Account {
    account_id: string;
    name: string;
    code: string;
}

interface ExportTransactionsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const ExportTransactionsModal = ({ isOpen, onClose }: ExportTransactionsModalProps) => {
    const [loading, setLoading] = useState(false);
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [dateFrom, setDateFrom] = useState<Date | undefined>(undefined);
    const [dateTo, setDateTo] = useState<Date | undefined>(undefined);
    const [type, setType] = useState<string>("all");
    const [accountId, setAccountId] = useState<string>("all");

    // Fetch Accounts
    const fetchAccounts = async () => {
        try {
            const response = await GetDataSimple("api/finance/accounts?page=1&limit=100");
            if (response && response.result) {
                setAccounts(response.result);
            }
        } catch (err) {
            console.error("Error fetching accounts:", err);
        }
    };

    useEffect(() => {
        if (isOpen) {
            fetchAccounts();
        }
    }, [isOpen]);

    const handleExport = async () => {
        setLoading(true);

        try {
            let queryParams = [];
            if (dateFrom) queryParams.push(`date_from=${format(dateFrom, "yyyy-MM-dd")}`);
            if (dateTo) queryParams.push(`date_to=${format(dateTo, "yyyy-MM-dd")}`);
            if (type !== "all") queryParams.push(`type=${type}`);
            if (accountId !== "all") queryParams.push(`account_id=${accountId}`);

            const queryString = queryParams.length > 0 ? `?${queryParams.join("&")}` : "";
            const response = await DownloadFile(`api/finance/transactions/export${queryString}`);

            // Download logic
            const blob = new Blob([response.data], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", `transactions_${format(new Date(), "yyyy-MM-dd_HH-mm")}.xlsx`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);

            toast.success("Excel файл успешно скачан!");
            onClose();
        } catch (err: any) {
            console.error("Export error:", err);
            showErrorToast(err, "Ошибка при экспорте транзакций");
        } finally {
            setLoading(false);
        }
    };

    return (
        <CustomModal
            showTrigger={false}
            open={isOpen}
            onOpenChange={onClose}
            title="Экспорт транзакций в Excel"
            confirmText={loading ? "Загрузка..." : "Скачать Excel"}
            cancelText="Отмена"
            confirmBg="bg-green-600"
            confirmBgHover="bg-green-700"
            onConfirm={handleExport}
            onCancel={onClose}
            size="lg"
            showCloseButton={true}
        >
            <div className="space-y-4 py-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Date From */}
                    <div className="space-y-2">
                        <Label>Дата от</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    className={cn(
                                        "w-full justify-start text-left font-normal",
                                        !dateFrom && "text-muted-foreground"
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {dateFrom ? format(dateFrom, "dd.MM.yyyy") : <span>Выберите дату</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
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
                                        !dateTo && "text-muted-foreground"
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {dateTo ? format(dateTo, "dd.MM.yyyy") : <span>Выберите дату</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                    mode="single"
                                    selected={dateTo}
                                    onSelect={setDateTo}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                    </div>

                    {/* Type Filter */}
                    <div className="space-y-2">
                        <Label>Тип транзакции</Label>
                        <Select value={type} onValueChange={setType}>
                            <SelectTrigger>
                                <SelectValue placeholder="Все типы" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Все</SelectItem>
                                <SelectItem value="deposit">Пополнение</SelectItem>
                                <SelectItem value="withdraw">Снятие</SelectItem>
                                <SelectItem value="transfer">Перевод</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Account Filter */}
                    <div className="space-y-2">
                        <Label>Счёт</Label>
                        <Select value={accountId} onValueChange={setAccountId}>
                            <SelectTrigger>
                                <SelectValue placeholder="Все счета" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Все</SelectItem>
                                {accounts.map((account) => (
                                    <SelectItem key={account.account_id} value={account.account_id.toString()}>
                                        {account.name} ({account.code})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>
        </CustomModal>
    );
};

export default ExportTransactionsModal;
