/*
    useQuery: fetch
    useMutation: PUT,POST,DELETE
    
    queryClient.invalidateQueries({ queryKey: ['todos'] }) 
        - 특정 queryKey 기반 캐시를 무효화하여 refetch 유도

    const queryClient = useQueryClient() 
        - React Query의 전역 캐시 인스턴스 (Queryclient) 에 접근가능(Singleton pattern)

    useQueryClient -> queryClient에서 
        - 직접 객체를 생성하지않고 현재 Provider 컨텍스트 내에서 제어 가능

*/
import { useState } from "react"
import { useMutation } from "@tanstack/react-query"
import { axiosInstance } from "../../lib/axios.js"
import { toast } from "react-hot-toast"
import { Loader } from "lucide-react"

const SignUpForm = () => {
    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")

    // SIGNUP MUTATION
    const { mutate: signUpMutation, isLoading } = useMutation({
        mutationFn: async (data) => {
            const res = await axiosInstance.post("/auth/signup", data)
            return res.data
        },
        onSuccess: () => {
            toast.success("Account created successfully");
        },
        onError: (error) => {
            // 에러 다루는법도 알아야함
            console.log(error)
            toast.error("Failed to create new account");
        },
    })

    const handleSignUp = (e) => {
        e.preventDefault();
        // API 통해서 값 보내주기
        signUpMutation({ name, email, username, password })

    }
    // BUILD UI
    return (
        <form onSubmit={handleSignUp} className="flex flex-col gap-4">
            <input
                type='text'
                placeholder='Full name'
                value={name}
                onChange={(e) => setName(e.target.value)}
                className='input input-bordered w-full'
                required
            />
            <input
                type='text'
                placeholder='Username'
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className='input input-bordered w-full'
                required
            />
            <input
                type='email'
                placeholder='Email'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className='input input-bordered w-full'
                required
            />
            <input
                type='password'
                placeholder='Password (6+ characters)'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className='input input-bordered w-full'
                required
            />
            {/* Loading */}
            {/* Loading 보여줄떄 화면전환하지말고 Action만 못하게 막아주기 - disabled로 잘 막아주기 */}
            <button type='submit' disabled={isLoading} className='btn btn-primary w-full text-white'>
                {isLoading ? <Loader className='size-5 animate-spin' /> : "Agree & Join"}
            </button>
        </form>
    )
}

export default SignUpForm