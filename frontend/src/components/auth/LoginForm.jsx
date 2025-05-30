import React, { useState } from 'react'
import { axiosInstance } from "../../lib/axios.js"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Loader } from "lucide-react"
import toast from "react-hot-toast"
const LoginForm = () => {
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    // QueryClient- Q
    const queryClient = useQueryClient();

    // invalidates queryies -> 그 쿼리를 다시 재 실행하세용
    const { mutate: loginMutation, isLoading } = useMutation({
        mutationFn: (userData) => axiosInstance.post("/auth/login", userData),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["authUser"] })
        },
        onError: (error) => {
            console.error(error.response.data.message || "Failed to Login")
            toast.error(error.response.data.message || "Login Failed")
        }
    })
    const handleSubmit = (e) => {
        e.preventDefault()
        console.log("Sending login data:", { username, password })
        loginMutation({ username, password })
    }
    // BUILD UI
    return (
        <form onSubmit={handleSubmit} className='space-y-4 w-full max-w-md'>
            <input
                type='text'
                placeholder='Username'
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className='input input-bordered w-full'
                required
            />
            <input
                type='password'
                placeholder='Password'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className='input input-bordered w-full'
                required
            />

            <button type='submit' className='btn btn-primary w-full'>
                {isLoading ? <Loader className='size-5 animate-spin' /> : "Login"}
            </button>
        </form>
    );
}

export default LoginForm