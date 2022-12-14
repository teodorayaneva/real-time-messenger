import { useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import ChannelsList from '../../components/ChannelsList/ChannelsList';
import ChatParticipants from '../../components/ChatParticipants/ChatParticipants';
import { getLiveTeamChannels, getLiveTeamMembers, getTeamByName, manageTeamMembersUpdateUsers, updateTeamMembers } from '../../services/teams.services';
import { Team, User } from '../../types/Interfaces';
import Channel from '../../components/Channel/Channel';
import { Channel as IChannel } from '../../types/Interfaces';
import TeamParticipants from '../../components/TeamParticipants/TeamParticipants';
import ManiPulateUsersLists from '../../components/ManipulateUsersLists/ManiPulateUsersLists';
import { getAllUsers, getLiveChannelsByUsername, updateUserChats } from '../../services/users.services';
import { toast } from 'react-toastify';
import { MIN_CHANNEL_NAME_LENGTH, MAX_CHANNEL_NAME_LENGTH, MIN_NUMBER_OF_CHAT_PARTICIPANTS } from '../../common/constants';
import { createTeamChat, getChatByName } from '../../services/channels.services';
import AppContext from '../../providers/AppContext';
import Logo from '../../assets/images/Logo.png';
import './Team.css';

const MyTeam = (): JSX.Element => {
  const { appState,
    isTeamView,
    isDetailedChatClicked,
    isCreateChatClicked,
    setIsCreateChatClicked,
    setIsDetailedChatClicked,
    setIsTeamView,
  } = useContext(AppContext);
  const currentUser = appState.userData?.username;

  const [team, setTeam] = useState<object>({});
  const [currentChat, setCurrentChat] = useState<IChannel>({
    id: '',
    title: '',
    participants: [],
    messages: [],
    isPublic: false,
    teamID: '',
    lastActivity: new Date(),
  });

  const [channels, setChannels] = useState<IChannel[]>([]);
  const [title, setTitle] = useState<string>('');
  const [teamMembersObjects, setTeamMembersObject] = useState<User[]>([]);
  const [addedToChat, setAddedToChat] = useState<User[]>([]);
  const [initialChatParticipants, setInitialChatParticipants] = useState<User[]>([]);
  const [teamProps, setTeamProps] = useState<Team>({} as Team);

  const { name } = useParams<{ name: string }>();

  const [outerUsers, setOuterUsers] = useState<User[]>([]);
  const [usersToRemove, setUsersToRemove] = useState<User[]>([]);
  const [ownerObj, setOwnerObject] = useState<User>({} as User);

  useEffect(() => {
    getTeamByName(name!)
      .then((snapshot) => {
        if (snapshot.exists()) {
          const team: object = snapshot.val();

          setTeam(team);
          setTeamProps(Object.values(team)[0]);
        }
      })
      .catch(console.error);
  }, [name]);

  const teamID = Object.keys(team)[0];

  useEffect(() => {
    const unsubscribe = getLiveTeamChannels(teamID!, (snapshot) => {
      if (snapshot.exists()) {
        const allTeamChannels = Object.keys(snapshot.val());
        const unsubscribe2 = getLiveChannelsByUsername(appState.userData!.username,
          (snapshotUC) => {
            const channelsToDisplay = allTeamChannels
              .filter((teamChan) => Object.keys(snapshotUC.val()).includes(teamChan));

            const channelsObjPr = channelsToDisplay.map((chatName) => {
              return getChatByName(chatName)
                .then((snapshotChanObj) => {
                  const arr: IChannel[] = Object.values(snapshotChanObj.val());
                  return arr[0];
                });
            });

            Promise.all(channelsObjPr)
              .then((values) => setChannels(values));
          });

        return () => unsubscribe2();
      }
    });

    return () => unsubscribe();
  }, [appState.userData, appState?.userData?.username, teamID]);

  useEffect(() => {
    getLiveTeamMembers(teamID, (snapshot) => {
      if (snapshot.exists()) {
        getAllUsers()
          .then((snapshot2) => {
            const usersObj: object = snapshot2.val();
            const allUsersInTeam = Object.values(usersObj)
              .filter((userA) => snapshot.val().includes(userA.username));
            const ownerOfTeam: User[] = Object.values(usersObj)
              .filter((user: User) => user.username === teamProps?.owner);

            setTeamMembersObject(allUsersInTeam);
            setUsersToRemove(allUsersInTeam);
            setOwnerObject(ownerOfTeam[0]);

            if (ownerOfTeam[0].username !== appState.userData?.username) {
              setInitialChatParticipants([...allUsersInTeam, ownerOfTeam[0]]);
            } else {
              setInitialChatParticipants(allUsersInTeam);
            }

            const allUsersOutOfTeam: User[] = Object.values(usersObj)
              .filter((userA) => ![...snapshot.val(), teamProps?.owner].includes(userA.username));
            setOuterUsers(allUsersOutOfTeam);
            setIsTeamView(true);
          })
          .catch(console.error);
      };
    });
  }, [appState.userData?.username, setIsTeamView, teamID, teamProps?.owner]);

  useEffect(() => {
    if (isCreateChatClicked) {
      setIsDetailedChatClicked(false);
      setIsTeamView(false);
    }

    if (isDetailedChatClicked) {
      setIsCreateChatClicked(false);
      setIsTeamView(false);
    }

    if (isTeamView) {
      setIsDetailedChatClicked(false);
      setIsCreateChatClicked(false);
    }
  }, [isCreateChatClicked, isDetailedChatClicked, isTeamView, setIsCreateChatClicked, setIsDetailedChatClicked, setIsTeamView]);

  const updateTeam = () => {
    const stringMembers = usersToRemove.map((member) => member.username);
    updateTeamMembers(teamID, stringMembers)
      .then(() => {
        manageTeamMembersUpdateUsers(outerUsers, usersToRemove, Object.values(team)[0], teamID);
      })
      .then(() => toast.success('You have successfully updated your team!'))
      .catch((err) => toast.warning(err));
  };

  const createChatFunc = () => {
    setIsTeamView(false);
    setAddedToChat([]);

    if (title.length < MIN_CHANNEL_NAME_LENGTH || title.length > MAX_CHANNEL_NAME_LENGTH) {
      return toast.warning(`The name of the chat must be between ${MIN_CHANNEL_NAME_LENGTH} and ${MAX_CHANNEL_NAME_LENGTH} symbols`);
    }

    if (addedToChat.length === MIN_NUMBER_OF_CHAT_PARTICIPANTS) {
      return toast.warning('Please add at least one participant in the chat!');
    }

    getChatByName(title)
      .then((snapshot) => {
        if (snapshot.exists()) {
          toast.warning('This chat name is already taken! Please choose a different one.');
          return;
        } else {
          if (teamID) {
            const membersToAdd = addedToChat.map((m) => m.username);

            createTeamChat(teamID, title, [...membersToAdd, currentUser!])
              .then(() => {
                toast.success('Successful chat creation!');
                [...membersToAdd, currentUser!].map((participant) => updateUserChats(participant, title));
                setInitialChatParticipants(teamMembersObjects);
              })
              .catch((console.error));
          }
        }
      });
  };

  return (
    <div className='landing-page'>
      {channels && <ChannelsList props={{
        channels,
        setCurrentChat,
      }} />
      }

      <div className='main-container'>
        <>

          {!isCreateChatClicked && !isDetailedChatClicked && currentUser !== ownerObj.username ?
            <div className='main-container-bg'><img src={Logo} alt='background' /></div>:
            null
          }

          {isCreateChatClicked &&
            <>
              <input type="text" className={'create-chat-title'}
                name="team-name" placeholder='Please, add a title...'
                required
                defaultValue=''
                onChange={(e) => setTitle(e.target.value.trim())} />
              <button className='create-a-team'
                onClick={createChatFunc}>Create a Chat</button>
              <ManiPulateUsersLists
                leftSide={initialChatParticipants}
                setLeftSide={setInitialChatParticipants}
                rightSide={addedToChat}
                setRightSide={setAddedToChat} />
            </>
          }

          {isDetailedChatClicked ?
            <Channel currentChannel={currentChat} /> :
            isTeamView && ownerObj.username === currentUser ?
              <>
                <h4 id='team-title-name'>{teamProps?.name}</h4>
                <button className='create-a-team' onClick={updateTeam}>Update users</button>
                <ManiPulateUsersLists
                  leftSide={outerUsers}
                  setLeftSide={setOuterUsers}
                  rightSide={usersToRemove}
                  setRightSide={setUsersToRemove} />
              </> :
              null
          }
        </>
      </div>
      {isDetailedChatClicked ?
        <ChatParticipants
          currentChannel={currentChat}
          allUsers={teamMembersObjects}
          owner={ownerObj} /> :
        ownerObj && teamMembersObjects &&
        <TeamParticipants owner={ownerObj} allUsers={teamMembersObjects} />
      }

    </div >
  );
};

export default MyTeam;
