import CustomModal from "@/components/ui/custom-modal";
import {
    CustomInput,
    CustomCombobox,
} from "@/components/ui/custom-form";
import { useState, useEffect } from "react";
import { GrEdit } from "react-icons/gr";
import { PostSimple } from "@/service";
import { toast } from "sonner";

interface EditUserProps {
    user: any;
    onSuccess: () => void;
}

const EditUser = ({ user, onSuccess }: EditUserProps) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        firstname: "",
        lastname: "",
        fathername: "",
        login: "",
        password: "",
        role_id: "2",
    });

    useEffect(() => {
        if (user && isModalOpen) {
            setFormData({
                firstname: user.firstname || "",
                lastname: user.lastname || "",
                fathername: user.fathername || "",
                login: user.login || "",
                password: "", // Leave blank for security
                role_id: user.role_id?.toString() || "2",
            });
        }
    }, [user, isModalOpen]);

    const handleUpdateUser = async () => {
        if (!formData.firstname || !formData.lastname || !formData.login) {
            toast.error("Пожалуйста, заполните обязательные поля");
            return;
        }

        try {
            const dataToSubmit: any = {
                firstname: formData.firstname,
                lastname: formData.lastname,
                fathername: formData.fathername,
                login: formData.login,
                role_id: Number(formData.role_id),
            };
            
            if (formData.password) {
                dataToSubmit.password = formData.password;
            }

            await PostSimple(`api/user/update/${user.user_id}`, dataToSubmit);
            
            toast.success("Пользователь успешно обновлен!", {
                description: `${formData.firstname} ${formData.lastname} обновлен в системе.`,
                duration: 3000,
            });

            onSuccess();
            setIsModalOpen(false);
        } catch (error) {
            console.error("Error updating user:", error);
            toast.error("Ошибка при обновлении пользователя");
        }
    };

    const handleCancel = () => {
        setIsModalOpen(false);
    };

    const roleOptions = [
        { value: "1", label: "Директор" },
        { value: "2", label: "Бухгалтер" },
        { value: "3", label: "Зритель" },
    ];

    return (
        <CustomModal
            trigger={
                <button className="rounded-full p-2  hover:bg-gray-200 ">
                    <GrEdit className="w-4 h-4" />
                </button>
            }
            open={isModalOpen}
            onOpenChange={setIsModalOpen}
            showTrigger={true}
            title="Редактировать пользователя"
            onConfirm={handleUpdateUser}
            onCancel={handleCancel}
            confirmText="Сохранить"
            cancelText="Отмена"
            size="xl"
            showCloseButton={true}
        >
            <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <CustomInput
                        label="Имя"
                        placeholder="Введите имя"
                        value={formData.firstname}
                        onChange={(value) =>
                            setFormData({ ...formData, firstname: value })
                        }
                        required
                    />
                    <CustomInput
                        label="Фамилия"
                        placeholder="Введите фамилию"
                        value={formData.lastname}
                        onChange={(value) =>
                            setFormData({ ...formData, lastname: value })
                        }
                        required
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <CustomInput
                        label="Отчество"
                        placeholder="Введите отчество"
                        value={formData.fathername}
                        onChange={(value) =>
                            setFormData({ ...formData, fathername: value })
                        }
                    />
                    <CustomInput
                        label="Логин"
                        placeholder="Введите логин"
                        value={formData.login}
                        onChange={(value) =>
                            setFormData({ ...formData, login: value })
                        }
                        required
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <CustomInput
                        label="Пароль"
                        placeholder="Оставьте пустым, если не хотите менять"
                        type="password"
                        value={formData.password}
                        onChange={(value) =>
                            setFormData({ ...formData, password: value })
                        }
                    />
                    <CustomCombobox
                        label="Роль"
                        placeholder="Выберите роль"
                        value={formData.role_id}
                        onChange={(value) =>
                            setFormData({ ...formData, role_id: value })
                        }
                        options={roleOptions}
                        required
                    />
                </div>
            </div>
        </CustomModal>
    );
};

export default EditUser;
