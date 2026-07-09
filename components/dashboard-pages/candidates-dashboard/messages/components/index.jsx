

'use client'

import SearchBox from "./SearchBox";
import ContactList from "./ContactList";
import ContentField from "./ContentField";
import { useDispatch } from "react-redux";
import { chatSidebarToggle } from "../../../../../features/toggle/toggleSlice";

const ChatBox = () => {
  const dispatch = useDispatch();

  const chatToggle = () => {
    dispatch(chatSidebarToggle());
  };

  return (
    <div className="row ">


      <div className=" col-xl-12 col-lg-12 col-md-12 col-sm-12 chat">
        <ContentField />
      </div>
      {/* chatbox-field-content */}
    </div>
  );
};

export default ChatBox;
