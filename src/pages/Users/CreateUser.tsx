import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import CustomBreadcrumb from "@/components/ui/custom-breadcrumb";
import { ProgressAuto } from "@/components/ui/progress";
import { CustomInput, CustomCombobox } from "@/components/ui/custom-form";
import { PostSimple } from "@/service";
import { toast } from "sonner";

const CreateUser = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        firstname: "",
        lastname: "",
        fathername: "",
        login: "",
        password: "",
        role_id: "2", // Default to Accountant
    });

    const roleOptions = [
        { value: "1", label: "Директор" },
        { value: "2", label: "Бухгалтер" },
        { value: "3", label: "Зритель" },
    ];

    const handleInputChange = (field: string, value: string) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!formData.firstname || !formData.lastname || !formData.login || !formData.password) {
            toast.error("Пожалуйста, заполните все обязательные поля");
            return;
        }

        try {
            const dataToSubmit = {
                ...formData,
                role_id: Number(formData.role_id),
            };

            await PostSimple("api/user/create", dataToSubmit);
            
            toast.success("Пользователь успешно создан!", {
                description: `${formData.firstname} ${formData.lastname} добавлен в систему.`,
                duration: 3000,
            });

            navigate("/users");
        } catch (error) {
            console.error("Error creating user:", error);
            toast.error("Ошибка при создании пользователя");
        }
    };

    const [loading, setLoading] = useState(true);
    useEffect(() => {
        setTimeout(() => {
            setLoading(false);
        }, 500);
    }, []);

    if (loading) {
        return (
            <div className="h-[80vh] w-full flex justify-center items-center ">
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

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
                        Создать нового пользователя
                    </h1>
                </div>
            </div>

            {/* Breadcrumb */}
            <CustomBreadcrumb
                items={[
                    { label: "Панель управления", href: "/" },
                    { label: "Пользователи", href: "/users" },
                    { label: "Создать", isActive: true },
                ]}
            />

            <div className="flex justify-center">
                <Card className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 w-full max-w-4xl">
                    <CardHeader>
                        <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                            Данные пользователя
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <CustomInput
                                    label="Имя"
                                    placeholder="Введите имя"
                                    value={formData.firstname}
                                    onChange={(value) => handleInputChange("firstname", value)}
                                    required
                                />
                                <CustomInput
                                    label="Фамилия"
                                    placeholder="Введите фамилию"
                                    value={formData.lastname}
                                    onChange={(value) => handleInputChange("lastname", value)}
                                    required
                                />
                                <CustomInput
                                    label="Отчество"
                                    placeholder="Введите отчество"
                                    value={formData.fathername}
                                    onChange={(value) => handleInputChange("fathername", value)}
                                />
                                <CustomInput
                                    label="Логин"
                                    placeholder="Введите логин"
                                    value={formData.login}
                                    onChange={(value) => handleInputChange("login", value)}
                                    required
                                />
                                <CustomInput
                                    label="Пароль"
                                    placeholder="Введите пароль"
                                    type="password"
                                    value={formData.password}
                                    onChange={(value) => handleInputChange("password", value)}
                                    required
                                />
                                <CustomCombobox
                                    label="Роль"
                                    placeholder="Выберите роль"
                                    value={formData.role_id}
                                    onChange={(value) => handleInputChange("role_id", value)}
                                    options={roleOptions}
                                    required
                                />
                            </div>

                            {/* Action Buttons */}
                            <div className="flex justify-end space-x-4 pt-6">
                                <Link to="/users">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="px-6 py-2 h-12 rounded-xl border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                                    >
                                        Отмена
                                    </Button>
                                </Link>
                                <Button
                                    type="submit"
                                    className="px-6 py-2 h-12 bg-gray-900 hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-100 text-white dark:text-gray-900 rounded-xl font-medium transition-all duration-200"
                                >
                                    Создать пользователя
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default CreateUser;
