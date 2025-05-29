import {
  useQuery,
  useMutation,
  useQueryClient,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'

// Create a client
// quertClient - 전역상태 / SingleTon 처럼 작동됨
const queryClient = new QueryClient()

// useQuery -> Get the data
// useMutation -> POST/PUT/DELETE
// querKey - > 쿼리식별자 = 캐시의 주소 - Primary Key 같은느낌
// 키에 설정된걸 다시불러오게함 queryClient.invalidatieQuerye 믿을수없는 query-> refrecth시킴

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </BrowserRouter>
)
