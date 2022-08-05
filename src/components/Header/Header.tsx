import { useContext, useEffect, useState } from 'react';
import DefaultAvatar from '../../assets/images/Default-avatar.jpg';
import { logOut } from '../../services/auth.services';
import AppContext from '../../providers/AppContext';
import { useNavigate } from 'react-router-dom';
import { getUsersCount } from '../../services/users.services';
import { getTeamsCount } from '../../services/teams.services';
import './Header.css';

const Header = (): JSX.Element => {
  const { appState, setState } = useContext(AppContext);
  const user = appState.user;

  const [usersCount, setUsersCount] = useState(0);
  const [teamsCount, setTeamsCount] = useState(0);

  const navigate = useNavigate();

  useEffect(() => {
    getUsersCount()
      .then((users) => setUsersCount(users.size))
      .catch(console.error);

    getTeamsCount()
      .then((teams) => setTeamsCount(teams.size))
      .catch(console.error);
  }, []);

  const handleLogOut = () => {
    setState({
      user: null,
      userData: null,
    });

    logOut();

    alert('Successful sign out!');
    navigate('/');
  };

  return (
    <header id='header'>
      <div id='stats'>
        <h4 className='stats'>Total active users: {usersCount}</h4>
        <h4 className='stats'>Total active teams: {teamsCount}</h4>
      </div>

      <div id='navigation'>
        <button className='header-btn' onClick={() => navigate('/about-us')}>About us</button>

        {user ?
          <>
            <button className='header-btn'>My teams</button>
            <button onClick={handleLogOut} className='header-btn'>Log out</button>
            <img className="default-avatar" src={DefaultAvatar} alt="default-avatar" />
          </> :
          null
        }
      </div>
    </header>
  );
};

export default Header;
