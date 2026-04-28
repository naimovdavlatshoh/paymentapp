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
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CustomPagination from "@/components/ui/custom-pagination";
import SearchInput from "@/components/ui/search-input";
import CustomBreadcrumb from "@/components/ui/custom-breadcrumb";
import { useEffect, useState } from "react";
import EditUser from "./EditUser";
import { CiTrash } from "react-icons/ci";
import { HiDotsVertical } from "react-icons/hi";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import CustomModal from "@/components/ui/custom-modal";
import { toast } from "sonner";
import { IoMdAdd } from "react-icons/io";
import { ProgressAuto } from "@/components/ui/progress";

import { canPerformAction } from "@/utils/role";

import {
    GetDataSimple,
    DeleteData,
} from "@/service";

const Users = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState("");
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
    const [activeTab, setActiveTab] = useState("all");
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState<{
        id: number;
        name: string;
    } | null>(null);
    const [users, setUsers] = useState<any[]>([]);
    const [totalUsers, setTotalUsers] = useState(0);
    const [loading, setLoading] = useState(true);

    const roleMap: Record<number, string> = {
        1: "Администратор",
        2: "Бухгалтер",
        3: "Зритель",
    };

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const data = await GetDataSimple(
                `api/user/list?page=${currentPage}&limit=${itemsPerPage}`
            );
            setUsers(data.result || []);
            setTotalUsers(data.count || 0);
        } catch (error) {
            console.error("Error fetching users:", error);
            toast.error("Ошибка при получении списка пользователей");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, [currentPage, itemsPerPage]);

    const getRoleBadgeColor = (roleId: number) => {
        switch (roleId) {
            case 1:
                return "bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300"; // Admin/Director
            case 2:
                return "bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300"; // Accountant
            case 3:
                return "bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300"; // Viewer
            default:
                return "bg-gray-100 dark:bg-gray-900/20 text-gray-800 dark:text-gray-300";
        }
    };

    const handleSearch = (query: string) => {
        setSearchQuery(query);
    };

    const filteredUsers = users.filter((user) => {
        const fullName = `${user.firstname || ""} ${user.lastname || ""} ${user.fathername || ""}`.toLowerCase();
        const matchesSearch =
            fullName.includes(searchQuery.toLowerCase()) ||
            (user.login || "").toLowerCase().includes(searchQuery.toLowerCase());

        if (activeTab === "all") return matchesSearch;
        if (activeTab === "admin") return matchesSearch && Number(user.role_id) === 1;
        if (activeTab === "accountant") return matchesSearch && Number(user.role_id) === 2;
        if (activeTab === "viewer") return matchesSearch && Number(user.role_id) === 3;
        return matchesSearch;
    });

    const totalPages = Math.ceil(totalUsers / itemsPerPage);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handleItemsPerPageChange = (value: string) => {
        setItemsPerPage(Number(value));
        setCurrentPage(1);
    };

    const handleSelectUser = (userId: number) => {
        setSelectedUsers((prev) =>
            prev.includes(userId)
                ? prev.filter((id) => id !== userId)
                : [...prev, userId]
        );
    };

    const handleSelectAll = () => {
        if (selectedUsers.length === filteredUsers.length) {
            setSelectedUsers([]);
        } else {
            setSelectedUsers(filteredUsers.map((user) => Number(user.user_id)));
        }
    };

    const handleTabChange = (value: string) => {
        setActiveTab(value);
        setCurrentPage(1);
    };

    const openDeleteModal = (user: { id: number; name: string }) => {
        setUserToDelete({ id: user.id, name: user.name });
        setIsDeleteOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (userToDelete) {
            try {
                await DeleteData(`api/user/delete/${userToDelete.id}`);
                toast.success("Пользователь удалён", {
                    description: `${userToDelete.name} успешно удалён.`,
                    duration: 2500,
                });
                fetchUsers();
            } catch (error) {
                console.error("Error deleting user:", error);
                toast.error("Ошибка при удалении пользователя");
            }
        }
        setIsDeleteOpen(false);
        setUserToDelete(null);
    };

    const handleCancelDelete = () => {
        setIsDeleteOpen(false);
        setUserToDelete(null);
    };

    if (loading && users.length === 0) {
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
            <div className="space-y-4 mb-10">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl  font-semibold text-gray-900 dark:text-white">
                            Все пользователи
                        </h1>
                    </div>
                    {canPerformAction() && (
                        <Link to="/users/create">
                            <Button className="bg-black text-white duration-300 hover:bg-black/70 rounded-xl ">
                                <IoMdAdd className="w-3 h-3" /> Добавить
                            </Button>
                        </Link>
                    )}
                </div>
                <CustomBreadcrumb
                    items={[
                        { label: "Панель управления", href: "/" },
                        { label: "Пользователи", isActive: true },
                    ]}
                />
            </div>

            {/* Users Table */}
            <Card className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700">
                <Tabs
                    value={activeTab}
                    onValueChange={handleTabChange}
                    className="border-b"
                >
                    <TabsList className="flex justify-start w-full bg-transparent  p-0 h-auto ">
                            <TabsTrigger
                            value="all"
                            className="rounded-none border-b-2 border-transparent data-[state=active]:border-black dark:data-[state=active]:border-white data-[state=active]:bg-transparent data-[state=active]:text-black dark:data-[state=active]:text-white text-gray-400 dark:text-gray-500 flex items-center justify-center gap-2 py-3"
                        >
                            <span>Все</span>
                            <Badge
                                variant="secondary"
                                className={`bg-gray-100 dark:bg-gray-900/20 text-gray-800 dark:text-gray-300 text-xs px-2 py-0.5 rounded-lg`}
                            >
                                {totalUsers}
                            </Badge>
                        </TabsTrigger>
                        <TabsTrigger
                            value="admin"
                            className="rounded-none border-b-2 border-transparent data-[state=active]:border-black dark:data-[state=active]:border-white data-[state=active]:bg-transparent data-[state=active]:text-black dark:data-[state=active]:text-white text-gray-400 dark:text-gray-500 flex items-center justify-center gap-2 py-3"
                        >
                            <span>Директоры</span>
                            <Badge
                                variant="secondary"
                                className={`${getRoleBadgeColor(
                                    1
                                )} text-xs px-2 py-0.5 rounded-lg`}
                            >
                                {
                                    users.filter((u: any) => Number(u.role_id) === 1)
                                        .length
                                }
                            </Badge>
                        </TabsTrigger>
                        <TabsTrigger
                            value="accountant"
                            className="rounded-none border-b-2 border-transparent data-[state=active]:border-black dark:data-[state=active]:border-white data-[state=active]:bg-transparent data-[state=active]:text-black dark:data-[state=active]:text-white text-gray-400 dark:text-gray-500 flex items-center justify-center gap-2 py-3"
                        >
                            <span>Бухгалтеры</span>
                            <Badge
                                variant="secondary"
                                className={`${getRoleBadgeColor(
                                    2
                                )} text-xs px-2 py-0.5 rounded-lg`}
                            >
                                {
                                    users.filter((u: any) => Number(u.role_id) === 2)
                                        .length
                                }
                            </Badge>
                        </TabsTrigger>
                        <TabsTrigger
                            value="viewer"
                            className="rounded-none border-b-2 border-transparent data-[state=active]:border-black dark:data-[state=active]:border-white data-[state=active]:bg-transparent data-[state=active]:text-black dark:data-[state=active]:text-white text-gray-400 dark:text-gray-500 flex items-center justify-center gap-2 py-3"
                        >
                            <span>Зрители</span>
                            <Badge
                                variant="secondary"
                                className={`${getRoleBadgeColor(
                                    3
                                )} text-xs px-2 py-0.5 rounded-lg`}
                            >
                                {
                                    users.filter(
                                        (u: any) => Number(u.role_id) === 3
                                    ).length
                                }
                            </Badge>
                        </TabsTrigger>
                    </TabsList>
                </Tabs>
                <CardHeader className="pb-4">
                    <div className="flex flex-col space-y-4">
                        <div className="flex justify-start w-full">
                            <SearchInput
                                placeholder="Поиск пользователей..."
                                value={searchQuery}
                                onChange={handleSearch}
                                onSearch={handleSearch}
                            />
                        </div>

                        {/* Tabs */}
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-mainbg/10 ">
                            <TableRow>
                                <TableHead className="text-maintx dark:text-white w-12">
                                    <Checkbox
                                        checked={
                                            selectedUsers.length ===
                                                filteredUsers.length &&
                                            filteredUsers.length > 0
                                        }
                                        onCheckedChange={handleSelectAll}
                                    />
                                </TableHead>
                                <TableHead className="text-maintx dark:text-white">
                                    Пользователь
                                </TableHead>
                                <TableHead className="text-maintx dark:text-white">
                                    Логин
                                </TableHead>
                                <TableHead className="text-maintx dark:text-white">
                                    Роль
                                </TableHead>
                                <TableHead className="text-right text-maintx dark:text-white">
                                    Действия
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredUsers.map((user: any) => (
                                <TableRow
                                    key={user.user_id}
                                    className="border-dashed border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
                                >
                                    <TableCell className="w-12">
                                        <Checkbox
                                            checked={selectedUsers.includes(
                                                Number(user.user_id)
                                            )}
                                            onCheckedChange={() =>
                                                handleSelectUser(Number(user.user_id))
                                            }
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center space-x-3">
                                            <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                                                <span className="text-sm font-bold text-gray-500 uppercase">
                                                    {user.firstname?.[0]}
                                                    {user.lastname?.[0]}
                                                </span>
                                            </div>
                                            <div>
                                                <Link
                                                    to={`/users`}
                                                    className="text-sm font-medium text-gray-900 dark:text-white hover:underline cursor-pointer transition-all duration-200"
                                                >
                                                    {user.lastname} {user.firstname} {user.fathername}
                                                </Link>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-gray-600 dark:text-gray-300">
                                        {user.login}
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            className={`${getRoleBadgeColor(Number(user.role_id))} border-none shadow-none`}
                                        >
                                            {user.role_name || roleMap[Number(user.role_id)] || "Неизвестно"}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {canPerformAction() && (
                                            <>
                                                <EditUser user={user} onSuccess={fetchUsers} />
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <button className="rounded-full outline-none focus:outline-none focus:ring-0 focus:border-0 focus-visible:outline-none focus-visible:ring-0 focus-visible:border-0 hover:bg-gray-200 p-2 transition-colors duration-200">
                                                            <HiDotsVertical className="w-4 h-4 text-gray-500" />
                                                        </button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem
                                                            className="flex items-center gap-2 text-red-600 hover:text-red-600"
                                                            onClick={() =>
                                                                openDeleteModal({
                                                                    id: Number(user.user_id),
                                                                    name: `${user.lastname} ${user.firstname}`
                                                                })
                                                            }
                                                        >
                                                            <CiTrash className="w-4 h-4" />
                                                            <span>Удалить</span>
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
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
            {/* Delete Confirmation Modal */}
            <CustomModal
                showTrigger={false}
                open={isDeleteOpen}
                onOpenChange={setIsDeleteOpen}
                title="Подтверждение удаления"
                confirmText="Удалить"
                cancelText="Отмена"
                confirmBg="bg-red-500"
                confirmBgHover="bg-red-600"
                onConfirm={handleConfirmDelete}
                onCancel={handleCancelDelete}
                size="md"
                showCloseButton={false}
            >
                <div className="space-y-2">
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                        Вы уверены, что хотите удалить пользователя{" "}
                        <span className="font-semibold text-gray-900 dark:text-white">
                            {userToDelete?.name}
                        </span>
                        ? Это действие нельзя отменить.
                    </p>
                </div>
            </CustomModal>
        </div>
    );
};

export default Users;
