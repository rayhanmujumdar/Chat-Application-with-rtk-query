// import Blank from "./Blank";
import ChatHead from "./ChatHead";
import Messages from "./Messages";
import Options from "./Options";
import { useParams } from "react-router-dom";
import { useGetMessagesQuery } from "../../../features/messages/messagesApi";
import Error from "../../ui/Error";
import { useSelector } from "react-redux";


export default function ChatBody() {
  const { user } = useSelector((state) => state.auth);
  const { id } = useParams();
  const { data, isLoading, isError, error } = useGetMessagesQuery(id);
  let content = null;

  const {data: messages,totalCount} = data || {}
  if (isLoading) {
    content = <div className="m-2 text-xl">Loading...</div>;
  }
  if (!isLoading && isError) {
    content = <Error message={error?.data}></Error>;
  }
  if (!isLoading && !isError && messages?.length === 0) {
    content = <Error message="No messages here"></Error>;
  }
  if (!isLoading && !isError && messages?.length > 0) {
    content = (
      <>
        <ChatHead message={messages[0]} />
        
          <Messages messages={messages} user={user} totalCount={totalCount}/>
        
        <Options info={messages[0]} />
      </>
    );
  }
  return (
    <div className="w-full lg:col-span-2 lg:block">
      <div className="w-full grid conversation-row-grid">{content}</div>
    </div>
  );
}
