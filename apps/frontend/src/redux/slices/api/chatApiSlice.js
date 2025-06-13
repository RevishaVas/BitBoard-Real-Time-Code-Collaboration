import { apiSlice } from '../apiSlice';

export const chatApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({

    getUsers: builder.query({
      query: () => ({
        url: '/users',
        serviceKey: 'kanbanService'
      })
    }),


    getConversationUsers: builder.query({
      query: (userId) => ({
        url: `/chat/conversations/${userId}`, 
        serviceKey: 'chatService'
      })
    }),


    getChatHistory: builder.query({
      query: ({ user1, user2 }) => ({
        url: `/chat/history/${user1}/${user2}`,
        serviceKey: 'chatService'
      })
    }),


    sendMessage: builder.mutation({
      query: (data) => ({
        url: '/chat/send',
        method: 'POST',
        body: data,
        serviceKey: 'chatService'
      })
    })

  })
});


export const {
  useGetUsersQuery,
  useGetChatHistoryQuery,
  useSendMessageMutation,
  useGetConversationUsersQuery
} = chatApiSlice;