import './Login.css';
import { Link, useNavigate } from 'react-router-dom';
import AppContext from '../../providers/AppContext';
import { useContext, useState } from 'react';
import { getUserByUsername, getUserData } from '../../services/users.services';
import { signIn } from '../../services/auth.services';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Login = (): JSX.Element => {
  const { setState } = useContext(AppContext);
  const navigate = useNavigate();

  const [logInDetails, updateLogInDetails] = useState({
    username: '',
    password: '',
  });

  const updateForm = (prop: string) => (e: React.FormEvent<HTMLInputElement>) => {
    updateLogInDetails({
      ...logInDetails,
      [prop]: e.currentTarget.value,
    });
  };


  const handleLogIn: React.FormEventHandler<HTMLFormElement> = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    getUserByUsername(logInDetails.username)
      .then((snapshot) => {
        if (snapshot.exists()) {
          signIn(snapshot.val().email, logInDetails.password)
            .then((u) => {
              return getUserData(u.user.uid)
                .then((snapshot) => {
                  if (snapshot.exists()) {
                    setState({
                      user: u.user,
                      userData: snapshot.val()[Object.keys(snapshot.val())[0]],
                    });
                    toast.success('Successful sign in!');
                    navigate('/');
                  }
                });
            })
            .catch((e) => {
              if (e.message.includes('wrong-password')) {
                toast.warning('Wrong password!');
              } else {
                toast.error(e.message);
              }
            });
        } else {
          toast.warning(`The username ${logInDetails.username} is not registered!`);
        }
      });
  };

  return (
    <div id="login-div">
      <form id="login-form" onSubmit={handleLogIn}>
        <h4 id="sign-in">Sign in</h4>
        <label htmlFor="username">Username:</label>
        <br />
        <input onChange={updateForm('username')} type="text" id="username" placeholder='username' value={logInDetails.username} />
        <br /><br />
        <label htmlFor="password">Password:</label>
        <br />
        <input onChange={updateForm('password')} type="password" id="password" placeholder='password' value={logInDetails.password} />
        <br /><br />
        <button id="sign-in-button" className='user-btn'>Sign in</button>
        <br />
        <h3>Don't have an account yet?
          <Link to={'/home-page'}>
            <button id="go-back-register-btn" className='go-back-btn'>
              <img src="https://firebasestorage.googleapis.com/v0/b/thunderteam-99849.appspot.com/o/icons8-go-back-48.png?alt=media&token=7bdfef4c-cf94-4147-8f4d-fc55fd086b4a" alt='go-back-icon' />
            </button>
          </Link>
        </h3>
        <br />
      </form>
      <ToastContainer />
    </div>
  );
};

export default Login;
