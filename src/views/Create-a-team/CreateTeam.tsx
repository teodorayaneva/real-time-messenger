import React, { useContext, useState, useEffect } from 'react';
import { MAX_TEAM_NAME_LENGTH, MIN_TEAM_NAME_LENGTH } from '../../common/constants';
import UserComponent from '../../components/User/User';
import AppContext from '../../providers/AppContext';
import { addTeamToDB, getTeamByName } from '../../services/teams.services';
import { getAllUsers, updateUserTeams } from '../../services/users.services';
import { User } from '../../types/Interfaces';

import './Create-team.css';
import { ToastContainer, toast, Id } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
// import { useNavigate } from 'react-router-dom';

const CreateTeam = (): JSX.Element => {
  const [searchTerm, setSearchTerm] = useState('');
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [addedUsers, setAddedUsers] = useState<User[]>([]);
  const [name, setName] = useState('');
  const [owner, setOwner] = useState('');
  const { appState } = useContext(AppContext);

  const currentUser = appState.userData?.username;

  useEffect(() => {
    getAllUsers()
      .then((snapshot) => setAllUsers(Object.values(snapshot.val())));
  }, []);

  useEffect(() => {
    setOwner(currentUser!);
  }, [currentUser]);

  // const navigate = useNavigate();

  const createTeam: React.MouseEventHandler<HTMLButtonElement> = (): Id | void => {
    if (name.length < MIN_TEAM_NAME_LENGTH || name.length > MAX_TEAM_NAME_LENGTH) {
      return toast.warning(`The name of the team must be between ${MIN_TEAM_NAME_LENGTH} and ${MAX_TEAM_NAME_LENGTH} symbols`);
    }

    getTeamByName(name)
      .then((snapshot) => {
        if (snapshot.exists()) {
          return toast.warning(`This name ${name} already exists!`);
        } else {
          console.log(owner);
          const membersIds = addedUsers.map((user) => user.username);
          addTeamToDB(name, owner, membersIds)
            .then(() => {
              [...membersIds, owner].forEach((username) => updateUserTeams(username, name));
              toast.success('You have successfully created a Team!');
            })
            .catch(console.error);
        }
      })
      .catch(console.error);
    // navigate(`/teams/${name}`);
  };

  const getUsersBySearchTerm = (searchTerm: string, users: User[]) => {
    return users.filter((user) =>
      user.username.toLowerCase().includes(searchTerm) ||
      user.email.toLowerCase().includes(searchTerm) ||
      user.firstName.toLowerCase().includes(searchTerm) ||
      user.lastName.toLowerCase().includes(searchTerm));
  };

  const result = getUsersBySearchTerm(searchTerm, allUsers);

  const handleAddUser = (user: User): void => {
    setAddedUsers([
      ...addedUsers,
      user,
    ]);
    setAllUsers(allUsers.filter((u) => u.uid !== user.uid));
  };

  const handleRemoveUser = (user: User): void => {
    setAddedUsers(addedUsers.filter((u) => u.uid !== user.uid));
    setAllUsers([
      ...allUsers,
      user,
    ]);
  };

  // const mappingUser = (user: User): JSX.Element => {
  //   return <> <UserComponent props={{ user }} key={user.uid} /><br /></>;
  // };

  const mappingUserAddButton = (user: User): JSX.Element | undefined => {
    const buttonEl: JSX.Element =
      <button onClick={() => {
        handleAddUser(user);
      }} id='add-remove-user-btn'>
        <img src="https://img.icons8.com/color/48/000000/add--v1.png" alt='add-btn' />
      </button>;
    if (user.username !== currentUser) {
      return <>
        <UserComponent props={{ user, buttonEl }} key={user.uid} />

        <br />
      </>;
    }
  };

  const mappingUserRemoveButton = (user: User): JSX.Element | undefined => {
    const buttonEl: JSX.Element =
      <button onClick={() => {
        handleRemoveUser(user);
      }} id='add-remove-user-btn'>
        <img src="https://img.icons8.com/color/48/000000/delete-forever.png" alt='remove-btn' />
      </button>;
    if (user.username !== currentUser) {
      return <>
        <UserComponent props={{ user, buttonEl }} key={user.uid} />

        <br />
      </>;
    }
  };


  return (
    <div className="create-team-view">
      <div className='create-team-wrapper'>
        <div id="create-team-form" >
          <h4 id="create-team-title">Create a new team</h4>
          <div className="search-users-create-team">
            <input type="text" defaultValue="" placeholder='search Users...' onChange={(event) => setSearchTerm(event.target.value)} />
          </div>
        </div>
        <div className='users-container'>
          {searchTerm ?
            result.length > 0 ?
              result.map(mappingUserAddButton) :
              <p>No users found</p> :
            allUsers.map(mappingUserAddButton)
          }
        </div>
      </div>
      <div className='list-of-added-participants'>
        <label htmlFor="name-of-the-team">Name of the Team:</label><br />
        <br />
        <input type="text" className="create-team-title" name="team-name" placeholder="name of your new Team" required defaultValue='' onChange={(e) => setName(e.target.value)} /> <br /> <br />

        <h4>Added users to your Team</h4>
        {addedUsers.map(mappingUserRemoveButton)}
        <button className='create-a-team' onClick={createTeam}>Create team</button>

      </div>
      <ToastContainer />
    </div>
  );
};

export default CreateTeam;
