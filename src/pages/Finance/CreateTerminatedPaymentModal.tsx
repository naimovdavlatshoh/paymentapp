import { useState, useEffect } from "react";
// @ts-ignore
import { GetDataSimple, PostDataTokenJson } from "@/service";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import CustomModal from "@/components/ui/custom-modal";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { showErrorToast } from "@/utils/toast-utils";
import { User, Home, Hash, Calendar, Banknote, Loader2 } from "lucide-react";

interface TerminatedContract {
    terminated_contract_id: string;
    contract_number: string;
    client_name: string;
}

interface PriceItem {
    id: string;
    terminated_contract_id: string;
    price_type: string;
    price_type_text: string;
    total_price: string;
    payment_status: string;
    payment_status_text: string;
    created_at: string;
}

interface ContractDetail {
    terminated_contract_id: string;
    contract_id: string;
    contract_number: string;
    client_name: string;
    apartment_number: string;
    created_at: string;
    total_price: string;
    prices: PriceItem[];
}

interface Props {
    isOpen: boolean;
    selectedContractId?: string | null;
    onClose: () => void;
    onSuccess: () => void;
}

const PAYMENT_METHODS = [
    { id: "1", name: "Наличка" },
    { id: "2", name: "Карта-Терминал" },
    { id: "3", name: "Перевод на карту" },
    { id: "4", name: "Перечисление Банк" },
];

/* ── Component ────────────────────────────────────────────────────────── */
const CreateTerminatedPaymentModal = ({ isOpen, selectedContractId, onClose, onSuccess }: Props) => {
    const [contracts, setContracts]         = useState<TerminatedContract[]>([]);
    const [detail, setDetail]               = useState<ContractDetail | null>(null);
    const [detailLoading, setDetailLoading] = useState(false);
    const [submitting, setSubmitting]       = useState(false);

    const [formData, setFormData] = useState({
        terminated_contract_id: "",
        price_type: "",
        payment_method: "",
        payment_amount: "",
        comments: "",
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    /* ── Reset on open ──────────────────────────────────────────────── */
    useEffect(() => {
        if (isOpen) {
            setFormData({ 
                terminated_contract_id: selectedContractId || "", 
                price_type: "", 
                payment_method: "", 
                payment_amount: "", 
                comments: "" 
            });
            setErrors({});
            setDetail(null);
            loadContracts();

            if (selectedContractId) {
                loadDetail(selectedContractId);
            }
        }
    }, [isOpen, selectedContractId]);

    /* ── Load contracts list ────────────────────────────────────────── */
    const loadContracts = async () => {
        try {
            const res = await GetDataSimple("api/finance/terminated-contracts?page=1&limit=100");
            if (res?.result) setContracts(res.result);
        } catch (err) {
            showErrorToast(err, "Ошибка при загрузке контрактов");
        }
    };

    /* ── Fetch contract detail when contract selected ───────────────── */
    const loadDetail = async (id: string) => {
        setDetail(null);
        setFormData(prev => ({ ...prev, price_type: "" })); // reset price type
        setDetailLoading(true);
        try {
            const res = await GetDataSimple(`api/finance/terminated-contracts/${id}`);
            const d = res?.result || res?.data || res;
            setDetail(d);
        } catch (err) {
            showErrorToast(err, "Ошибка при загрузке деталей контракта");
        } finally {
            setDetailLoading(false);
        }
    };

    const handleContractChange = (val: string) => {
        set("terminated_contract_id", val);
        loadDetail(val);
    };

    /* ── Helpers ────────────────────────────────────────────────────── */
    const formatPrice = (val: string | number | undefined) => {
        if (!val) return "—";
        const num = typeof val === "string" ? parseFloat(val) : val;
        if (isNaN(num)) return "—";
        return new Intl.NumberFormat("ru-RU").format(num);
    };

    const formatDate = (d?: string) => {
        if (!d) return "—";
        return new Date(d).toLocaleDateString("ru-RU", { year: "numeric", month: "2-digit", day: "2-digit" });
    };

    const getStatusCls = (status: string) =>
        status === "1"
            ? "border-green-300 text-green-600 bg-green-50 dark:border-green-600 dark:text-green-400 dark:bg-green-900/10"
            : "border-yellow-300 text-yellow-600 bg-yellow-50 dark:border-yellow-600 dark:text-yellow-400 dark:bg-yellow-900/10";

    /* ── Validation ─────────────────────────────────────────────────── */
    const validate = () => {
        const e: Record<string, string> = {};
        if (!formData.terminated_contract_id) e.terminated_contract_id = "Выберите контракт";
        if (!formData.price_type)             e.price_type = "Выберите тип оплаты";
        if (!formData.payment_method)         e.payment_method = "Выберите метод оплаты";
        if (!formData.payment_amount || formData.payment_amount === "0")
            e.payment_amount = "Введите сумму";
        if (!formData.comments.trim())        e.comments = "Введите комментарий";
        if (formData.comments.trim().length > 255)
            e.comments = "Комментарий не должен превышать 255 символов";
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    /* ── Submit ─────────────────────────────────────────────────────── */
    const handleSubmit = async () => {
        if (!validate()) return;
        setSubmitting(true);
        try {
            const payload = {
                terminated_contract_id: parseInt(formData.terminated_contract_id),
                price_type: parseInt(formData.price_type),
                payment_method: parseInt(formData.payment_method),
                payment_amount: parseInt(formData.payment_amount.replace(/\s/g, "")),
                comments: formData.comments.trim(),
            };
            await PostDataTokenJson("api/finance/terminated-contracts/payments", payload);
            toast.success("Оплата успешно добавлена");
            onSuccess();
            onClose();
        } catch (err: any) {
            showErrorToast(err, "Ошибка при добавлении оплаты");
        } finally {
            setSubmitting(false);
        }
    };

    const formatNumber = (value: string) => {
        const digits = value.replace(/\D/g, "");
        return digits.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
    };

    const set = (key: keyof typeof formData, val: string) => {
        setFormData(prev => ({ ...prev, [key]: val }));
        if (errors[key]) setErrors(prev => ({ ...prev, [key]: "" }));
    };

    /* ── JSX ────────────────────────────────────────────────────────── */
    return (
        <CustomModal
            showTrigger={false}
            open={isOpen}
            onOpenChange={onClose}
            title="Добавить оплату"
            confirmText={submitting ? "Сохранение..." : "Добавить"}
            onConfirm={handleSubmit}
            onCancel={onClose}
            maxWidth="820px"
        >
            <div className="space-y-5 py-2">

                {/* ── Контракт select ───────────────────────────────── */}
                <div className="space-y-1.5">
                    <Label className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400 tracking-wide">
                        Расторгнутый контракт <span className="text-red-500">*</span>
                    </Label>
                    <Select
                        value={formData.terminated_contract_id}
                        onValueChange={handleContractChange}
                    >
                        <SelectTrigger className={`rounded-xl h-12 ${errors.terminated_contract_id ? "border-red-400" : ""}`}>
                            <SelectValue placeholder="Выберите контракт" />
                        </SelectTrigger>
                        <SelectContent>
                            {contracts.length === 0
                                ? <SelectItem value="_" disabled>Нет контрактов</SelectItem>
                                : contracts.map(c => (
                                    <SelectItem key={c.terminated_contract_id} value={c.terminated_contract_id}>
                                        <span className="font-medium">№{c.contract_number}</span>
                                        <span className="text-gray-400 ml-2 text-xs">— {c.client_name}</span>
                                    </SelectItem>
                                ))
                            }
                        </SelectContent>
                    </Select>
                    {errors.terminated_contract_id && (
                        <p className="text-xs text-red-500">{errors.terminated_contract_id}</p>
                    )}
                </div>

                {/* ── Contract detail card ──────────────────────────── */}
                {detailLoading && (
                    <div className="flex items-center gap-2 text-gray-400 text-sm py-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Загрузка деталей...
                    </div>
                )}

                {detail && !detailLoading && (
                    <div className="rounded-2xl border border-blue-100 dark:border-blue-900/40 bg-blue-50/60 dark:bg-blue-900/10 p-4 space-y-3">
                        {/* Info grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            <MiniInfo icon={<User className="w-3.5 h-3.5 text-maintx" />}    label="Клиент"     value={detail.client_name} />
                            <MiniInfo icon={<Home className="w-3.5 h-3.5 text-maintx" />}    label="Квартира"   value={detail.apartment_number || "—"} />
                            <MiniInfo icon={<Hash className="w-3.5 h-3.5 text-maintx" />}    label="№ Контр."   value={`#${detail.contract_number}`} />
                            <MiniInfo icon={<Calendar className="w-3.5 h-3.5 text-maintx" />} label="Дата"      value={formatDate(detail.created_at)} />
                        </div>

                        {/* Prices table */}
                        {detail.prices && detail.prices.length > 0 && (
                            <div className="rounded-xl overflow-hidden border border-blue-100 dark:border-blue-900/30">
                                <table className="w-full text-sm">
                                    <thead className="bg-blue-100/60 dark:bg-blue-900/20">
                                        <tr>
                                            <th className="text-left px-3 py-2 text-xs text-gray-500 dark:text-gray-400 font-semibold">#</th>
                                            <th className="text-left px-3 py-2 text-xs text-gray-500 dark:text-gray-400 font-semibold">Тип</th>
                                            <th className="text-right px-3 py-2 text-xs text-gray-500 dark:text-gray-400 font-semibold">Сумма</th>
                                            <th className="text-left px-3 py-2 text-xs text-gray-500 dark:text-gray-400 font-semibold">Статус</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {detail.prices.map((p, idx) => (
                                            <tr key={p.id} className="border-t border-blue-100/80 dark:border-blue-900/20 bg-white/60 dark:bg-gray-900/20">
                                                <td className="px-3 py-2 text-gray-400">{idx + 1}</td>
                                                <td className="px-3 py-2 font-medium text-gray-800 dark:text-white">{p.price_type_text}</td>
                                                <td className="px-3 py-2 text-right font-semibold text-gray-800 dark:text-white whitespace-nowrap">
                                                    <span className="flex items-center justify-end gap-1">
                                                        <Banknote className="w-3.5 h-3.5 text-gray-400" />
                                                        {formatPrice(p.total_price)}
                                                    </span>
                                                </td>
                                                <td className="px-3 py-2">
                                                    <Badge variant="outline" className={`text-xs whitespace-nowrap ${getStatusCls(p.payment_status)}`}>
                                                        {p.payment_status_text}
                                                    </Badge>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

                {/* ── Тип оплаты (from prices array) ───────────────── */}
                <div className="space-y-1.5">
                    <Label className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400 tracking-wide">
                        Тип оплаты <span className="text-red-500">*</span>
                    </Label>
                    <Select
                        value={formData.price_type}
                        onValueChange={(val) => set("price_type", val)}
                        disabled={!detail || (detail.prices?.length === 0)}
                    >
                        <SelectTrigger className={`rounded-xl h-12 ${errors.price_type ? "border-red-400" : ""}`}>
                            <SelectValue placeholder={!formData.terminated_contract_id ? "Сначала выберите контракт" : "Выберите тип"} />
                        </SelectTrigger>
                        <SelectContent>
                            {detail?.prices?.map(p => (
                                <SelectItem key={p.id} value={p.price_type}>
                                    <span className="font-medium">{p.price_type_text}</span>
                                    <span className="text-gray-400 ml-2 text-xs">— {formatPrice(p.total_price)} сум</span>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {errors.price_type && (
                        <p className="text-xs text-red-500">{errors.price_type}</p>
                    )}
                </div>

                {/* ── Метод оплаты ─────────────────────────────────── */}
                <div className="space-y-1.5">
                    <Label className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400 tracking-wide">
                        Метод оплаты <span className="text-red-500">*</span>
                    </Label>
                    <Select
                        value={formData.payment_method}
                        onValueChange={(val) => set("payment_method", val)}
                    >
                        <SelectTrigger className={`rounded-xl h-12 ${errors.payment_method ? "border-red-400" : ""}`}>
                            <SelectValue placeholder="Выберите метод" />
                        </SelectTrigger>
                        <SelectContent>
                            {PAYMENT_METHODS.map(m => (
                                <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {errors.payment_method && (
                        <p className="text-xs text-red-500">{errors.payment_method}</p>
                    )}
                </div>

                {/* ── Сумма ────────────────────────────────────────── */}
                <div className="space-y-1.5">
                    <Label className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400 tracking-wide">
                        Сумма оплаты <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                        <Input
                            placeholder="0"
                            value={formData.payment_amount}
                            onChange={(e) => set("payment_amount", formatNumber(e.target.value))}
                            className={`rounded-xl h-12 pr-14 ${errors.payment_amount ? "border-red-400" : ""}`}
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-medium">сум</span>
                    </div>
                    {errors.payment_amount && (
                        <p className="text-xs text-red-500">{errors.payment_amount}</p>
                    )}
                </div>

                {/* ── Комментарий ──────────────────────────────────── */}
                <div className="space-y-1.5">
                    <Label className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400 tracking-wide">
                        Комментарий <span className="text-red-500">*</span>
                    </Label>
                    <Input
                        placeholder="Введите комментарий"
                        value={formData.comments}
                        onChange={(e) => set("comments", e.target.value)}
                        className={`rounded-xl h-12 ${errors.comments ? "border-red-400" : ""}`}
                    />
                    <div className="flex justify-between">
                        {errors.comments
                            ? <p className="text-xs text-red-500">{errors.comments}</p>
                            : <span />
                        }
                        <span className={`text-xs ${formData.comments.length > 255 ? "text-red-500" : "text-gray-400"}`}>
                            {formData.comments.length}/255
                        </span>
                    </div>
                </div>
            </div>
        </CustomModal>
    );
};

/* ── MiniInfo sub-component ──────────────────────────────────────────── */
const MiniInfo = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) => (
    <div className="flex items-start gap-2">
        <div className="mt-0.5">{icon}</div>
        <div>
            <p className="text-[10px] uppercase text-gray-400 font-medium tracking-wide">{label}</p>
            <p className="text-xs font-semibold text-gray-800 dark:text-white leading-tight">{value}</p>
        </div>
    </div>
);

export default CreateTerminatedPaymentModal;
