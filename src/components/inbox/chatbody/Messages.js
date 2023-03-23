import Message from "./Message";
import InfiniteScroll from "react-infinite-scroll-component";
import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { messagesApi } from "../../../features/messages/messagesApi";
export default function Messages({ messages = [], user, totalCount }) {
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const { email } = user || {};
  const dispatch = useDispatch();
  const handleFetchMore = () => {
    console.log("hello");
    setPage((prevPage) => prevPage + 1);
  };
  useEffect(() => {
    if (totalCount > 0) {
      const more =
        Math.ceil(
          totalCount / Number(process.env.REACT_APP_MESSAGES_PER_PAGE)
        ) > page;
      setHasMore(more);
    }
  }, [totalCount, page]);
  useEffect(() => {
    if (page > 1) {
      dispatch(
        messagesApi.endpoints.getMoreMessage.initiate({
          page,
          id: messages[0]?.conversationId,
        })
      );
    }
  }, [page, dispatch, messages]);
  return (
    <div
      id="scrollableDiv"
      className="relative w-full h-[calc(100vh_-_197px)] p-6 overflow-y-auto flex flex-col-reverse"
    >
      <ul className="space-y-2 flex flex-col-reverse">
        <InfiniteScroll
          dataLength={messages.length} //This is important field to render the next data
          next={handleFetchMore}
          hasMore={hasMore}
          loader={<h4>Loading...</h4>}
          height={window.innerHeight - 129}
          style={{ display: "flex", flexDirection: "column-reverse" }}
          inverse={true}
          id="scrollableDiv"
        >
          {messages
            .slice()
            .sort((a, b) =>  b?.timestamp - a?.timestamp)
            .map((message) => {
              const {
                id,
                sender,
                message: conversation,
                timestamp,
              } = message || {};
              const justify = email !== sender?.email ? "start" : "end";
              return (
                <Message
                  key={id}
                  justify={justify}
                  message={conversation}
                  timestamp={timestamp}
                />
              );
            })}
        </InfiniteScroll>
      </ul>
    </div>
  );
}
