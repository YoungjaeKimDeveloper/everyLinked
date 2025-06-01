/*

    API = Method + EndPoint
    Refactoring - Divide the funcion / UI later
    Switch Case - When we need to render different UI according to type
    Mutation 이름 항상 동일시하게 작성해주기
    // deleteNotificationMutation

*/
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { axiosInstance } from "../../lib/axios.js"
import toast from "react-hot-toast"
import { Link } from "react-router-dom"
import { ThumbsUp, MessageSquare, UserPlus, ExternalLink } from "lucide-react"
import Sidebar from "./Sidebar.jsx"
import { Eye, Trash2 } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
const NotificationPage = () => {
    const queryClient = useQueryClient()
    // Refactoring - cause of the error message
    const { data: authUser } = useQuery({ queryKey: ["authUser"] })
    // fetch notification
    // fetch - try catch combination + hottoast
    const { data: notifications, isLoading: isNotificationLoading } = useQuery({
        queryKey: ["notifications"],
        queryFn: () => axiosInstance.get("/notifications")
    })
    // Read the notification
    // Mutation -> mutationFn
    // onSuccess + onError combination -Q
    const { mutate: markAsReadMutation } = useMutation({
        mutationFn: (id) => axiosInstance.put(`/notifications/${id}/read`),
        onSuccess: () => {
            // Refetch the notifications - Q 
            // Query key base
            queryClient.invalidateQueries({ queryKey: ["notifications"] })
        }, onError: (error) => {
            console.error("ERROR IN markAsReadMutations", error)
            toast.error(error?.response?.data?.message || "Something wrong in  markAsReadMutations")
        }
    })
    const { mutate: deleteNotificationMutation } = useMutation({
        mutationFn: (id) => axiosInstance.delete(`/notification/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: "notifications" })
            toast.success("Notification has been deleted successfully")
        }, onError: (error) => {
            console.error("ERROR IN deleteNotifications", error)
            toast.error(error?.response?.data?.message || "Something wrong in  deleteNotifications")
        }
    })


    const renderNotificationIcon = (type) => {
        switch (type) {
            case "like":
                return <ThumbsUp className='text-blue-500' />;

            case "comment":
                return <MessageSquare className='text-green-500' />;
            case "connectionAccepted":
                return <UserPlus className='text-purple-500' />;
            default:
                return null;
        }
    };

    // RENDER CONTENT
    const renderNotificationContent = (notification) => {
        switch (notification.type) {
            case "like":
                return (
                    <span>
                        <strong>{notification.relatedUser.name}</strong> liked your post
                    </span>
                );
            case "comment":
                return (
                    <span>
                        <Link to={`/profile/${notification.relatedUser.username}`} className='font-bold'>
                            {notification.relatedUser.name}
                        </Link>
                        commented on your post
                    </span>
                );
            case "connectionAccepted":
                return (
                    <span>
                        <Link to={`/profile/${notification.relatedUser.username}`} className='font-bold'>
                            {notification.relatedUser.name}
                        </Link>
                        accepted your connection request
                    </span>
                );
            default:
                return null;
        }
    };
    // Renavent POST - Q 
    // Make sure to double-check this part later.

    const renderRelatedPost = (relatedPost) => {
        if (!relatedPost) return null;

        return (
            <Link
                to={`/post/${relatedPost._id}`}
                className='mt-2 p-2 bg-gray-50 rounded-md flex items-center space-x-2 hover:bg-gray-100 transition-colors'
            >
                {relatedPost.image && (
                    <img src={relatedPost.image} alt='Post preview' className='w-10 h-10 object-cover rounded' />
                )}
                <div className='flex-1 overflow-hidden'>
                    <p className='text-sm text-gray-600 truncate'>{relatedPost.content}</p>
                </div>
                <ExternalLink size={14} className='text-gray-400' />
            </Link>
        );
    };
    // BUILD UI - SRP DIV
    return (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            <div className="col-span-1 lg:col-span-1">
                <Sidebar user={authUser} />
            </div>
            <div className="col-span-1 lg:col-span-3">
                <div className="bg-white rounded-lg shadow p-6">
                    <h1 className="text-2xl font-bold mb-6">
                        NOtifications
                    </h1>
                    {isNotificationLoading ? (
                        <p>Loading notifications...</p>
                    ) : notifications && notifications.data.length > 0 ? (
                        <ul>
                            {notifications.data.map((notification) => (
                                <li
                                    key={notification._id}
                                    className={`bg-white border rounded-lg p-4 my-4 transition-all hover:shadow-md ${!notification.read ? "border-blue-500" : "border-gray-200"
                                        }`}
                                >
                                    <div className='flex items-start justify-between'>
                                        <div className='flex items-center space-x-4'>
                                            <Link to={`/profile/${notification.relatedUser.username}`}>
                                                <img
                                                    src={notification.relatedUser.profilePicture || "/avatar.png"}
                                                    alt={notification.relatedUser.name}
                                                    className='w-12 h-12 rounded-full object-cover'
                                                />
                                            </Link>

                                            <div>
                                                <div className='flex items-center gap-2'>
                                                    <div className='p-1 bg-gray-100 rounded-full'>
                                                        {renderNotificationIcon(notification.type)}
                                                    </div>
                                                    <p className='text-sm'>{renderNotificationContent(notification)}</p>
                                                </div>
                                                <p className='text-xs text-gray-500 mt-1'>
                                                    {formatDistanceToNow(new Date(notification.createdAt), {
                                                        addSuffix: true,
                                                    })}
                                                </p>
                                                {renderRelatedPost(notification.relatedPost)}
                                            </div>
                                        </div>

                                        <div className='flex gap-2'>
                                            {!notification.read && (
                                                <button
                                                    onClick={() => markAsReadMutation(notification._id)}
                                                    className='p-1 bg-blue-100 text-blue-600 rounded hover:bg-blue-200 transition-colors'
                                                    aria-label='Mark as read'
                                                >
                                                    <Eye size={16} />
                                                </button>
                                            )}

                                            <button
                                                onClick={() => deleteNotificationMutation(notification._id)}
                                                className='p-1 bg-red-100 text-red-600 rounded hover:bg-red-200 transition-colors'
                                                aria-label='Delete notification'
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p>No notification at the moment.</p>
                    )}
                </div>
            </div>
        </div>
    )
}

export default NotificationPage