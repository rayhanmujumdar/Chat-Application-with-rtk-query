import { apiSlice } from "../api/apiSlice";
import { userLoggedIn } from "./authSlice";

export const authApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    register: builder.mutation({
      query: (data) => ({
        url: "/register",
        method: "POST",
        body: data,
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const result = await queryFulfilled;
          const auth = {
            accessToken: result.data.accessToken,
            user: result.data.user,
          };
          localStorage.setItem("auth", JSON.stringify(auth));
          dispatch(userLoggedIn(auth));
        } catch (err) {
          console.log(err);
        }
      },
    }),
    login: builder.mutation({
      query: (data) => ({
        url: "/login",
        method: "POST",
        body: data,
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const result = await queryFulfilled;
          const auth = {
            accessToken: result.data.accessToken,
            user: result.data.user,
          };
          localStorage.setItem("auth", JSON.stringify(auth));
          dispatch(userLoggedIn(auth));
        } catch (err) {
          console.log(err);
        }
      },
    }),
  }),
});

export const { useLoginMutation, useRegisterMutation } = authApi;
