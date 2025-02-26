import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { Table } from 'apache-arrow'

// Define a type for the Arrow data response
interface ArrowDataResponse {
  data: ArrayBuffer
}

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({ baseUrl: '/' }),
  endpoints: (builder) => ({
    getArrowData: builder.query<ArrayBuffer, string>({
      query: (filePath) => ({
        url: filePath,
        responseHandler: async (response) => {
          // Get the raw ArrayBuffer from the response
          const arrayBuffer = await response.arrayBuffer()
          return arrayBuffer
        },
      }),
      // Transform the response if needed
      transformResponse: (response: ArrayBuffer) => {
        return response
      },
    }),
  }),
})

// Export the auto-generated hooks for the endpoints
export const { useGetArrowDataQuery } = apiSlice 