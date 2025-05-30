
import { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { axiosInstance } from "../../lib/axios.js"
import toast from "react-hot-toast"
import { Image, Loader } from "lucide-react"
// COMPONENTS
const PostCreation = ({ user }) => {
    const [content, setContent] = useState("")
    const [image, setImage] = useState(null)
    const [imagePreview, setImagePriview] = useState(null)

    const queryClient = useQueryClient();

    // Mutation -API 
    const { mutate: createPostMutation, isPending } = useMutation({
        mutationFn: async (postData) => {
            const res = await axiosInstance.post("/posts/create", postData, {
                headers: { "Content-Type": "application/json" }
            })
            return res.data
        },
        onSuccess: () => {
            toast.success("Post created successfully")
            resetForm()
            queryClient.invalidateQueries(["posts"])
        },
        onError: (error) => {
            toast.error(error.response.data.message || "Failed to create new post")
        }
    })

    const handlePostCreation = async () => {
        try {
            // 항사 이미지 / content따로 관리해주기
            const postData = { content }
            if (image) postData.image = await readFileAsDataURL(image)
            createPostMutation(postData)
        } catch (error) {
            console.error("Error in handlePostCreation", error)
        }
    }

    const resetForm = () => {
        setContent(""),
            setImage(null),
            setImagePriview(null)
    }

    //  Q - Study in Detailed
    const readFileAsDataURL = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onError = reject;
            reader.readAsDataURL(file)
        })
    }
    // Q- Study in detailed
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        setImage(file);
        if (file) {
            readFileAsDataURL(file).then(setImagePriview)
        } else {
            setImagePriview(null)
        }


    }
    // BUILD UI
    return (
        <div className='bg-gray-100 rounded-lg shadow mb-4 p-4'>
            <div className="flex space-x-3">
                <img src={user.profilePicture || "/avatar.png"} alt={user.name} className='size-12 rounded-full' />
                <textarea
                    placeholder="What's on your mind?"
                    className='w-full p-3 rounded-lg bg-base-100 hover:bg-base-200 focus:bg-base-200 focus:outline-none resize-none transition-colors duration-200 min-h-[100px]'
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                />
            </div>
            {imagePreview && (
                <div className='mt-4'>
                    <img src={imagePreview} alt='Selected' className='w-full h-auto rounded-lg' />
                </div>
            )}

            <div className='flex justify-between items-center mt-4'>
                <div className='flex space-x-4'>
                    <label className='flex items-center text-info hover:text-info-dark transition-colors duration-200 cursor-pointer'>
                        <Image size={20} className='mr-2' />
                        <span>Photo</span>
                        <input type='file' accept='image/*' className='hidden' onChange={handleImageChange} />
                    </label>
                </div>
                {/* Disabled 항상 다뤄주기 */}
                <button
                    className='bg-primary text-white rounded-lg px-4 py-2 hover:bg-primary-dark transition-colors duration-200'
                    onClick={handlePostCreation}
                    disabled={isPending}
                >
                    {isPending ? <Loader className='size-5 animate-spin' /> : "Share"}
                </button>
            </div>
        </div>
    )
}

export default PostCreation