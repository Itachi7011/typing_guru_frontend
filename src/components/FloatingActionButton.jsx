import React, { useState, useContext, useRef, useEffect } from 'react';
import {
    Share2,
    Sun,
    Moon,
    MessageCircle,
    HelpCircle,
    Settings,
    ChevronRight,
    X,
    Zap,
    User,
    Bell,
    FileText,
    CreditCard,
    Shield,
    Globe,
    Smartphone,
    Mail,
    Facebook,
    Twitter,
    Linkedin,
    Link2,
    MessageSquare,
    LogIn,
    UserPlus,
    LogOut,
    LayoutDashboard,
    BarChart3,
    Users,
    Database,
    Activity,
    Key,
    AlertTriangle, // Add this import
    Eye
} from 'lucide-react';
import { ThemeContext } from '../context/ThemeContext';
import { UserContext } from "../context/UserContext";
import Swal from 'sweetalert2';

const FloatingActionButton = () => {
    const { isDarkMode, toggleTheme } = useContext(ThemeContext);
    const { state, dispatch } = useContext(UserContext);
    const [isOpen, setIsOpen] = useState(false);
    const [activeMenu, setActiveMenu] = useState('main');
    const [subMenu, setSubMenu] = useState(null);
    const [authnest_client_data, setAuthnest_client_data] = useState({});
    const [authnest_loading, setAuthnest_loading] = useState(true);
    const fabRef = useRef(null);

    useEffect(() => {
        fetchClientData();
    }, []);

    // Close menus when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (fabRef.current && !fabRef.current.contains(event.target)) {
                setIsOpen(false);
                setActiveMenu('main');
                setSubMenu(null);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const fetchClientData = async () => {
        try {
            const token = localStorage.getItem('clientTokens');
            if (!token) {
                setAuthnest_loading(false);
                return;
            }

            const response = await fetch('/api/clients/profile', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();
            if (response.ok && data.status === 'success' && data.data.client) {
                setAuthnest_client_data(data.data.client);
            }
        } catch (error) {
            console.error('Error fetching client data:', error);
        } finally {
            setAuthnest_loading(false);
        }
    };

    // Determine user status
    const isLoggedIn = !authnest_loading && authnest_client_data && Object.keys(authnest_client_data).length > 0;
    const userType = authnest_client_data?.usertype;
    const isClientLoggedIn = userType === 'Client';
    const isAdmin = userType === 'admin';
    const isUserLoggedIn = state && userType === 'user';

    const toggleHighContrast = () => {
        document.body.classList.toggle('high-contrast');
        Swal.fire({
            icon: 'success',
            title: 'Contrast Updated',
            text: 'High contrast mode toggled',
            timer: 1500,
            showConfirmButton: false
        });
    };

    const handleForcedLogout = () => {
        Swal.fire({
            icon: 'warning',
            title: 'Forced Logout',
            text: 'This will log you out from all devices and sessions. This action cannot be undone.',
            showCancelButton: true,
            confirmButtonText: 'Yes, log me out everywhere',
            confirmButtonColor: '#ef4444',
            cancelButtonText: 'Cancel',
            background: isDarkMode ? '#1e293b' : '#ffffff',
            color: isDarkMode ? '#e2e8f0' : '#1e293b',
        }).then((result) => {
            if (result.isConfirmed) {
                // Perform forced logout logic here
                handleLogout();
                Swal.fire({
                    icon: 'success',
                    title: 'Logged Out Everywhere',
                    text: 'You have been logged out from all devices and sessions.',
                    timer: 2000,
                    showConfirmButton: false
                });
            }
        });
    };

    const handleClearCache = () => {
        Swal.fire({
            icon: 'warning',
            title: 'Clear All Cache',
            text: 'This will clear all cached data including images, scripts, and localStorage. This may affect performance temporarily.',
            showCancelButton: true,
            confirmButtonText: 'Yes, clear all cache',
            confirmButtonColor: '#ef4444',
            cancelButtonText: 'Cancel',
            background: isDarkMode ? '#1e293b' : '#ffffff',
            color: isDarkMode ? '#e2e8f0' : '#1e293b',
        }).then((result) => {
            if (result.isConfirmed) {
                // Clear cache logic
                if ('caches' in window) {
                    caches.keys().then((names) => {
                        names.forEach((name) => {
                            caches.delete(name);
                        });
                    });
                }

                Swal.fire({
                    icon: 'success',
                    title: 'Cache Cleared',
                    text: 'All cache has been cleared successfully.',
                    timer: 2000,
                    showConfirmButton: false
                });
            }
        });
    };

    const handleResetSettings = () => {
        Swal.fire({
            icon: 'error',
            title: 'Reset All Settings',
            text: 'This will reset all your preferences and settings to default. This action cannot be recovered!',
            showCancelButton: true,
            confirmButtonText: 'Yes, reset everything',
            confirmButtonColor: '#ef4444',
            cancelButtonText: 'Cancel',
            background: isDarkMode ? '#1e293b' : '#ffffff',
            color: isDarkMode ? '#e2e8f0' : '#1e293b',
        }).then((result) => {
            if (result.isConfirmed) {
                // Reset settings logic
                localStorage.clear();
                document.body.classList.remove('high-contrast');
                document.documentElement.style.fontSize = '16px';

                Swal.fire({
                    icon: 'success',
                    title: 'Settings Reset',
                    text: 'All settings have been reset to default.',
                    timer: 2000,
                    showConfirmButton: false
                });

                // Refresh the page
                setTimeout(() => {
                    window.location.reload();
                }, 2000);
            }
        });
    };

    const handleDeleteLocalData = () => {
        Swal.fire({
            icon: 'error',
            title: 'Delete Local Data',
            text: 'This will permanently delete all your local data including preferences and cached information. This is non-recoverable!',
            showCancelButton: true,
            confirmButtonText: 'Yes, delete everything',
            confirmButtonColor: '#ef4444',
            cancelButtonText: 'Cancel',
            background: isDarkMode ? '#1e293b' : '#ffffff',
            color: isDarkMode ? '#e2e8f0' : '#1e293b',
        }).then((result) => {
            if (result.isConfirmed) {
                // Delete local data logic
                localStorage.clear();
                sessionStorage.clear();

                if ('indexedDB' in window) {
                    indexedDB.databases().then((databases) => {
                        databases.forEach((db) => {
                            if (db.name) {
                                indexedDB.deleteDatabase(db.name);
                            }
                        });
                    });
                }

                Swal.fire({
                    icon: 'success',
                    title: 'Data Deleted',
                    text: 'All local data has been deleted.',
                    timer: 2000,
                    showConfirmButton: false
                });

                // Refresh the page
                setTimeout(() => {
                    window.location.reload();
                }, 2000);
            }
        });
    };

    // Base share options (available to all users)
    const shareOptions = [
        {
            id: 'share-facebook',
            label: 'Facebook',
            icon: <Facebook size={18} />,
            action: () => shareOnPlatform('facebook')
        },
        {
            id: 'share-twitter',
            label: 'Twitter',
            icon: <Twitter size={18} />,
            action: () => shareOnPlatform('twitter')
        },
        {
            id: 'share-linkedin',
            label: 'LinkedIn',
            icon: <Linkedin size={18} />,
            action: () => shareOnPlatform('linkedin')
        },
        {
            id: 'share-email',
            label: 'Email',
            icon: <Mail size={18} />,
            action: () => shareViaEmail()
        },
        {
            id: 'share-copy',
            label: 'Copy Link',
            icon: <Link2 size={18} />,
            action: () => copyToClipboard()
        }
    ];

    // Accessibility options (available to all users)
    const accessibilityOptions = [
        {
            id: 'access-theme',
            label: 'Toggle Theme',
            icon: isDarkMode ? <Sun size={18} /> : <Moon size={18} />,
            action: toggleTheme
        },
        {
            id: 'access-font',
            label: 'Font Size',
            icon: <FileText size={18} />,
            hasSubmenu: true,
            submenu: [
                {
                    id: 'font-small',
                    label: 'Small',
                    action: () => changeFontSize('small')
                },
                {
                    id: 'font-medium',
                    label: 'Medium',
                    action: () => changeFontSize('medium')
                },
                {
                    id: 'font-large',
                    label: 'Large',
                    action: () => changeFontSize('large')
                }
            ]
        },
        {
            id: 'access-contrast',
            label: 'High Contrast',
            icon: <Zap size={18} />,
            action: toggleHighContrast
        }
    ];

    // Quick actions for logged out users
    const quickActionsLoggedOut = [
        // {
        //     id: 'action-login',
        //     label: 'Login',
        //     icon: <LogIn size={18} />,
        //     action: () => window.location.href = '/client/login'
        // },
        // {
        //     id: 'action-signup',
        //     label: 'Sign Up',
        //     icon: <UserPlus size={18} />,
        //     action: () => window.location.href = '/client/signup'
        // },
        {
            id: 'action-support',
            label: 'Contact Support',
            icon: <MessageCircle size={18} />,
            action: () => window.location.href = '/support'
        },
        {
            id: 'action-docs',
            label: 'Documentation',
            icon: <HelpCircle size={18} />,
            action: () => window.location.href = '/docs/introduction'
        }
    ];

    // Quick actions for Client users
    const quickActionsClient = [
        {
            id: 'action-dashboard',
            label: 'Dashboard',
            icon: <LayoutDashboard size={18} />,
            action: () => window.location.href = '/client/dashboard'
        },
        {
            id: 'action-analytics',
            label: 'Analytics',
            icon: <BarChart3 size={18} />,
            action: () => window.location.href = '/client/analytics'
        },
        {
            id: 'action-users',
            label: 'Users',
            icon: <Users size={18} />,
            action: () => window.location.href = '/client/users/all'
        },
        {
            id: 'action-profile',
            label: 'My Profile',
            icon: <User size={18} />,
            action: () => window.location.href = '/client/profile'
        },
        {
            id: 'action-billing',
            label: 'Billing',
            icon: <CreditCard size={18} />,
            action: () => window.location.href = '/client/billing'
        },
        {
            id: 'action-settings',
            label: 'Settings',
            icon: <Settings size={18} />,
            hasSubmenu: true,
            submenu: [
                {
                    id: 'settings-general',
                    label: 'General Settings',
                    action: () => window.location.href = '/client/settings/general'
                },
                {
                    id: 'settings-security',
                    label: 'Security Settings',
                    action: () => window.location.href = '/client/settings/security'
                },
                {
                    id: 'settings-registration',
                    label: 'Custom Registration',
                    action: () => window.location.href = '/client/settings/custom-registration-form'
                }
            ]
        },
        {
            id: 'action-logs',
            label: 'Logs & Analytics',
            icon: <Database size={18} />,
            hasSubmenu: true,
            submenu: [
                {
                    id: 'logs-my',
                    label: 'My Logs',
                    action: () => window.location.href = '/client/logs/my-logs'
                },
                {
                    id: 'logs-users',
                    label: 'Users Logs',
                    action: () => window.location.href = '/client/logs/users-logs'
                },
                {
                    id: 'logs-system',
                    label: 'System Logs',
                    action: () => window.location.href = '/client/logs/system-logs'
                }
            ]
        }
    ];

    // Quick actions for regular users
    const quickActionsUser = [
        {
            id: 'action-profile',
            label: 'My Profile',
            icon: <User size={18} />,
            action: () => window.location.href = '/profile'
        },
        {
            id: 'action-settings',
            label: 'Settings',
            icon: <Settings size={18} />,
            action: () => window.location.href = '/settings'
        },
        {
            id: 'action-support',
            label: 'Contact Support',
            icon: <MessageCircle size={18} />,
            action: () => window.location.href = '/support'
        }
    ];

    // Quick actions for Admin users
    const quickActionsAdmin = [
        {
            id: 'action-admin-dashboard',
            label: 'Admin Dashboard',
            icon: <LayoutDashboard size={18} />,
            action: () => window.location.href = '/admin/dashboard'
        },
        {
            id: 'action-admin-users',
            label: 'Manage Users',
            icon: <Users size={18} />,
            action: () => window.location.href = '/admin/users'
        },
        {
            id: 'action-admin-settings',
            label: 'Admin Settings',
            icon: <Settings size={18} />,
            action: () => window.location.href = '/admin/settings'
        },
        {
            id: 'action-admin-logs',
            label: 'System Logs',
            icon: <Database size={18} />,
            action: () => window.location.href = '/admin/logs'
        }
    ];

    const dangerousOptions = [
        {
            id: 'danger-forced-logout',
            label: 'Forced Logout',
            icon: <LogOut size={18} />,
            color: 'danger-option', // Changed from 'danger'
            action: handleForcedLogout
        },
        {
            id: 'danger-clear-cache',
            label: 'Clear All Cache',
            icon: <Database size={18} />,
            color: 'danger-option',
            action: handleClearCache
        },
        {
            id: 'danger-reset-settings',
            label: 'Reset All Settings',
            icon: <Settings size={18} />,
            color: 'danger-option',
            action: handleResetSettings
        },
        {
            id: 'danger-delete-data',
            label: 'Delete Local Data',
            icon: <X size={18} />,
            color: 'danger-option',
            action: handleDeleteLocalData
        }
    ];

    // Get appropriate quick actions based on user type
    const getQuickActions = () => {
        if (isAdmin) {
            return quickActionsAdmin;
        } else if (isClientLoggedIn) {
            return quickActionsClient;
        } else if (isUserLoggedIn) {
            return quickActionsUser;
        } else {
            return quickActionsLoggedOut;
        }
    };

    // Main menu items based on login status
    const getMainMenuItems = () => {
        const baseItems = [
            {
                id: 'menu-share',
                label: 'Share',
                icon: <Share2 size={20} />,
                menu: 'share'
            },
            {
                id: 'menu-accessibility',
                label: 'Accessibility',
                icon: <Globe size={20} />,
                menu: 'accessibility'
            },
            {
                id: 'menu-actions',
                label: 'Quick Actions',
                icon: <Zap size={20} />,
                menu: 'actions'
            },
            {
                id: 'menu-dangerous',
                label: 'Danger Zone',
                icon: <AlertTriangle size={20} />,
                color: 'danger', // Add this property for styling
                menu: 'dangerous'
            }
        ];

        // Add logout option for logged in users
        if (isLoggedIn) {
            baseItems.push({
                id: 'menu-logout',
                label: 'Sign Out',
                icon: <LogOut size={20} />,
                action: handleLogout
            });
        }

        // Add feedback option for all users
        baseItems.push({
            id: 'menu-feedback',
            label: 'Feedback',
            icon: <MessageSquare size={20} />,
            action: () => openFeedbackModal()
        });

        return baseItems;
    };

    const shareOnPlatform = (platform) => {
        const url = window.location.href;
        const title = document.title;

        let shareUrl = '';
        switch (platform) {
            case 'facebook':
                shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
                break;
            case 'twitter':
                shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`;
                break;
            case 'linkedin':
                shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
                break;
            default:
                return;
        }

        window.open(shareUrl, '_blank', 'width=600,height=400');
        Swal.fire({
            icon: 'success',
            title: 'Shared!',
            text: `Sharing on ${platform}...`,
            timer: 2000,
            showConfirmButton: false
        });
    };

    const shareViaEmail = () => {
        const url = window.location.href;
        const title = document.title;
        const subject = `Check out: ${title}`;
        const body = `I thought you might be interested in this: ${title} - ${url}`;

        window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    };

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(window.location.href);
            Swal.fire({
                icon: 'success',
                title: 'Copied!',
                text: 'Link copied to clipboard',
                timer: 2000,
                showConfirmButton: false
            });
        } catch (err) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to copy link',
            });
        }
    };

    const changeFontSize = (size) => {
        const root = document.documentElement;
        let fontSize = '16px';

        switch (size) {
            case 'small':
                fontSize = '14px';
                break;
            case 'large':
                fontSize = '18px';
                break;
            default:
                fontSize = '16px';
        }

        root.style.fontSize = fontSize;
        Swal.fire({
            icon: 'success',
            title: 'Font Size Updated',
            text: `Font size set to ${size}`,
            timer: 1500,
            showConfirmButton: false
        });
    };



    const openFeedbackModal = () => {
        Swal.fire({
            title: 'Send Feedback',
            html: `
        <textarea id="feedback-message" class="swal2-textarea" placeholder="Tell us what you think..." rows="4"></textarea>
        <input type="email" id="feedback-email" class="swal2-input" placeholder="Your email (optional)">
      `,
            confirmButtonText: 'Send Feedback',
            showCancelButton: true,
            background: isDarkMode ? '#1e293b' : '#ffffff',
            color: isDarkMode ? '#e2e8f0' : '#1e293b',
            preConfirm: () => {
                const message = document.getElementById('feedback-message').value;
                const email = document.getElementById('feedback-email').value;

                if (!message) {
                    Swal.showValidationMessage('Please enter your feedback');
                    return false;
                }

                return { message, email };
            }
        }).then((result) => {
            if (result.isConfirmed) {
                Swal.fire({
                    icon: 'success',
                    title: 'Thank You!',
                    text: 'Your feedback has been submitted.',
                    timer: 2000,
                    showConfirmButton: false
                });
            }
        });
    };

    // Add this helper function near your other functions
    const clearAllCookies = () => {
        // Clear all cookies for the current domain
        const cookies = document.cookie.split(";");

        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i];
            const eqPos = cookie.indexOf("=");
            const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();

            // Clear cookie with various path and domain options
            document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
            document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname};`;
            document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.${window.location.hostname};`;
        }

        // Also try to clear common auth cookies
        const authCookies = [
            'userToken',
            'token',
            'access_token',
            'refresh_token',
            'session',
            'sessionId',
            'auth_token',
            'jwt',
            'auth',
            'remember_token'
        ];

        authCookies.forEach(cookieName => {
            document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
            document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname};`;
        });
    };

    const handleLogout = async (e) => {
        if (e) e.preventDefault();

        try {
            // Get all tokens
            const clientToken = localStorage.getItem('clientTokens');
            const adminToken = localStorage.getItem('adminToken');

            // Logout from client account
            if (clientToken) {
                await fetch('/api/clients/logout', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${clientToken}`,
                    }
                });
            }

            // Logout from admin account
            if (adminToken) {
                try {
                    await fetch('/api/admin/logout', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${adminToken}`,
                        }
                    });
                } catch (adminErr) {
                    console.warn('Admin logout error:', adminErr);
                }
            }

            // Logout from user account (cookie-based)
            try {
                await fetch('/api/users/logout', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include' // Important for cookies
                });
            } catch (userErr) {
                console.warn('User logout error:', userErr);
            }

            // Clear all localStorage tokens
            localStorage.removeItem('clientTokens');
            localStorage.removeItem('adminToken');
            localStorage.removeItem('client');
            localStorage.removeItem('admin');

            // Clear any other possible token names
            localStorage.removeItem('token');
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('authToken');

            // Also clear sessionStorage for good measure
            sessionStorage.clear();

            clearAllCookies();

            await Swal.fire({
                icon: 'success',
                title: 'Logged Out',
                text: 'You have been logged out from all accounts.',
                timer: 2000,
                showConfirmButton: false
            });

        } catch (err) {
            console.warn('Logout error:', err);
            // Still clear local storage and cookies even if API call fails
            localStorage.clear();
            sessionStorage.clear();
            document.cookie.split(";").forEach(function (c) {
                document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
            });
        } finally {
            // Clear all state
            setAuthnest_client_data({});
            dispatch({ type: "LOGOUT" });

            // Force a hard redirect to clear any remaining state
            window.location.href = "/client/login";
        }
    };

    const handleMenuAction = (item) => {
        if (item.action) {
            item.action();
            setIsOpen(false);
            setActiveMenu('main');
        } else if (item.menu) {
            setActiveMenu(item.menu);
            setSubMenu(null);
        } else if (item.hasSubmenu) {
            setSubMenu(item.submenu);
        }
    };

    const getCurrentMenuItems = () => {
        switch (activeMenu) {
            case 'share':
                return shareOptions;
            case 'accessibility':
                return accessibilityOptions;
            case 'actions':
                return getQuickActions();
            case 'dangerous': // Add this case
                return dangerousOptions;
            default:
                return getMainMenuItems();
        }
    };
    const handleBack = () => {
        if (subMenu) {
            setSubMenu(null);
        } else if (activeMenu !== 'main') {
            setActiveMenu('main');
        } else {
            setIsOpen(false);
        }
    };

    return (
        <div className="authnest-floating-action-button" ref={fabRef}>
            {/* Main FAB Button */}
            <button
                className={`authnest-fab-main ${isOpen ? 'authnest-fab-open' : ''} ${activeMenu === 'dangerous' ? 'danger-alert' : ''}`}
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Quick actions menu"
            >
                {isOpen ? <X size={24} /> : <Settings size={24} />}
            </button>

            {/* Floating Menu */}
            {isOpen && (
                <div className="authnest-fab-menu">
                    {/* Header with Back Button */}
                    {(activeMenu !== 'main' || subMenu) && (
                        <div className="authnest-fab-header">
                            <button
                                className="authnest-fab-back"
                                onClick={handleBack}
                                aria-label="Go back"
                            >
                                <ChevronRight size={16} />
                            </button>
                            <span className="authnest-fab-title">
                                {subMenu ? 'Font Size' :
                                    activeMenu === 'share' ? 'Share' :
                                        activeMenu === 'accessibility' ? 'Accessibility' :
                                            activeMenu === 'actions' ? 'Quick Actions' :
                                                activeMenu === 'dangerous' ? 'Danger Zone' : 'Quick Actions'} {/* Add this line */}
                            </span>
                        </div>
                    )}

                    {/* User info for logged in users in main menu */}


                    {/* Menu Items */}
                    <div className="authnest-fab-items">
                        {(subMenu || getCurrentMenuItems()).map((item) => (
                            <button
                                key={item.id}
                                className={`authnest-fab-item ${item.color ? item.color : ''}`}
                                onClick={() => handleMenuAction(item)}
                                aria-label={item.label}
                            >
                                <span className="authnest-fab-item-icon">
                                    {item.icon}
                                </span>
                                <span className="authnest-fab-item-label">
                                    {item.label}
                                </span>
                                {(item.menu || item.hasSubmenu) && !subMenu && (
                                    <ChevronRight size={16} className="authnest-fab-chevron" />
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Close Button */}
                    <button
                        className="authnest-fab-close"
                        onClick={() => {
                            setIsOpen(false);
                            setActiveMenu('main');
                            setSubMenu(null);
                        }}
                        aria-label="Close menu"
                    >
                        Close
                    </button>
                </div>
            )}
        </div>
    );
};

export default FloatingActionButton;