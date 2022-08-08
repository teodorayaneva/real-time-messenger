import './LoggedUser.css';
import { User } from '../../types/Interfaces';
import { useContext, useEffect, useState } from 'react';
import { getAllUsers, getUserByUsername, updateUserChats } from '../../services/users.services';
import UserComponent from '../../components/User/User';
import { createChat, deleteUserFromChat, getChatById, getChatByName } from '../../services/channels.services';
import AppContext from '../../providers/AppContext';
import Channel from '../Channel/Channel';
import { ToastContainer, toast } from 'react-toastify';
import { MAX_CHANNEL_NAME_LENGTH, MIN_CHANNEL_NAME_LENGTH, MIN_NUMBER_OF_CHAT_PARTICIPANTS } from '../../common/constants';

const LoggedUser = (): JSX.Element => {
  const { appState } = useContext(AppContext);
  const userUsername = appState.userData?.username;

  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAllUsersClicked, setisAllUsersClicked] = useState(false);
  const [isDetailedChatClicked, setisDetailedChatClicked] = useState(false);
  const [isCreateChatClicked, setisCreateChatClicked] = useState(false);
  const [addedUsers, setAddedUsers] = useState<User[]>([]);
  const [currentChat, setCurrentChat] = useState({
    date: {},
    id: '',
    isPublic: false,
    participants: [],
    title: '',
  });

  console.log(currentChat);
  const [userDetails, setUserDetails] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    phoneNumber: '',
    imgURL: '',
    teams: [],
    channels: [],
    uid: '',
  });
  const [chatDetails, setChatDetails] = useState({
    title: '',
    participants: [],
    isPublic: false,
  });

  const updateForm = (prop: string) => (e: React.FormEvent<HTMLInputElement>) => {
    setChatDetails({
      ...chatDetails,
      [prop]: e.currentTarget.value,
    });
  };

  useEffect(() => {
    getAllUsers()
      .then((snapshot) => setAllUsers(Object.values(snapshot.val())));
  }, []);

  useEffect(() => {
    getUserByUsername(userUsername!)
      .then((res) => setUserDetails(res.val()))
      .catch(console.error);
  }, [userUsername]);

  const getUsersBySearchTerm = (searchTerm: string, users: User[]) => {
    return users.filter((user) =>
      user.username.toLowerCase().includes(searchTerm) ||
      user.email.toLowerCase().includes(searchTerm) ||
      user.firstName.toLowerCase().includes(searchTerm) ||
      user.lastName.toLowerCase().includes(searchTerm));
  };

  const result = getUsersBySearchTerm(searchTerm, allUsers);

  const handleAddUser = (user: User) => {
    setAddedUsers([
      ...addedUsers,
      user,
    ]);
  };

  const mappingResult = (user: User): JSX.Element | undefined => {
    const buttonEl: JSX.Element =
      <button onClick={() => {
        handleAddUser(user);
      }}
      id='add-remove-user-btn'>
        <img src="https://img.icons8.com/color/48/000000/add--v1.png" alt='add-btn' />
      </button>;
    return <>
      <UserComponent props={{ user, buttonEl }} key={user.uid} />
      <br />
    </>;
  };

  const createChatFunc = (chatName: string, participants: string [] | User[]) => {
    if (chatDetails.title.length < MIN_CHANNEL_NAME_LENGTH || chatDetails.title.length > MAX_CHANNEL_NAME_LENGTH) {
      return toast.warning(`The name of the chat must be between ${MIN_CHANNEL_NAME_LENGTH} and ${MAX_CHANNEL_NAME_LENGTH} symbols`);
    }
    if (participants.length === MIN_NUMBER_OF_CHAT_PARTICIPANTS) {
      return toast.warning('Please add at least one participant in the chat!');
    }
    createChat(chatName, participants)
      .then(()=> {
        toast.success('Successful chat creation!');
        setSearchTerm('');
        setisCreateChatClicked(!isCreateChatClicked);
        participants.map((participant) => updateUserChats(participant, chatName));
      })
      .catch(console.error);
  };

  const createChatButtonFunc = () => {
    return <>
      <div className='create-chat-view'>
        <div className='create-chat-form'>
          <div className="search-users">
            <label htmlFor="create-chat-title">Name of the chat:</label><br />
            <input type="text" className="create-chat-title" name="create-chat-title" placeholder="The name of your new chat" required defaultValue='' onChange={updateForm('title')} /> <br /> <br />
            <input type="text" defaultValue="" placeholder='search users...' onChange={(event) => setSearchTerm(event.target.value)}/> <br />
            <button className="view-users-btn" onClick={() =>setisAllUsersClicked(!isAllUsersClicked)}>View all users</button>
          </div>
          {addedUsers.map(mappingResult)}
          <button className='create-a-team' onClick={() => createChatFunc(chatDetails.title, addedUsers.map((user) => user.username))}>Create a Chat</button>
        </div>
      </div>
    </>;
  };

  const mappingChats = (chat: string) => {
    return <>
      <p onClick={() =>openDetailedChat(chat)} className='chat-item'>{chat}</p>
    </>;
  };

  const openCreateChat = () => {
    setisCreateChatClicked(true);
    setisAllUsersClicked(false);
    setisDetailedChatClicked(false);
  };

  const openDetailedChat = (chat: string) => {
    setisDetailedChatClicked(true);
    setisCreateChatClicked(false);
    setisAllUsersClicked(false);
    getChatByName(chat)
      .then((res) => Object.keys(res.val()))
      .then((res) => getChatById(res[0]))
      .then((res) => setCurrentChat(res))
      .catch(console.error);
  };

  const leaveChat = (username: string | undefined, chatName: string) => {
    deleteUserFromChat(username, chatName)
      .then(() => {
        toast.success(`You have successfully been removed from chat ${chatName}!`);
      });
  };

  return (
    <div className="landing-page">
      <div className="chats-channels-list">
        <h4>Chats:</h4>
        {Object.keys(userDetails.channels).map((chat)=> mappingChats(chat))}
        <button onClick={() =>openCreateChat()} className='view-users-btn'>Create a Chat</button>
      </div>

      {/* DYNAMIC DIV TO SHOW RESULTS FROM SEARCH AND VIEWING CHATS */}
      <div className="main-container">
        <>
          {isCreateChatClicked ?
            createChatButtonFunc() :
            null
          }
          {searchTerm !== '' ?
            result.map(mappingResult) :
            null
          }
          {isAllUsersClicked ?
            allUsers.map(mappingResult) :
            null

          }
          {isDetailedChatClicked ?
            <Channel/> :
            null
          }
        </>
      </div>

      <div className="participants-list">
        <h4>Owner:</h4>
        <p>User0</p>

        <h4>Participants of chat/team:</h4>
        <p>User1</p>
        <p>User2</p>
        <p>User3</p>
        <p>User4</p>

        <div className="manage-participants-btns">
          <button className="add-btn"><span>Add members</span></button>
          <br />
          <button onClick={() =>leaveChat(userUsername, currentChat.title)} className="leave-btn">Leave channel</button>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default LoggedUser;
