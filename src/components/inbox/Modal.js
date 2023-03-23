import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  conversationsApi,
  useAddConversationMutation,
  useEditConversationMutation,
} from "../../features/conversations/converstionsApi";
import { useGetUsersQuery } from "../../features/users/usersApi";
import isValidEmail from "../../utils/isValidEmail";
import Error from "../ui/Error";
import debounceHandler from "../../utils/debounceHandler";
export default function Modal({ open, control }) {
  const [to, setTo] = useState("");
  const [message, setMessage] = useState("");
  const [checkEmail, setCheckEmail] = useState(false);
  const [responseError, setResponseError] = useState("");
  const [conversation, setConversation] = useState(undefined);
  const dispatch = useDispatch();
  const { user: loggedUser } = useSelector((state) => state.auth) || {};
  const { email: myEmail } = loggedUser || {};
  const { data: participants = {} } = useGetUsersQuery(to, {
    skip: !checkEmail,
  });

  const [addConversation, { isSuccess: isAddConversationSuccess }] =
    useAddConversationMutation();
  const [editConversation, { isSuccess: isEditConversationSuccess }] =
    useEditConversationMutation();
  useEffect(() => {
    if (participants.length > 0 && participants[0].email !== myEmail) {
      dispatch(
        conversationsApi.endpoints.getConversation.initiate({
          myEmail,
          partnerEmail: to,
        })
      )
        .unwrap()
        .then((result) => {
          setConversation(result);
        })
        .catch((err) => {
          setResponseError(err.message);
        });
    }
  }, [participants, myEmail, dispatch, to]);

  useEffect(() => {
    if (isAddConversationSuccess || isEditConversationSuccess) {
      setMessage("");
      control();
    }
  }, [isAddConversationSuccess, isEditConversationSuccess]);
  // callback fn
  const doSearch = (value) => {
    if (isValidEmail(value)) {
      setCheckEmail(true);
      setTo(value);
    }
  };

  const handleSearch = debounceHandler(doSearch, 500);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (conversation.length > 0) {
      // edit conversation
      editConversation({
        id: conversation[0].id,
        sender: myEmail,
        data: {
          participants: `${myEmail}-${participants[0].email}`,
          users: [loggedUser, participants[0]],
          message,
          timestamp: new Date().getTime(),
        },
      });
    } else if (conversation.length === 0) {
      // add conversation
      addConversation({
        sender: myEmail,
        data: {
          participants: `${myEmail}-${participants[0].email}`,
          users: [loggedUser, participants[0]],
          message,
          timestamp: new Date().getTime(),
        },
      });
    }
  };
  return (
    open && (
      <>
        <div
          onClick={control}
          className="fixed w-full h-full inset-0 z-10 bg-black/50 cursor-pointer"
        ></div>
        <div className="rounded w-[400px] lg:w-[600px] space-y-8 bg-white p-10 absolute top-1/2 left-1/2 z-20 -translate-x-1/2 -translate-y-1/2">
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Send message
          </h2>
          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            <input type="hidden" name="remember" value="true" />
            <div className="rounded-md shadow-sm -space-y-px">
              <div>
                <label htmlFor="to" className="sr-only">
                  To
                </label>
                <input
                  onChange={(e) => handleSearch(e.target.value)}
                  id="to"
                  name="to"
                  type="email"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-violet-500 focus:border-violet-500 focus:z-10 sm:text-sm"
                  placeholder="Send to"
                />
              </div>
              <div>
                <label htmlFor="message" className="sr-only">
                  Message
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  id="message"
                  name="message"
                  type="message"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-violet-500 focus:border-violet-500 focus:z-10 sm:text-sm"
                  placeholder="Message"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-violet-600 hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500"
                disabled={
                  conversation === undefined &&
                  participants?.length > 0 &&
                  participants[0].email === myEmail
                }
              >
                Send Message
              </button>
            </div>

            {participants?.length === 0 && (
              <Error message="This user does not exist" />
            )}
            {participants?.length > 0 && participants[0].email === myEmail && (
              <Error message="You can not message to yourself" />
            )}
            {responseError && <Error message={responseError} />}
          </form>
        </div>
      </>
    )
  );
}
