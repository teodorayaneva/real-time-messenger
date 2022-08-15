import { useContext, useState } from 'react';
import { uid } from 'uid';
import AppContext from '../../providers/AppContext';
import { User, UsersListProps } from '../../types/Interfaces';
import UserComponent from '../User/User';
import './../Create/Create.css';

const ManiPulateUsersLists = ({ leftSide, setLeftSide, rightSide, setRightSide }: UsersListProps): JSX.Element => {
  // const [leftSideUsers, setLeftSideUsers] = useState<User[]>([]);
  // const [rightSideUsers, setRightSideUsers] = useState<User[]>([]);
  const [searchTermLeft, setSearchTermLeft] = useState<string>('');
  const [searchTermRight, setSearchTermRight] = useState<string>('');

  const { appState } = useContext(AppContext);

  const currentUser = appState.userData?.username;

  const getUsersBySearchTerm = (searchTerm: string, users: User[]) => {
    return users.filter((user) =>
      user.username.toLowerCase().includes(searchTerm) ||
      user.email.toLowerCase().includes(searchTerm) ||
      user.firstName.toLowerCase().includes(searchTerm) ||
      user.lastName.toLowerCase().includes(searchTerm));
  };

  const leftResult = getUsersBySearchTerm(searchTermLeft, leftSide);
  const rightResult = getUsersBySearchTerm(searchTermRight, rightSide);


  const handleAddUser = (user: User): void => {
    setRightSide([
      ...rightSide,
      user,
    ]);
    setLeftSide(leftSide.filter((u) => u.uid !== user.uid));
  };

  const handleRemoveUser = (user: User): void => {
    setRightSide(rightSide.filter((u) => u.uid !== user.uid));
    setLeftSide([
      ...leftSide,
      user,
    ]);
  };

  const mappingUserAddButton = (user: User): JSX.Element | undefined => {
    const buttonEl: JSX.Element =
      <button onClick={() => {
        handleAddUser(user);
      }} id='add-remove-user-btn'>
        <img src="https://img.icons8.com/color/48/000000/add--v1.png" alt='add-btn' />
      </button>;
    if (user.username !== currentUser) {
      return <div key={uid()}>
        <UserComponent props={{ user, buttonEl }} />
      </div>;
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
      return <div key={uid()}>
        <UserComponent props={{ user, buttonEl }} />
      </div>;
    }
  };


  return (
    <div className='create-team-view'>
      <div className='create-team-wrapper'>
        {/* <button onClick={handleGoBack} className='go-back-btn'>
          <img src="https://firebasestorage.googleapis.com/v0/b/thunderteam-99849.appspot.com/o/icons8-go-back-48.png?alt=media&token=7bdfef4c-cf94-4147-8f4d-fc55fd086b4a" alt='go-back-icon' />
        </button> */}
        {/* <h4 id="create-team-title">Create a new {props.string || 'chat'}</h4> */}
        <div id="create-team-form" >
          <div className="search-users-create-team">
            <input type="text" defaultValue="" placeholder='search Users...' onChange={(event) => setSearchTermLeft(event.target.value)} />
          </div>
        </div>
        {/* LEFT SIDE */}
        <div className='users-container'>
          {searchTermLeft ?
            leftResult.length > 0 ?
              leftResult.map(mappingUserAddButton) :
              <p>No users found</p> :
            leftSide.map(mappingUserAddButton)
          }
        </div>
      </div >
      {/* RIGHT SIDE */}
      <div className='list-of-added-participants'>
        <input type="text" defaultValue="" placeholder='search Users...' onChange={(event) => setSearchTermRight(event.target.value)} />
        <div className='users-container-added'>
          {searchTermRight ?
            rightResult.length > 0 ?
              rightResult.map(mappingUserRemoveButton) :
              <p>No users found</p> :
            rightSide.map(mappingUserRemoveButton)
          }
        </div>
      </div>

    </div>
  );
};

export default ManiPulateUsersLists;