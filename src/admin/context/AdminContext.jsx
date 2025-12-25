// Admin Authentication Context
import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminContext = createContext();

// Demo admin credentials (in production, this would be server-side)
const ADMIN_CREDENTIALS = {
    email: 'admin@perfectbakery.com',
    password: 'admin123'
};

export const AdminProvider = ({ children }) => {
    const navigate = useNavigate();
    const [admin, setAdmin] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [sidebarOpen, setSidebarOpen] = useState(true);

    // Check for existing admin session on mount
    useEffect(() => {
        const savedAdmin = localStorage.getItem('bakery_admin');
        if (savedAdmin) {
            try {
                setAdmin(JSON.parse(savedAdmin));
            } catch (e) {
                localStorage.removeItem('bakery_admin');
            }
        }
        setIsLoading(false);
    }, []);

    const login = (email, password) => {
        return new Promise((resolve, reject) => {
            // Simulate API call delay
            setTimeout(() => {
                if (email === ADMIN_CREDENTIALS.email && password === ADMIN_CREDENTIALS.password) {
                    const adminData = {
                        id: 1,
                        email,
                        name: 'Admin',
                        role: 'super_admin',
                        avatar: null,
                        loginTime: new Date().toISOString()
                    };
                    setAdmin(adminData);
                    localStorage.setItem('bakery_admin', JSON.stringify(adminData));
                    resolve(adminData);
                } else {
                    reject(new Error('Invalid email or password'));
                }
            }, 500);
        });
    };

    const logout = () => {
        setAdmin(null);
        localStorage.removeItem('bakery_admin');
        navigate('/admin/login');
    };

    const toggleSidebar = () => {
        setSidebarOpen(prev => !prev);
    };

    return (
        <AdminContext.Provider value={{
            admin,
            isLoading,
            isAuthenticated: !!admin,
            login,
            logout,
            sidebarOpen,
            setSidebarOpen,
            toggleSidebar
        }}>
            {children}
        </AdminContext.Provider>
    );
};

export const useAdmin = () => {
    const context = useContext(AdminContext);
    if (!context) {
        throw new Error('useAdmin must be used within an AdminProvider');
    }
    return context;
};

export default AdminContext;
