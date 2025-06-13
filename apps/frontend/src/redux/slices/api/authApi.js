import { apiSlice } from '../apiSlice'

const Auth_URL = '/auth'

export const authApiSlice = apiSlice.injectEndpoints({
  endpoints: builder => ({
    loginUser: builder.mutation({
      query: data => ({
        url: `${Auth_URL}/login`,
        method: 'POST',
        body: data,
        serviceKey: 'authService',
        credentials: 'include'
      })
    }),
   
    logout: builder.mutation({
      query: () => ({
        url: `${Auth_URL}/logout`,
        method: 'POST',
        serviceKey: 'authService',
        credentials: 'include'
      })
    }),
    
   
  })
})

export const {
  useLoginUserMutation,
  useLogoutMutation,

} = authApiSlice
