import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';

const ProtectedRoute = ({ children, requireAdmin = false }) => {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen w-full bg-gray-50">
                <Loader2 className="w-12 h-12 text-primary animate-spin" />
            </div>
        );
    }

    if (!user) {
        // Redirect to login if not authenticated
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (requireAdmin && user.role !== 'admin') {
        // Redirect to standard dashboard if user is not an admin
        return <Navigate to="/dashboard" replace />;
    }

    // Wrap the child component
    return children;
};

export default ProtectedRoute;
