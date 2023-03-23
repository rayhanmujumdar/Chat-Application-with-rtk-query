import { useSelector } from "react-redux";
import { useGetConversationsQuery } from "../../features/conversations/converstionsApi";
import ChatItem from "./ChatItem";
import Error from "../ui/Error";
import moment from "moment";
import getPartnerInfo from "../../utils/getPartnerInfo";
import gravatarUrl from "gravatar-url";
import { Link } from "react-router-dom";

export default function ChatItems() {
  const { user } = useSelector((state) => state.auth) || {};
  const { email } = user || {};
  const {
    data: conversations,
    isLoading,
    error,
    isError,
  } = useGetConversationsQuery(email);
  let content = null;
  if (isLoading) {
    content = <li className="m-2 text-center">Loading...</li>;
  }
  if (!isLoading && isError) {
    content = <Error message={error?.data}></Error>;
  }
  if (!isLoading && !isError && conversations.length === 0) {
    content = <Error message="No conversation found"></Error>;
  }
  if (!isLoading && !isError && conversations.length > 0) {
    content = conversations?.map((conversation) => {
      const { id, message, timestamp } = conversation;
      const { name, email: partnerEmail } = getPartnerInfo(
        conversation.users,
        email
      );
      const partnerAvatarUrl = gravatarUrl(partnerEmail, { size: 80 });
      return (
        <li key={id}>
          <Link to={`/inbox/${id}`}>
            <ChatItem
              avatar={partnerAvatarUrl}
              name={name}
              lastMessage={message}
              lastTime={moment(timestamp).fromNow()}
            />
          </Link>
        </li>
      );
    });
  }
  return <ul>{content}</ul>;
}
