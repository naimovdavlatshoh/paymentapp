import { createBrowserRouter, RouterProvider } from "react-router-dom";
import DashboardLayout from "../layout/DashboardLayout";
// import Dashboard from "../pages/Dashboard";
import Users from "../pages/Users/Users";

import Details from "@/pages/Users/Details";
import CreateUser from "@/pages/Users/CreateUser";
import Login from "../pages/Login";
import Account from "@/pages/Users/Account";
import Accountlist from "@/pages/Accounts/Accountlist";
import AccountTransactions from "@/pages/Accounts/AccountTransactions";
import AccountStatistics from "@/pages/Accounts/AccountStatistics";
import Transactionslist from "@/pages/Transactions/Transactionslist";
import CreditsList from "@/pages/Credits/CreditsList";
import CreateCredit from "@/pages/Credits/CreateCredit";
import PaymentsList from "@/pages/Credits/PaymentsList";

const router = createBrowserRouter([
    {
        path: "/login",
        element: <Login />,
    },
    {
        path: "/",
        element: <DashboardLayout />,
        children: [
            {
                index: true,
                element: <Accountlist />,
            },
            {
                path: "accounts",
                element: <Accountlist />,
            },
            {
                path: "accounts/:accountId/transactions",
                element: <AccountTransactions />,
            },
            {
                path: "accounts/:accountId/statistics",
                element: <AccountStatistics />,
            },
            {
                path: "transactions",
                element: <Transactionslist />,
            },
            {
                path: "credits",
                element: <CreditsList />,
            },
            {
                path: "credits/create",
                element: <CreateCredit />,
            },
            {
                path: "credits/payments",
                element: <PaymentsList />,
            },
            {
                path: "users",
                element: <Users />,
            },
            {
                path: "users/create",
                element: <CreateUser />,
            },
            {
                path: "users/account",
                element: <Account />,
            },
            {
                path: "details/:id",
                element: <Details />,
            },
        ],
    },
]);

const AppRouter = () => {
    return <RouterProvider router={router} />;
};

export default AppRouter;
