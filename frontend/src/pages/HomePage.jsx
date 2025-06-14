// Components
import PostCreation from "../components/home/PostCreation.jsx"
import Sidebar from "../components/home/Sidebar.jsx"
import Post from "../components/home/Post.jsx"
import RecommendedUser from "../components/home/RecommendedUser.jsx"
// Internal Library
import { axiosInstance } from "../lib/axios.js"
// External Library
import { useQuery } from "@tanstack/react-query"
import { Users } from "lucide-react"
import toast from "react-hot-toast"

const HomePage = () => {
    // Q- queryClient - use queryClient 
    // const queryClient = useQueryClient()
    // const authUser = queryClient.getQueryData(["authUser"])

    const { data: authUser } = useQuery({ queryKey: ["authUser"] })
    // fetch recommended users
    // Refactoring later
    const { data: recommendedUsers } = useQuery({
        queryKey: ["recommendedUsers"],
        queryFn: async () => {
            try {
                const res = await axiosInstance.get("/users/suggestions")
                return res.data
            } catch (error) {
                console.error("Failed in fetching recommendedUsers in homepage", error);
                toast.error(error?.response?.data?.message || "Something went wrong")
            }
        }
    })

    // fetch posts
    const { data: posts } = useQuery({
        queryKey: ["posts"],
        queryFn: async () => {
            const res = await axiosInstance.get("/posts/")
            return res.data
        }

    })

    console.log("POSTS", posts);
    return (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="hidden lg:block lg:col-span-1 ">
                <Sidebar user={authUser} />
            </div>
            <div className='col-span-1 lg:col-span-2 order-first lg:order-none'>
                <PostCreation user={authUser} />
                {/* POST CARD */}
                {posts?.map(post => <Post key={post._id} post={post} />)}
                {/* When there is no post */}
                {posts?.length === 0 && (
                    <div className='bg-white rounded-lg shadow p-8 text-center'>
                        <div className='mb-6'>
                            <Users size={64} className='mx-auto text-blue-500' />
                        </div>
                        <h2 className='text-2xl font-bold mb-4 text-gray-800'>No Posts Yet</h2>
                        <p className='text-gray-600 mb-6'>Connect with others to start seeing posts in your feed!</p>
                    </div>
                )}

            </div>
            {/* Recommended users */}
            {recommendedUsers?.length > 0 && (
                <div className='col-span-1 lg:col-span-1 hidden lg:block'>
                    <div className='bg-secondary rounded-lg shadow p-4'>
                        <h2 className='font-semibold mb-4'>People you may know</h2>
                        {recommendedUsers?.map((user) => (
                            <RecommendedUser key={user._id} user={user} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}

export default HomePage