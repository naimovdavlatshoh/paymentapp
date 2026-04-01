export const ROLES = {
    DIRECTOR: 1,
    ACCOUNTANT: 2,
    VIEWER: 3,
};

export const getRoleId = () => {
    const roleId = localStorage.getItem("role_id");
    return roleId ? Number(roleId) : null;
};

export const isViewer = () => {
    return getRoleId() === ROLES.VIEWER;
};

export const isAccountant = () => {
    return getRoleId() === ROLES.ACCOUNTANT;
};

export const isDirector = () => {
    return getRoleId() === ROLES.DIRECTOR;
};

export const canPerformAction = () => {
    return !isViewer();
};
