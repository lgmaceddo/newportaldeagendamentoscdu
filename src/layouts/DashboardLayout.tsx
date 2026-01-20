
import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { Footer } from "@/components/Footer";
import { NoticeSheet } from "@/components/NoticeSheet";
import { UserNameModal } from "@/components/modals/UserNameModal";
import { MigrationModal } from "@/components/modals/MigrationModal";
import { useData } from "@/contexts/DataContext";
import { useAuth } from "@/contexts/AuthContext";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";

// Define the shape of the context we'll pass to child routes
export type DashboardOutletContextType = {
    currentSection: string;
    currentSubCategory: string;
};

export const DashboardLayout = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [currentSection, setCurrentSection] = useState("scripts");
    const [currentSubCategory, setCurrentSubCategory] = useState("UNIMED");
    const [isNoticeSheetOpen, setIsNoticeSheetOpen] = useState(false);
    const [showUserNameModal, setShowUserNameModal] = useState(false);
    const [showMigrationModal, setShowMigrationModal] = useState(false);

    // Extract only needed data/functions from useData
    const {
        noticeData,
        addNotice,
        updateNotice,
        deleteNotice,
        userName,
        setUserName,
        headerTagData,
        updateHeaderTag,
        isLoading,
        syncAllDataFromSupabase: loadAllDataFromSupabase
    } = useData();

    const { user } = useAuth();

    const [showLoader, setShowLoader] = useState(false); // Default to false initially

    useEffect(() => {
        setShowLoader(!!isLoading);
        let timer: NodeJS.Timeout;
        if (isLoading) {
            timer = setTimeout(() => {
                setShowLoader(false); // Force hide loader after 5s to avoid permanent block
            }, 5000);
        }
        return () => {
            if (timer) clearTimeout(timer);
        }
    }, [isLoading]);

    // Move useEffects that depend on state variables BEFORE conditional return
    useEffect(() => {
        // Sync Supabase Auth user display name with DataContext userName only if userName is empty
        // This avoids reverting manual changes while they are being persisted
        if (!userName && user?.user_metadata?.display_name) {
            setUserName(user.user_metadata.display_name);
        } else if (!userName && !isLoading) {
            // Only show modal if we don't have a name from Auth AND no local name
            setShowUserNameModal(true);
        }
    }, [userName, user, setUserName, isLoading]);

    // Handle location changes to manage sidebar highlighting
    useEffect(() => {
        if (location.pathname === '/search') {
            // When on search page, do not highlight any sidebar item
            setCurrentSection("");
        } else if (location.pathname === '/' && !currentSection) {
            // When returning to dashboard without a section, default to scripts
            setCurrentSection("scripts");
            setCurrentSubCategory("UNIMED");
        }
    }, [location.pathname]);

    // Handle navigation from global search or search results
    useEffect(() => {
        // Clear search result state from location after processing
        if (location.state && location.state.section) {
            setCurrentSection(location.state.section);

            // Set default subcategory based on section
            if (location.state.section === 'scripts') {
                setCurrentSubCategory(location.state.subCategory || "UNIMED");
            } else if (location.state.section === 'contatos') {
                setCurrentSubCategory('GERAL');
            } else {
                setCurrentSubCategory("");
            }

            // Clear the search result state to prevent re-triggering
            if (location.state.searchResult) {
                // Replace state without searchResult to prevent re-opening
                const newState = { ...location.state };
                delete newState.searchResult;
                window.history.replaceState(newState, document.title, location.pathname);
            }
        }
    }, [location.state]);



    const handleSaveUserName = (name: string) => {
        setUserName(name);
        setShowUserNameModal(false);
    };

    const handleNavigate = (section: string, subCategory?: string) => {
        setCurrentSection(section);

        // Define a subcategoria padrão se for Contatos
        if (section === 'contatos') {
            setCurrentSubCategory('GERAL');
        } else {
            setCurrentSubCategory(subCategory || "");
        }

        // If we are NOT on the root page (e.g. on /search), we must navigate to root
        // so that the Index page can render the correct section.
        if (location.pathname !== '/') {
            navigate('/', { state: { section, subCategory } });
        } else {
            // Clear any search result state when manually navigating
            if (location.state?.searchResult) {
                navigate(location.pathname, { state: { section, subCategory }, replace: true });
            }
        }
    };

    return (
        <div className="flex flex-col h-screen">
            <Header
                onNotificationClick={() => setIsNoticeSheetOpen(true)}
                notificationCount={noticeData.length}
                userName={userName}
                setUserName={setUserName}
                headerTagData={headerTagData}
                updateHeaderTag={updateHeaderTag}
                onMigrationClick={() => setShowMigrationModal(true)}
                isLoading={isLoading}
                onSyncClick={loadAllDataFromSupabase}
            />
            <div className="flex flex-1 overflow-hidden">
                <Sidebar
                    onNavigate={handleNavigate}
                    currentSection={currentSection}
                    currentSubCategory={currentSubCategory}
                />
                <main className="flex-1 p-6 lg:p-8 bg-background overflow-y-auto">
                    <Outlet context={{ currentSection, currentSubCategory } satisfies DashboardOutletContextType} />
                </main>
            </div>
            <Footer />
            <NoticeSheet
                isOpen={isNoticeSheetOpen}
                onClose={() => setIsNoticeSheetOpen(false)}
                notices={noticeData}
                onAdd={addNotice}
                onUpdate={updateNotice}
                onDelete={deleteNotice}
            />
            <UserNameModal
                open={showUserNameModal}
                onSave={handleSaveUserName}
            />
            <MigrationModal
                open={showMigrationModal}
                onClose={() => setShowMigrationModal(false)}
            />
        </div>
    );
};
