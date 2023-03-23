import { apiSlice } from "../api/apiSlice";
import { messagesApi } from "../messages/messagesApi";
import { io } from "socket.io-client";

export const conversationsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getConversations: builder.query({
      query: (email) =>
        `/conversations?participants_like=${email}&_sort=timestamp&_order=desc&_page=1&_limit=${process.env.REACT_APP_CONVERSATIONS_PER_PAGE}`,
      async onCacheEntryAdded(
        args,
        { updateCachedData, cacheDataLoaded, cacheEntryRemoved }
      ) {
        //create socket
        const socket = io("http://localhost:9000", {
          reconnectionDelay: 1000,
          reconnection: true,
          reconnectionAttempts: 10,
          transports: ["websocket"],
          agent: false,
          upgrade: false,
          rejectUnauthorized: false
        });
        try {
          await cacheDataLoaded;
          socket.on("conversation", (data) => {
            updateCachedData(draft => {
              const conversation = draft.find(c => c.id == data.data.id)
              if(conversation?.id){
                conversation.message = data.data.message
                conversation.timestamp = data.data.timestamp
              }else{
                
              }
            })
          });
        } catch (err) {}
        await cacheEntryRemoved
        socket.close()
      },
    }),
    getConversation: builder.query({
      query: ({ myEmail, partnerEmail }) => {
        return `/conversations?participants_like=${myEmail}-${partnerEmail}&&participants_like=${partnerEmail}-${myEmail}`;
      },
    }),
    addConversation: builder.mutation({
      query: ({ data, sender }) => ({
        url: "/conversations",
        method: "POST",
        body: data,
      }),
      async onQueryStarted({ sender, data }, { queryFulfilled, dispatch }) {
        // optimistic cache update start
        const addConversationCacheUpdate = dispatch(
          apiSlice.util.updateQueryData("getConversations", sender, (draft) => {
            draft.push(data);
          })
        );
        // optimistic cache update end
        try {
          const conversation = await queryFulfilled;
          if (conversation?.id) {
            const users = data.users;
            const senderUser = users.find((user) => user.email === sender);
            const receiverUser = users.find((user) => user.email !== sender);

            await dispatch(
              messagesApi.endpoints.addMessage.initiate({
                conversationId: conversation?.id,
                sender: senderUser,
                receiver: receiverUser,
                message: data.message,
                timestamp: data.timestamp,
              })
            );
          }
        } catch (err) {
          addConversationCacheUpdate.undo();
        }
      },
    }),
    editConversation: builder.mutation({
      query: ({ id, data }) => ({
        url: `/conversations/${id}`,
        method: "PATCH",
        body: data,
      }),
      async onQueryStarted({ id, sender, data }, { queryFulfilled, dispatch }) {
        // optimistic cache update start
        const updateCacheConversation = dispatch(
          apiSlice.util.updateQueryData("getConversations", sender, (draft) => {
            const draftEditConversation = draft.find(
              (conversation) => conversation.id == id
            );
            draftEditConversation.message = data.message;
            draftEditConversation.timestamp = data.timestamp;
          })
        );
        // optimistic cache update end
        const { data: conversation } = await queryFulfilled;
        if (conversation?.id) {
          const users = data.users;
          const senderUser = users.find((user) => user.email === sender);
          const receiverUser = users.find((user) => user.email !== sender);
          try {
            await dispatch(
              messagesApi.endpoints.addMessage.initiate({
                conversationId: conversation?.id,
                sender: senderUser,
                receiver: receiverUser,
                message: data.message,
                timestamp: data.timestamp,
              })
            );
            // dispatch(
            //   apiSlice.util.updateQueryData(
            //     "getMessages",
            //     res.data.conversationId.toString(),
            //     (draft) => {
            //       draft.push(res.data);
            //     }
            //   )
            // );
          } catch (err) {
            updateCacheConversation.undo();
          }
        }
      },
    }),
  }),
});

export const {
  useGetConversationsQuery,
  useGetConversationQuery,
  useAddConversationMutation,
  useEditConversationMutation,
} = conversationsApi;
