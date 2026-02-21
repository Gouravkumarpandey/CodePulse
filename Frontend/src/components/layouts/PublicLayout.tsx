import React from 'react';
import { Outlet } from 'react-router-dom';
import MainNavbar from '@/components/MainNavbar';

const PublicLayout: React.FC = () => {
    return (
        <div className="flex flex-col min-h-screen">
            <MainNavbar />
            <main className="flex-grow">
                <Outlet />
            </main>
        </div>
    );
};

export default PublicLayout;
