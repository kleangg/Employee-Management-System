
import React, {useState} from 'react';
import {NavLink, useNavigate, BrowserRouter} from 'react-router-dom';
import { createRoot } from 'react-dom/client';

function getInitials(name){
    if(!name) return '';
    return name
        .split(' ')
        .filter(Boolean)
        .map((part) => part[0]?.toUpperCase() ?? '')
        .join('');
}

const icons = { 
    chevronLeft: (
        <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 12 12" fill="none">
            <path d="M7 2L3 6L7 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
    ),
    chevronRight: (
        <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 12 12" fill="none">
            <path d="M5 2L9 6L5 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
    ),
    logout: (
        <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 18 18" fill="none">
            <path d="M7 3H3a1 1 0 00-1 1v10a1 1 0 001 1h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            <path d="M12 5l4 4-4 4M16 9H7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
    ),
    dashboard: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
            <path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M8 5a2 2 0 012-2h4a2 2 0 012 2v2H8V5z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
    ),
    employees: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
            <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
    ),
    departments: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
            <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
    ),
    attendance: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
            <path d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
    ),
    leave: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
            <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
    ),
    reports: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
            <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
    ),
};

function NavItem ({ to, label, collapsed, icon}){
    return(
        <NavLink 
            to={to}
            style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 14px',
                borderRadius: '12px',
                textDecoration: 'none',
                color: isActive ? '#1d4ed8' : '#475569',
                backgroundColor: isActive ? '#eff6ff' : 'transparent',
                fontWeight: isActive ? 600 : 500,
                borderRight: isActive ? '3px solid #3b82f6' : '3px solid transparent',
                transition: 'all .2s ease',
                justifyContent: collapsed ? 'center' : 'flex-start',
            })}
            title={collapsed ? label : ""}
        >
            {icon && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: 24, minHeight: 24 }}>
                    {icon}
                </div>
            )}
            {!collapsed && (
                <span style={{ whiteSpace: 'nowrap' }}>{label}</span>
            )}
        </NavLink>
    );
}

function SectionLabel({ label, collapsed }) {
    return (
        <div style={{ padding: '0 12px', marginTop: '24px', marginBottom: '8px', fontSize: '11px', fontWeight: 700, letterSpacing: '0.13em', color: '#6b7280', textTransform: 'uppercase' }}>
            {!collapsed ? label : ''}
        </div>
    );
}

export default function Sidebar(){ 
    const [collapsed, setCollapsed] = useState(false);
    const [loggingOut, setLoggingOut] = useState(false);
    const navigate = useNavigate();

    const user = { name: 'Admin User' };

    const handleLogout = () => {
        setLoggingOut(true);
        // TODO: implement actual logout flow (API call, token remove, redirect)
        // For now, redirect via router if available.
        setTimeout(() => {
            setLoggingOut(false);
            if (navigate) {
                navigate('/login');
            } else {
                window.location = '/login';
            }
        }, 200);
    };

    return(
        <aside style={{
            position: 'sticky',
            top: 0,
            display: 'flex',
            flexDirection: 'column',
            width: collapsed ? 64 : 250,
            minHeight: '100%',
            backgroundColor: '#ffffff',
            borderRight: '1px solid #e5e7eb',
            boxShadow: '0 10px 30px rgba(15, 23, 42, 0.08)',
            alignSelf: 'flex-start',
            transition: 'width 0.3s ease',
        }}>

            {/*The header of the sidebar*/}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '18px 16px',
                borderBottom: '1px solid #e5e7eb',
                backgroundColor: '#f8fbff',
            }}>
                {!collapsed &&(
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: 34, height: 34, borderRadius: 10, backgroundColor: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <span style={{ color: '#fff', fontWeight: 700, fontSize: 12 }}>EMS</span>
                        </div>
                        <span style={{ fontSize: 14, fontWeight: 600, color: '#111827', whiteSpace: 'nowrap' }}>
                            Employee Management System
                        </span>
                    </div>
                )}
                {collapsed && (
                    <div style={{ width: 34, height: 34, borderRadius: 10, backgroundColor: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ color: '#fff', fontWeight: 700, fontSize: 10 }}>EMS</span>
                    </div>
                )}
            </div>

            {/*navigation links*/}
            <nav style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
                padding: '18px 12px',
                overflowY: 'auto',
            }}>
                <SectionLabel label="Main" collapsed={collapsed} />
                <NavItem to="/dashboard" label="Dashboard" collapsed={collapsed} icon={icons.dashboard} />
                <NavItem to="/employees" label="Employees" collapsed={collapsed} icon={icons.employees} />
                <NavItem to="/departments" label="Departments" collapsed={collapsed} icon={icons.departments} />
                <NavItem to="/attendance" label="Attendance" collapsed={collapsed} icon={icons.attendance} />
                
                <SectionLabel label="Management" collapsed={collapsed} />
                <NavItem to="/leave" label="Leave" collapsed={collapsed} icon={icons.leave} />
                <NavItem to="/reports" label="Reports" collapsed={collapsed} icon={icons.reports} />
            </nav>

            {/*collapse toggle button*/}
            <div style={{ padding: '12px 12px', borderTop: '1px solid #e5e7eb' }}>
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: collapsed? 'center' :  'flex-start',
                        gap: 20,
                        padding: '10px 12px',
                        borderRadius: 12,
                        border: 'none',
                        backgroundColor: 'transparent',
                        color: '#475569',
                        cursor: 'pointer',
                        transition: 'background-color .2s ease, color .2s ease',
                    }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                    <div style={{
                        width: 16,
                        height: 16,
                        display: 'flex', 
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        {collapsed ? icons.chevronRight : icons.chevronLeft}
                    </div>
                    {!collapsed && <span style={{ fontWeight: 600 }}>Collapse</span>}
                </button>
            </div>

            {/* ── Current user card ── */}
            {/* This section shows who is logged in */}
            <div style={{ borderTop: '1px solid #bdc4d2', padding: '18px 14px', backgroundColor: '#f9fafb' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 25 }}>
                    <button
                    onClick={() => navigate('/profile')}
                    style={{
                        display: 'flex',
                        width: '100%',
                        alignItems: 'center',
                        gap: 12,
                        borderRadius: 12, 
                        cursor: 'pointer',

                    }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#e2e5e8'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >  
                        <div style={{ width: 40, height: 40, borderRadius: '9999px', backgroundColor: '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#1d4ed8', border: '1px solid #bfdbfe' }}>
                            {getInitials(user?.name)}
                        </div>
                        {!collapsed && (
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {user?.name || "Loading..."}
                                </p>
                                <p style={{ margin: 0, fontSize: 12, color: '#6b7280', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {user?.email || ""}
                                </p>
                            </div>
                        )}
                    </button>  
                    {!collapsed && (
                        <button
                            onClick={handleLogout}
                            disabled={loggingOut}
                            title="Logout"
                            style={{
                                width: 32,
                                height: 32,
                                padding: 8,
                                borderRadius: 10,
                                border: 'none',
                                backgroundColor: 'transparent',
                                color: '#6b7280',
                                cursor: 'pointer',
                            }}
                            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#e2e5e8'}
                            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                            {icons.logout}
                        </button>
                    )}
                </div>
                {collapsed && (
                    <button
                        onClick={handleLogout}
                        disabled={loggingOut}
                        title="Logout"
                        style={{
                            width: '100%',
                            marginTop: 12,
                            padding: '10px 12px',
                            borderRadius: 12,
                            border: 'none',
                            backgroundColor: '#ffffff',
                            color: '#6b7280',
                            cursor: 'pointer',
                        }}
                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#e2e5e8'}
                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                        {icons.logout}
                    </button>
                )}
            </div>
        </aside>
    )
}

if (document.getElementById('sideBar')) {
    const container = document.getElementById('sideBar');
    const root = createRoot(container);
    root.render(
        <BrowserRouter>
            <Sidebar />
        </BrowserRouter>
    );
}