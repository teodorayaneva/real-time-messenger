import { FC } from 'react';
// import AppContext from '../../providers/AppContext';
import DefaultAvatar from '../../assets/images/Default-avatar.jpg';
import './User.css';
import { UserProps } from '../../types/Interfaces';

const UserComponent: FC<UserProps> = ({ props }): JSX.Element => {
  return (
    <div className="user-box" id="user-box">
      <p> {<img src={props?.imgURL} alt="avatar" /> && <img src={DefaultAvatar} alt="avatar" />} @{props?.username} </p>
      {/* <p>@{props?.username}</p> */}
    </div>
  );
};

export default UserComponent;