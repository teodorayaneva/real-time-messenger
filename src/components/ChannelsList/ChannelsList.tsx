import { useContext } from 'react';
import { uid } from 'uid';
import AppContext from '../../providers/AppContext';
import { getChatByName, getChatById } from '../../services/channels.services';
import { Channel, ChannelsListProps } from '../../types/Interfaces';
import './ChannelsList.css';

const ChannelsList = (
  { props }: ChannelsListProps) => {
  const {
    setIsCreateChatClicked,
    setIsDetailedChatClicked,
    setIsTeamView,
    setIsMeetingClicked,
  } = useContext(AppContext);

  const mappingChats = (chanObj: Channel, key: string) => {
    return <div key={key}>
      <p onClick={() => openDetailedChat(chanObj)} className='chat-item'>{chanObj.title}</p>
    </div>;
  };

  const openCreateChat = () => {
    setIsCreateChatClicked(true);
    setIsDetailedChatClicked(false);
    setIsTeamView(false);
  };

  const openDetailedChat = (chanObj: Channel) => {
    setIsDetailedChatClicked(true);
    setIsCreateChatClicked(false);
    setIsTeamView(false);
    setIsMeetingClicked(false);
    getChatByName(chanObj.title)
      .then((res) => Object.keys(res.val()))
      .then((res) => getChatById(res[0]))
      .then((res) => props.setCurrentChat(res))
      .catch(console.error);
  };

  return (
    <div className='chats-channels-list'>
      <button onClick={openCreateChat} className='view-users-btn'>Create a Chat</button>
      <h4>Chats:</h4>
      <div className='chats'>
        {props.channels && props.channels.map((chanObj) => mappingChats(chanObj, uid()))}
      </div>
    </div>
  );
};

export default ChannelsList;
