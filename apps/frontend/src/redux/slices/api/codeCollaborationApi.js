import { apiSlice } from '../apiSlice'


export const codeCollaborationApiSlice = apiSlice.injectEndpoints({
  endpoints: builder => ({
    createRoom: builder.mutation({
      query: data => ({
        url: `/room/create`,
        method: 'POST',
        body: data,
        serviceKey: 'codeCollaborationService',
        credentials: 'include'
      })
    }),
   
    getRoom: builder.mutation({
      query: (id) => ({
        url: `/room/users/${id}`,
        method: 'GET',
        serviceKey: 'codeCollaborationService',
        credentials: 'include'
      })
    }),
    joinRoom: builder.mutation({
      query: data => ({
        url: `/room/join`,
        method: 'POST',
        body: data,
        serviceKey: 'codeCollaborationService',
        credentials: 'include'
      })
    }),
   
    leaveRoom: builder.mutation({
      query: data => ({
        url: `/room/leave`,
        method: 'POST',
        body: data,
        serviceKey: 'codeCollaborationService',
        credentials: 'include'
      })
    }),
   submitCode: builder.mutation({
      query: data => ({
        url: `/code/submit`,
        method: 'POST',
        body: data,
        serviceKey: 'codeCollaborationService',
        credentials: 'include'
      })
    }),

  })
})

export const {
    useCreateRoomMutation,
    useGetRoomMutation,
    useJoinRoomMutation,
    useLeaveRoomMutation,
    useSubmitCodeMutation

} = codeCollaborationApiSlice
