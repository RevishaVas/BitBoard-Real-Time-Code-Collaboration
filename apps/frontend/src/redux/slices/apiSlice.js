import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const serviceUrls = {
  authService: 'http://localhost:5001',
  codeCollaborationService: 'http://localhost:5002',
  kanbanService: 'http://localhost:5003',
  commentService: 'http://localhost:5004',
  notificationService: 'http://localhost:5005',
  chatService: 'http://localhost:5006',
};

const dynamicBaseQuery = async (args, api, extraOptions) => {
  const { serviceKey, ...restArgs } = args;

  const baseUrl = serviceUrls[serviceKey] + '/api';

  const rawBaseQuery = fetchBaseQuery({
    baseUrl,
    credentials: 'include',
  });

  return rawBaseQuery(restArgs, api, extraOptions);
};

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: dynamicBaseQuery,
  endpoints: () => ({}),
});

export default apiSlice;