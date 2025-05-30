// Components
import PostCreation from "../components/home/PostCreation.jsx"
import Sidebar from "../components/home/Sidebar.jsx"
// Internal Library
import { axiosInstance } from "../lib/axios.js"
// External Library
import { useQuery } from "@tanstack/react-query"
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
            </div>
        </div>
    )
}

export default HomePage