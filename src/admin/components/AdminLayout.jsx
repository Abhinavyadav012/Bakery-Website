// Admin Layout Component
import { Navigate } from 'react-router-dom';
import { useAdmin } from '../context/AdminContext';
import Sidebar from './Sidebar';

const AdminLayout = ({ children }) => {
    const { isAuthenticated, isLoading, sidebarOpen } = useAdmin();

    // Show loading state
    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 bg-gold rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
                        <span className="text-3xl">🥐</span>
                    </div>
                    <p className="text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    // Redirect to login if not authenticated
    if (!isAuthenticated) {
        return <Navigate to="/admin/login" replace />;
    }

    return (
        <div className="min-h-screen h-screen bg-gray-100 flex overflow-hidden">
            {/* Sidebar */}
            <Sidebar />

            {/* Main Content */}
            <main className={`
                flex-1 h-screen overflow-y-auto overflow-x-hidden
                transition-all duration-300
                ${sidebarOpen ? 'lg:ml-0' : 'lg:ml-0'}
            `}>
                {children}
            </main>
        </div>
    );
};

export default AdminLayout;
