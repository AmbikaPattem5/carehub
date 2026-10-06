import { Search, Bell, ChevronDown } from "lucide-react";
import { useState } from "react";
import useAuth from "../CustomHooks/useAuth";
function Header() {
    const { user, logout } = useAuth();
    const [isDropDown, setIsDropDown] = useState(false);
    function handleDropDown() {
        setIsDropDown(!isDropDown);
    }
    return (
        <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-xs transition-all">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-18">
                    <div className="relative w-64">
                        {/* <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input type="text" className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-gray-300 bg-gray-50/50 outline-hidden focus:border-red-500 focus:bg-white focus:ring-2 focus:ring-red-100 transition" /> */}
                    </div>
                    <div className="flex items-center justify-center w-36">
                        {/* <Bell className="text-gray-400" size={20} /> */}
                    </div>
                    <div className="flex relative items-center justify-center w-36">
                        <span>{user ? user : "Guest"}</span>
                        {/* <ChevronDown className="text-gray-400" size={20} onClick={handleDropDown} />
                        {isDropDown && (
                            <div className="absolute top-10 right-0 w-48 bg-white rounded-xl border border-gray-200 shadow-lg">
                                <div className="py-1">
                                    <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Profile</a>
                                    <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Settings</a>
                                    <button onClick={logout} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Logout</button>
                                </div>
                            </div>
                        )} */}
                    </div>
                </div>
            </div>
        </header>
    )
}
export default Header