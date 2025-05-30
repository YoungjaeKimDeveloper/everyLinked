import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { axiosInstance } from '../../lib/axios'
import toast from 'react-hot-toast'
import { Link } from 'react-router-dom'
import { Home, Users, Bell, User, LogOut } from "lucide-react"

// AXIOS 는 항상 res.data안에 값알 가져오게됌
const Navbar = () => {
    const { data: authUser } = useQuery({
        queryKey: ["authUser"]
    })
    const queryClient = useQueryClient()
    // 가져온 데이터가 notification에 들어가게됨
    const { data: notifications, isLoading } = useQuery({
        queryKey: ["notification"],
        queryFn: async () => {
            try {
                const res = await axiosInstance.get("/notifications");
                return res.data
            } catch (error) {
                if (error.response && error.response.stats === 500) {
                    console.error("Failed to fetch notifications", error)
                    toast.error("Failed to fetch notifications")
                }
            }
        },
        // Bang Bang Operator  - Q
        enabled: !!authUser,
    })
    const { data: connectionRequests } = useQuery({
        queryKey: ["connectionRequests"],
        queryFn: async () => {
            try {
                const res = await axiosInstance.get("/connections/requests");
                return res.data
            } catch (error) {
                if (error.response && error.response.stats === 500) {
                    console.error("Failed to fetch notifications", error)
                    toast.error("Failed to fetch notifications")
                }
            }
        },
        // Bang Bang Operator  - Q
        enabled: !!authUser,
    })
    const { mutate: logout } = useMutation({
        mutationFn: async () => {
            await axiosInstance.post("/auth/logout")
        },
        onSuccess: () => {
            toast.success("Logout Successfully")
            queryClient.invalidateQueries({ queryKey: ["authUser"] })
        },
        onError: (error) => {
            console.error("Failed to logout", error)
            toast.error("Failed to logout")
        },
    })
    const unreadNotificationCount = (notifications || []).filter((notification) => !notification.read).length
    const unreadConnectionRequestCount = connectionRequests?.length ?? 0
    // BUILD UI

    return (
        <nav className='bg-blue-200 shadow-md sticky top-0 z-10'>
            <div className='max-w-7xl mx-auto px-4'>
                <div className='flex justify-between items-center py-3'>
                    <div className='flex items-center space-x-4'>
                        <Link to='/'>
                            <img className='h-8 rounded' src='/small-logo.png' alt='LinkedIn' />
                        </Link>
                    </div>
                    <div className='flex items-center gap-2 md:gap-6'>
                        {authUser ? (
                            <>
                                <Link to={"/"} className='text-neutral flex flex-col items-center'>
                                    <Home size={20} />
                                    <span className='text-xs hidden md:block'>Home</span>
                                </Link>
                                <Link to='/network' className='text-neutral flex flex-col items-center relative'>
                                    <Users size={20} />
                                    <span className='text-xs hidden md:block'>My Network</span>
                                    {unreadConnectionRequestCount > 0 && (
                                        <span
                                            className='absolute -top-1 -right-1 md:right-4 bg-blue-500 text-white text-xs 
										rounded-full size-3 md:size-4 flex items-center justify-center'
                                        >
                                            {unreadConnectionRequestCount}
                                        </span>
                                    )}
                                </Link>
                                <Link to='/notifications' className='text-neutral flex flex-col items-center relative'>
                                    <Bell size={20} />
                                    <span className='text-xs hidden md:block'>Notifications</span>
                                    {unreadNotificationCount > 0 && (
                                        <span
                                            className='absolute -top-1 -right-1 md:right-4 bg-blue-500 text-white text-xs 
										rounded-full size-3 md:size-4 flex items-center justify-center'
                                        >
                                            {unreadNotificationCount}
                                        </span>
                                    )}
                                </Link>
                                <Link
                                    to={`/profile/${authUser.username}`}
                                    className='text-neutral flex flex-col items-center'
                                >
                                    <User size={20} />
                                    <span className='text-xs hidden md:block'>Me</span>
                                </Link>
                                <button
                                    className='flex items-center space-x-1 text-sm text-gray-600 hover:text-gray-800'
                                    onClick={() => logout()}
                                >
                                    <LogOut size={20} />
                                    <span className='hidden md:inline'>Logout</span>
                                </button>
                            </>
                        ) : (
                            <>
                                <Link to='/login' className='btn btn-ghost'>
                                    Sign In
                                </Link>
                                <Link to='/signup' className='btn btn-primary'>
                                    Join now
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}

export default Navbar